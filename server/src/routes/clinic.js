import { Router } from 'express';
import { db, tx } from '../lib/db.js';
import { audit } from '../lib/auth.js';
import { requireAuth, requireRole, csrfProtect, validate, AppError, asyncH } from '../middleware/security.js';
import { appointmentSchema, treatmentSchema, paymentSchema, labSchema } from '../lib/schemas.js';

export const clinicRouter = Router();
clinicRouter.use(requireAuth);

/* =====================================================================
   المواعيد
===================================================================== */
clinicRouter.get('/appointments', asyncH((req, res) => {
  const { from, to } = req.query;
  const where = ['a.deleted_at IS NULL'];
  const params = [];
  if (from) { where.push('a.appointment_date >= ?'); params.push(String(from)); }
  if (to)   { where.push('a.appointment_date <= ?'); params.push(String(to)); }

  const rows = db.prepare(`
    SELECT a.id, a.patient_id AS patientId, a.appointment_date AS appointmentDate,
           a.appointment_time AS appointmentTime, a.duration_min AS durationMin,
           a.treatment_type AS treatmentType, a.status, a.notes,
           p.full_name AS patientName, p.file_no AS fileNo, p.phone
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id AND p.deleted_at IS NULL
    WHERE ${where.join(' AND ')}
    ORDER BY a.appointment_date, a.appointment_time
    LIMIT 1000
  `).all(...params);
  res.json({ appointments: rows });
}));

clinicRouter.post('/appointments', csrfProtect, validate(appointmentSchema), asyncH((req, res) => {
  const b = req.body;
  const p = db.prepare('SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL').get(b.patientId);
  if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

  try {
    const info = db.prepare(`
      INSERT INTO appointments (patient_id, appointment_date, appointment_time,
        duration_min, treatment_type, status, notes, created_by)
      VALUES (?,?,?,?,?,?,?,?)
    `).run(b.patientId, b.appointmentDate, b.appointmentTime, b.durationMin,
           b.treatmentType, b.status, b.notes || null, req.user.id);
    audit(req.user.id, 'APPOINTMENT_CREATED', 'appointment', info.lastInsertRowid, b, req.ip);
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  } catch (e) {
    // القيد الفريد يمنع الحجز المزدوج على مستوى القاعدة
    if (String(e.message).includes('UNIQUE')) {
      throw new AppError(409, 'هذا الوقت محجوز لموعد آخر', 'SLOT_TAKEN');
    }
    throw e;
  }
}));

clinicRouter.patch('/appointments/:id', csrfProtect, validate(appointmentSchema), asyncH((req, res) => {
  const id = Number(req.params.id);
  const b = req.body;
  const exists = db.prepare('SELECT id FROM appointments WHERE id = ? AND deleted_at IS NULL').get(id);
  if (!exists) throw new AppError(404, 'الموعد غير موجود', 'NOT_FOUND');
  try {
    db.prepare(`
      UPDATE appointments SET patient_id=?, appointment_date=?, appointment_time=?,
        duration_min=?, treatment_type=?, status=?, notes=? WHERE id = ?
    `).run(b.patientId, b.appointmentDate, b.appointmentTime, b.durationMin,
           b.treatmentType, b.status, b.notes || null, id);
    audit(req.user.id, 'APPOINTMENT_UPDATED', 'appointment', id, b, req.ip);
    res.json({ ok: true });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      throw new AppError(409, 'هذا الوقت محجوز لموعد آخر', 'SLOT_TAKEN');
    }
    throw e;
  }
}));

clinicRouter.delete('/appointments/:id', csrfProtect, asyncH((req, res) => {
  const id = Number(req.params.id);
  const r = db.prepare(`UPDATE appointments SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL`).run(id);
  if (!r.changes) throw new AppError(404, 'الموعد غير موجود', 'NOT_FOUND');
  audit(req.user.id, 'APPOINTMENT_DELETED', 'appointment', id, null, req.ip);
  res.json({ ok: true });
}));

/* =====================================================================
   العلاجات والدفعات — معاملات ذرّية
===================================================================== */
clinicRouter.post('/treatments', csrfProtect, validate(treatmentSchema), asyncH((req, res) => {
  const b = req.body;
  const p = db.prepare('SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL').get(b.patientId);
  if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');
  if (b.initialPayment > b.totalCost) {
    throw new AppError(400, 'الدفعة الأولى أكبر من السعر الكلي', 'OVERPAY');
  }

  const id = tx(() => {
    const info = db.prepare(`
      INSERT INTO treatments (patient_id, name, details, total_cost, paid_amount, created_by)
      VALUES (?,?,?,?,?,?)
    `).run(b.patientId, b.name, b.details || null, b.totalCost, b.initialPayment, req.user.id);
    const tid = Number(info.lastInsertRowid);
    if (b.initialPayment > 0) {
      db.prepare(`
        INSERT INTO payments (treatment_id, patient_id, amount, received_by)
        VALUES (?,?,?,?)
      `).run(tid, b.patientId, b.initialPayment, req.user.id);
    }
    return tid;
  });

  audit(req.user.id, 'TREATMENT_CREATED', 'treatment', id, b, req.ip);
  res.status(201).json({ id });
}));

