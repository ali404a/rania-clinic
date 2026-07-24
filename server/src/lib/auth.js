import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { db } from './db.js';

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
export function createSession(userId, { userAgent, ip } = {}) {
  const raw = randomBytes(32).toString('hex');      // 256-bit
  const csrfSecret = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  db.prepare(`
    INSERT INTO sessions (id, user_id, csrf_secret, user_agent, ip_address, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(sha256(raw), userId, csrfSecret, userAgent ?? null, ip ?? null, expires);
  return { token: raw, csrfToken: csrfSecret, expiresAt: expires };
}

/** جلب الجلسة والمستخدم + تجديد تلقائي (sliding expiration) */
export function getSession(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') return null;
  const row = db.prepare(`
    SELECT s.id, s.user_id, s.csrf_secret, s.expires_at,
           u.username, u.full_name, u.role, u.is_active, u.deleted_at, u.must_change_pw
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
  `).get(sha256(rawToken));

  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) { destroySession(rawToken); return null; }
  if (row.is_active !== 1 || row.deleted_at) { destroySession(rawToken); return null; }

  // تجديد: كل استخدام يمدّد الصلاحية ٣٠ يوماً أخرى
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

export function destroySession(rawToken) {
  if (!rawToken) return;
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sha256(rawToken));
}

/** إنهاء كل جلسات مستخدم (عند تعطيل الحساب أو تغيير كلمة المرور) */
export function destroyUserSessions(userId) {
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

export function purgeExpiredSessions() {
  const r = db.prepare(`DELETE FROM sessions WHERE expires_at < datetime('now')`).run();
  return r.changes;
}

/* ===================== قفل الحساب ضد القوة الغاشمة ===================== */
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export function isLocked(user) {
  return !!(user.locked_until && new Date(user.locked_until) > new Date());
}

export function registerFailedAttempt(userId) {
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

export function clearFailedAttempts(userId) {
  db.prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?').run(userId);
}

/* ===================== سجل التدقيق ===================== */
export function audit(userId, action, entity, entityId, details, ip) {
  try {
    db.prepare(`
      INSERT INTO audit_log (user_id, action, entity, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId ?? null, action, entity, entityId != null ? String(entityId) : null,
           details ? JSON.stringify(details) : null, ip ?? null);
  } catch { /* التدقيق لا يجب أن يُفشل العملية الأصلية */ }
}
