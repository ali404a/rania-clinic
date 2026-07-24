import { Router } from 'express';
import { db, tx, nextFileNo } from '../lib/db.js';
import { audit } from '../lib/auth.js';
import { requireAuth, requireRole, csrfProtect, validate, AppError, asyncH } from '../middleware/security.js';
import { patientSchema, visitSchema, toothSchema, listQuerySchema } from '../lib/schemas.js';

export const patientsRouter = Router();
patientsRouter.use(requireAuth);

/* ---------- قائمة المرضى (مرقّمة — لا تُرجع الآلاف دفعة واحدة) ---------- */
patientsRouter.get('/', validate(listQuerySchema, 'query'), asyncH((req, res) => {
  const { q, page, limit } = req.validatedQuery;
  const offset = (page - 1) * limit;

  const where = ['p.deleted_at IS NULL'];
  const params = [];
  if (q) {
    where.push('(p.full_name LIKE ? OR CAST(p.file_no AS TEXT) LIKE ? OR p.phone LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const whereSql = where.join(' AND ');

  const total = db.prepare(`SELECT COUNT(*) c FROM patients p WHERE ${whereSql}`).get(...params).c;
  const rows = db.prepare(`
    SELECT p.id, p.file_no AS fileNo, p.full_name AS fullName, p.age, p.gender,
           p.phone, p.address, p.occupation, p.created_at AS createdAt,
           m.chronic_diseases AS chronicDiseases, m.allergies,
           m.is_pregnant AS isPregnant, m.is_smoker AS isSmoker,
           COALESCE(f.total,0) AS total, COALESCE(f.paid,0) AS paid, COALESCE(f.due,0) AS due
    FROM patients p
    LEFT JOIN patient_medical m ON m.patient_id = p.id
    LEFT JOIN v_patient_finance f ON f.patient_id = p.id
    WHERE ${whereSql}
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({
    patients: rows.map(normalizePatient),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}));

const normalizePatient = (r) => ({
  ...r,
  isPregnant: r.isPregnant === 1,
  isSmoker: r.isSmoker === 1,
});

/* ---------- ملف مريض كامل ---------- */
patientsRouter.get('/:id', asyncH((req, res) => {
  const id = Number(req.params.id);
  const p = db.prepare(`
    SELECT p.id, p.file_no AS fileNo, p.full_name AS fullName, p.age, p.gender,
           p.phone, p.address, p.occupation, p.created_at AS createdAt,
           m.chronic_diseases AS chronicDiseases, m.allergies,
           m.is_pregnant AS isPregnant, m.is_smoker AS isSmoker
    FROM patients p LEFT JOIN patient_medical m ON m.patient_id = p.id
    WHERE p.id = ? AND p.deleted_at IS NULL
  `).get(id);
  if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

  const visits = db.prepare(`
    SELECT id, visit_date AS visitDate, reason, diagnosis,
           treatment_plan AS treatmentPlan, treatment_done AS treatmentDone
    FROM visits WHERE patient_id = ? AND deleted_at IS NULL
    ORDER BY visit_date DESC, id DESC
  `).all(id);

  const treatments = db.prepare(`
    SELECT id, name, details, total_cost AS totalCost, paid_amount AS paidAmount,
           started_at AS startedAt
    FROM treatments WHERE patient_id = ? AND deleted_at IS NULL ORDER BY id DESC
  `).all(id);

  const chart = {};
  db.prepare('SELECT tooth_no, condition FROM tooth_chart WHERE patient_id = ?')
    .all(id).forEach(t => { chart[t.tooth_no] = t.condition; });

  const appointments = db.prepare(`
    SELECT id, appointment_date AS appointmentDate, appointment_time AS appointmentTime,
           duration_min AS durationMin, treatment_type AS treatmentType, status
    FROM appointments WHERE patient_id = ? AND deleted_at IS NULL
    ORDER BY appointment_date DESC LIMIT 20
  `).all(id);

  const fin = db.prepare('SELECT total, paid, due FROM v_patient_finance WHERE patient_id = ?').get(id)
             || { total: 0, paid: 0, due: 0 };

  res.json({ patient: normalizePatient(p), visits, treatments, chart, appointments, finance: fin });
}));

/* ---------- إنشاء مريض (رقم ملف ذرّي) ---------- */
patientsRouter.post('/', csrfProtect, validate(patientSchema), asyncH((req, res) => {
  const b = req.body;
  const result = tx(() => {
    const fileNo = nextFileNo();
    const info = db.prepare(`
      INSERT INTO patients (file_no, full_name, age, gender, phone, address, occupation, created_by)
      VALUES (?,?,?,?,?,?,?,?)
    `).run(fileNo, b.fullName, b.age, b.gender, b.phone,
           b.address || null, b.occupation || null, req.user.id);
    const pid = Number(info.lastInsertRowid);
    db.prepare(`
      INSERT INTO patient_medical (patient_id, chronic_diseases, allergies, is_pregnant, is_smoker)
      VALUES (?,?,?,?,?)
    `).run(pid, b.chronicDiseases || null, b.allergies || null,
           b.isPregnant ? 1 : 0, b.isSmoker ? 1 : 0);
    return { id: pid, fileNo };
  });
  audit(req.user.id, 'PATIENT_CREATED', 'patient', result.id, { fileNo: result.fileNo }, req.ip);
  res.status(201).json({ patient: { ...result, ...b } });
}));

/* ---------- تعديل مريض ---------- */
patientsRouter.patch('/:id', csrfProtect, validate(patientSchema), asyncH((req, res) => {
  const id = Number(req.params.id);
  const b = req.body;
  const exists = db.prepare('SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL').get(id);
  if (!exists) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

  tx(() => {
    db.prepare(`
      UPDATE patients SET full_name=?, age=?, gender=?, phone=?, address=?, occupation=?
      WHERE id = ?
    `).run(b.fullName, b.age, b.gender, b.phone, b.address || null, b.occupation || null, id);
    db.prepare(`
      INSERT INTO patient_medical (patient_id, chronic_diseases, allergies, is_pregnant, is_smoker)
      VALUES (?,?,?,?,?)
      ON CONFLICT(patient_id) DO UPDATE SET
        chronic_diseases=excluded.chronic_diseases, allergies=excluded.allergies,
        is_pregnant=excluded.is_pregnant, is_smoker=excluded.is_smoker,
        updated_at=datetime('now')
    `).run(id, b.chronicDiseases || null, b.allergies || null,
           b.isPregnant ? 1 : 0, b.isSmoker ? 1 : 0);
  });
  audit(req.user.id, 'PATIENT_UPDATED', 'patient', id, null, req.ip);
  res.json({ ok: true });
}));

/* ---------- حذف منطقي (الطبيب فقط) ---------- */
patientsRouter.delete('/:id', requireRole('doctor'), csrfProtect, asyncH((req, res) => {
  const id = Number(req.params.id);
  const r = db.prepare(`UPDATE patients SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL`).run(id);
  if (!r.changes) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');
  audit(req.user.id, 'PATIENT_DELETED', 'patient', id, null, req.ip);
  res.json({ ok: true });
}));

/* =============== الزيارات (الطبيب فقط) =============== */
patientsRouter.post('/visits', requireRole('doctor'), csrfProtect,
  validate(visitSchema), asyncH((req, res) => {
    const b = req.body;
    const p = db.prepare('SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL').get(b.patientId);
    if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

    const info = db.prepare(`
      INSERT INTO visits (patient_id, visit_date, reason, diagnosis, treatment_plan, treatment_done, created_by)
      VALUES (?,?,?,?,?,?,?)
    `).run(b.patientId, b.visitDate, b.reason, b.diagnosis || null,
           b.treatmentPlan || null, b.treatmentDone || null, req.user.id);

    audit(req.user.id, 'VISIT_CREATED', 'visit', info.lastInsertRowid, { patientId: b.patientId }, req.ip);
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  }));

/* =============== مخطط الأسنان (الطبيب فقط) =============== */
patientsRouter.put('/tooth', requireRole('doctor'), csrfProtect,
  validate(toothSchema), asyncH((req, res) => {
    const { patientId, toothNo, condition } = req.body;
    const p = db.prepare('SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL').get(patientId);
    if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

    if (condition === '') {
      db.prepare('DELETE FROM tooth_chart WHERE patient_id = ? AND tooth_no = ?').run(patientId, toothNo);
    } else {
      db.prepare(`
        INSERT INTO tooth_chart (patient_id, tooth_no, condition, updated_by)
        VALUES (?,?,?,?)
        ON CONFLICT(patient_id, tooth_no) DO UPDATE SET
          condition = excluded.condition, updated_by = excluded.updated_by,
          updated_at = datetime('now')
      `).run(patientId, toothNo, condition, req.user.id);
    }
    res.json({ ok: true });
  }));