/**
 * تسجيل دفعة — العملية كلها ذرّية:
 * قراءة الرصيد + التحقق + إدراج الدفعة + تحديث المجموع
 * قيد CHECK في القاعدة يمنع تجاوز المدفوع للكلي حتى تحت التزامن.
 */
clinicRouter.post('/payments', csrfProtect, validate(paymentSchema), asyncH((req, res) => {
  const { treatmentId, amount, paidAt, method } = req.body;

  const result = tx(() => {
    const t = db.prepare(`
      SELECT id, patient_id, total_cost, paid_amount
      FROM treatments WHERE id = ? AND deleted_at IS NULL
    `).get(treatmentId);
    if (!t) throw new AppError(404, 'العلاج غير موجود', 'NOT_FOUND');

    const remaining = t.total_cost - t.paid_amount;
    if (amount > remaining) {
      throw new AppError(400, `المبلغ يتجاوز المتبقي (${remaining})`, 'OVERPAY');
    }

    db.prepare(`
      INSERT INTO payments (treatment_id, patient_id, amount, paid_at, method, received_by)
      VALUES (?,?,?,COALESCE(?, date('now')),?,?)
    `).run(treatmentId, t.patient_id, amount, paidAt || null, method || 'نقدي', req.user.id);

    db.prepare('UPDATE treatments SET paid_amount = paid_amount + ? WHERE id = ?')
      .run(amount, treatmentId);

    return { patientId: t.patient_id, newPaid: t.paid_amount + amount, total: t.total_cost };
  });

  audit(req.user.id, 'PAYMENT_RECEIVED', 'treatment', treatmentId, { amount }, req.ip);
  res.status(201).json(result);
}));

/** إلغاء دفعة (لا حذف — تدقيق مالي) */
clinicRouter.post('/payments/:id/void', requireRole('doctor'), csrfProtect, asyncH((req, res) => {
  const id = Number(req.params.id);
  const reason = String(req.body?.reason || '').slice(0, 200);

  tx(() => {
    const p = db.prepare('SELECT id, treatment_id, amount, voided_at FROM payments WHERE id = ?').get(id);
    if (!p) throw new AppError(404, 'الدفعة غير موجودة', 'NOT_FOUND');
    if (p.voided_at) throw new AppError(400, 'الدفعة ملغاة بالفعل', 'ALREADY_VOID');
    db.prepare(`UPDATE payments SET voided_at = datetime('now'), void_reason = ? WHERE id = ?`).run(reason, id);
    db.prepare('UPDATE treatments SET paid_amount = paid_amount - ? WHERE id = ?').run(p.amount, p.treatment_id);
  });

  audit(req.user.id, 'PAYMENT_VOIDED', 'payment', id, { reason }, req.ip);
  res.json({ ok: true });
}));

clinicRouter.get('/finance', asyncH((req, res) => {
  const totals = db.prepare(`
    SELECT COALESCE(SUM(total_cost),0) AS total,
           COALESCE(SUM(paid_amount),0) AS paid,
           COALESCE(SUM(total_cost - paid_amount),0) AS due
    FROM treatments WHERE deleted_at IS NULL
  `).get();

  const dueList = db.prepare(`
    SELECT p.id AS patientId, p.full_name AS patientName, p.file_no AS fileNo,
           f.total, f.paid, f.due
    FROM v_patient_finance f
    JOIN patients p ON p.id = f.patient_id
    WHERE f.due > 0 ORDER BY f.due DESC LIMIT 200
  `).all();

  const recent = db.prepare(`
    SELECT pay.id, pay.amount, pay.paid_at AS paidAt, pay.method,
           p.full_name AS patientName, t.name AS treatmentName
    FROM payments pay
    JOIN patients p ON p.id = pay.patient_id
    JOIN treatments t ON t.id = pay.treatment_id
    WHERE pay.voided_at IS NULL
    ORDER BY pay.id DESC LIMIT 50
  `).all();

  res.json({ totals, dueList, recentPayments: recent });
}));

/* =====================================================================
   المختبر (الطبيب فقط)
===================================================================== */
clinicRouter.get('/labs', requireRole('doctor'), asyncH((req, res) => {
  const rows = db.prepare(`
    SELECT l.id, l.patient_id AS patientId, l.work_details AS workDetails,
           l.lab_name AS labName, l.cost, l.status, l.due_date AS dueDate,
           p.full_name AS patientName
    FROM lab_works l
    JOIN patients p ON p.id = l.patient_id
    WHERE l.deleted_at IS NULL ORDER BY l.due_date
  `).all();
  res.json({ labs: rows });
}));

