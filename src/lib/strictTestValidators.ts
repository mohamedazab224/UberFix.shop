/**
 * نظام التحقق الصارم للاختبارات
 * يضمن عدم تمرير أي خطأ أو مشكلة محتملة
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details?: any;
}

export class StrictTestValidators {
  /**
   * التحقق الصارم من اتصال قاعدة البيانات
   */
  static async validateDatabaseConnection(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // التحقق من أن الاستجابة ليست فقط ناجحة، بل سريعة أيضاً
      const start = performance.now();
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error, status, statusText } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });

      const duration = performance.now() - start;

      if (error) {
        errors.push(`Database error: ${error.message}`);
        errors.push(`Status: ${status}, StatusText: ${statusText}`);
      }

      if (duration > 1000) {
        warnings.push(`Slow response: ${duration.toFixed(2)}ms (expected < 1000ms)`);
      }

      if (status !== 200 && status !== 206) {
        errors.push(`Unexpected status code: ${status}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        details: { duration, status, count: data }
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings,
      };
    }
  }

  /**
   * التحقق الصارم من RLS policies
   */
  static async validateRLSPolicies(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const criticalTables = [
      'profiles',
      'user_roles',
      'maintenance_requests',
      'properties',
      'invoices',
      'vendors'
    ];

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        errors.push('No authenticated user - RLS policies cannot be properly tested');
        return { isValid: false, errors, warnings };
      }

      for (const table of criticalTables) {
        try {
          const { data, error } = await supabase
            .from(table as any)
            .select('*')
            .limit(1);

          if (error && error.code === 'PGRST301') {
            // RLS is blocking as expected for some tables
            continue;
          } else if (error && error.code !== '42501') {
            // 42501 is "insufficient_privilege" which is expected for some users
            warnings.push(`Table ${table}: Unexpected error - ${error.message}`);
          }
        } catch (err) {
          errors.push(`Table ${table}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        details: { testedTables: criticalTables.length }
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`RLS validation failed: ${error instanceof Error ? error.message : 'Unknown'}`],
        warnings,
      };
    }
  }

  /**
   * التحقق من نزاهة البيانات والعلاقات
   */
  static async validateDataIntegrity(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // التحقق من أن كل طلب صيانة له عقار موجود
      const { data: orphanedRequests } = await supabase
        .from('maintenance_requests')
        .select('id, property_id')
        .not('property_id', 'is', null);

      if (orphanedRequests && orphanedRequests.length > 0) {
        // التحقق من وجود العقارات المرتبطة
        const propertyIds = orphanedRequests.map(r => r.property_id);
        const { data: properties } = await supabase
          .from('properties')
          .select('id')
          .in('id', propertyIds);

        const existingIds = new Set(properties?.map(p => p.id) || []);
        const missingPropertyRequests = orphanedRequests.filter(
          r => r.property_id && !existingIds.has(r.property_id)
        );

        if (missingPropertyRequests.length > 0) {
          errors.push(
            `Found ${missingPropertyRequests.length} maintenance requests with non-existent properties`
          );
        }
      }

      // التحقق من أن كل مستخدم له profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (error || !profile) {
          errors.push('Current user has no profile record');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Data integrity check failed: ${error instanceof Error ? error.message : 'Unknown'}`],
        warnings,
      };
    }
  }

  /**
   * التحقق من صحة المصادقة والجلسات
   */
  static async validateAuthentication(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        errors.push(`Session error: ${sessionError.message}`);
      }

      if (!session) {
        warnings.push('No active session - some tests may fail');
        return { isValid: false, errors, warnings };
      }

      // التحقق من صلاحية الجلسة
      const expiresAt = session.expires_at ? new Date(session.expires_at).getTime() : 0;
      const now = Date.now();
      const timeLeft = expiresAt - now;

      if (timeLeft < 0) {
        errors.push('Session has expired');
      } else if (timeLeft < 5 * 60 * 1000) {
        warnings.push(`Session expires in ${Math.round(timeLeft / 60000)} minutes`);
      }

      // التحقق من صحة المستخدم
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        errors.push(`User validation error: ${userError.message}`);
      }

      if (!user) {
        errors.push('No authenticated user found');
      } else if (!user.email) {
        warnings.push('User has no email address');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        details: { 
          sessionExpiry: session?.expires_at,
          userEmail: user?.email 
        }
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Authentication validation failed: ${error instanceof Error ? error.message : 'Unknown'}`],
        warnings,
      };
    }
  }

  /**
   * التحقق من الأداء
   */
  static async validatePerformance(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      // اختبار 1: سرعة استجابة قاعدة البيانات
      const dbStart = performance.now();
      await supabase.from('profiles').select('count', { count: 'exact', head: true });
      const dbDuration = performance.now() - dbStart;

      if (dbDuration > 500) {
        errors.push(`Database response too slow: ${dbDuration.toFixed(2)}ms (max: 500ms)`);
      } else if (dbDuration > 300) {
        warnings.push(`Database response slow: ${dbDuration.toFixed(2)}ms (optimal: < 300ms)`);
      }

      // اختبار 2: وقت تحميل الصفحة
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        const loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
        if (loadTime > 3000) {
          warnings.push(`Page load time: ${loadTime.toFixed(2)}ms (optimal: < 3000ms)`);
        }
      }

      // اختبار 3: استخدام الذاكرة (إن كان متاحاً)
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        const usedMemoryMB = memory.usedJSHeapSize / 1024 / 1024;
        if (usedMemoryMB > 100) {
          warnings.push(`High memory usage: ${usedMemoryMB.toFixed(2)}MB`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        details: { dbResponseTime: dbDuration }
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Performance validation failed: ${error instanceof Error ? error.message : 'Unknown'}`],
        warnings,
      };
    }
  }

  /**
   * التحقق من Storage والملفات
   */
  static async validateStorage(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      const { data: buckets, error } = await supabase.storage.listBuckets();

      if (error) {
        errors.push(`Storage error: ${error.message}`);
        return { isValid: false, errors, warnings };
      }

      if (!buckets || buckets.length === 0) {
        warnings.push('No storage buckets configured');
      }

      // التحقق من صحة كل bucket
      for (const bucket of buckets || []) {
        try {
          const { data: files, error: listError } = await supabase.storage
            .from(bucket.name)
            .list('', { limit: 1 });

          if (listError && listError.message.includes('not found')) {
            warnings.push(`Bucket ${bucket.name} may have permission issues`);
          }
        } catch (err) {
          warnings.push(`Could not access bucket ${bucket.name}`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        details: { bucketsCount: buckets?.length || 0 }
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Storage validation failed: ${error instanceof Error ? error.message : 'Unknown'}`],
        warnings,
      };
    }
  }
}
