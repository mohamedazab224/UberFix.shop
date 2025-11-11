import { ReactNode } from "react";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { AppLayout } from "@/components/layout/AppLayout";

interface ProtectedRouteProps {
  children: ReactNode;
  withLayout?: boolean;
}

/**
 * مكون للمسارات المحمية التي تتطلب تسجيل دخول
 * withLayout: true (default) - يعرض AppLayout مع Sidebar
 * withLayout: false - لا يعرض Layout (مثل صفحة الخريطة)
 */
export const ProtectedRoute = ({ children, withLayout = true }: ProtectedRouteProps) => {
  return (
    <AuthWrapper>
      {withLayout ? <AppLayout>{children}</AppLayout> : children}
    </AuthWrapper>
  );
};
