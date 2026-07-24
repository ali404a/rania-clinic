import { Router } from 'express';
import { db, tx } from '../lib/db.js';
import { supabase } from '../lib/supabase.js';
import {
  hashPassword, verifyPassword, createSession, destroySession, destroyUserSessions,
  isLocked, registerFailedAttempt, clearFailedAttempts, audit,
  SESSION_COOKIE, SESSION_DAYS,
} from '../lib/auth.js';
import {
  requireAuth, requireRole, csrfProtect, validate, AppError, asyncH,
} from '../middleware/security.js';
import {
  loginSchema, createUserSchema, updateUserSchema,
  resetPasswordSchema, changePasswordSchema,
} from '../lib/schemas.js';

export const authRouter = Router();

const cookieOpts = () => ({
  httpOnly: true,                                   // JS لا يستطيع قراءتها → يحبط XSS
  sameSite: 'strict',                               // يحبط CSRF
  secure: process.env.NODE_ENV === 'production',    // HTTPS فقط في الإنتاج
  maxAge: SESSION_DAYS * 864e5,                     // البقاء ٣٠ يوماً
  path: '/',
});

/* ---------- تسجيل الدخول ---------- */
authRouter.post('/login', validate(loginSchema), asyncH(async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;

  let user = null;
  if (supabase) {
    const { data, error } = await supabase.from('users')
      .select('id, username, password_hash, full_name, role, is_active, failed_attempts, locked_until, must_change_pw')
      .eq('username', username)
      .is('deleted_at', null)
      .maybeSingle();
    user = data;
  } else {
    user = db.prepare(`
      SELECT id, username, password_hash, full_name, role, is_active,
             failed_attempts, locked_until, must_change_pw
      FROM users WHERE username = ? AND deleted_at IS NULL
    `).get(username);
  }

  // رسالة واحدة للمستخدم غير الموجود وكلمة المرور الخاطئة (منع تعداد الحسابات)
  const generic = 'اسم المستخدم أو كلمة المرور غير صحيحة';

  if (!user) {
    await audit(null, 'LOGIN_FAILED', 'user', null, { username, reason: 'not_found' }, ip);
    throw new AppError(401, generic, 'BAD_CREDENTIALS');
  }
  if (isLocked(user)) {
    await audit(user.id, 'LOGIN_BLOCKED', 'user', user.id, null, ip);
    throw new AppError(429, 'الحساب مقفل مؤقتاً بسبب محاولات متكررة. حاول بعد ١٥ دقيقة.', 'LOCKED');
  }
  if (user.is_active !== true && user.is_active !== 1) {
    await audit(user.id, 'LOGIN_INACTIVE', 'user', user.id, null, ip);
    throw new AppError(403, 'الحساب معطّل. راجع الطبيب.', 'INACTIVE');
  }
  if (!verifyPassword(password, user.password_hash)) {
    await registerFailedAttempt(user.id);
    await audit(user.id, 'LOGIN_FAILED', 'user', user.id, { reason: 'bad_password' }, ip);
    throw new AppError(401, generic, 'BAD_CREDENTIALS');
  }

  await clearFailedAttempts(user.id);
  const { token, csrfToken } = await createSession(user.id, {
    userAgent: req.get('user-agent'), ip,
  });
  res.cookie(SESSION_COOKIE, token, cookieOpts());
  await audit(user.id, 'LOGIN', 'user', user.id, null, ip);

  res.json({
    user: {
      id: user.id, username: user.username, fullName: user.full_name,
      role: user.role, mustChangePassword: user.must_change_pw === true || user.must_change_pw === 1,
    },
    csrfToken,
  });
}));

/* ---------- الجلسة الحالية (يُستدعى عند كل تحميل صفحة) ---------- */
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user, csrfToken: req.session.csrfSecret });
});

/* ---------- تسجيل الخروج ---------- */
authRouter.post('/logout', requireAuth, csrfProtect, asyncH(async (req, res) => {
  await destroySession(req.cookies[SESSION_COOKIE]);
  await audit(req.user.id, 'LOGOUT', 'user', req.user.id, null, req.ip);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ ok: true });
}));

/* ---------- تغيير كلمة المرور الشخصية ---------- */
authRouter.post('/change-password', requireAuth, csrfProtect,
  validate(changePasswordSchema), asyncH(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    let storedHash = null;

    if (supabase) {
      const { data } = await supabase.from('users').select('password_hash').eq('id', req.user.id).single();
      storedHash = data?.password_hash;
    } else {
      const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
      storedHash = row?.password_hash;
    }

    if (!verifyPassword(currentPassword, storedHash)) {
      throw new AppError(400, 'كلمة المرور الحالية غير صحيحة', 'BAD_PASSWORD');
    }

    const newHash = hashPassword(newPassword);
    if (supabase) {
      await supabase.from('users').update({ password_hash: newHash, must_change_pw: false }).eq('id', req.user.id);
    } else {
      db.prepare(`UPDATE users SET password_hash = ?, must_change_pw = 0 WHERE id = ?`).run(newHash, req.user.id);
    }

    // إنهاء كل الجلسات الأخرى ثم إصدار جلسة جديدة لهذا الجهاز
    await destroyUserSessions(req.user.id);
    const { token, csrfToken } = await createSession(req.user.id, {
      userAgent: req.get('user-agent'), ip: req.ip,
    });
    res.cookie(SESSION_COOKIE, token, cookieOpts());
    await audit(req.user.id, 'PASSWORD_CHANGED', 'user', req.user.id, null, req.ip);
    res.json({ ok: true, csrfToken });
  }));

