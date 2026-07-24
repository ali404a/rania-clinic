import { timingSafeEqual } from 'node:crypto';
import { getSession, SESSION_COOKIE } from '../lib/auth.js';

/** خطأ تطبيقي بحالة HTTP محددة */
export class AppError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** يتطلب جلسة صالحة */
export async function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  const session = await getSession(token);
  if (!session) {
    return res.status(401).json({ error: 'يجب تسجيل الدخول', code: 'UNAUTHENTICATED' });
  }
  req.session = session;
  req.user = session.user;
  next();
}

/**
 * يتطلب دوراً محدداً — الفحص على الخادم دائماً.
 * إخفاء الزر في الواجهة ليس حماية.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول', code: 'UNAUTHENTICATED' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'لا تملك صلاحية لهذا الإجراء', code: 'FORBIDDEN' });
    }
    next();
  };
}

/** حماية CSRF: مقارنة بزمن ثابت لرمز الرأس مع سر الجلسة */
export function csrfProtect(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const sent = req.get('x-csrf-token') || '';
  const secret = req.session?.csrfSecret || '';
  const a = Buffer.from(sent);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(403).json({ error: 'رمز الحماية غير صالح', code: 'CSRF_INVALID' });
  }
  next();
}

/** التحقق من جسم الطلب عبر مخطط Zod */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const issues = result.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({ error: 'بيانات غير صالحة', code: 'VALIDATION', issues });
    }
    // في Express 5 يكون req.query للقراءة فقط — نضع النتيجة في حقل منفصل
    if (source === 'query') {
      req.validatedQuery = result.data;
    } else {
      req[source] = result.data;
    }
    next();
  };
}

/** يلتقط أخطاء الدوال غير المتزامنة */
export const asyncH = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** معالج أخطاء مركزي — لا يكشف تفاصيل داخلية للعميل */
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error('[ERROR]', new Date().toISOString(), req.method, req.originalUrl, err);
  }
  const isProd = process.env.NODE_ENV === 'production';
  res.status(status).json({
    error: status >= 500 && isProd ? 'حدث خطأ في الخادم' : err.message,
    code: err.code || 'INTERNAL',
  });
}

export function notFound(req, res) {
  res.status(404).json({ error: 'المسار غير موجود', code: 'NOT_FOUND' });
}
