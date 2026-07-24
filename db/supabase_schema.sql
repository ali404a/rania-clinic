-- =====================================================================
-- نظام إدارة عيادة الدكتورة رانية زياد — مخطط قاعدة البيانات لـ Supabase (PostgreSQL)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "citext";

-- المجال ١: الهوية والأمان
CREATE TABLE IF NOT EXISTS users (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username        CITEXT  NOT NULL UNIQUE,
  password_hash   TEXT    NOT NULL,
  full_name       TEXT    NOT NULL,
  role            TEXT    NOT NULL CHECK (role IN ('doctor','secretary')),
  phone           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  must_change_pw  BOOLEAN NOT NULL DEFAULT FALSE,
  failed_attempts INT     NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  created_by      BIGINT  REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active, deleted_at);

-- الجلسات
CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  csrf_secret  TEXT NOT NULL,
  user_agent   TEXT,
  ip_address   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- سجل التدقيق
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   TEXT,
  details     TEXT,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity  ON audit_log(entity, entity_id);

-- المجال ٢: المرضى
CREATE TABLE IF NOT EXISTS patients (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  file_no       INT    NOT NULL UNIQUE,
  full_name     TEXT   NOT NULL,
  age           INT    NOT NULL CHECK (age >= 0 AND age <= 130),
  gender        TEXT   NOT NULL CHECK (gender IN ('ذكر','أنثى')),
  phone         TEXT   NOT NULL,
  address       TEXT,
  occupation    TEXT,
  created_by    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_patients_name    ON patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone   ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_created ON patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_live    ON patients(deleted_at, id);

CREATE TABLE IF NOT EXISTS patient_medical (
  patient_id       BIGINT PRIMARY KEY REFERENCES patients(id) ON DELETE CASCADE,
  chronic_diseases TEXT,
  allergies        TEXT,
  is_pregnant      BOOLEAN NOT NULL DEFAULT FALSE,
  is_smoker        BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- المجال ٣: الإكلينيكي
CREATE TABLE IF NOT EXISTS visits (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id     BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date     DATE   NOT NULL,
  reason         TEXT   NOT NULL,
  diagnosis      TEXT,
  treatment_plan TEXT,
  treatment_done TEXT,
  created_by     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits(patient_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_date    ON visits(visit_date DESC);

CREATE TABLE IF NOT EXISTS tooth_chart (
  patient_id  BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tooth_no    INT    NOT NULL CHECK (tooth_no BETWEEN 11 AND 48),
  condition   TEXT   NOT NULL CHECK (condition IN ('تقويم','تنظيف','خلع','حشوات')),
  updated_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (patient_id, tooth_no)
);

-- المجال ٤: الجدولة
CREATE TABLE IF NOT EXISTS appointments (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id       BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date DATE   NOT NULL,
  appointment_time TIME   NOT NULL,
  duration_min     INT    NOT NULL DEFAULT 30 CHECK (duration_min IN (30,45,60,90)),
  treatment_type   TEXT   NOT NULL,
  status           TEXT   NOT NULL DEFAULT 'مؤكد'
                   CHECK (status IN ('مؤكد','قائمة انتظار','حضر','لم يحضر','ملغي')),
  notes            TEXT,
  created_by       BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_appt_date    ON appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appt_patient ON appointments(patient_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appt_status  ON appointments(status, appointment_date);

CREATE UNIQUE INDEX IF NOT EXISTS uq_appt_slot
  ON appointments(appointment_date, appointment_time)
  WHERE deleted_at IS NULL AND status NOT IN ('ملغي','قائمة انتظار');

-- المجال ٥: المالي
CREATE TABLE IF NOT EXISTS treatments (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id   BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name         TEXT   NOT NULL,
  details      TEXT,
  total_cost   INT    NOT NULL CHECK (total_cost >= 0),
  paid_amount  INT    NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  started_at   DATE   NOT NULL DEFAULT CURRENT_DATE,
  created_by   BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ,
  CHECK (paid_amount <= total_cost)
);
CREATE INDEX IF NOT EXISTS idx_treat_patient ON treatments(patient_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_treat_due ON treatments(patient_id) WHERE deleted_at IS NULL AND paid_amount < total_cost;

CREATE TABLE IF NOT EXISTS payments (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  treatment_id BIGINT NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  patient_id   BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount       INT    NOT NULL CHECK (amount > 0),
  paid_at      DATE   NOT NULL DEFAULT CURRENT_DATE,
  method       TEXT   NOT NULL DEFAULT 'نقدي',
  received_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  voided_at    TIMESTAMPTZ,
  void_reason  TEXT
);
CREATE INDEX IF NOT EXISTS idx_pay_treatment ON payments(treatment_id, voided_at);
CREATE INDEX IF NOT EXISTS idx_pay_patient   ON payments(patient_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_pay_date      ON payments(paid_at DESC);

-- المجال ٦: المختبر
CREATE TABLE IF NOT EXISTS lab_works (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id   BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  work_details TEXT   NOT NULL,
  lab_name     TEXT,
  cost         INT    NOT NULL DEFAULT 0 CHECK (cost >= 0),
  status       TEXT   NOT NULL DEFAULT 'مرسل'
               CHECK (status IN ('مرسل','قيد التنفيذ','تم الاستلام')),
  due_date     DATE,
  created_by   BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_lab_status  ON lab_works(status, due_date);
CREATE INDEX IF NOT EXISTS idx_lab_patient ON lab_works(patient_id);

-- العدادات
CREATE TABLE IF NOT EXISTS counters (
  name  TEXT PRIMARY KEY,
  value INT  NOT NULL
);
INSERT INTO counters(name, value) VALUES ('file_no', 1000) ON CONFLICT DO NOTHING;

-- الدوال والمحفزات
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_patients_updated
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_treatments_updated
BEFORE UPDATE ON treatments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_appt_updated
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- العروض
CREATE OR REPLACE VIEW v_patient_finance AS
SELECT p.id AS patient_id,
       COALESCE(SUM(t.total_cost), 0)  AS total,
       COALESCE(SUM(t.paid_amount), 0) AS paid,
       COALESCE(SUM(t.total_cost - t.paid_amount), 0) AS due
FROM patients p
LEFT JOIN treatments t ON t.patient_id = p.id AND t.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id;