/* =====================================================================
   إدارة المستخدمين — الطبيب فقط
===================================================================== */

authRouter.get('/users', requireAuth, requireRole('doctor'), asyncH(async (req, res) => {
  if (supabase) {
    const { data: rows } = await supabase.from('users')
      .select('id, username, full_name, role, phone, is_active, must_change_pw, created_at')
      .is('deleted_at', null)
      .order('full_name');

    const formatted = (rows || []).map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.full_name,
      role: u.role,
      phone: u.phone,
      isActive: u.is_active === true || u.is_active === 1,
      mustChangePassword: u.must_change_pw === true || u.must_change_pw === 1,
      createdAt: u.created_at,
      activeSessions: 1
    }));
    return res.json({ users: formatted });
  }

  const rows = db.prepare(`
    SELECT id, username, full_name AS fullName, role, phone,
           is_active AS isActive, must_change_pw AS mustChangePassword,
           created_at AS createdAt,
           (SELECT COUNT(*) FROM sessions s WHERE s.user_id = users.id
              AND s.expires_at > datetime('now')) AS activeSessions
    FROM users WHERE deleted_at IS NULL ORDER BY role, full_name
  `).all();
  res.json({ users: rows.map(u => ({ ...u, isActive: u.isActive === 1 })) });
}));

/** الطبيب ينشئ حساب السكرتيرة */
authRouter.post('/users', requireAuth, requireRole('doctor'), csrfProtect,
  validate(createUserSchema), asyncH(async (req, res) => {
    const { username, password, fullName, role, phone } = req.body;

    if (supabase) {
      const { data: exists } = await supabase.from('users').select('id').eq('username', username).maybeSingle();
      if (exists) throw new AppError(409, 'اسم المستخدم مستخدم بالفعل', 'DUPLICATE');

      const { data: created, error } = await supabase.from('users').insert({
        username,
        password_hash: hashPassword(password),
        full_name: fullName,
        role,
        phone: phone || null,
        created_by: req.user.id
      }).select().single();

      if (error) throw new AppError(500, error.message, 'DB_ERROR');

      await audit(req.user.id, 'USER_CREATED', 'user', created.id, { username, role, fullName }, req.ip);
      return res.status(201).json({
        user: { id: created.id, username, fullName, role, phone, isActive: true },
      });
    }

    const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (exists) throw new AppError(409, 'اسم المستخدم مستخدم بالفعل', 'DUPLICATE');

    const info = tx(() => db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, phone, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(username, hashPassword(password), fullName, role, phone || null, req.user.id));

    await audit(req.user.id, 'USER_CREATED', 'user', info.lastInsertRowid,
          { username, role, fullName }, req.ip);
    res.status(201).json({
      user: { id: Number(info.lastInsertRowid), username, fullName, role, phone, isActive: true },
    });
  }));

authRouter.patch('/users/:id', requireAuth, requireRole('doctor'), csrfProtect,
  validate(updateUserSchema), asyncH(async (req, res) => {
    const id = Number(req.params.id);

    if (supabase) {
      const { data: target } = await supabase.from('users').select('id, role').eq('id', id).is('deleted_at', null).maybeSingle();
      if (!target) throw new AppError(404, 'المستخدم غير موجود', 'NOT_FOUND');
      if (id === req.user.id && req.body.isActive === false) {
        throw new AppError(400, 'لا يمكنك تعطيل حسابك', 'SELF_DISABLE');
      }

      const updates = {};
      if (req.body.fullName !== undefined) updates.full_name = req.body.fullName;
      if (req.body.phone !== undefined) updates.phone = req.body.phone || null;
      if (req.body.isActive !== undefined) updates.is_active = req.body.isActive;

      if (Object.keys(updates).length === 0) throw new AppError(400, 'لا توجد تغييرات', 'NO_CHANGES');

      await supabase.from('users').update(updates).eq('id', id);
      if (req.body.isActive === false) await destroyUserSessions(id);

      await audit(req.user.id, 'USER_UPDATED', 'user', id, req.body, req.ip);
      return res.json({ ok: true });
    }

    const target = db.prepare('SELECT id, role FROM users WHERE id = ? AND deleted_at IS NULL').get(id);
    if (!target) throw new AppError(404, 'المستخدم غير موجود', 'NOT_FOUND');
    if (id === req.user.id && req.body.isActive === false) {
      throw new AppError(400, 'لا يمكنك تعطيل حسابك', 'SELF_DISABLE');
    }

    const sets = [], vals = [];
    if (req.body.fullName !== undefined) { sets.push('full_name = ?'); vals.push(req.body.fullName); }
    if (req.body.phone !== undefined)    { sets.push('phone = ?');     vals.push(req.body.phone || null); }
    if (req.body.isActive !== undefined) { sets.push('is_active = ?'); vals.push(req.body.isActive ? 1 : 0); }
    if (!sets.length) throw new AppError(400, 'لا توجد تغييرات', 'NO_CHANGES');

    vals.push(id);
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    if (req.body.isActive === false) await destroyUserSessions(id);   // طرد فوري

    await audit(req.user.id, 'USER_UPDATED', 'user', id, req.body, req.ip);
    res.json({ ok: true });
  }));

