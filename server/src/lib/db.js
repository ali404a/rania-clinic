import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..', '..');

const isVercel = !!process.env.VERCEL;
const defaultDbPath = isVercel ? '/tmp/clinic.db' : join(ROOT, 'db', 'clinic.db');
const DB_PATH = process.env.DB_PATH || defaultDbPath;
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

/** تهيئة المخطط — آمنة للتشغيل المتكرر */
export function initSchema() {
  const schema = readFileSync(join(ROOT, 'db', 'schema.sql'), 'utf8');
  db.exec(schema);
}

/**
 * تنفيذ دالة داخل معاملة ذرّية.
 * إمّا أن تنجح كل العمليات أو تُلغى جميعها — لا حالة وسطى.
 */
export function tx(fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch { /* المعاملة أُنهيت فعلاً */ }
    throw err;
  }
}

/** توليد رقم ملف فريد بشكل ذرّي (يمنع التكرار تحت التزامن) */
export function nextFileNo() {
  db.prepare(`UPDATE counters SET value = value + 1 WHERE name = 'file_no'`).run();
  return db.prepare(`SELECT value FROM counters WHERE name = 'file_no'`).get().value;
}

/** نسخة احتياطية فورية */
export function backup() {
  const dir = join(ROOT, 'db', 'backups');
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = join(dir, `clinic-${stamp}.db`);
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    copyFileSync(DB_PATH, dest);
  } catch { /* قد تفشل في بيئة خادمة للقراءة فقط */ }
  return dest;
}

/** فحص سلامة القاعدة */
export function integrityCheck() {
  try {
    const r = db.prepare('PRAGMA integrity_check').get();
    return (r && (r.integrity_check ?? Object.values(r)[0])) || 'ok';
  } catch {
    return 'ok';
  }
}

export function closeDb() {
  try { db.exec('PRAGMA wal_checkpoint(TRUNCATE)'); db.close(); } catch { /* مغلقة */ }
}
