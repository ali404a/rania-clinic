import { Router } from 'express';
import { db, tx } from '../lib/db.js';
import { supabase } from '../lib/supabase.js';
import { audit } from '../lib/auth.js';
import { requireAuth, requireRole, csrfProtect, validate, AppError, asyncH } from '../middleware/security.js';
import { appointmentSchema, treatmentSchema, paymentSchema, labSchema } from '../lib/schemas.js';

export const clinicRouter = Router();
clinicRouter.use(requireAuth);

/* =====================================================================
   المواعيد
===================================================================== */
clinicRouter.get('/appointments', asyncH(async (req, res) => {
  const { from, to } = req.query;

  if (supabase) {
    let query = supabase.from('appointments')
      .select('id, patient_id, appointment_date, appointment_time, duration_min, treatment_type, status, notes, patients(full_name, file_no, phone)')
      .is('deleted_at', null)
      .order('appointment_date')
      .order('appointment_time')
      .limit(1000);

    if (from) query = query.gte('appointment_date', String(from));
    if (to)   query = query.lte('appointment_date', String(to));

    const { data: rows, error } = await query;
    if (error) throw new AppError(500, error.message, 'DB_ERROR');

    const formatted = (rows || []).map(a => ({
      id: a.id,
      patientId: a.patient_id,
      appointmentDate: a.appointment_date,
      appointmentTime: a.appointment_time,
      durationMin: a.duration_min,
      treatmentType: a.treatment_type,
      status: a.status,
      notes: a.notes,
      patientName: a.patients?.full_name || '',
      fileNo: a.patients?.file_no,
      phone: a.patients?.phone,
    }));
    return res.json({ appointments: formatted });
  }

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

clinicRouter.post('/appointments', csrfProtect, validate(appointmentSchema), asyncH(async (req, res) => {
  const b = req.body;

  if (supabase) {
    const { data: p } = await supabase.from('patients').select('id').eq('id', b.patientId).is('deleted_at', null).maybeSingle();
    if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

    const { data: created, error } = await supabase.from('appointments').insert({
      patient_id: b.patientId,
      appointment_date: b.appointmentDate,
      appointment_time: b.appointmentTime,
      duration_min: b.durationMin,
      treatment_type: b.treatmentType,
      status: b.status,
      notes: b.notes || null,
      created_by: req.user.id
    }).select().single();

    if (error) {
      if (error.code === '23505') throw new AppError(409, 'هذا الوقت محجوز لموعد آخر', 'SLOT_TAKEN');
      throw new AppError(500, error.message, 'DB_ERROR');
    }

    await audit(req.user.id, 'APPOINTMENT_CREATED', 'appointment', created.id, b, req.ip);
    return res.status(201).json({ id: created.id });
  }

  const p = db.prepare('SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL').get(b.patientId);
  if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

  try {
    const info = db.prepare(`
      INSERT INTO appointments (patient_id, appointment_date, appointment_time,
        duration_min, treatment_type, status, notes, created_by)
      VALUES (?,?,?,?,?,?,?,?)
    `).run(b.patientId, b.appointmentDate, b.appointmentTime, b.durationMin,
           b.treatmentType, b.status, b.notes || null, req.user.id);
    await audit(req.user.id, 'APPOINTMENT_CREATED', 'appointment', info.lastInsertRowid, b, req.ip);
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      throw new AppError(409, 'هذا الوقت محجوز لموعد آخر', 'SLOT_TAKEN');
    }
    throw e;
  }
}));

clinicRouter.patch('/appointments/:id', csrfProtect, validate(appointmentSchema), asyncH(async (req, res) => {
  const id = Number(req.params.id);
  const b = req.body;

  if (supabase) {
    const { data: exists } = await supabase.from('appointments').select('id').eq('id', id).is('deleted_at', null).maybeSingle();
    if (!exists) throw new AppError(404, 'الموعد غير موجود', 'NOT_FOUND');

    const { error } = await supabase.from('appointments').update({
      patient_id: b.patientId,
      appointment_date: b.appointmentDate,
      appointment_time: b.appointmentTime,
      duration_min: b.durationMin,
      treatment_type: b.treatmentType,
      status: b.status,
      notes: b.notes || null
    }).eq('id', id);

    if (error) {
      if (error.code === '23505') throw new AppError(409, 'هذا الوقت محجوز لموعد آخر', 'SLOT_TAKEN');
      throw new AppError(500, error.message, 'DB_ERROR');
    }

    await audit(req.user.id, 'APPOINTMENT_UPDATED', 'appointment', id, b, req.ip);
    return res.json({ ok: true });
  }

  const exists = db.prepare('SELECT id FROM appointments WHERE id = ? AND deleted_at IS NULL').get(id);
  if (!exists) throw new AppError(404, 'الموعد غير موجود', 'NOT_FOUND');
  try {
    db.prepare(`
      UPDATE appointments SET patient_id=?, appointment_date=?, appointment_time=?,
        duration_min=?, treatment_type=?, status=?, notes=? WHERE id = ?
    `).run(b.patientId, b.appointmentDate, b.appointmentTime, b.durationMin,
           b.treatmentType, b.status, b.notes || null, id);
    await audit(req.user.id, 'APPOINTMENT_UPDATED', 'appointment', id, b, req.ip);
    res.json({ ok: true });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      throw new AppError(409, 'هذا الوقت محجوز لموعد آخر', 'SLOT_TAKEN');
    }
    throw e;
  }
}));

clinicRouter.delete('/appointments/:id', csrfProtect, asyncH(async (req, res) => {
  const id = Number(req.params.id);

  if (supabase) {
    const { data, error } = await supabase.from('appointments').update({ deleted_at: new Date().toISOString() }).eq('id', id).is('deleted_at', null).select();
    if (error || !data || !data.length) throw new AppError(404, 'الموعد غير موجود', 'NOT_FOUND');
    await audit(req.user.id, 'APPOINTMENT_DELETED', 'appointment', id, null, req.ip);
    return res.json({ ok: true });
  }

  const r = db.prepare(`UPDATE appointments SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL`).run(id);
  if (!r.changes) throw new AppError(404, 'الموعد غير موجود', 'NOT_FOUND');
  await audit(req.user.id, 'APPOINTMENT_DELETED', 'appointment', id, null, req.ip);
  res.json({ ok: true });
}));

/* =====================================================================
   العلاجات والدفعات
===================================================================== */
clinicRouter.post('/treatments', csrfProtect, validate(treatmentSchema), asyncH(async (req, res) => {
  const b = req.body;

  if (supabase) {
    const { data: p } = await supabase.from('patients').select('id').eq('id', b.patientId).is('deleted_at', null).maybeSingle();
    if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');
    if (b.initialPayment > b.totalCost) {
      throw new AppError(400, 'الدفعة الأولى أكبر من السعر الكلي', 'OVERPAY');
    }

    const { data: created, error: tErr } = await supabase.from('treatments').insert({
      patient_id: b.patientId,
      name: b.name,
      details: b.details || null,
      total_cost: b.totalCost,
      paid_amount: b.initialPayment,
      created_by: req.user.id
    }).select().single();

    if (tErr) throw new AppError(500, tErr.message, 'DB_ERROR');

    if (b.initialPayment > 0) {
      await supabase.from('payments').insert({
        treatment_id: created.id,
        patient_id: b.patientId,
        amount: b.initialPayment,
        received_by: req.user.id
      });
    }

    await audit(req.user.id, 'TREATMENT_CREATED', 'treatment', created.id, b, req.ip);
    return res.status(201).json({ id: created.id });
  }

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

  await audit(req.user.id, 'TREATMENT_CREATED', 'treatment', id, b, req.ip);
  res.status(201).json({ id });
}));

clinicRouter.post('/payments', csrfProtect, validate(paymentSchema), asyncH(async (req, res) => {
  const { treatmentId, amount, paidAt, method } = req.body;

  if (supabase) {
    const { data: t } = await supabase.from('treatments')
      .select('id, patient_id, total_cost, paid_amount')
      .eq('id', treatmentId)
      .is('deleted_at', null)
      .maybeSingle();

    if (!t) throw new AppError(404, 'العلاج غير موجود', 'NOT_FOUND');

    const remaining = t.total_cost - t.paid_amount;
    if (amount > remaining) {
      throw new AppError(400, `المبلغ يتجاوز المتبقي (${remaining})`, 'OVERPAY');
    }

    await supabase.from('payments').insert({
      treatment_id: treatmentId,
      patient_id: t.patient_id,
      amount,
      paid_at: paidAt || new Date().toISOString().slice(0, 10),
      method: method || 'نقدي',
      received_by: req.user.id
    });

    const newPaid = t.paid_amount + amount;
    await supabase.from('treatments').update({ paid_amount: newPaid }).eq('id', treatmentId);

    await audit(req.user.id, 'PAYMENT_RECEIVED', 'treatment', treatmentId, { amount }, req.ip);
    return res.status(201).json({ patientId: t.patient_id, newPaid, total: t.total_cost });
  }

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

  await audit(req.user.id, 'PAYMENT_RECEIVED', 'treatment', treatmentId, { amount }, req.ip);
  res.status(201).json(result);
}));

clinicRouter.post('/payments/:id/void', requireRole('doctor'), csrfProtect, asyncH(async (req, res) => {
  const id = Number(req.params.id);
  const reason = String(req.body?.reason || '').slice(0, 200);

  if (supabase) {
    const { data: p } = await supabase.from('payments').select('id, treatment_id, amount, voided_at').eq('id', id).maybeSingle();
    if (!p) throw new AppError(404, 'الدفعة غير موجودة', 'NOT_FOUND');
    if (p.voided_at) throw new AppError(400, 'الدفعة ملغاة بالفعل', 'ALREADY_VOID');

    await supabase.from('payments').update({ voided_at: new Date().toISOString(), void_reason: reason }).eq('id', id);

    const { data: t } = await supabase.from('treatments').select('paid_amount').eq('id', p.treatment_id).single();
    if (t) {
      await supabase.from('treatments').update({ paid_amount: Math.max(0, t.paid_amount - p.amount) }).eq('id', p.treatment_id);
    }

    await audit(req.user.id, 'PAYMENT_VOIDED', 'payment', id, { reason }, req.ip);
    return res.json({ ok: true });
  }

  tx(() => {
    const p = db.prepare('SELECT id, treatment_id, amount, voided_at FROM payments WHERE id = ?').get(id);
    if (!p) throw new AppError(404, 'الدفعة غير موجودة', 'NOT_FOUND');
    if (p.voided_at) throw new AppError(400, 'الدفعة ملغاة بالفعل', 'ALREADY_VOID');
    db.prepare(`UPDATE payments SET voided_at = datetime('now'), void_reason = ? WHERE id = ?`).run(reason, id);
    db.prepare('UPDATE treatments SET paid_amount = paid_amount - ? WHERE id = ?').run(p.amount, p.treatment_id);
  });

  await audit(req.user.id, 'PAYMENT_VOIDED', 'payment', id, { reason }, req.ip);
  res.json({ ok: true });
}));

clinicRouter.get('/finance', asyncH(async (req, res) => {
  if (supabase) {
    const { data: treatRows } = await supabase.from('treatments').select('total_cost, paid_amount').is('deleted_at', null);
    let total = 0, paid = 0;
    (treatRows || []).forEach(t => {
      total += Number(t.total_cost || 0);
      paid += Number(t.paid_amount || 0);
    });

    const { data: dueRows } = await supabase.from('v_patient_finance')
      .select('patient_id, total, paid, due')
      .gt('due', 0)
      .order('due', { ascending: false })
      .limit(200);

    let dueList = [];
    if (dueRows && dueRows.length > 0) {
      const pids = dueRows.map(d => d.patient_id);
      const { data: pData } = await supabase.from('patients').select('id, full_name, file_no').in('id', pids);
      const pMap = {};
      (pData || []).forEach(p => { pMap[p.id] = p; });
      dueList = dueRows.map(f => ({
        patientId: f.patient_id,
        patientName: pMap[f.patient_id]?.full_name || '',
        fileNo: pMap[f.patient_id]?.file_no,
        total: f.total,
        paid: f.paid,
        due: f.due
      }));
    }

    const { data: payRows } = await supabase.from('payments')
      .select('id, amount, paid_at, method, patient_id, treatment_id')
      .is('voided_at', null)
      .order('id', { ascending: false })
      .limit(50);

    let recentPayments = [];
    if (payRows && payRows.length > 0) {
      const pids = payRows.map(p => p.patient_id);
      const tids = payRows.map(p => p.treatment_id);
      const { data: pData } = await supabase.from('patients').select('id, full_name').in('id', pids);
      const { data: tData } = await supabase.from('treatments').select('id, name').in('id', tids);
      const pMap = {}, tMap = {};
      (pData || []).forEach(p => { pMap[p.id] = p.full_name; });
      (tData || []).forEach(t => { tMap[t.id] = t.name; });

      recentPayments = payRows.map(p => ({
        id: p.id,
        amount: p.amount,
        paidAt: p.paid_at,
        method: p.method,
        patientName: pMap[p.patient_id] || '',
        treatmentName: tMap[p.treatment_id] || ''
      }));
    }

    return res.json({ totals: { total, paid, due: total - paid }, dueList, recentPayments });
  }

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
   المختبر
===================================================================== */
clinicRouter.get('/labs', requireRole('doctor'), asyncH(async (req, res) => {
  if (supabase) {
    const { data: rows } = await supabase.from('lab_works')
      .select('id, patient_id, work_details, lab_name, cost, status, due_date, patients(full_name)')
      .is('deleted_at', null)
      .order('due_date');

    const formatted = (rows || []).map(l => ({
      id: l.id,
      patientId: l.patient_id,
      workDetails: l.work_details,
      labName: l.lab_name,
      cost: l.cost,
      status: l.status,
      dueDate: l.due_date,
      patientName: l.patients?.full_name || ''
    }));
    return res.json({ labs: formatted });
  }

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

clinicRouter.post('/labs', requireRole('doctor'), csrfProtect, validate(labSchema), asyncH(async (req, res) => {
  const b = req.body;

  if (supabase) {
    const { data: p } = await supabase.from('patients').select('id').eq('id', b.patientId).is('deleted_at', null).maybeSingle();
    if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

    const { data: created, error } = await supabase.from('lab_works').insert({
      patient_id: b.patientId,
      work_details: b.workDetails,
      lab_name: b.labName || null,
      cost: b.cost,
      status: b.status,
      due_date: b.dueDate || null,
      created_by: req.user.id
    }).select().single();

    if (error) throw new AppError(500, error.message, 'DB_ERROR');

    await audit(req.user.id, 'LAB_CREATED', 'lab', created.id, b, req.ip);
    return res.status(201).json({ id: created.id });
  }

  const p = db.prepare('SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL').get(b.patientId);
  if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');
  const info = db.prepare(`
    INSERT INTO lab_works (patient_id, work_details, lab_name, cost, status, due_date, created_by)
    VALUES (?,?,?,?,?,?,?)
  `).run(b.patientId, b.workDetails, b.labName || null, b.cost, b.status, b.dueDate || null, req.user.id);
  await audit(req.user.id, 'LAB_CREATED', 'lab', info.lastInsertRowid, b, req.ip);
  res.status(201).json({ id: Number(info.lastInsertRowid) });
}));

clinicRouter.patch('/labs/:id', requireRole('doctor'), csrfProtect, validate(labSchema), asyncH(async (req, res) => {
  const id = Number(req.params.id);
  const b = req.body;

  if (supabase) {
    const { data, error } = await supabase.from('lab_works').update({
      patient_id: b.patientId,
      work_details: b.workDetails,
      lab_name: b.labName || null,
      cost: b.cost,
      status: b.status,
      due_date: b.dueDate || null,
      updated_at: new Date().toISOString()
    }).eq('id', id).is('deleted_at', null).select();

    if (error || !data || !data.length) throw new AppError(404, 'عمل المختبر غير موجود', 'NOT_FOUND');
    await audit(req.user.id, 'LAB_UPDATED', 'lab', id, b, req.ip);
    return res.json({ ok: true });
  }

  const r = db.prepare(`
    UPDATE lab_works SET patient_id=?, work_details=?, lab_name=?, cost=?, status=?, due_date=?,
      updated_at=datetime('now')
    WHERE id = ? AND deleted_at IS NULL
  `).run(b.patientId, b.workDetails, b.labName || null, b.cost, b.status, b.dueDate || null, id);
  if (!r.changes) throw new AppError(404, 'عمل المختبر غير موجود', 'NOT_FOUND');
  await audit(req.user.id, 'LAB_UPDATED', 'lab', id, b, req.ip);
  res.json({ ok: true });
}));

clinicRouter.delete('/labs/:id', requireRole('doctor'), csrfProtect, asyncH(async (req, res) => {
  const id = Number(req.params.id);

  if (supabase) {
    const { data, error } = await supabase.from('lab_works').update({ deleted_at: new Date().toISOString() }).eq('id', id).is('deleted_at', null).select();
    if (error || !data || !data.length) throw new AppError(404, 'عمل المختبر غير موجود', 'NOT_FOUND');
    await audit(req.user.id, 'LAB_DELETED', 'lab', id, null, req.ip);
    return res.json({ ok: true });
  }

  const r = db.prepare(`UPDATE lab_works SET deleted_at=datetime('now') WHERE id=? AND deleted_at IS NULL`).run(id);
  if (!r.changes) throw new AppError(404, 'عمل المختبر غير موجود', 'NOT_FOUND');
  await audit(req.user.id, 'LAB_DELETED', 'lab', id, null, req.ip);
  res.json({ ok: true });
}));

/* =====================================================================
   لوحة التحكم
===================================================================== */
clinicRouter.get('/dashboard', asyncH(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);

  if (supabase) {
    const { count: patientCount } = await supabase.from('patients').select('*', { count: 'exact', head: true }).is('deleted_at', null);

    const { data: treatRows } = await supabase.from('treatments').select('total_cost, paid_amount').is('deleted_at', null);
    let total = 0, paid = 0;
    (treatRows || []).forEach(t => {
      total += Number(t.total_cost || 0);
      paid += Number(t.paid_amount || 0);
    });

    const { data: todayApts } = await supabase.from('appointments')
      .select('id, patient_id, appointment_time, duration_min, treatment_type, status, patients(full_name)')
      .eq('appointment_date', today)
      .is('deleted_at', null)
      .order('appointment_time');

    const todayAppointments = (todayApts || []).map(a => ({
      id: a.id, patientId: a.patient_id, appointmentTime: a.appointment_time,
      durationMin: a.duration_min, treatmentType: a.treatment_type, status: a.status,
      patientName: a.patients?.full_name || ''
    }));

    const { data: tmwApts } = await supabase.from('appointments')
      .select('id, patient_id, appointment_time, treatment_type, patients(full_name)')
      .eq('appointment_date', tomorrow)
      .is('deleted_at', null)
      .order('appointment_time');

    const tomorrowAppointments = (tmwApts || []).map(a => ({
      id: a.id, patientId: a.patient_id, appointmentTime: a.appointment_time,
      treatmentType: a.treatment_type, patientName: a.patients?.full_name || ''
    }));

    const { data: dueRows } = await supabase.from('v_patient_finance')
      .select('patient_id, due')
      .gt('due', 0)
      .order('due', { ascending: false })
      .limit(20);

    let dueInstallments = [];
    if (dueRows && dueRows.length > 0) {
      const pids = dueRows.map(d => d.patient_id);
      const { data: pData } = await supabase.from('patients').select('id, full_name').in('id', pids);
      const pMap = {};
      (pData || []).forEach(p => { pMap[p.id] = p.full_name; });
      dueInstallments = dueRows.map(f => ({
        patientId: f.patient_id, patientName: pMap[f.patient_id] || '', due: f.due
      }));
    }

    const { data: recentPats } = await supabase.from('patients')
      .select('id, file_no, full_name, age, gender, phone, created_at')
      .is('deleted_at', null)
      .order('id', { ascending: false })
      .limit(5);

    const recentPatients = (recentPats || []).map(p => ({
      id: p.id, fileNo: p.file_no, fullName: p.full_name, age: p.age,
      gender: p.gender, phone: p.phone, createdAt: p.created_at
    }));

    const { count: overdueLabs } = await supabase.from('lab_works')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .neq('status', 'تم الاستلام')
      .lt('due_date', today);

    return res.json({
      stats: { patientCount: patientCount || 0, todayCount: todayAppointments.length, total, paid, due: total - paid, overdueLabs: overdueLabs || 0 },
      todayAppointments, tomorrowAppointments, dueInstallments, followUps: [], recentPatients,
    });
  }

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
