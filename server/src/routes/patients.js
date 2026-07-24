import { Router } from 'express';
import { db, tx, nextFileNo } from '../lib/db.js';
import { supabase } from '../lib/supabase.js';
import { audit } from '../lib/auth.js';
import { requireAuth, requireRole, csrfProtect, validate, AppError, asyncH } from '../middleware/security.js';
import { patientSchema, visitSchema, toothSchema, listQuerySchema } from '../lib/schemas.js';

export const patientsRouter = Router();
patientsRouter.use(requireAuth);

const normalizePatient = (r) => ({
  ...r,
  isPregnant: r.isPregnant === true || r.isPregnant === 1,
  isSmoker: r.isSmoker === true || r.isSmoker === 1,
});

/* ---------- قائمة المرضى ---------- */
patientsRouter.get('/', validate(listQuerySchema, 'query'), asyncH(async (req, res) => {
  const { q, page, limit } = req.validatedQuery;
  const offset = (page - 1) * limit;

  if (supabase) {
    let query = supabase.from('patients')
      .select('id, file_no, full_name, age, gender, phone, address, occupation, created_at, patient_medical(*)', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (q) {
      query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    const { data: rows, count, error } = await query.range(offset, offset + limit - 1);
    if (error) throw new AppError(500, error.message, 'DB_ERROR');

    const total = count || 0;
    const patientIds = (rows || []).map(r => r.id);
    let financeMap = {};
    if (patientIds.length > 0) {
      const { data: finRows } = await supabase.from('v_patient_finance')
        .select('patient_id, total, paid, due')
        .in('patient_id', patientIds);

      (finRows || []).forEach(f => {
        financeMap[f.patient_id] = f;
      });
    }

    const formatted = (rows || []).map(r => {
      const med = Array.isArray(r.patient_medical) ? r.patient_medical[0] : r.patient_medical;
      const fin = financeMap[r.id] || { total: 0, paid: 0, due: 0 };
      return normalizePatient({
        id: r.id,
        fileNo: r.file_no,
        fullName: r.full_name,
        age: r.age,
        gender: r.gender,
        phone: r.phone,
        address: r.address,
        occupation: r.occupation,
        createdAt: r.created_at,
        chronicDiseases: med?.chronic_diseases || null,
        allergies: med?.allergies || null,
        isPregnant: med?.is_pregnant,
        isSmoker: med?.is_smoker,
        total: fin.total || 0,
        paid: fin.paid || 0,
        due: fin.due || 0,
      });
    });

    return res.json({
      patients: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  }

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
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
}));

/* ---------- ملف مريض كامل ---------- */
patientsRouter.get('/:id', asyncH(async (req, res) => {
  const id = Number(req.params.id);

  if (supabase) {
    const { data: p, error } = await supabase.from('patients')
      .select('*, patient_medical(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

    const med = Array.isArray(p.patient_medical) ? p.patient_medical[0] : p.patient_medical;

    const { data: visitsRows } = await supabase.from('visits')
      .select('id, visit_date, reason, diagnosis, treatment_plan, treatment_done')
      .eq('patient_id', id)
      .is('deleted_at', null)
      .order('visit_date', { ascending: false });

    const visits = (visitsRows || []).map(v => ({
      id: v.id, visitDate: v.visit_date, reason: v.reason, diagnosis: v.diagnosis,
      treatmentPlan: v.treatment_plan, treatmentDone: v.treatment_done
    }));

    const { data: treatRows } = await supabase.from('treatments')
      .select('id, name, details, total_cost, paid_amount, started_at')
      .eq('patient_id', id)
      .is('deleted_at', null)
      .order('id', { ascending: false });

    const treatments = (treatRows || []).map(t => ({
      id: t.id, name: t.name, details: t.details, totalCost: t.total_cost,
      paidAmount: t.paid_amount, startedAt: t.started_at
    }));

    const { data: chartRows } = await supabase.from('tooth_chart')
      .select('tooth_no, condition')
      .eq('patient_id', id);

    const chart = {};
    (chartRows || []).forEach(t => { chart[t.tooth_no] = t.condition; });

    const { data: aptRows } = await supabase.from('appointments')
      .select('id, appointment_date, appointment_time, duration_min, treatment_type, status')
      .eq('patient_id', id)
      .is('deleted_at', null)
      .order('appointment_date', { ascending: false })
      .limit(20);

    const appointments = (aptRows || []).map(a => ({
      id: a.id, appointmentDate: a.appointment_date, appointmentTime: a.appointment_time,
      durationMin: a.duration_min, treatmentType: a.treatment_type, status: a.status
    }));

    const { data: finRow } = await supabase.from('v_patient_finance')
      .select('total, paid, due')
      .eq('patient_id', id)
      .maybeSingle();

    const finance = finRow || { total: 0, paid: 0, due: 0 };

    const patientFormatted = normalizePatient({
      id: p.id,
      fileNo: p.file_no,
      fullName: p.full_name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      address: p.address,
      occupation: p.occupation,
      createdAt: p.created_at,
      chronicDiseases: med?.chronic_diseases || null,
      allergies: med?.allergies || null,
      isPregnant: med?.is_pregnant,
      isSmoker: med?.is_smoker,
    });

    return res.json({ patient: patientFormatted, visits, treatments, chart, appointments, finance });
  }

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

/* ---------- إنشاء مريض ---------- */
patientsRouter.post('/', csrfProtect, validate(patientSchema), asyncH(async (req, res) => {
  const b = req.body;

  if (supabase) {
    const { data: counterData } = await supabase.from('counters').select('value').eq('name', 'file_no').single();
    const currentNo = counterData?.value || 1000;
    const fileNo = currentNo + 1;
    await supabase.from('counters').update({ value: fileNo }).eq('name', 'file_no');

    const { data: newPatient, error: pErr } = await supabase.from('patients').insert({
      file_no: fileNo,
      full_name: b.fullName,
      age: b.age,
      gender: b.gender,
      phone: b.phone,
      address: b.address || null,
      occupation: b.occupation || null,
      created_by: req.user.id
    }).select().single();

    if (pErr) throw new AppError(500, pErr.message, 'DB_ERROR');

    await supabase.from('patient_medical').insert({
      patient_id: newPatient.id,
      chronic_diseases: b.chronicDiseases || null,
      allergies: b.allergies || null,
      is_pregnant: b.isPregnant || false,
      is_smoker: b.isSmoker || false
    });

    await audit(req.user.id, 'PATIENT_CREATED', 'patient', newPatient.id, { fileNo }, req.ip);
    return res.status(201).json({ patient: { id: newPatient.id, fileNo, ...b } });
  }

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
  await audit(req.user.id, 'PATIENT_CREATED', 'patient', result.id, { fileNo: result.fileNo }, req.ip);
  res.status(201).json({ patient: { ...result, ...b } });
}));

/* ---------- تعديل مريض ---------- */
patientsRouter.patch('/:id', csrfProtect, validate(patientSchema), asyncH(async (req, res) => {
  const id = Number(req.params.id);
  const b = req.body;

  if (supabase) {
    const { data: exists } = await supabase.from('patients').select('id').eq('id', id).is('deleted_at', null).maybeSingle();
    if (!exists) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

    await supabase.from('patients').update({
      full_name: b.fullName,
      age: b.age,
      gender: b.gender,
      phone: b.phone,
      address: b.address || null,
      occupation: b.occupation || null
    }).eq('id', id);

    await supabase.from('patient_medical').upsert({
      patient_id: id,
      chronic_diseases: b.chronicDiseases || null,
      allergies: b.allergies || null,
      is_pregnant: b.isPregnant || false,
      is_smoker: b.isSmoker || false,
      updated_at: new Date().toISOString()
    });

    await audit(req.user.id, 'PATIENT_UPDATED', 'patient', id, null, req.ip);
    return res.json({ ok: true });
  }

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
  await audit(req.user.id, 'PATIENT_UPDATED', 'patient', id, null, req.ip);
  res.json({ ok: true });
}));

/* ---------- حذف مريض (حذف منطقي) ---------- */
patientsRouter.delete('/:id', requireRole('doctor'), csrfProtect, asyncH(async (req, res) => {
  const id = Number(req.params.id);

  if (supabase) {
    const { data, error } = await supabase.from('patients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select();

    if (error || !data || data.length === 0) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');
    await audit(req.user.id, 'PATIENT_DELETED', 'patient', id, null, req.ip);
    return res.json({ ok: true });
  }

  const r = db.prepare(`UPDATE patients SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL`).run(id);
  if (!r.changes) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');
  await audit(req.user.id, 'PATIENT_DELETED', 'patient', id, null, req.ip);
  res.json({ ok: true });
}));

/* =============== الزيارات =============== */
patientsRouter.post('/visits', requireRole('doctor'), csrfProtect,
  validate(visitSchema), asyncH(async (req, res) => {
    const b = req.body;

    if (supabase) {
      const { data: p } = await supabase.from('patients').select('id').eq('id', b.patientId).is('deleted_at', null).maybeSingle();
      if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

      const { data: newVisit, error } = await supabase.from('visits').insert({
        patient_id: b.patientId,
        visit_date: b.visitDate,
        reason: b.reason,
        diagnosis: b.diagnosis || null,
        treatment_plan: b.treatmentPlan || null,
        treatment_done: b.treatmentDone || null,
        created_by: req.user.id
      }).select().single();

      if (error) throw new AppError(500, error.message, 'DB_ERROR');

      await audit(req.user.id, 'VISIT_CREATED', 'visit', newVisit.id, { patientId: b.patientId }, req.ip);
      return res.status(201).json({ id: newVisit.id });
    }

    const p = db.prepare('SELECT id FROM patients WHERE id = ? AND deleted_at IS NULL').get(b.patientId);
    if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

    const info = db.prepare(`
      INSERT INTO visits (patient_id, visit_date, reason, diagnosis, treatment_plan, treatment_done, created_by)
      VALUES (?,?,?,?,?,?,?)
    `).run(b.patientId, b.visitDate, b.reason, b.diagnosis || null,
           b.treatmentPlan || null, b.treatmentDone || null, req.user.id);

    await audit(req.user.id, 'VISIT_CREATED', 'visit', info.lastInsertRowid, { patientId: b.patientId }, req.ip);
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  }));

/* =============== مخطط الأسنان =============== */
patientsRouter.put('/tooth', requireRole('doctor'), csrfProtect,
  validate(toothSchema), asyncH(async (req, res) => {
    const { patientId, toothNo, condition } = req.body;

    if (supabase) {
      const { data: p } = await supabase.from('patients').select('id').eq('id', patientId).is('deleted_at', null).maybeSingle();
      if (!p) throw new AppError(404, 'المريض غير موجود', 'NOT_FOUND');

      if (condition === '') {
        await supabase.from('tooth_chart').delete().match({ patient_id: patientId, tooth_no: toothNo });
      } else {
        await supabase.from('tooth_chart').upsert({
          patient_id: patientId,
          tooth_no: toothNo,
          condition,
          updated_by: req.user.id,
          updated_at: new Date().toISOString()
        });
      }
      return res.json({ ok: true });
    }

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