clinicRouter.post('/labs', requireRole('doctor'), csrfProtect, validate(labSchema), asyncH((req, res) => {
  const b = req.body;
  const p = db.prepare('SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL').get(b.patientId);
  if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');
  const info = db.prepare(`
    INSERT INTO lab_works (patient_id, work_details, lab_name, cost, status, due_date, created_by)
    VALUES (?,?,?,?,?,?,?)
  `).run(b.patientId, b.workDetails, b.labName || null, b.cost, b.status, b.dueDate || null, req.user.id);
  audit(req.user.id, 'LAB_CREATED', 'lab', info.lastInsertRowid, b, req.ip);
  res.status(201).json({ id: Number(info.lastInsertRowid) });
}));

clinicRouter.patch('/labs/:id', requireRole('doctor'), csrfProtect, validate(labSchema), asyncH((req, res) => {
  const id = Number(req.params.id);
  const b = req.body;
  const r = db.prepare(`
    UPDATE lab_works SET patient_id=?, work_details=?, lab_name=?, cost=?, status=?, due_date=?,
      updated_at=datetime('now')
    WHERE id = ? AND deleted_at IS NULL
  `).run(b.patientId, b.workDetails, b.labName || null, b.cost, b.status, b.dueDate || null, id);
  if (!r.changes) throw new AppError(404, 'عمل المختبر غير موجود', 'NOT_FOUND');
  audit(req.user.id, 'LAB_UPDATED', 'lab', id, b, req.ip);
  res.json({ ok: true });
}));

clinicRouter.delete('/labs/:id', requireRole('doctor'), csrfProtect, asyncH((req, res) => {
  const id = Number(req.params.id);
  const r = db.prepare(`UPDATE lab_works SET deleted_at=datetime('now') WHERE id=? AND deleted_at IS NULL`).run(id);
  if (!r.changes) throw new AppError(404, 'عمل المختبر غير موجود', 'NOT_FOUND');
  audit(req.user.id, 'LAB_DELETED', 'lab', id, null, req.ip);
  res.json({ ok: true });
}));

/* =====================================================================
   لوحة التحكم + التنبيهات (استعلام واحد مجمّع — سريع مع آلاف السجلات)
===================================================================== */
clinicRouter.get('/dashboard', asyncH((req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);

  const patientCount = db.prepare('SELECT COUNT(*) c FROM patients WHERE deleted_at IS NULL').get().c;
  const totals = db.prepare(`
    SELECT COALESCE(SUM(total_cost),0) total, COALESCE(SUM(paid_amount),0) paid,
           COALESCE(SUM(total_cost - paid_amount),0) due
    FROM treatments WHERE deleted_at IS NULL
  `).get();

  const todayAppointments = db.prepare(`
    SELECT a.id, a.patient_id AS patientId, a.appointment_time AS appointmentTime,
           a.duration_min AS durationMin, a.treatment_type AS treatmentType, a.status,
           p.full_name AS patientName
    FROM appointments a JOIN patients p ON p.id = a.patient_id
    WHERE a.appointment_date = ? AND a.deleted_at IS NULL AND p.deleted_at IS NULL
    ORDER BY a.appointment_time
  `).all(today);

  const tomorrowAppointments = db.prepare(`
    SELECT a.id, a.patient_id AS patientId, a.appointment_time AS appointmentTime,
           a.treatment_type AS treatmentType, p.full_name AS patientName
    FROM appointments a JOIN patients p ON p.id = a.patient_id
    WHERE a.appointment_date = ? AND a.deleted_at IS NULL AND p.deleted_at IS NULL
    ORDER BY a.appointment_time
  `).all(tomorrow);

  const dueInstallments = db.prepare(`
    SELECT p.id AS patientId, p.full_name AS patientName, f.due
    FROM v_patient_finance f JOIN patients p ON p.id = f.patient_id
    WHERE f.due > 0 ORDER BY f.due DESC LIMIT 20
  `).all();

  const followUps = db.prepare(`
    SELECT v.patient_id AS patientId, p.full_name AS patientName, v.visit_date AS visitDate,
           CAST(julianday('now') - julianday(v.visit_date) AS INTEGER) AS daysAgo
    FROM visits v JOIN patients p ON p.id = v.patient_id
    WHERE v.deleted_at IS NULL AND p.deleted_at IS NULL
      AND v.treatment_plan IS NOT NULL AND v.treatment_plan != ''
      AND julianday('now') - julianday(v.visit_date) BETWEEN 7 AND 30
    ORDER BY v.visit_date DESC LIMIT 20
  `).all();

  const recentPatients = db.prepare(`
    SELECT id, file_no AS fileNo, full_name AS fullName, age, gender, phone, created_at AS createdAt
    FROM patients WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 5
  `).all();

  const overdueLabs = db.prepare(`
    SELECT COUNT(*) c FROM lab_works
    WHERE deleted_at IS NULL AND status != 'تم الاستلام' AND due_date < ?
  `).get(today).c;

  res.json({
    stats: { patientCount, todayCount: todayAppointments.length, ...totals, overdueLabs },
    todayAppointments, tomorrowAppointments, dueInstallments, followUps, recentPatients,
  });
}));
