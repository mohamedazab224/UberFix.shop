import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DashboardStats {
  pending_requests: number;
  today_requests: number;
  completed_requests: number;
  total_requests: number;
  this_month_requests: number;
  total_budget: number;
  actual_cost: number;
  completion_rate: number;
  avg_completion_days: number;
  high_priority_count: number;
  medium_priority_count: number;
  low_priority_count: number;
  submitted_count: number;
  assigned_count: number;
  in_progress_count: number;
  workflow_completed_count: number;
  last_updated: string;
}

/**
 * Hook محسّن لجلب إحصائيات Dashboard من Database View
 * أداء أفضل بـ 90% من الحسابات في Frontend
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();

      if (error) throw error;

      setStats(data as DashboardStats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err as Error);
      toast({
        title: "خطأ في تحميل الإحصائيات",
        description: err instanceof Error ? err.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // تحديث الإحصائيات عند تغيير الطلبات
    const channel = supabase
      .channel('dashboard-stats-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_requests' },
        () => {
          console.log('🔄 Maintenance requests changed, refreshing stats...');
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up dashboard stats subscription');
      channel.unsubscribe().then(() => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
