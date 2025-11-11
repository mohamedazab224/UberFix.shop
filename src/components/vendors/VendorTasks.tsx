import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string;
  location: string | null;
  priority: string | null;
}

interface VendorTasksProps {
  vendorId: string;
}

export const VendorTasks = ({ vendorId }: VendorTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [vendorId]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("id, title, status, created_at, location, priority")
        .eq("assigned_vendor_id", vendorId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
      "Completed": { label: "مكتمل", className: "bg-green-600 text-primary-foreground", icon: CheckCircle2 },
      "In Progress": { label: "جاري العمل", className: "bg-blue-600 text-primary-foreground", icon: Clock },
      "Open": { label: "جديد", className: "bg-yellow-600 text-primary-foreground", icon: Clock },
      "Closed": { label: "مغلق", className: "bg-muted text-muted-foreground", icon: CheckCircle2 }
    };
    return configs[status] || configs["Open"];
  };

  const getPriorityConfig = (priority: string | null) => {
    const configs: Record<string, { label: string; className: string }> = {
      "high": { label: "عالية", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
      "medium": { label: "متوسطة", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
      "low": { label: "منخفضة", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" }
    };
    return priority ? configs[priority] || configs["medium"] : null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">لا توجد مهام بعد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const statusConfig = getStatusConfig(task.status);
        const priorityConfig = getPriorityConfig(task.priority);
        const StatusIcon = statusConfig.icon;

        return (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-2">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDistanceToNow(new Date(task.created_at), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                    </div>
                    {task.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{task.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={statusConfig.className}>
                    <StatusIcon className="h-3 w-3 ml-1" />
                    {statusConfig.label}
                  </Badge>
                  {priorityConfig && (
                    <Badge variant="outline" className={priorityConfig.className}>
                      {priorityConfig.label}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
