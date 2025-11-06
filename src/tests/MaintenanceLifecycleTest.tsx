import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function MaintenanceLifecycleTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runFullLifecycleTest = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      // المرحلة 1: إنشاء شركة وفرع للاختبار
      addResult({ step: "تحضير البيئة", status: 'success', message: "بدء الاختبار الشامل" });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addResult({ step: "المصادقة", status: 'error', message: "يجب تسجيل الدخول أولاً" });
        return;
      }

      // التحقق من وجود company_id للمستخدم
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      let companyId = profile?.company_id;
      
      if (!companyId) {
        addResult({ step: "الشركة", status: 'warning', message: "لا يوجد company_id للمستخدم" });
        
        // إنشاء شركة اختبارية
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({ name: 'شركة اختبار دورة الحياة', created_by: user.id })
          .select()
          .single();
          
        if (companyError) {
          addResult({ step: "إنشاء الشركة", status: 'error', message: companyError.message });
          return;
        }
        
        companyId = newCompany.id;
        
        // تحديث profile
        await supabase
          .from('profiles')
          .update({ company_id: companyId })
          .eq('id', user.id);
          
        addResult({ step: "إنشاء الشركة", status: 'success', message: "تم إنشاء شركة اختبارية" });
      }

      // إنشاء فرع اختبار
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .insert({
          name: 'فرع اختبار',
          company_id: companyId,
          created_by: user.id
        })
        .select()
        .single();

      if (branchError) {
        addResult({ step: "إنشاء الفرع", status: 'error', message: branchError.message });
        return;
      }

      addResult({ step: "إنشاء الفرع", status: 'success', message: "تم إنشاء فرع اختبار بنجاح" });

      // المرحلة 2: إنشاء طلب صيانة جديد
      const requestData = {
        title: 'طلب صيانة اختبار - دورة حياة كاملة',
        description: 'اختبار شامل لجميع مراحل دورة الحياة',
        workflow_stage: 'DRAFT',
        status: 'Open' as const,
        priority: 'high',
        company_id: companyId,
        branch_id: branch.id,
        created_by: user.id,
        client_name: 'عميل اختبار',
        client_phone: '0123456789',
        location: 'موقع اختبار'
      };

      const { data: request, error: requestError } = await supabase
        .from('maintenance_requests')
        .insert([requestData])
        .select()
        .single();

      if (requestError) {
        addResult({ 
          step: "إنشاء الطلب", 
          status: 'error', 
          message: requestError.message,
          details: requestError 
        });
        return;
      }

      addResult({ 
        step: "إنشاء الطلب", 
        status: 'success', 
        message: `تم إنشاء الطلب #${request.id.substring(0, 8)}` 
      });

      // المرحلة 3: اختبار جميع الانتقالات (Workflow Transitions)
      const transitions = [
        { from: 'DRAFT', to: 'SUBMITTED', label: 'تقديم الطلب' },
        { from: 'SUBMITTED', to: 'TRIAGED', label: 'فرز الطلب' },
        { from: 'TRIAGED', to: 'ASSIGNED', label: 'تخصيص فني' },
        { from: 'ASSIGNED', to: 'SCHEDULED', label: 'جدولة الموعد' },
        { from: 'SCHEDULED', to: 'IN_PROGRESS', label: 'بدء التنفيذ' },
        { from: 'IN_PROGRESS', to: 'INSPECTION', label: 'الفحص' },
        { from: 'INSPECTION', to: 'COMPLETED', label: 'اكتمال العمل' },
        { from: 'COMPLETED', to: 'BILLED', label: 'إصدار الفاتورة' },
        { from: 'BILLED', to: 'PAID', label: 'الدفع' },
        { from: 'PAID', to: 'CLOSED', label: 'إغلاق الطلب' }
      ];

      for (const transition of transitions) {
        // تحديث workflow_stage
        const { error: updateError } = await supabase
          .from('maintenance_requests')
          .update({ 
            workflow_stage: transition.to,
            updated_at: new Date().toISOString()
          })
          .eq('id', request.id);

        if (updateError) {
          addResult({
            step: transition.label,
            status: 'error',
            message: `فشل الانتقال من ${transition.from} إلى ${transition.to}`,
            details: updateError
          });
          continue;
        }

        // التحقق من نجاح التحديث
        const { data: updated } = await supabase
          .from('maintenance_requests')
          .select('workflow_stage')
          .eq('id', request.id)
          .single();

        if (updated?.workflow_stage === transition.to) {
          addResult({
            step: transition.label,
            status: 'success',
            message: `تم الانتقال بنجاح من ${transition.from} إلى ${transition.to}`
          });
        } else {
          addResult({
            step: transition.label,
            status: 'warning',
            message: `المرحلة الحالية: ${updated?.workflow_stage} (متوقع: ${transition.to})`
          });
        }

        // انتظار صغير بين كل انتقال
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // المرحلة 4: اختبار الحالات الجانبية
      const sideStates = [
        { state: 'ON_HOLD', label: 'تعليق الطلب' },
        { state: 'WAITING_PARTS', label: 'بانتظار القطع' }
      ];

      for (const sideState of sideStates) {
        const { error } = await supabase
          .from('maintenance_requests')
          .update({ workflow_stage: sideState.state })
          .eq('id', request.id);

        if (error) {
          addResult({
            step: sideState.label,
            status: 'error',
            message: error.message
          });
        } else {
          addResult({
            step: sideState.label,
            status: 'success',
            message: `تم الانتقال إلى حالة ${sideState.label}`
          });
        }
      }

      // المرحلة 5: اختبار الإلغاء
      const { error: cancelError } = await supabase
        .from('maintenance_requests')
        .update({ workflow_stage: 'CANCELLED' })
        .eq('id', request.id);

      if (cancelError) {
        addResult({
          step: "إلغاء الطلب",
          status: 'error',
          message: cancelError.message
        });
      } else {
        addResult({
          step: "إلغاء الطلب",
          status: 'success',
          message: "تم إلغاء الطلب بنجاح"
        });
      }

      // المرحلة 6: اختبار request_events
      const { data: events, error: eventsError } = await supabase
        .from('request_events')
        .select('*')
        .eq('request_id', request.id);

      if (eventsError) {
        addResult({
          step: "سجل الأحداث",
          status: 'warning',
          message: `تعذر جلب الأحداث: ${eventsError.message}`
        });
      } else {
        addResult({
          step: "سجل الأحداث",
          status: events && events.length > 0 ? 'success' : 'warning',
          message: `تم تسجيل ${events?.length || 0} حدث`,
          details: events
        });
      }

      // المرحلة 7: التنظيف (حذف البيانات الاختبارية)
      const { error: deleteError } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', request.id);

      if (deleteError) {
        addResult({
          step: "تنظيف البيانات",
          status: 'warning',
          message: "تعذر حذف الطلب الاختباري (قد يحتاج صلاحيات admin)"
        });
      } else {
        addResult({
          step: "تنظيف البيانات",
          status: 'success',
          message: "تم حذف البيانات الاختبارية"
        });
      }

      // حذف الفرع
      await supabase.from('branches').delete().eq('id', branch.id);

      // ملخص النتائج
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      const warningCount = results.filter(r => r.status === 'warning').length;

      addResult({
        step: "الملخص النهائي",
        status: errorCount === 0 ? 'success' : 'warning',
        message: `نجح: ${successCount} | فشل: ${errorCount} | تحذيرات: ${warningCount}`
      });

      toast({
        title: "اكتمل الاختبار",
        description: `تم اختبار ${transitions.length + sideStates.length + 1} انتقال`,
      });

    } catch (error: any) {
      addResult({
        step: "خطأ عام",
        status: 'error',
        message: error.message,
        details: error
      });
      
      toast({
        title: "فشل الاختبار",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">اختبار دورة حياة طلب الصيانة الكامل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              سيقوم هذا الاختبار بإنشاء طلب صيانة اختباري واختبار جميع مراحل دورة الحياة من DRAFT حتى CLOSED
              وجميع الحالات الجانبية (ON_HOLD, WAITING_PARTS, CANCELLED)
            </AlertDescription>
          </Alert>

          <Button 
            onClick={runFullLifecycleTest} 
            disabled={testing}
            size="lg"
            className="w-full"
          >
            {testing && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {testing ? 'جاري الاختبار...' : 'بدء الاختبار الشامل'}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>نتائج الاختبار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success' ? 'bg-green-50 border-green-200' :
                    result.status === 'error' ? 'bg-red-50 border-red-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(result.status)}
                    <div className="flex-1">
                      <div className="font-semibold">{result.step}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-muted-foreground">
                            عرض التفاصيل
                          </summary>
                          <pre className="mt-2 text-xs bg-background p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
