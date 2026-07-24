import { Router } from 'express';
import { db, tx } from '../lib/db.js';
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
authRouter.post('/login', validate(loginSchema), asyncH((req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;

  const user = db.prepare(`
    SELECT id, username, password_hash, full_name, role, is_active,
           failed_attempts, locked_until, must_change_pw
    FROM users WHERE username = ? AND deleted_at IS NULL
  `).get(username);

  // رسالة واحدة للمستخدم غير الموجود وكلمة المرور الخاطئة (منع تعداد الحسابات)
  const generic = 'اسم المستخدم أو كلمة المرور غير صحيحة';

  if (!user) {
    audit(null, 'LOGIN_FAILED', 'user', null, { username, reason: 'not_found' }, ip);
    throw new AppError(401, generic, 'BAD_CREDENTIALS');
  }
  if (isLocked(user)) {
    audit(user.id, 'LOGIN_BLOCKED', 'user', user.id, null, ip);
    throw new AppError(429, 'الحساب مقفل مؤقتاً بسبب محاولات متكررة. حاول بعد ١٥ دقيقة.', 'LOCKED');
  }
  if (user.is_active !== 1) {
    audit(user.id, 'LOGIN_INACTIVE', 'user', user.id, null, ip);
    throw new AppError(403, 'الحساب معطّل. راجع الطبيب.', 'INACTIVE');
  }
  if (!verifyPassword(password, user.password_hash)) {
    registerFailedAttempt(user.id);
    audit(user.id, 'LOGIN_FAILED', 'user', user.id, { reason: 'bad_password' }, ip);
    throw new AppError(401, generic, 'BAD_CREDENTIALS');
  }

  clearFailedAttempts(user.id);
  const { token, csrfToken } = createSession(user.id, {
    userAgent: req.get('user-agent'), ip,
  });
  res.cookie(SESSION_COOKIE, token, cookieOpts());
  audit(user.id, 'LOGIN', 'user', user.id, null, ip);

  res.json({
    user: {
      id: user.id, username: user.username, fullName: user.full_name,
      role: user.role, mustChangePassword: user.must_change_pw === 1,
    },
    csrfToken,
  });
}));

/* ---------- الجلسة الحالية (يُستدعى عند كل تحميل صفحة) ---------- */
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user, csrfToken: req.session.csrfSecret });
});

/* ---------- تسجيل الخروج (الطريقة الوحيدة لإنهاء الجلسة) ---------- */
authRouter.post('/logout', requireAuth, csrfProtect, (req, res) => {
  destroySession(req.cookies[SESSION_COOKIE]);
  audit(req.user.id, 'LOGOUT', 'user', req.user.id, null, req.ip);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ ok: true });
});

/* ---------- تغيير كلمة المرور الشخصية ---------- */
authRouter.post('/change-password', requireAuth, csrfProtect,
  validate(changePasswordSchema), asyncH((req, res) => {
    const { currentPassword, newPassword } = req.body;
    const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    if (!verifyPassword(currentPassword, row.password_hash)) {
      throw new AppError(400, 'كلمة المرور الحالية غير صحيحة', 'BAD_PASSWORD');
    }
    db.prepare(`UPDATE users SET password_hash = ?, must_change_pw = 0 WHERE id = ?`)
      .run(hashPassword(newPassword), req.user.id);
    // إنهاء كل الجلسات الأخرى ثم إصدار جلسة جديدة لهذا الجهاز
    destroyUserSessions(req.user.id);
    const { token, csrfToken } = createSession(req.user.id, {
      userAgent: req.get('user-agent'), ip: req.ip,
    });
    res.cookie(SESSION_COOKIE, token, cookieOpts());
    audit(req.user.id, 'PASSWORD_CHANGED', 'user', req.user.id, null, req.ip);
    res.json({ ok: true, csrfToken });
  }));

/* =====================================================================
   إدارة المستخدمين — الطبيب فقط
===================================================================== */

