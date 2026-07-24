-- =====================================================================
-- نظام إدارة عيادة الدكتورة رانية زياد — مخطط قاعدة البيانات
-- مقسّم منطقياً حسب المجال لزيادة الاعتمادية مع آلاف المرضى
-- =====================================================================

PRAGMA journal_mode = WAL;        -- قراءة متزامنة دون حجب الكتابة
PRAGMA foreign_keys = ON;         -- فرض التكامل المرجعي
PRAGMA busy_timeout = 5000;       -- انتظار القفل بدل الفشل الفوري
PRAGMA synchronous = NORMAL;      -- توازن بين الأمان والأداء

-- =====================================================================
-- المجال ١: الهوية والأمان  (معزول عن بيانات المرضى)
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  username        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash   TEXT    NOT NULL,          -- scrypt: salt:hash
  full_name       TEXT    NOT NULL,
  role            TEXT    NOT NULL CHECK (role IN ('doctor','secretary')),
  phone           TEXT,
  is_active       INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  must_change_pw  INTEGER NOT NULL DEFAULT 0 CHECK (must_change_pw IN (0,1)),
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until    TEXT,
  created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  deleted_at      TEXT                                  -- حذف منطقي
);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active, deleted_at);

-- الجلسات: تبقى ٣٠ يوماً — الدخول لا ينتهي بتحديث الصفحة
CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,             -- تجزئة SHA-256 لرمز الجلسة
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  csrf_secret  TEXT NOT NULL,
  user_agent   TEXT,
  ip_address   TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- سجل التدقيق: كل عملية حساسة
CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   TEXT,
  details     TEXT,
  ip_address  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity  ON audit_log(entity, entity_id);

-- =====================================================================
-- المجال ٢: المرضى
-- =====================================================================

CREATE TABLE IF NOT EXISTS patients (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  file_no       INTEGER NOT NULL UNIQUE,     -- رقم الملف التلقائي
  full_name     TEXT    NOT NULL,
  age           INTEGER NOT NULL CHECK (age >= 0 AND age <= 130),
  gender        TEXT    NOT NULL CHECK (gender IN ('ذكر','أنثى')),
  phone         TEXT    NOT NULL,
  address       TEXT,
  occupation    TEXT,
  created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  deleted_at    TEXT
);
-- فهارس البحث الساخن (اسم / رقم ملف / هاتف)
CREATE INDEX IF NOT EXISTS idx_patients_name    ON patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone   ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_created ON patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_live    ON patients(deleted_at, id);

