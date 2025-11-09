import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ClipboardList,
  BarChart3,
  Users,
  MapPin,
  FileText,
  Settings,
  Building2,
  Calendar,
  DollarSign,
  PlayCircle,
  Activity,
  Clock
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  {
    icon: Home,
    label: "الرئيسية",
    href: "/"
  },
  {
    icon: ClipboardList,
    label: "طلبات الصيانة",
    href: "/requests",
    badge: "2"
  },
  {
    icon: Users,
    label: "الموردين والفنيين",
    href: "/vendors"
  },
  {
    icon: BarChart3,
    label: "التقارير والإحصائيات",
    href: "/reports"
  },
  {
    icon: Building2,
    label: "العقارات",
    href: "/properties"
  },
  {
    icon: Calendar,
    label: "المواعيد",
    href: "/appointments"
  },
  {
    icon: DollarSign,
    label: "الفواتير",
    href: "/invoices"
  },
  {
    icon: MapPin,
    label: "الخريطة",
    href: "/map"
  },
  {
    icon: FileText,
    label: "التوثيق",
    href: "/documentation"
  },
  {
    icon: Settings,
    label: "الإعدادات",
    href: "/settings"
  },
  {
    icon: PlayCircle,
    label: "اختبار النظام",
    href: "/testing"
  },
  {
    icon: BarChart3,
    label: "تقرير الإنتاج",
    href: "/production-report"
  },
  {
    icon: Clock,
    label: "لوحة SLA",
    href: "/sla-dashboard"
  },
  {
    icon: Activity,
    label: "مراقب الإنتاج",
    href: "/production-monitor"
  }
];

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside className="w-64 h-full bg-card border-l border-border shadow-lg flex flex-col">
      {/* Header - Mobile only */}
      <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-foreground">UberFix.shop</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-2 hover:bg-accent rounded-lg"
          aria-label="إغلاق القائمة"
        >
          ×
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === item.href
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/70 hover:translate-x-1'
                )}
                onClick={onClose}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p className="font-medium">نسخة 1.0.0</p>
          <p>© 2024 UberFix.shop</p>
        </div>
      </div>
    </aside>
  );
};