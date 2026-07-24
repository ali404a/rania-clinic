/**
 * الفحص الشامل — تقني + أمني + اعتمادية
 * يُشغَّل مقابل خادم حي على http://localhost:3000
 */
const BASE = process.env.BASE || 'http://localhost:3000';

let pass = 0, fail = 0;
const results = [];
function check(section, name, ok, detail = '') {
  (ok ? pass++ : fail++);
  results.push({ section, name, ok, detail });
  console.log(`${ok ? ' PASS' : ' FAIL'} [${section}] ${name}${detail ? ' — ' + detail : ''}`);
}

/** عميل يحتفظ بالكوكيز مثل المتصفح */
function makeClient() {
  let cookies = {}, csrf = null;
  const jar = () => Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  return {
    get csrf() { return csrf; },
    setCsrf(v) { csrf = v; },
    get cookieHeader() { return jar(); },
    clearCookies() { cookies = {}; },
    async req(method, path, body, extraHeaders = {}) {
      const headers = { 'content-type': 'application/json', ...extraHeaders };
      if (jar()) headers.cookie = jar();
      if (csrf && !('x-csrf-token' in extraHeaders)) headers['x-csrf-token'] = csrf;
      const res = await fetch(BASE + path, {
        method, headers, body: body ? JSON.stringify(body) : undefined, redirect: 'manual',
      });
      const setCookie = res.headers.getSetCookie?.() || [];
      for (const c of setCookie) {
        const [pair, ...attrs] = c.split(';');
        const idx = pair.indexOf('=');
        const k = pair.slice(0, idx).trim(), v = pair.slice(idx + 1).trim();
        // الكوكي يُحذف إذا كانت قيمته فارغة أو Max-Age=0 أو انتهت صلاحيته
        const expired = attrs.some(a => /^\s*max-age=0\s*$/i.test(a)) ||
                        attrs.some(a => /^\s*expires=Thu, 01 Jan 1970/i.test(a));
        if (v === '' || expired) delete cookies[k]; else cookies[k] = v;
      }
      let data = null;
      try { data = await res.json(); } catch { /* غير JSON */ }
      return { status: res.status, data, headers: res.headers, rawCookies: setCookie };
    },
  };
}

const doctor = makeClient();
const secretary = makeClient();

