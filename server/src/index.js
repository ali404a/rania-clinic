import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { db, initSchema, backup, integrityCheck, closeDb } from './lib/db.js';
import { hashPassword, purgeExpiredSessions } from './lib/auth.js';
import { errorHandler, notFound } from './middleware/security.js';
import { authRouter } from './routes/auth.js';
import { patientsRouter } from './routes/patients.js';
import { clinicRouter } from './routes/clinic.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const PORT = process.env.PORT || 3000;

initSchema();

/* ---------- إنشاء حساب الطبيب الأول عند أول تشغيل ---------- */
function seedFirstDoctor() {
  const count = db.prepare('SELECT COUNT(*) c FROM users WHERE deleted_at IS NULL').get().c;
  if (count > 0) return;
  const username = process.env.SEED_DOCTOR_USER || 'rania';
  const password = process.env.SEED_DOCTOR_PASS || 'Clinic@2026';
  db.prepare(`
    INSERT INTO users (username, password_hash, full_name, role, must_change_pw)
    VALUES (?,?,?,'doctor',1)
  `).run(username, hashPassword(password), 'د. رانية زياد');
  console.log(`\n  تم إنشاء حساب الطبيب الأول:`);
  console.log(`   المستخدم: ${username}`);
  console.log(`   كلمة المرور: ${password}`);
  console.log(`   (يُطلب تغييرها عند أول دخول)\n`);
}
seedFirstDoctor();

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

/* ---------- رؤوس الحماية ---------- */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],              // لا سكربت مضمّن — حماية XSS حقيقية
      scriptSrcAttr: ["'none'"],          // لا معالجات onclick مضمّنة
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],       // منع Clickjacking
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: process.env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
}));

app.use(express.json({ limit: '200kb' }));   // حد حجم الطلب — يمنع استنزاف الذاكرة
app.use(cookieParser());

/* ---------- تحديد المعدل ---------- */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'محاولات كثيرة. حاول بعد ١٥ دقيقة.', code: 'RATE_LIMITED' },
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  // في بيئة الاختبار نتجاوز الحد لتمكين اختبار الحِمل
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'طلبات كثيرة جداً. أبطئ قليلاً.', code: 'RATE_LIMITED' },
});

app.use('/api/auth/login', loginLimiter);
app.use('/api', apiLimiter);

/* ---------- المسارات ---------- */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    db: integrityCheck() === 'ok' ? 'ok' : 'corrupt',
    uptime: Math.round(process.uptime()),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/patients', patientsRouter);
app.use('/api', clinicRouter);

/* ---------- الواجهة الأمامية ---------- */
app.use(express.static(join(ROOT, 'public'), { index: 'index.html', maxAge: '1h' }));
app.get(/^\/(?!api).*/, (req, res) => res.sendFile(join(ROOT, 'public', 'index.html')));

app.use('/api', notFound);
app.use(errorHandler);

/* ---------- مهام دورية ---------- */
setInterval(() => {
  const n = purgeExpiredSessions();
  if (n) console.log(`[cleanup] حُذفت ${n} جلسة منتهية`);
}, 60 * 60 * 1000).unref();

setInterval(() => {
  try { backup(); } catch (e) { console.error('[backup] فشل:', e.message); }
}, 24 * 60 * 60 * 1000).unref();

let server = null;

if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(` الخادم يعمل على المنفذ ${PORT}`);
    console.log(`   سلامة القاعدة: ${integrityCheck()}`);
  });

  /* ---------- إيقاف رشيق ---------- */
  function shutdown(signal) {
    console.log(`\n[${signal}] إيقاف رشيق...`);
    if (server) server.close(() => { closeDb(); process.exit(0); });
    else { closeDb(); process.exit(0); }
    setTimeout(() => process.exit(1), 10000).unref();
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (r) => console.error('[unhandledRejection]', r));
  process.on('uncaughtException', (e) => { console.error('[uncaughtException]', e); shutdown('EXCEPTION'); });
}

export default app;
export { app, server };