authRouter.get('/users', requireAuth, requireRole('doctor'), (req, res) => {
  const rows = db.prepare(`
    SELECT id, username, full_name AS fullName, role, phone,
           is_active AS isActive, must_change_pw AS mustChangePassword,
           created_at AS createdAt,
           (SELECT COUNT(*) FROM sessions s WHERE s.user_id = users.id
              AND s.expires_at > datetime('now')) AS activeSessions
    FROM users WHERE deleted_at IS NULL ORDER BY role, full_name
  `).all();
  res.json({ users: rows.map(u => ({ ...u, isActive: u.isActive === 1 })) });
});

/** الطبيب ينشئ حساب السكرتيرة ويملأ كل البيانات */
authRouter.post('/users', requireAuth, requireRole('doctor'), csrfProtect,
  validate(createUserSchema), asyncH((req, res) => {
    const { username, password, fullName, role, phone } = req.body;

    const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (exists) throw new AppError(409, 'اسم المستخدم مستخدم بالفعل', 'DUPLICATE');

    const info = tx(() => db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, phone, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(username, hashPassword(password), fullName, role, phone || null, req.user.id));

    audit(req.user.id, 'USER_CREATED', 'user', info.lastInsertRowid,
          { username, role, fullName }, req.ip);
    res.status(201).json({
      user: { id: Number(info.lastInsertRowid), username, fullName, role, phone, isActive: true },
    });
  }));

authRouter.patch('/users/:id', requireAuth, requireRole('doctor'), csrfProtect,
  validate(updateUserSchema), asyncH((req, res) => {
    const id = Number(req.params.id);
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
    if (req.body.isActive === false) destroyUserSessions(id);   // طرد فوري

    audit(req.user.id, 'USER_UPDATED', 'user', id, req.body, req.ip);
    res.json({ ok: true });
  }));

authRouter.post('/users/:id/reset-password', requireAuth, requireRole('doctor'), csrfProtect,
  validate(resetPasswordSchema), asyncH((req, res) => {
    const id = Number(req.params.id);
    const target = db.prepare('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL').get(id);
    if (!target) throw new AppError(404, 'المستخدم غير موجود', 'NOT_FOUND');

    db.prepare('UPDATE users SET password_hash = ?, must_change_pw = 1, failed_attempts = 0, locked_until = NULL WHERE id = ?')
      .run(hashPassword(req.body.password), id);
    destroyUserSessions(id);
    audit(req.user.id, 'PASSWORD_RESET', 'user', id, null, req.ip);
    res.json({ ok: true });
  }));

authRouter.delete('/users/:id', requireAuth, requireRole('doctor'), csrfProtect,
  asyncH((req, res) => {
    const id = Number(req.params.id);
    if (id === req.user.id) throw new AppError(400, 'لا يمكنك حذف حسابك', 'SELF_DELETE');
    const target = db.prepare('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL').get(id);
    if (!target) throw new AppError(404, 'المستخدم غير موجود', 'NOT_FOUND');

    // آخر طبيب نشط لا يُحذف
    const doctors = db.prepare(`SELECT COUNT(*) c FROM users WHERE role='doctor' AND is_active=1 AND deleted_at IS NULL`).get().c;
    const isDoc = db.prepare('SELECT role FROM users WHERE id = ?').get(id).role === 'doctor';
    if (isDoc && doctors <= 1) throw new AppError(400, 'لا يمكن حذف آخر حساب طبيب', 'LAST_DOCTOR');

    db.prepare(`UPDATE users SET deleted_at = datetime('now'), is_active = 0 WHERE id = ?`).run(id);
    destroyUserSessions(id);
    audit(req.user.id, 'USER_DELETED', 'user', id, null, req.ip);
    res.json({ ok: true });
  }));

/* ---------- سجل التدقيق (الطبيب فقط) ---------- */
authRouter.get('/audit', requireAuth, requireRole('doctor'), (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const rows = db.prepare(`
    SELECT a.id, a.action, a.entity, a.entity_id AS entityId, a.details,
           a.created_at AS createdAt, u.full_name AS userName
    FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
    ORDER BY a.id DESC LIMIT ?
  `).all(limit);
  res.json({ entries: rows });
});