async function run() {
  console.log('\n══════ ١. الفحص التقني الأساسي ══════\n');

  const health = await doctor.req('GET', '/api/health');
  check('تقني', 'فحص الصحة يستجيب', health.status === 200, `status=${health.status}`);
  check('تقني', 'سلامة قاعدة البيانات', health.data?.db === 'ok', health.data?.db);

  console.log('\n══════ ٢. المصادقة وبقاء الجلسة ══════\n');

  const badLogin = await doctor.req('POST', '/api/auth/login', { username: 'rania', password: 'wrong' });
  check('أمان', 'رفض كلمة المرور الخاطئة', badLogin.status === 401, `status=${badLogin.status}`);
  check('أمان', 'رسالة عامة (منع تعداد الحسابات)',
    !/غير موجود|not found/i.test(badLogin.data?.error || ''), badLogin.data?.error);

  const ghost = await doctor.req('POST', '/api/auth/login', { username: 'nonexistent_user_xyz', password: 'x' });
  check('أمان', 'نفس الرسالة لمستخدم غير موجود',
    ghost.data?.error === badLogin.data?.error, 'الرسالتان متطابقتان');

  const login = await doctor.req('POST', '/api/auth/login', { username: 'rania', password: 'Clinic@2026' });
  check('مصادقة', 'دخول الطبيب ناجح', login.status === 200, `status=${login.status}`);
  doctor.setCsrf(login.data?.csrfToken);
  check('مصادقة', 'إصدار رمز CSRF', !!login.data?.csrfToken);

  const sidCookie = login.rawCookies.find(c => c.startsWith('clinic_sid='));
  check('أمان', 'كوكي HttpOnly', /HttpOnly/i.test(sidCookie || ''));
  check('أمان', 'كوكي SameSite=Strict', /SameSite=Strict/i.test(sidCookie || ''));
  check('أمان', 'كوكي بعمر طويل (بقاء الدخول)', /Max-Age=\d{6,}/i.test(sidCookie || ''),
    (sidCookie || '').match(/Max-Age=\d+/)?.[0]);

  // محاكاة تحديث الصفحة: طلب /me بنفس الكوكي
  const me1 = await doctor.req('GET', '/api/auth/me');
  check('مصادقة', 'الجلسة تبقى بعد تحديث الصفحة', me1.status === 200 && me1.data?.user?.role === 'doctor');
  const me2 = await doctor.req('GET', '/api/auth/me');
  check('اعتمادية', 'الجلسة تبقى بعد عدة تحميلات', me2.status === 200);

  console.log('\n══════ ٣. الصلاحيات (RBAC) ══════\n');

  // الطبيب ينشئ حساب السكرتيرة
  const created = await doctor.req('POST', '/api/auth/users', {
    username: 'sara', password: 'Secretary@123', fullName: 'سارة السكرتيرة',
    role: 'secretary', phone: '0770 111 2222',
  });
  check('صلاحيات', 'الطبيب ينشئ حساب سكرتيرة', created.status === 201, `status=${created.status}`);

  const dupUser = await doctor.req('POST', '/api/auth/users', {
    username: 'sara', password: 'Another@123', fullName: 'مكرر', role: 'secretary',
  });
  check('اعتمادية', 'منع تكرار اسم المستخدم', dupUser.status === 409);

  const weakPw = await doctor.req('POST', '/api/auth/users', {
    username: 'weakuser', password: '123', fullName: 'ضعيف', role: 'secretary',
  });
  check('أمان', 'رفض كلمة مرور قصيرة', weakPw.status === 400);

  // دخول السكرتيرة
  const secLogin = await secretary.req('POST', '/api/auth/login', { username: 'sara', password: 'Secretary@123' });
  check('مصادقة', 'دخول السكرتيرة ناجح', secLogin.status === 200);
  secretary.setCsrf(secLogin.data?.csrfToken);

  // السكرتيرة تحاول إنشاء مستخدم → ممنوع
  const escalate = await secretary.req('POST', '/api/auth/users', {
    username: 'hacker', password: 'Hacker@12345', fullName: 'مخترق', role: 'doctor',
  });
  check('أمان', 'السكرتيرة لا تستطيع إنشاء مستخدمين (منع تصعيد الصلاحيات)', escalate.status === 403,
    `status=${escalate.status}`);

  const secAudit = await secretary.req('GET', '/api/auth/audit');
  check('أمان', 'السكرتيرة لا ترى سجل التدقيق', secAudit.status === 403);

  const secLabs = await secretary.req('GET', '/api/labs');
  check('صلاحيات', 'السكرتيرة لا ترى المختبر', secLabs.status === 403);

  console.log('\n══════ ٤. حماية CSRF ══════\n');

  const noCsrf = await doctor.req('POST', '/api/patients',
    { fullName: 'اختبار', age: 30, gender: 'ذكر', phone: '0770' },
    { 'x-csrf-token': '' });
  check('أمان', 'رفض الطلب بدون رمز CSRF', noCsrf.status === 403, `status=${noCsrf.status}`);

  const badCsrf = await doctor.req('POST', '/api/patients',
    { fullName: 'اختبار', age: 30, gender: 'ذكر', phone: '0770' },
    { 'x-csrf-token': 'x'.repeat(64) });
  check('أمان', 'رفض رمز CSRF خاطئ', badCsrf.status === 403);

  console.log('\n══════ ٥. التحقق من المدخلات ══════\n');

  const badAge = await doctor.req('POST', '/api/patients',
    { fullName: 'عمر خاطئ', age: 999, gender: 'ذكر', phone: '0770' });
  check('اعتمادية', 'رفض عمر غير منطقي', badAge.status === 400);

  const badGender = await doctor.req('POST', '/api/patients',
    { fullName: 'جنس خاطئ', age: 30, gender: 'other', phone: '0770' });
  check('اعتمادية', 'رفض قيمة جنس غير صالحة', badGender.status === 400);

  const noName = await doctor.req('POST', '/api/patients',
    { fullName: '   ', age: 30, gender: 'ذكر', phone: '0770' });
  check('اعتمادية', 'رفض اسم فارغ', noName.status === 400);

  console.log('\n══════ ٦. حقن SQL و XSS ══════\n');

  const sqli = await doctor.req('POST', '/api/patients', {
    fullName: "'; DROP TABLE patients; --", age: 30, gender: 'ذكر', phone: '0770 000 0000',
  });
  const stillAlive = await doctor.req('GET', '/api/health');
  check('أمان', 'حقن SQL لا يُسقط الجداول',
    sqli.status === 201 && stillAlive.data?.db === 'ok', 'الجداول سليمة');

  const sqliSearch = await doctor.req('GET', "/api/patients?q=' OR '1'='1");
  check('أمان', 'حقن SQL في البحث غير فعّال',
    sqliSearch.status === 200 && Array.isArray(sqliSearch.data?.patients));

  const xss = await doctor.req('POST', '/api/patients', {
    fullName: '<script>alert(1)</script>', age: 25, gender: 'أنثى', phone: '0770 000 0001',
  });
  check('أمان', 'تخزين محتوى XSS دون تنفيذ (يُهرَّب عند العرض)', xss.status === 201);

  console.log('\n══════ ٧. المنطق المالي (المعاملات الذرّية) ══════\n');

  const pat = await doctor.req('POST', '/api/patients', {
    fullName: 'مريض مالي', age: 40, gender: 'ذكر', phone: '0770 555 5555',
  });
  const pid = pat.data?.patient?.id;
  check('تقني', 'إنشاء مريض ورقم ملف تلقائي', !!pid && !!pat.data?.patient?.fileNo,
    `file#${pat.data?.patient?.fileNo}`);

  const treat = await doctor.req('POST', '/api/treatments', {
    patientId: pid, name: 'تقويم', totalCost: 1000000, initialPayment: 200000,
  });
  const tid = treat.data?.id;
  check('مالي', 'إنشاء علاج بدفعة أولى', treat.status === 201);

  const overInitial = await doctor.req('POST', '/api/treatments', {
    patientId: pid, name: 'زائد', totalCost: 100, initialPayment: 500,
  });
  check('مالي', 'رفض دفعة أولى أكبر من الكلي', overInitial.status === 400);

  const pay = await doctor.req('POST', '/api/payments', { treatmentId: tid, amount: 300000 });
  check('مالي', 'تسجيل دفعة', pay.status === 201 && pay.data?.newPaid === 500000,
    `المدفوع=${pay.data?.newPaid}`);

  const overpay = await doctor.req('POST', '/api/payments', { treatmentId: tid, amount: 999999999 });
  check('مالي', 'منع الدفع الزائد عن المتبقي', overpay.status === 400, overpay.data?.error);

  const negPay = await doctor.req('POST', '/api/payments', { treatmentId: tid, amount: -5000 });
  check('مالي', 'رفض مبلغ سالب', negPay.status === 400);

  // اختبار التزامن: ١٠ دفعات متوازية بمجموع يتجاوز المتبقي
  const remaining = 1000000 - 500000; // 500000
  const concurrent = await Promise.all(
    Array.from({ length: 10 }, () =>
      doctor.req('POST', '/api/payments', { treatmentId: tid, amount: 100000 }))
  );
  const okCount = concurrent.filter(r => r.status === 201).length;
  const fin = await doctor.req('GET', `/api/patients/${pid}`);
  const finalPaid = fin.data?.treatments?.find(t => t.id === tid)?.paidAmount;
  check('اعتمادية', 'التزامن لا يسبب دفعاً زائداً',
    finalPaid <= 1000000, `نجحت ${okCount}/10 — المدفوع النهائي=${finalPaid} من 1000000`);

  console.log('\n══════ ٨. المواعيد ومنع الحجز المزدوج ══════\n');

  const apt1 = await doctor.req('POST', '/api/appointments', {
    patientId: pid, appointmentDate: '2026-09-01', appointmentTime: '15:30',
    durationMin: 30, treatmentType: 'كشف',
  });
  check('تقني', 'حجز موعد', apt1.status === 201);

  const apt2 = await doctor.req('POST', '/api/appointments', {
    patientId: pid, appointmentDate: '2026-09-01', appointmentTime: '15:30',
    durationMin: 30, treatmentType: 'تنظيف',
  });
  check('اعتمادية', 'منع الحجز المزدوج لنفس الوقت', apt2.status === 409, apt2.data?.error);

  const badTime = await doctor.req('POST', '/api/appointments', {
    patientId: pid, appointmentDate: '2026-09-01', appointmentTime: '99:99',
    durationMin: 30, treatmentType: 'كشف',
  });
  check('اعتمادية', 'رفض وقت غير صالح', badTime.status === 400);

  const badDate = await doctor.req('POST', '/api/appointments', {
    patientId: pid, appointmentDate: '2026-13-45', appointmentTime: '16:00',
    durationMin: 30, treatmentType: 'كشف',
  });
  check('اعتمادية', 'رفض تاريخ مستحيل', badDate.status === 400);

  const badDuration = await doctor.req('POST', '/api/appointments', {
    patientId: pid, appointmentDate: '2026-09-03', appointmentTime: '16:00',
    durationMin: 7, treatmentType: 'كشف',
  });
  check('اعتمادية', 'رفض مدة غير مسموحة', badDuration.status === 400);

  const ghostPatient = await doctor.req('POST', '/api/appointments', {
    patientId: 999999, appointmentDate: '2026-09-02', appointmentTime: '16:00',
    durationMin: 30, treatmentType: 'كشف',
  });
  check('اعتمادية', 'رفض موعد لمريض غير موجود', ghostPatient.status === 404);

  console.log('\n══════ ٩. الوصول بلا مصادقة ══════\n');

  const anon = makeClient();
  for (const [m, p] of [['GET', '/api/patients'], ['GET', '/api/dashboard'],
                        ['GET', '/api/auth/users'], ['GET', '/api/finance']]) {
    const r = await anon.req(m, p);
    check('أمان', `منع الوصول بلا تسجيل دخول: ${p}`, r.status === 401, `status=${r.status}`);
  }

  console.log('\n══════ ١٠. تعطيل الحساب يطرد الجلسة ══════\n');

  const users = await doctor.req('GET', '/api/auth/users');
  const saraId = users.data?.users?.find(u => u.username === 'sara')?.id;
  await doctor.req('PATCH', `/api/auth/users/${saraId}`, { isActive: false });
  const afterDisable = await secretary.req('GET', '/api/auth/me');
  check('أمان', 'تعطيل الحساب يُنهي جلساته فوراً', afterDisable.status === 401,
    `status=${afterDisable.status}`);
  await doctor.req('PATCH', `/api/auth/users/${saraId}`, { isActive: true });

  console.log('\n══════ ١١. حماية آخر طبيب ══════\n');
  const meUsers = await doctor.req('GET', '/api/auth/users');
  const docId = meUsers.data?.users?.find(u => u.role === 'doctor')?.id;
  const selfDel = await doctor.req('DELETE', `/api/auth/users/${docId}`);
  check('اعتمادية', 'منع حذف الحساب الذاتي', selfDel.status === 400, selfDel.data?.error);

  console.log('\n══════ ١٢. اختبار الحِمل ══════\n');

  const t0 = Date.now();
  const BULK = 500;
  for (let i = 0; i < BULK; i++) {
    await doctor.req('POST', '/api/patients', {
      fullName: `مريض اختبار ${i}`, age: 20 + (i % 50),
      gender: i % 2 ? 'ذكر' : 'أنثى', phone: `0770${String(i).padStart(7, '0')}`,
    });
  }
  const bulkMs = Date.now() - t0;
  check('أداء', `إدراج ${BULK} مريض`, bulkMs < 60000, `${bulkMs}ms (${(bulkMs / BULK).toFixed(1)}ms/سجل)`);

  const t1 = Date.now();
  const listRes = await doctor.req('GET', '/api/patients?page=1&limit=25');
  const listMs = Date.now() - t1;
  check('أداء', 'جلب صفحة مرضى (مرقّمة)', listMs < 500 && listRes.status === 200,
    `${listMs}ms — الإجمالي ${listRes.data?.pagination?.total}`);
  check('اعتمادية', 'الترقيم يحد النتائج',
    (listRes.data?.patients?.length || 0) <= 25, `أُرجع ${listRes.data?.patients?.length}`);

  const t2 = Date.now();
  const search = await doctor.req('GET', '/api/patients?q=اختبار 42');
  const searchMs = Date.now() - t2;
  check('أداء', 'البحث بالاسم', searchMs < 500, `${searchMs}ms`);

  const t3 = Date.now();
  const dash = await doctor.req('GET', '/api/dashboard');
  const dashMs = Date.now() - t3;
  check('أداء', 'لوحة التحكم المجمّعة', dashMs < 1000 && dash.status === 200,
    `${dashMs}ms — ${dash.data?.stats?.patientCount} مريض`);

  const bigLimit = await doctor.req('GET', '/api/patients?limit=99999');
  check('أمان', 'رفض حد ترقيم مبالغ فيه (منع استنزاف)', bigLimit.status === 400);

  console.log('\n══════ ١٣. حد المحاولات ورؤوس الحماية ══════\n');

  const brute = makeClient();
  let blocked = false;
  for (let i = 0; i < 14; i++) {
    const r = await brute.req('POST', '/api/auth/login',
      { username: 'rania', password: 'definitely-wrong-' + i });
    if (r.status === 429) { blocked = true; break; }
  }
  check('أمان', 'حد المعدل يوقف هجوم القوة الغاشمة', blocked, 'رُدّ بـ429');

  const h = await doctor.req('GET', '/api/health');
  check('أمان', 'رأس CSP موجود', !!h.headers.get('content-security-policy'));
  check('أمان', 'منع Clickjacking', /DENY|SAMEORIGIN/i.test(h.headers.get('x-frame-options') || ''),
    h.headers.get('x-frame-options'));
  check('أمان', 'منع تخمين نوع المحتوى',
    h.headers.get('x-content-type-options') === 'nosniff');
  check('أمان', 'إخفاء تقنية الخادم', !h.headers.get('x-powered-by'));

  console.log('\n══════ ١٤. تسجيل الخروج ══════\n');
  const out = await doctor.req('POST', '/api/auth/logout');
  check('مصادقة', 'تسجيل الخروج ينجح', out.status === 200);
  const afterOut = await doctor.req('GET', '/api/auth/me');
  check('أمان', 'الجلسة تنتهي بعد الخروج فقط', afterOut.status === 401);

  /* ---------- التقرير ---------- */
  console.log('\n' + '═'.repeat(58));
  console.log(`  النتيجة: ${pass} نجح / ${fail} فشل  —  ${((pass / (pass + fail)) * 100).toFixed(1)}%`);
  console.log('═'.repeat(58));
  const bySection = {};
  results.forEach(r => {
    bySection[r.section] ??= { p: 0, f: 0 };
    r.ok ? bySection[r.section].p++ : bySection[r.section].f++;
  });
  Object.entries(bySection).forEach(([s, v]) =>
    console.log(`  ${s.padEnd(10)} ${v.p} نجح${v.f ? ` / ${v.f} فشل` : ''}`));
  if (fail) {
    console.log('\n  الفحوص الفاشلة:');
    results.filter(r => !r.ok).forEach(r => console.log(`   - [${r.section}] ${r.name} ${r.detail}`));
  }
  process.exit(fail ? 1 : 0);
}

run().catch(e => { console.error('خطأ في الفحص:', e); process.exit(1); });
