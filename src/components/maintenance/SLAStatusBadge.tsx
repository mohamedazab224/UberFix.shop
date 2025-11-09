import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SLAStatusBadgeProps {
  dueDate: string | null;
  status: string;
  label: string;
}

export function SLAStatusBadge({ dueDate, status, label }: SLAStatusBadgeProps) {
  if (!dueDate || ['completed', 'cancelled', 'closed'].includes(status.toLowerCase())) {
    return null;
  }

  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  const minutesRemaining = Math.floor(diff / 60000);
  const hoursRemaining = Math.floor(minutesRemaining / 60);

  let variant: "default" | "outline" | "destructive" | "secondary" = "default";
  let icon = <Clock className="h-3 w-3 ml-1" />;
  let timeText = "";
  let className = "";

  if (diff < 0) {
    variant = "destructive";
    icon = <AlertTriangle className="h-3 w-3 ml-1" />;
    timeText = `متأخر ${Math.abs(hoursRemaining)}س`;
  } else if (hoursRemaining < 1) {
    variant = "outline";
    className = "border-yellow-600 text-yellow-600";
    icon = <AlertTriangle className="h-3 w-3 ml-1" />;
    timeText = `${minutesRemaining}د متبقية`;
  } else if (hoursRemaining < 24) {
    variant = "default";
    timeText = `${hoursRemaining}س متبقية`;
  } else {
    variant = "secondary";
    icon = <CheckCircle className="h-3 w-3 ml-1" />;
    const daysRemaining = Math.floor(hoursRemaining / 24);
    timeText = `${daysRemaining}ي متبقية`;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className={`text-xs gap-1 ${className}`}>
            {icon}
            {label}: {timeText}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>الموعد النهائي: {due.toLocaleString('ar-EG')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
