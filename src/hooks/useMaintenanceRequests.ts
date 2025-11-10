import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type WorkflowStage = 
  | 'draft'
  | 'submitted'
  | 'acknowledged'
  | 'assigned'
  | 'scheduled'
  | 'in_progress'
  | 'inspection'
  | 'waiting_parts'
  | 'completed'
  | 'billed'
  | 'paid'
  | 'closed'
  | 'cancelled'
  | 'on_hold';

// Based on actual database schema
export interface MaintenanceRequest {
  id: string;
  company_id: string;
  branch_id: string;
  asset_id?: string;
  category_id?: string;
  subcategory_id?: string;
  opened_by_role?: string;
  channel?: string;
  title: string;
  description?: string;
  priority?: string;
  sla_deadline?: string;
  status: string;
  created_at: string;
  created_by?: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  location?: string;
  service_type?: string;
  estimated_cost?: number;
  actual_cost?: number;
  rating?: number;
  workflow_stage?: string;
  sla_due_date?: string;
  assigned_vendor_id?: string;
  vendor_notes?: string;
  archived_at?: string;
  updated_at?: string;
}

export function useMaintenanceRequests() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // جرب الجدول الجديد أولاً
      let data, error;
      
      const result = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
        
      // إذا نجح، استخدمه
      if (!result.error) {
        const fullResult = await supabase
          .from('maintenance_requests')
          .select('*')
          .order('created_at', { ascending: false });
        data = fullResult.data;
        error = fullResult.error;
      } else {
        // وإلا، لا توجد بيانات
        data = [];
        error = null;
      }

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err as Error);
      toast({
        title: "خطأ في تحميل الطلبات",
        description: err instanceof Error ? err.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }
      
      // جلب company_id و branch_id من profile المستخدم
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !profile?.company_id) {
        throw new Error("حدث خطأ في جلب بيانات المستخدم. يرجى تسجيل الخروج والدخول مرة أخرى.");
      }
      
      // جلب أول فرع للشركة
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('company_id', profile.company_id)
        .limit(1)
        .single();
      
      if (branchError || !branch) {
        throw new Error("حدث خطأ في جلب بيانات الفرع. يرجى تسجيل الخروج والدخول مرة أخرى.");
      }
      
      // إنشاء الطلب
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert({
          ...requestData,
          created_by: user.id,
          status: 'Open',
          workflow_stage: 'submitted',
          company_id: profile.company_id,
          branch_id: branch.id
        })
        .select()
        .single();

      if (error) throw error;

      // إرسال إشعار بإنشاء طلب جديد
      try {
        await supabase.functions.invoke('send-maintenance-notification', {
          body: {
            request_id: data.id,
            event_type: 'request_created',
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // لا نفشل العملية إذا فشل الإشعار
      }

      toast({
        title: "✓ تم إنشاء الطلب",
        description: "تم إنشاء طلب الصيانة بنجاح",
      });

      await fetchRequests();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "فشل في إنشاء طلب الصيانة";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateRequest = async (id: string, updates: Partial<MaintenanceRequest>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      // جلب البيانات القديمة للمقارنة
      const { data: oldData } = await supabase
        .from('maintenance_requests')
        .select('status, workflow_stage')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // إرسال إشعار عند تغيير الحالة أو المرحلة
      try {
        if (oldData) {
          if (updates.status && updates.status !== oldData.status) {
            await supabase.functions.invoke('send-maintenance-notification', {
              body: {
                request_id: id,
                old_status: oldData.status,
                new_status: updates.status,
                event_type: 'status_changed',
              }
            });
          }
          
          if (updates.workflow_stage && updates.workflow_stage !== oldData.workflow_stage) {
            await supabase.functions.invoke('send-maintenance-notification', {
              body: {
                request_id: id,
                old_stage: oldData.workflow_stage,
                new_stage: updates.workflow_stage,
                event_type: 'stage_changed',
              }
            });
          }

          if (updates.workflow_stage === 'completed') {
            await supabase.functions.invoke('send-maintenance-notification', {
              body: {
                request_id: id,
                event_type: 'request_completed',
              }
            });
          }
        }
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      toast({
        title: "✓ تم التحديث",
        description: "تم تحديث طلب الصيانة بنجاح",
      });

      await fetchRequests();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "فشل في تحديث طلب الصيانة";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✓ تم الحذف",
        description: "تم حذف طلب الصيانة بنجاح",
      });

      await fetchRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "فشل في حذف طلب الصيانة";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchRequests();

    // إضافة realtime subscription
    const channel = supabase
      .channel('maintenance-requests-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'maintenance_requests' },
        () => {
          console.log('🔄 Maintenance requests changed, refetching...');
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up maintenance requests subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    requests,
    loading,
    error,
    createRequest,
    updateRequest,
    deleteRequest,
    refetch: fetchRequests
  };
}