authRouter.post('/users/:id/reset-password', requireAuth, requireRole('doctor'), csrfProtect,
  validate(resetPasswordSchema), asyncH(async (req, res) => {
    const id = Number(req.params.id);

    if (supabase) {
      const { data: target } = await supabase.from('users').select('id').eq('id', id).is('deleted_at', null).maybeSingle();
      if (!target) throw new AppError(404, 'المستخدم غير موجود', 'NOT_FOUND');

      await supabase.from('users').update({
        password_hash: hashPassword(req.body.password),
        must_change_pw: true,
        failed_attempts: 0,
        locked_until: null
      }).eq('id', id);

      await destroyUserSessions(id);
      await audit(req.user.id, 'PASSWORD_RESET', 'user', id, null, req.ip);
      return res.json({ ok: true });
    }

    const target = db.prepare('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL').get(id);
    if (!target) throw new AppError(404, 'المستخدم غير موجود', 'NOT_FOUND');

    db.prepare('UPDATE users SET password_hash = ?, must_change_pw = 1, failed_attempts = 0, locked_until = NULL WHERE id = ?')
      .run(hashPassword(req.body.password), id);
    await destroyUserSessions(id);
    await audit(req.user.id, 'PASSWORD_RESET', 'user', id, null, req.ip);
    res.json({ ok: true });
  }));

authRouter.delete('/users/:id', requireAuth, requireRole('doctor'), csrfProtect,
  asyncH(async (req, res) => {
    const id = Number(req.params.id);
    if (id === req.user.id) throw new AppError(400, 'لا يمكنك حذف حسابك', 'SELF_DELETE');

    if (supabase) {
      const { data: target } = await supabase.from('users').select('id, role').eq('id', id).is('deleted_at', null).maybeSingle();
      if (!target) throw new AppError(404, 'المستخدم غير موجود', 'NOT_FOUND');

      if (target.role === 'doctor') {
        const { data: docs } = await supabase.from('users').select('id').eq('role', 'doctor').eq('is_active', true).is('deleted_at', null);
        if (!docs || docs.length <= 1) throw new AppError(400, 'لا يمكن حذف آخر حساب طبيب', 'LAST_DOCTOR');
      }

      await supabase.from('users').update({ deleted_at: new Date().toISOString(), is_active: false }).eq('id', id);
      await destroyUserSessions(id);
      await audit(req.user.id, 'USER_DELETED', 'user', id, null, req.ip);
      return res.json({ ok: true });
    }

    const target = db.prepare('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL').get(id);
    if (!target) throw new AppError(404, 'المستخدم غير موجود', 'NOT_FOUND');

    // آخر طبيب نشط لا يُحذف
    const doctors = db.prepare(`SELECT COUNT(*) c FROM users WHERE role='doctor' AND is_active=1 AND deleted_at IS NULL`).get().c;
    const isDoc = db.prepare('SELECT role FROM users WHERE id = ?').get(id).role === 'doctor';
    if (isDoc && doctors <= 1) throw new AppError(400, 'لا يمكن حذف آخر حساب طبيب', 'LAST_DOCTOR');

    db.prepare(`UPDATE users SET deleted_at = datetime('now'), is_active = 0 WHERE id = ?`).run(id);
    await destroyUserSessions(id);
    await audit(req.user.id, 'USER_DELETED', 'user', id, null, req.ip);
    res.json({ ok: true });
  }));

/* ---------- سجل التدقيق (الطبيب فقط) ---------- */
authRouter.get('/audit', requireAuth, requireRole('doctor'), asyncH(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);

  if (supabase) {
    const { data: rows } = await supabase.from('audit_log')
      .select('id, action, entity, entity_id, details, created_at, users(full_name)')
      .order('id', { ascending: false })
      .limit(limit);

    const entries = (rows || []).map(a => ({
      id: a.id,
      action: a.action,
      entity: a.entity,
      entityId: a.entity_id,
      details: a.details,
      createdAt: a.created_at,
      userName: a.users?.full_name || null
    }));
    return res.json({ entries });
  }

  const rows = db.prepare(`
    SELECT a.id, a.action, a.entity, a.entity_id AS entityId, a.details,
           a.created_at AS createdAt, u.full_name AS userName
    FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
    ORDER BY a.id DESC LIMIT ?
  `).all(limit);
  res.json({ entries: rows });
}));
