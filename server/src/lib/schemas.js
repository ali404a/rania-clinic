import { z } from 'zod';

const ar = (msg) => ({ message: msg });
const isoDate = (msg) => z.preprocess(val => {
  if (!val || typeof val !== 'string') return val;
  let str = String(val).trim().replace(/\//g, '-');
  const parts = str.split('-');
  if (parts.length === 3) {
    let [y, m, d] = parts;
    if (d.length === 4) [y, d] = [d, y];
    if (y.length === 4) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return str;
}, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, ar(msg)));
const trimmed = (max, msg) => z.string().trim().min(1, ar(msg)).max(max, ar('النص طويل جداً'));

export const loginSchema = z.object({
  username: z.string().trim().min(1, ar('اسم المستخدم مطلوب')).max(64),
  password: z.string().min(1, ar('كلمة المرور مطلوبة')).max(200),
});

export const createUserSchema = z.object({
  username: z.string().trim().toLowerCase()
    .min(3, ar('اسم المستخدم ٣ أحرف على الأقل')).max(32)
    .regex(/^[a-z0-9_.]+$/, ar('حروف إنجليزية وأرقام و _ . فقط')),
  password: z.string().min(8, ar('كلمة المرور ٨ أحرف على الأقل')).max(200),
  fullName: trimmed(120, 'الاسم الكامل مطلوب'),
  role: z.enum(['doctor', 'secretary'], ar('الدور غير صالح')),
  phone: z.string().trim().max(32).optional().or(z.literal('')),
});

export const updateUserSchema = z.object({
  fullName: trimmed(120, 'الاسم الكامل مطلوب').optional(),
  phone: z.string().trim().max(32).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, ar('كلمة المرور ٨ أحرف على الأقل')).max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, ar('كلمة المرور الحالية مطلوبة')),
  newPassword: z.string().min(8, ar('كلمة المرور الجديدة ٨ أحرف على الأقل')).max(200),
});

export const patientSchema = z.object({
  fullName: trimmed(120, 'الاسم الكامل مطلوب'),
  age: z.coerce.number().int().min(0, ar('عمر غير صالح')).max(130, ar('عمر غير صالح')),
  gender: z.enum(['ذكر', 'أنثى'], ar('الجنس مطلوب')),
  phone: trimmed(32, 'رقم الهاتف مطلوب'),
  address: z.string().trim().max(200).optional().or(z.literal('')),
  occupation: z.string().trim().max(80).optional().or(z.literal('')),
  chronicDiseases: z.string().trim().max(300).optional().or(z.literal('')),
  allergies: z.string().trim().max(300).optional().or(z.literal('')),
  isPregnant: z.boolean().optional().default(false),
  isSmoker: z.boolean().optional().default(false),
});

export const visitSchema = z.object({
  patientId: z.coerce.number().int().positive(ar('يرجى اختيار المريض')),
  visitDate: isoDate('تاريخ غير صالح'),
  reason: trimmed(200, 'سبب الزيارة مطلوب'),
  diagnosis: z.string().trim().max(1000).optional().or(z.literal('')),
  treatmentPlan: z.string().trim().max(1000).optional().or(z.literal('')),
  treatmentDone: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const appointmentSchema = z.object({
  patientId: z.coerce.number().int().positive(ar('يرجى اختيار المريض')),
  appointmentDate: isoDate('تاريخ غير صالح'),
  appointmentTime: z.preprocess(val => {
    if (!val) return val;
    let str = String(val).trim();
    if (str.includes('م') || str.includes('ص') || str.toLowerCase().includes('pm') || str.toLowerCase().includes('am')) {
      const isPM = str.includes('م') || str.toLowerCase().includes('pm');
      const clean = str.replace(/[^\d:]/g, '');
      const [hStr, mStr = '00'] = clean.split(':');
      let h = parseInt(hStr, 10) || 0;
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${String(mStr).padStart(2, '0')}`;
    }
    const parts = str.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return str;
  }, z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, ar('وقت غير صالح'))),
  durationMin: z.coerce.number().int().min(15).max(480).optional().default(30),
  treatmentType: trimmed(80, 'نوع العلاج مطلوب'),
  status: z.enum(['مؤكد', 'قائمة انتظار', 'حضر', 'لم يحضر', 'ملغي']).optional().default('مؤكد'),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

export const treatmentSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  name: trimmed(120, 'اسم العلاج مطلوب'),
  details: z.string().trim().max(500).optional().or(z.literal('')),
  totalCost: z.coerce.number().int().min(0, ar('المبلغ غير صالح')).max(1_000_000_000),
  initialPayment: z.coerce.number().int().min(0).max(1_000_000_000).optional().default(0),
});

export const paymentSchema = z.object({
  treatmentId: z.coerce.number().int().positive(),
  amount: z.coerce.number().int().positive(ar('المبلغ يجب أن يكون أكبر من صفر')).max(1_000_000_000),
  paidAt: isoDate('تاريخ غير صالح').optional(),
  method: z.string().trim().max(40).optional().default('نقدي'),
});

export const labSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  workDetails: trimmed(200, 'تفاصيل العمل مطلوبة'),
  labName: z.string().trim().max(120).optional().or(z.literal('')),
  cost: z.coerce.number().int().min(0).max(1_000_000_000).optional().default(0),
  status: z.enum(['مرسل', 'قيد التنفيذ', 'تم الاستلام']).default('مرسل'),
  dueDate: isoDate('تاريخ غير صالح').optional().or(z.literal('')),
});

export const toothSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  toothNo: z.coerce.number().int().min(11).max(48),
  condition: z.enum(['تقويم', 'تنظيف', 'خلع', 'حشوات', '']),
});

export const listQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
