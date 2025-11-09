import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle, Clock, RefreshCw, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SLAStats {
  total: number;
  onTime: number;
  atRisk: number;
  overdue: number;
}

interface SLAViolation {
  id: string;
  title: string;
  priority: string;
  workflow_stage: string;
  violation_type: 'accept' | 'arrive' | 'complete';
  minutes_overdue: number;
  due_date: string;
}

export default function SLADashboard() {
  const [stats, setStats] = useState<SLAStats>({ total: 0, onTime: 0, atRisk: 0, overdue: 0 });
  const [violations, setViolations] = useState<SLAViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSLAData = async () => {
    try {
      setLoading(true);
      
      // جلب جميع الطلبات النشطة
      const { data: requests, error } = await supabase
        .from('maintenance_requests')
        .select('id, title, priority, workflow_stage, status, sla_accept_due, sla_arrive_due, sla_complete_due, created_at')
        .not('status', 'in', '(completed,cancelled,closed)');

      if (error) throw error;

      const now = new Date();
      const stats: SLAStats = { total: 0, onTime: 0, atRisk: 0, overdue: 0 };
      const foundViolations: SLAViolation[] = [];

      for (const req of requests || []) {
        stats.total++;
        let hasViolation = false;
        let isAtRisk = false;

        // فحص موعد القبول
        if (req.sla_accept_due && req.workflow_stage === 'SUBMITTED') {
          const due = new Date(req.sla_accept_due);
          const diff = due.getTime() - now.getTime();
          const hours = diff / (1000 * 60 * 60);

          if (diff < 0) {
            hasViolation = true;
            foundViolations.push({
              id: req.id,
              title: req.title,
              priority: req.priority,
              workflow_stage: req.workflow_stage,
              violation_type: 'accept',
              minutes_overdue: Math.floor(Math.abs(diff) / 60000),
              due_date: req.sla_accept_due
            });
          } else if (hours < 1) {
            isAtRisk = true;
          }
        }

        // فحص موعد الوصول
        if (req.sla_arrive_due && req.workflow_stage === 'ASSIGNED') {
          const due = new Date(req.sla_arrive_due);
          const diff = due.getTime() - now.getTime();
          const hours = diff / (1000 * 60 * 60);

          if (diff < 0) {
            hasViolation = true;
            foundViolations.push({
              id: req.id,
              title: req.title,
              priority: req.priority,
              workflow_stage: req.workflow_stage,
              violation_type: 'arrive',
              minutes_overdue: Math.floor(Math.abs(diff) / 60000),
              due_date: req.sla_arrive_due
            });
          } else if (hours < 1) {
            isAtRisk = true;
          }
        }

        // فحص موعد الإنجاز
        if (req.sla_complete_due) {
          const due = new Date(req.sla_complete_due);
          const diff = due.getTime() - now.getTime();
          const hours = diff / (1000 * 60 * 60);

          if (diff < 0) {
            hasViolation = true;
            foundViolations.push({
              id: req.id,
              title: req.title,
              priority: req.priority,
              workflow_stage: req.workflow_stage,
              violation_type: 'complete',
              minutes_overdue: Math.floor(Math.abs(diff) / 60000),
              due_date: req.sla_complete_due
            });
          } else if (hours < 2) {
            isAtRisk = true;
          }
        }

        if (hasViolation) {
          stats.overdue++;
        } else if (isAtRisk) {
          stats.atRisk++;
        } else {
          stats.onTime++;
        }
      }

      setStats(stats);
      setViolations(foundViolations);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSLAData();
    
    // تحديث كل دقيقة
    const interval = setInterval(fetchSLAData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getViolationLabel = (type: string) => {
    switch (type) {
      case 'accept': return 'تأخر القبول';
      case 'arrive': return 'تأخر الوصول';
      case 'complete': return 'تأخر الإنجاز';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة SLA</h1>
          <p className="text-muted-foreground">مراقبة أوقات الاستجابة والالتزام بمعايير الخدمة</p>
        </div>
        <Button onClick={fetchSLAData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* إحصائيات SLA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">طلبات نشطة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في الوقت المحدد</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onTime}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.onTime / stats.total) * 100) : 0}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معرض للخطر</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.atRisk}</div>
            <p className="text-xs text-muted-foreground">أقل من ساعة متبقية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متأخر</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">تجاوز الموعد النهائي</p>
          </CardContent>
        </Card>
      </div>

      {/* قائمة التجاوزات */}
      {violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              تجاوزات SLA ({violations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {violations.map((violation) => (
                  <div key={`${violation.id}-${violation.violation_type}`} className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{violation.title}</h3>
                        <p className="text-sm text-muted-foreground">طلب #{violation.id.substring(0, 8)}</p>
                      </div>
                      <Badge variant="destructive">{violation.priority}</Badge>
                    </div>
                    <div className="flex gap-2 items-center text-sm">
                      <Badge variant="outline">{getViolationLabel(violation.violation_type)}</Badge>
                      <span className="text-red-600 font-medium">
                        متأخر {Math.floor(violation.minutes_overdue / 60)}س {violation.minutes_overdue % 60}د
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      الموعد النهائي: {new Date(violation.due_date).toLocaleString('ar-EG')}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {violations.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">ممتاز! لا توجد تجاوزات</h3>
            <p className="text-muted-foreground">جميع الطلبات ضمن معايير SLA المحددة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
