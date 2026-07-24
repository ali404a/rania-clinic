# دليل ربط وتجهيز قاعدة البيانات على Supabase (سناب بيس)

هذا الدليل يوضح خطوات نقل ورفع قاعدة بيانات **عيادة الدكتورة رانية زياد** إلى منصة **Supabase** بنجاح.

---

## 1. إنشاء المشروع على Supabase
1. سجل الدخول إلى [Supabase Console](https://supabase.com/dashboard).
2. أنشئ مشروعاً جديداً (New Project) باسم `rania-clinic`.
3. اختر كلمة مرور قوية لقاعدة البيانات واحتفظ بها.
4. حدد المنطقة الأقرب (مثل Frankfurt أو Bahrain).

---

## 2. تنفيذ مخطط قاعدة البيانات (Schema Execution)
1. افتح **SQL Editor** من القائمة الجانبية في منصة Supabase.
2. افتح الملف `db/supabase_schema.sql` الموجود في هذا المشروع وانسخ كافة محتوياته.
3. الصق المحتوى في محرّر SQL في Supabase واضغط على **RUN**.
4. سيتم إنشاء الجداول التسعة التالية بجميع الفهارس والمحفزات والعروض:
   - `users` (المستخدمين والأدوار)
   - `sessions` (الجلسات)
   - `audit_log` (سجل التدقيق الأمني)
   - `patients` (بيانات المرضى)
   - `patient_medical` (السجل الطبي)
   - `visits` (الزيارات والتشخيص)
   - `tooth_chart` (مخطط الأسنان)
   - `appointments` (المواعيد والجدولة)
   - `treatments` (العلاجات والمالية)
   - `payments` (الدفعات المالية)
   - `lab_works` (المختبر)
   - `counters` (عدادات الملفات)
   - `v_patient_finance` (عرض المالي الإجمالي)

---

## 3. الحصول على سلسلة الاتصال (Database Connection String)
1. في Supabase، اذهب إلى **Project Settings** -> **Database**.
2. ابحث عن قسم **Connection String** واختر **URI**.
3. سيكون الرابط بالشكل التالي:
   `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

---

## 4. ربط Supabase مع Vercel
1. افتح مشروعك في منصة **Vercel**.
2. اذهب إلى **Settings** -> **Environment Variables**.
3. أضف المتغير التالي:
   - **Key**: `DATABASE_URL`
   - **Value**: رابط الاتصال الخاص بك من Supabase.
4. اعد نشر المشروع (Redeploy) على Vercel ليعتمد الاتصال المباشر مع Supabase PostgreSQL.
