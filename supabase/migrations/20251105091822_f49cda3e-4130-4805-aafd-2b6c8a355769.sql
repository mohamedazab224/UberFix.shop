-- إصلاح المشكلة في foreign key constraints وإنشاء company/branch للمستخدمين الحاليين

-- 1. إزالة constraint القديم من companies
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_created_by_fkey;

-- 2. إزالة constraint القديم من branches  
ALTER TABLE public.branches DROP CONSTRAINT IF EXISTS branches_created_by_fkey;

-- 3. إنشاء company و branch لجميع المستخدمين الحاليين الذين ليس لديهم
DO $$
DECLARE
  user_record RECORD;
  new_company_id uuid;
  new_branch_id uuid;
BEGIN
  FOR user_record IN 
    SELECT p.id, p.email, p.name
    FROM public.profiles p
    WHERE p.company_id IS NULL
  LOOP
    BEGIN
      -- إنشاء شركة
      INSERT INTO public.companies (name, created_by)
      VALUES ('شركة ' || COALESCE(user_record.name, user_record.email), user_record.id)
      RETURNING id INTO new_company_id;
      
      -- إنشاء فرع
      INSERT INTO public.branches (company_id, name, created_by)
      VALUES (new_company_id, 'الفرع الرئيسي', user_record.id)
      RETURNING id INTO new_branch_id;
      
      -- تحديث الملف الشخصي
      UPDATE public.profiles
      SET company_id = new_company_id
      WHERE id = user_record.id;
      
      RAISE NOTICE 'Created company and branch for user %', user_record.email;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error for user %: %', user_record.email, SQLERRM;
    END;
  END LOOP;
END $$;