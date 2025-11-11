import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentRequests } from "@/components/dashboard/RecentRequests";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MaintenanceChart } from "@/components/dashboard/MaintenanceChart";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useProjects } from "@/hooks/useProjects";
import { useMediaQuery } from "@/hooks/use-mobile";
import { 
  Wrench, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Loader2
} from "lucide-react";

const Dashboard = () => {
  const { stats, loading } = useDashboardStats();
  const { projects } = useProjects();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // حسابات إضافية من Projects فقط
  const projectStats = {
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    actualCost: projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0),
    activeProjects: projects.filter(p => p.status === 'planning' || p.status === 'design').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2 text-center sm:text-right">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          مرحباً بك في لوحة التحكم 📊
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          نظرة عامة على الميزانية الشهرية وإحصائيات طلبات الصيانة
        </p>
      </div>

      {/* Stats Grid - مُحسنة للهواتف */}
      <div className={`grid gap-3 sm:gap-4 lg:gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        <StatsCard
          title="الطلبات المعلقة"
          value={stats.pending_requests.toString()}
          icon={Clock}
          iconColor="text-warning"
        />
        
        <StatsCard
          title="الطلبات المضافة اليوم"
          value={stats.today_requests.toString()}
          subtitle="طلبات جديدة"
          icon={Wrench}
          iconColor="text-primary"
        />
        
        <StatsCard
          title="الطلبات المكتملة"
          value={stats.completed_requests.toString()}
          subtitle={`${Math.round(stats.completion_rate)}%`}
          icon={CheckCircle}
          iconColor="text-success"
        />
        
        <StatsCard
          title="إجمالي طلبات الصيانة"
          value={stats.total_requests.toString()}
          icon={TrendingUp}
          iconColor="text-secondary"
        />
      </div>

      {/* Monthly Budget Overview - مُحسنة للهواتف */}
      <div className={`grid gap-3 sm:gap-4 lg:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
        <StatsCard
          title="الطلبات هذا الشهر"
          value={stats.this_month_requests.toString()}
          subtitle="طلبات الشهر الحالي"
          icon={Wrench}
          iconColor="text-primary"
          className="lg:col-span-1"
        />
        
        <StatsCard
          title="الميزانية المتبقية"
          value={`EGP ${(projectStats.totalBudget - projectStats.actualCost).toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-success"
          className="lg:col-span-1"
        />
        
        <StatsCard
          title="المبلغ المدفوع"
          value={`EGP ${stats.actual_cost.toLocaleString()}`}
          icon={CheckCircle}
          iconColor="text-secondary"
          className="lg:col-span-1"
        />
        
        <StatsCard
          title="إجمالي الميزانية"
          value={`EGP ${stats.total_budget.toLocaleString()}`}
          subtitle={`استخدام ${stats.total_budget > 0 ? Math.round((stats.actual_cost / stats.total_budget) * 100) : 0}%`}
          icon={TrendingUp}
          iconColor="text-primary"
          className="lg:col-span-1"
        />
      </div>

      {/* Charts */}
      <MaintenanceChart />

      {/* Recent Activity & Quick Actions - مُحسنة للهواتف */}
      <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1 space-y-2' : 'grid-cols-1 lg:grid-cols-2'}`}>
        <RecentRequests />
        <QuickActions />
      </div>

      {/* Performance Stats - مُحسنة للهواتف */}
      <div className={`grid gap-3 sm:gap-4 lg:gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
        <div className="text-center p-6 bg-card rounded-lg border card-elegant">
          <div className="text-3xl font-bold text-primary">
            {stats.high_priority_count}
          </div>
          <div className="text-sm text-muted-foreground">طلبات عالية الأولوية</div>
        </div>
        
        <div className="text-center p-6 bg-card rounded-lg border card-elegant">
          <div className="text-3xl font-bold text-warning">
            {stats.in_progress_count}
          </div>
          <div className="text-sm text-muted-foreground">طلبات قيد التنفيذ</div>
        </div>
        
        <div className="text-center p-6 bg-card rounded-lg border card-elegant">
          <div className="text-3xl font-bold text-info">
            {stats.avg_completion_days || 0}
          </div>
          <div className="text-sm text-muted-foreground">متوسط أيام الإنجاز</div>
        </div>
        
        <div className="text-center p-6 bg-card rounded-lg border card-elegant">
          <div className="text-3xl font-bold text-success">
            {Math.round(stats.completion_rate)}%
          </div>
          <div className="text-sm text-muted-foreground">نسبة الإنجاز</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;