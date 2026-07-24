import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { db } from './db.js';
import { supabase } from './supabase.js';

/* ===================== كلمات المرور ===================== */
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

/** تجزئة كلمة المرور بملح عشوائي — scrypt مقاوم لهجمات GPU */
export function hashPassword(plain) {
  const salt = randomBytes(16);
  const key = scryptSync(plain, salt, SCRYPT.keylen, SCRYPT);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

/** مقارنة بزمن ثابت — تمنع هجمات التوقيت */
export function verifyPassword(plain, stored) {
  try {
    const [alg, saltHex, keyHex] = String(stored).split('$');
    if (alg !== 'scrypt' || !saltHex || !keyHex) return false;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(keyHex, 'hex');
    const actual = scryptSync(plain, salt, expected.length, SCRYPT);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/* ===================== الجلسات ===================== */
// ٣٠ يوماً — الدخول يبقى رغم تحديث الصفحة أو إغلاق المتصفح
export const SESSION_DAYS = 30;
export const SESSION_COOKIE = 'clinic_sid';

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

/**
 * إنشاء جلسة. نُخزّن تجزئة الرمز فقط — تسريب القاعدة لا يمنح دخولاً.
 * يُعاد الرمز الخام مرة واحدة ليوضع في كوكي HttpOnly.
 */
export async function createSession(userId, { userAgent, ip } = {}) {
  const raw = randomBytes(32).toString('hex');      // 256-bit
  const csrfSecret = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();

  if (supabase) {
    await supabase.from('sessions').insert({
      id: sha256(raw),
      user_id: userId,
      csrf_secret: csrfSecret,
      user_agent: userAgent ?? null,
      ip_address: ip ?? null,
      expires_at: expires
    });
  } else {
    db.prepare(`
      INSERT INTO sessions (id, user_id, csrf_secret, user_agent, ip_address, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(sha256(raw), userId, csrfSecret, userAgent ?? null, ip ?? null, expires);
  }

  return { token: raw, csrfToken: csrfSecret, expiresAt: expires };
}

/** جلب الجلسة والمستخدم + تجديد تلقائي (sliding expiration) */
export async function getSession(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') return null;
  const tokenHash = sha256(rawToken);

  if (supabase) {
    const { data: row, error } = await supabase.from('sessions')
      .select('*, users(*)')
      .eq('id', tokenHash)
      .maybeSingle();

    if (error || !row || !row.users) return null;
    const u = row.users;
    if (new Date(row.expires_at) < new Date()) { await destroySession(rawToken); return null; }
    if (!u.is_active || u.deleted_at) { await destroySession(rawToken); return null; }

    // تجديد: كل استخدام يمدّد الصلاحية ٣٠ يوماً أخرى
    const fresh = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
    await supabase.from('sessions')
      .update({ last_seen_at: new Date().toISOString(), expires_at: fresh })
      .eq('id', tokenHash);

    return {
      sessionId: row.id,
      csrfSecret: row.csrf_secret,
      user: {
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        role: u.role,
        mustChangePassword: u.must_change_pw === true || u.must_change_pw === 1,
      },
    };
  } else {
    const row = db.prepare(`
      SELECT s.id, s.user_id, s.csrf_secret, s.expires_at,
             u.username, u.full_name, u.role, u.is_active, u.deleted_at, u.must_change_pw
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
    `).get(tokenHash);

    if (!row) return null;
    if (new Date(row.expires_at) < new Date()) { await destroySession(rawToken); return null; }
    if (row.is_active !== 1 || row.deleted_at) { destroySession(rawToken); return null; }

    const fresh = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
    db.prepare(`UPDATE sessions SET last_seen_at = datetime('now'), expires_at = ? WHERE id = ?`)
      .run(fresh, row.id);

    return {
      sessionId: row.id,
      csrfSecret: row.csrf_secret,
      user: {
        id: row.user_id,
        username: row.username,
        fullName: row.full_name,
        role: row.role,
        mustChangePassword: row.must_change_pw === 1,
      },
    };
  }
}

export async function destroySession(rawToken) {
  if (!rawToken) return;
  const tokenHash = sha256(rawToken);
  if (supabase) {
    await supabase.from('sessions').delete().eq('id', tokenHash);
  } else {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(tokenHash);
  }
}

/** إنهاء كل جلسات مستخدم (عند تعطيل الحساب أو تغيير كلمة المرور) */
export async function destroyUserSessions(userId) {
  if (supabase) {
    await supabase.from('sessions').delete().eq('user_id', userId);
  } else {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
  }
}

export async function purgeExpiredSessions() {
  const now = new Date().toISOString();
  if (supabase) {
    const { data } = await supabase.from('sessions').delete().lt('expires_at', now).select();
    return data?.length || 0;
  } else {
    const r = db.prepare(`DELETE FROM sessions WHERE expires_at < datetime('now')`).run();
    return r.changes;
  }
}

/* ===================== قفل الحساب ضد القوة الغاشمة ===================== */
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export function isLocked(user) {
  return !!(user.locked_until && new Date(user.locked_until) > new Date());
}

export async function registerFailedAttempt(userId) {
  if (supabase) {
    const { data: u } = await supabase.from('users').select('failed_attempts').eq('id', userId).single();
    const attempts = (u?.failed_attempts ?? 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const until = new Date(Date.now() + LOCK_MINUTES * 60000).toISOString();
      await supabase.from('users').update({ failed_attempts: attempts, locked_until: until }).eq('id', userId);
    } else {
      await supabase.from('users').update({ failed_attempts: attempts }).eq('id', userId);
    }
  } else {
    const u = db.prepare('SELECT failed_attempts FROM users WHERE id = ?').get(userId);
    const attempts = (u?.failed_attempts ?? 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const until = new Date(Date.now() + LOCK_MINUTES * 60000).toISOString();
      db.prepare('UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?')
        .run(attempts, until, userId);
    } else {
      db.prepare('UPDATE users SET failed_attempts = ? WHERE id = ?').run(attempts, userId);
    }
  }
}

export async function clearFailedAttempts(userId) {
  if (supabase) {
    await supabase.from('users').update({ failed_attempts: 0, locked_until: null }).eq('id', userId);
  } else {
    db.prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?').run(userId);
  }
}

/* ===================== سجل التدقيق ===================== */
export async function audit(userId, action, entity, entityId, details, ip) {
  try {
    if (supabase) {
      await supabase.from('audit_log').insert({
        user_id: userId ?? null,
        action,
        entity,
        entity_id: entityId != null ? String(entityId) : null,
        details: details ? JSON.stringify(details) : null,
        ip_address: ip ?? null
      });
    } else {
      db.prepare(`
        INSERT INTO audit_log (user_id, action, entity, entity_id, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId ?? null, action, entity, entityId != null ? String(entityId) : null,
             details ? JSON.stringify(details) : null, ip ?? null);
    }
  } catch { /* التدقيق لا يجب أن يُفشل العملية الأصلية */ }
}
