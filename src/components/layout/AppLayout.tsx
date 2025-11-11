import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, User, LogOut, Cog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();

      setUserData({
        email: user.email || "",
        firstName: profile?.first_name || "مستخدم",
        lastName: profile?.last_name || "",
        avatarUrl: profile?.avatar_url || null,
        role: profile?.role === "admin" ? "مسؤول" : 
              profile?.role === "manager" ? "مدير" :
              profile?.role === "staff" ? "موظف" :
              profile?.role === "vendor" ? "فني" : "عميل"
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  const getInitials = () => {
    if (!userData) return "م";
    const first = userData.firstName?.charAt(0) || "";
    const last = userData.lastName?.charAt(0) || "";
    return `${first}${last}` || "م";
  };

  const getFullName = () => {
    if (!userData) return "المستخدم";
    return `${userData.firstName} ${userData.lastName}`.trim() || "المستخدم";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background" dir="rtl">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with trigger and user menu */}
          <header className="h-14 flex items-center border-b border-border px-4 bg-card/95 backdrop-blur-sm sticky top-0 z-30 shadow-sm">
            <SidebarTrigger className="ml-2" />
            
            <div className="flex-1 flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="relative">
                    <span className="text-primary-foreground font-bold text-base">A</span>
                    <Cog className="absolute -top-1 -right-1 h-2.5 w-2.5 text-primary-foreground/80 animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-primary">UberFix.shop</h1>
                  <p className="text-xs text-muted-foreground">إدارة الصيانة</p>
                </div>
              </div>

              {/* User section */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <NotificationsList />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 hover:bg-primary/10 transition-all duration-200 p-1 rounded-xl"
                    >
                      <Avatar className="h-9 w-9 border-2 border-primary/30 shadow-lg ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                        <AvatarImage 
                          src={userData?.avatarUrl || "/lovable-uploads/fb9d438e-077d-4ce0-997b-709c295e2b35.png"} 
                          alt={getFullName()} 
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:block text-right">
                        <p className="text-sm font-semibold text-foreground">{getFullName()}</p>
                        <p className="text-xs text-muted-foreground">{userData?.role || "..."}</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-md border-border/50 shadow-xl">
                    <DropdownMenuLabel className="text-right py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarImage 
                            src={userData?.avatarUrl || "/lovable-uploads/fb9d438e-077d-4ce0-997b-709c295e2b35.png"} 
                            alt={getFullName()} 
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 flex-1">
                          <p className="text-sm font-semibold leading-none">{getFullName()}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {userData?.email || "..."}
                          </p>
                          <span className="text-xs text-primary font-medium">{userData?.role || "..."}</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => navigate("/settings")}
                    >
                      <User className="ml-2 h-4 w-4 text-primary" />
                      <span>الملف الشخصي</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => navigate("/settings")}
                    >
                      <Settings className="ml-2 h-4 w-4 text-primary" />
                      <span>الإعدادات</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="text-destructive cursor-pointer hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="ml-2 h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          {/* Page content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}