-- البيانات الطبية في جدول منفصل (حساسة + تُقرأ أقل)
CREATE TABLE IF NOT EXISTS patient_medical (
  patient_id       INTEGER PRIMARY KEY REFERENCES patients(id) ON DELETE CASCADE,
  chronic_diseases TEXT,
  allergies        TEXT,
  is_pregnant      INTEGER NOT NULL DEFAULT 0 CHECK (is_pregnant IN (0,1)),
  is_smoker        INTEGER NOT NULL DEFAULT 0 CHECK (is_smoker IN (0,1)),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =====================================================================
-- المجال ٣: الإكلينيكي (نمو سريع — قابل للتقسيم بالسنة مستقبلاً)
-- =====================================================================

CREATE TABLE IF NOT EXISTS visits (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date   TEXT    NOT NULL,
  reason       TEXT    NOT NULL,
  diagnosis    TEXT,
  treatment_plan TEXT,
  treatment_done TEXT,
  created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  deleted_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits(patient_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_date    ON visits(visit_date DESC);

-- مخطط الأسنان: صف لكل سن غير سليم فقط (توفير مساحة)
CREATE TABLE IF NOT EXISTS tooth_chart (
  patient_id  INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tooth_no    INTEGER NOT NULL CHECK (tooth_no BETWEEN 11 AND 48),
  condition   TEXT    NOT NULL CHECK (condition IN ('تقويم','تنظيف','خلع','حشوات')),
  updated_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (patient_id, tooth_no)
);

-- =====================================================================
-- المجال ٤: الجدولة
-- =====================================================================

CREATE TABLE IF NOT EXISTS appointments (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id       INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date TEXT    NOT NULL,
  appointment_time TEXT    NOT NULL,
  duration_min     INTEGER NOT NULL DEFAULT 30 CHECK (duration_min IN (30,45,60,90)),
  treatment_type   TEXT    NOT NULL,
  status           TEXT    NOT NULL DEFAULT 'مؤكد'
                   CHECK (status IN ('مؤكد','قائمة انتظار','حضر','لم يحضر','ملغي')),
  notes            TEXT,
  created_by       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  deleted_at       TEXT
);
-- استعلامات التقويم مكثفة بالتاريخ
CREATE INDEX IF NOT EXISTS idx_appt_date    ON appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appt_patient ON appointments(patient_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appt_status  ON appointments(status, appointment_date);
-- منع الحجز المزدوج لنفس الوقت (للمواعيد النشطة فقط)
CREATE UNIQUE INDEX IF NOT EXISTS uq_appt_slot
  ON appointments(appointment_date, appointment_time)
  WHERE deleted_at IS NULL AND status NOT IN ('ملغي','قائمة انتظار');

-- =====================================================================
-- المجال ٥: المالي (معاملات ذرّية + تدقيق)
-- =====================================================================

CREATE TABLE IF NOT EXISTS treatments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  details      TEXT,
  total_cost   INTEGER NOT NULL CHECK (total_cost >= 0),
  paid_amount  INTEGER NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  started_at   TEXT    NOT NULL DEFAULT (date('now')),
  created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  deleted_at   TEXT,
  -- لا يمكن أن يتجاوز المدفوع الكلي
  CHECK (paid_amount <= total_cost)
);
CREATE INDEX IF NOT EXISTS idx_treat_patient ON treatments(patient_id, deleted_at);
-- فهرس جزئي للأقساط المستحقة (استعلام متكرر جداً)
CREATE INDEX IF NOT EXISTS idx_treat_due
  ON treatments(patient_id) WHERE deleted_at IS NULL AND paid_amount < total_cost;

-- سجل الدفعات: كل دفعة صف مستقل (تدقيق مالي كامل)
CREATE TABLE IF NOT EXISTS payments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  treatment_id INTEGER NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount       INTEGER NOT NULL CHECK (amount > 0),
  paid_at      TEXT    NOT NULL DEFAULT (date('now')),
  method       TEXT    NOT NULL DEFAULT 'نقدي',
  received_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  voided_at    TEXT,                          -- إلغاء الدفعة (لا حذف)
  void_reason  TEXT
);
CREATE INDEX IF NOT EXISTS idx_pay_treatment ON payments(treatment_id, voided_at);
CREATE INDEX IF NOT EXISTS idx_pay_patient   ON payments(patient_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_pay_date      ON payments(paid_at DESC);

-- =====================================================================
-- المجال ٦: المختبر
-- =====================================================================

CREATE TABLE IF NOT EXISTS lab_works (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  work_details TEXT    NOT NULL,
  lab_name     TEXT,
  cost         INTEGER NOT NULL DEFAULT 0 CHECK (cost >= 0),
  status       TEXT    NOT NULL DEFAULT 'مرسل'
               CHECK (status IN ('مرسل','قيد التنفيذ','تم الاستلام')),
  due_date     TEXT,
  created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  deleted_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_lab_status  ON lab_works(status, due_date);
CREATE INDEX IF NOT EXISTS idx_lab_patient ON lab_works(patient_id);

-- =====================================================================
-- عدّاد رقم الملف (ذرّي — يمنع التكرار تحت التزامن)
-- =====================================================================
CREATE TABLE IF NOT EXISTS counters (
  name  TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);
INSERT OR IGNORE INTO counters(name, value) VALUES ('file_no', 1000);

-- =====================================================================
-- محفّزات تحديث الطوابع الزمنية
-- =====================================================================
CREATE TRIGGER IF NOT EXISTS trg_patients_updated
AFTER UPDATE ON patients FOR EACH ROW
BEGIN UPDATE patients SET updated_at = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_treatments_updated
AFTER UPDATE OF total_cost, paid_amount, name, details ON treatments FOR EACH ROW
BEGIN UPDATE treatments SET updated_at = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS trg_appt_updated
AFTER UPDATE ON appointments FOR EACH ROW
BEGIN UPDATE appointments SET updated_at = datetime('now') WHERE id = NEW.id; END;

-- =====================================================================
-- عروض (Views) للاستعلامات المتكررة
-- =====================================================================
CREATE VIEW IF NOT EXISTS v_patient_finance AS
SELECT p.id AS patient_id,
       COALESCE(SUM(t.total_cost), 0)  AS total,
       COALESCE(SUM(t.paid_amount), 0) AS paid,
       COALESCE(SUM(t.total_cost - t.paid_amount), 0) AS due
FROM patients p
LEFT JOIN treatments t ON t.patient_id = p.id AND t.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id;
