# إعداد المسؤول الأول

## 🚀 خطوات إضافة أول مسؤول للنظام

بعد تثبيت المشروع وإنشاء قاعدة البيانات، اتبع هذه الخطوات لإضافة أول مسؤول:

### الطريقة 1: عبر Supabase Dashboard (موصى بها)

1. **سجل حساب جديد في التطبيق**
   - اذهب إلى `/role-selection`
   - اختر "العملاء" (مؤقتاً)
   - سجل بالبريد الإلكتروني وكلمة المرور

2. **افتح Supabase Dashboard**
   - اذهب إلى: https://supabase.com/dashboard
   - اختر مشروعك
   - اذهب إلى **SQL Editor**

3. **احصل على User ID**
   ```sql
   SELECT id, email, created_at 
   FROM auth.users 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
   انسخ الـ `id` للمستخدم الذي سجلته

4. **أضف دور المسؤول**
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('user-uuid-here', 'admin')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

5. **تحقق من الدور**
   ```sql
   SELECT ur.*, u.email 
   FROM public.user_roles ur
   JOIN auth.users u ON u.id = ur.user_id
   WHERE ur.role = 'admin';
   ```

6. **سجل خروج وسجل دخول مرة أخرى**
   لتفعيل الصلاحيات الجديدة

### الطريقة 2: عبر SQL Script

يمكنك تشغيل هذا السكريبت في SQL Editor:

```sql
-- إنشاء حساب مسؤول جديد
DO $$
DECLARE
  new_user_id UUID;
  admin_email TEXT := 'admin@alazab.online';  -- غير هذا البريد
  admin_password TEXT := 'your-secure-password-here';  -- غير هذه الكلمة
BEGIN
  -- ملاحظة: لا يمكن إنشاء المستخدمين مباشرة من SQL
  -- يجب التسجيل أولاً عبر واجهة التطبيق
  
  -- ابحث عن المستخدم بالبريد الإلكتروني
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = admin_email;
  
  -- إذا وجد، أضف دور المسؤول
  IF new_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'تم إضافة دور المسؤول للمستخدم: %', admin_email;
  ELSE
    RAISE NOTICE 'المستخدم غير موجود. سجل أولاً عبر التطبيق: %', admin_email;
  END IF;
END $$;
```

### الطريقة 3: عبر حساب Demo (للتطوير فقط)

في صفحة Login، يوجد زر "دخول تجريبي سريع" يستخدم:
- البريد: `admin@alazab.online`
- كلمة المرور: `123456`

**تحذير**: غير هذه البيانات فوراً في الإنتاج!

## 🔧 إضافة مسؤولين إضافيين

بعد تسجيل دخولك كمسؤول، يمكنك إضافة مسؤولين آخرين:

### عبر SQL (حالياً)

```sql
-- احصل على user_id من البريد الإلكتروني
SELECT id FROM auth.users WHERE email = 'new-admin@example.com';

-- أضف دور المسؤول
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

### عبر واجهة المستخدم (قريباً)

سيتم إضافة صفحة إدارة المستخدمين في Settings حيث يمكن للمسؤولين:
- عرض جميع المستخدمين
- تعديل أدوار المستخدمين
- إضافة وإزالة الأدوار

## 📝 إضافة أدوار أخرى

### إضافة فني (Technician)

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'technician');
```

### إضافة دور إضافي لمستخدم موجود

يمكن للمستخدم أن يكون له أكثر من دور:

```sql
-- مثال: مسؤول وفني في نفس الوقت
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('user-uuid-here', 'admin'),
  ('user-uuid-here', 'technician')
ON CONFLICT (user_id, role) DO NOTHING;
```

## 🔍 التحقق من الأدوار

### عرض جميع المسؤولين

```sql
SELECT 
  u.id,
  u.email,
  u.created_at,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;
```

### عرض أدوار مستخدم معين

```sql
SELECT 
  ur.role,
  ur.created_at as assigned_at
FROM public.user_roles ur
WHERE ur.user_id = 'user-uuid-here';
```

### إحصائيات الأدوار

```sql
SELECT 
  role,
  COUNT(*) as count,
  array_agg(
    (SELECT email FROM auth.users WHERE id = user_id)
  ) as users
FROM public.user_roles
GROUP BY role;
```

## ⚠️ تنبيهات أمنية

1. **لا تشارك credentials المسؤول**: غير كلمة المرور الافتراضية فوراً
2. **استخدم email verification**: فعّل تأكيد البريد في Supabase
3. **قلل عدد المسؤولين**: أضف مسؤولين فقط عند الحاجة
4. **راقب سجلات الدخول**: تابع نشاط المسؤولين بانتظام
5. **استخدم MFA**: فعّل المصادقة الثنائية في Supabase Auth

## 🔄 إزالة أو تعديل الأدوار

### إزالة دور من مستخدم

```sql
DELETE FROM public.user_roles
WHERE user_id = 'user-uuid-here'
  AND role = 'admin';
```

### تغيير دور مستخدم

```sql
-- إزالة جميع الأدوار القديمة
DELETE FROM public.user_roles WHERE user_id = 'user-uuid-here';

-- إضافة الدور الجديد
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'technician');
```

## 🐛 استكشاف الأخطاء

### "ليس لديك صلاحية للوصول"
1. تحقق من وجود الدور في `user_roles`
2. سجل خروج وسجل دخول مرة أخرى
3. تحقق من RLS policies

### لا يمكن إضافة دور
1. تأكد من أن المستخدم موجود في `auth.users`
2. تحقق من أن user_id صحيح
3. تأكد من أنك مسجل دخول كمسؤول

### الدور موجود لكن الصلاحيات لا تعمل
```sql
-- تحقق من RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'user_roles';

-- تأكد من أن الدالة has_role تعمل
SELECT public.has_role(auth.uid(), 'admin');
```

## 📚 موارد إضافية

- [نظام الأدوار الكامل](./ROLES_SYSTEM.md)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Roles](https://www.postgresql.org/docs/current/user-manag.html)