import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { audit } from '../lib/auth.js';
import { requireAuth, requireRole, csrfProtect, AppError, asyncH } from '../middleware/security.js';

export const backupRouter = Router();
backupRouter.use(requireAuth);
backupRouter.use(requireRole('doctor'));

const BACKUP_TABLES = [
  'users', 'patients', 'patient_medical', 'visits', 'treatments',
  'payments', 'appointments', 'tooth_chart', 'lab_works', 'counters'
];

/* ---------- قائمة النسخ الاحتياطية ---------- */
backupRouter.get('/list', asyncH(async (req, res) => {
  if (!supabase) throw new AppError(400, 'النسخ الاحتياطي يحتاج Supabase', 'NO_SUPABASE');

  const { data: backups, error } = await supabase.from('backups')
    .select('id, created_at, size_bytes, table_count, created_by, type')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    // Table may not exist yet — return empty
    return res.json({ backups: [] });
  }

  res.json({ backups: backups || [] });
}));

/* ---------- إنشاء نسخة احتياطية يدوية ---------- */
backupRouter.post('/create', csrfProtect, asyncH(async (req, res) => {
  if (!supabase) throw new AppError(400, 'النسخ الاحتياطي يحتاج Supabase', 'NO_SUPABASE');

  const backupData = { _meta: { created_at: new Date().toISOString(), type: 'manual', version: 1 } };
  let totalRows = 0;

  for (const table of BACKUP_TABLES) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.warn(`[Backup] Skipping table ${table}:`, error.message);
      continue;
    }
    backupData[table] = data || [];
    totalRows += (data || []).length;
  }

  const jsonStr = JSON.stringify(backupData);
  const sizeBytes = new TextEncoder().encode(jsonStr).length;

  // Store backup metadata in the backups table
  try {
    await supabase.from('backups').insert({
      created_by: req.user.id,
      type: 'manual',
      size_bytes: sizeBytes,
      table_count: BACKUP_TABLES.length,
      data: backupData,
    });
  } catch (e) {
    // If backups table doesn't exist, just skip storage
    console.warn('[Backup] Could not store backup metadata:', e.message);
  }

  await audit(req.user.id, 'BACKUP_CREATED', 'backup', null, { type: 'manual', size: sizeBytes, rows: totalRows }, req.ip);
  res.json({ backup: backupData, size: sizeBytes, rows: totalRows });
}));

/* ---------- تحميل نسخة محددة ---------- */
backupRouter.get('/download/:id', asyncH(async (req, res) => {
  if (!supabase) throw new AppError(400, 'النسخ الاحتياطي يحتاج Supabase', 'NO_SUPABASE');

  const { data: backup, error } = await supabase.from('backups')
    .select('data')
    .eq('id', Number(req.params.id))
    .maybeSingle();

  if (error || !backup) throw new AppError(404, 'النسخة الاحتياطية غير موجودة', 'NOT_FOUND');

  res.json(backup.data);
}));

/* ---------- استعادة نسخة محفوظة ---------- */
backupRouter.post('/restore/:id', csrfProtect, asyncH(async (req, res) => {
  if (!supabase) throw new AppError(400, 'النسخ الاحتياطي يحتاج Supabase', 'NO_SUPABASE');

  const { data: backup } = await supabase.from('backups')
    .select('data')
    .eq('id', Number(req.params.id))
    .maybeSingle();

  if (!backup) throw new AppError(404, 'النسخة الاحتياطية غير موجودة', 'NOT_FOUND');

  await restoreFromData(backup.data, req.user.id, req.ip);
  res.json({ ok: true });
}));

/* ---------- استعادة من ملف مرفوع ---------- */
backupRouter.post('/restore-file', csrfProtect, asyncH(async (req, res) => {
  if (!supabase) throw new AppError(400, 'النسخ الاحتياطي يحتاج Supabase', 'NO_SUPABASE');

  const { data } = req.body;
  if (!data || typeof data !== 'object') throw new AppError(400, 'بيانات غير صالحة', 'INVALID_DATA');

  await restoreFromData(data, req.user.id, req.ip);
  res.json({ ok: true });
}));

/* ---------- دالة الاستعادة المشتركة ---------- */
async function restoreFromData(data, userId, ip) {
  // Tables in correct order for FK constraints (delete in reverse order, insert in this order)
  const orderedTables = [
    'counters', 'users', 'patients', 'patient_medical', 'visits',
    'treatments', 'payments', 'appointments', 'tooth_chart', 'lab_works'
  ];

  // Delete in reverse order to respect FKs
  for (const table of [...orderedTables].reverse()) {
    if (!data[table]) continue;
    const { error } = await supabase.from(table).delete().neq('id', -99999);
    if (error) console.warn(`[Restore] Delete ${table}:`, error.message);
  }

  // Insert in order
  let totalRows = 0;
  for (const table of orderedTables) {
    if (!data[table] || !data[table].length) continue;
    // Insert in batches of 500
    const rows = data[table];
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500);
      const { error } = await supabase.from(table).insert(batch);
      if (error) console.warn(`[Restore] Insert ${table}:`, error.message);
    }
    totalRows += rows.length;
  }

  await audit(userId, 'BACKUP_RESTORED', 'backup', null, { rows: totalRows }, ip);
}

/* ---------- نسخة احتياطية تلقائية (تُنادى من المؤقت) ---------- */
export async function autoBackup() {
  if (!supabase) return;

  try {
    const backupData = { _meta: { created_at: new Date().toISOString(), type: 'auto', version: 1 } };
    let totalRows = 0;

    for (const table of BACKUP_TABLES) {
      const { data } = await supabase.from(table).select('*');
      backupData[table] = data || [];
      totalRows += (data || []).length;
    }

    const jsonStr = JSON.stringify(backupData);
    const sizeBytes = new TextEncoder().encode(jsonStr).length;

    await supabase.from('backups').insert({
      type: 'auto',
      size_bytes: sizeBytes,
      table_count: BACKUP_TABLES.length,
      data: backupData,
    });

    // Keep only last 30 backups (cleanup old ones)
    const { data: allBackups } = await supabase.from('backups')
      .select('id')
      .order('created_at', { ascending: false });

    if (allBackups && allBackups.length > 30) {
      const toDelete = allBackups.slice(30).map(b => b.id);
      await supabase.from('backups').delete().in('id', toDelete);
    }

    console.log(`[AutoBackup] Created: ${totalRows} rows, ${(sizeBytes / 1024).toFixed(1)} KB`);
  } catch (e) {
    console.error('[AutoBackup] Error:', e.message);
  }
}
