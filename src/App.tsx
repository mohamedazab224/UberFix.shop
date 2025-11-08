// src/App.tsx - النسخة المُصححة
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { useProductionOptimizations } from "@/hooks/useProductionOptimizations";
import Index from "./pages/Index";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import AllRequests from "./pages/AllRequests";
import RequestDetails from "./pages/RequestDetails";
import Vendors from "./pages/Vendors";
import Reports from "./pages/Reports";
import Properties from "./pages/Properties";
import AddProperty from "./pages/properties/AddProperty";
import Appointments from "./pages/Appointments";
import Invoices from "./pages/Invoices";
import ServiceMap from "./pages/ServiceMap";
import EmergencyService from "./pages/EmergencyService";
import Documentation from "./pages/Documentation";
import UserGuide from "./pages/UserGuide";
import FAQ from "./pages/FAQ";
import MaintenanceProcedures from "./pages/MaintenanceProcedures";
import Settings from "./pages/Settings";
import Testing from "./pages/Testing";
import ProductionReport from "./pages/ProductionReport";
import ProductionMonitor from "./pages/ProductionMonitor";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceRequest from "./pages/ServiceRequest";
import Gallery from "./pages/Gallery";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import QuickRequest from "./pages/QuickRequest";
import ExpenseReports from "./pages/ExpenseReports";
import MaintenanceReports from "./pages/MaintenanceReports";
import UserManagement from "./pages/admin/UserManagement";
import EditProperty from "./pages/properties/EditProperty";
import LifecycleTesting from "./pages/LifecycleTesting";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const App = () => {
  useProductionOptimizations();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* الصفحات العامة بدون Layout */}
                <Route path="/" element={<Index />} />
                <Route path="/role-selection" element={<RoleSelection />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/quick-request/:propertyId" element={<QuickRequest />} />
                <Route path="*" element={<NotFound />} />

                {/* الصفحات المحمية بـ Layout واحد فقط */}
                <Route path="/dashboard" element={
                  <AuthWrapper>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/requests" element={
                  <AuthWrapper>
                    <AppLayout>
                      <Requests />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/all-requests" element={
                  <AuthWrapper>
                    <AppLayout>
                      <AllRequests />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/service-request" element={
                  <AuthWrapper>
                    <AppLayout>
                      <ServiceRequest />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/requests/:id" element={
                  <AuthWrapper>
                    <AppLayout>
                      <RequestDetails />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/vendors" element={
                  <AuthWrapper>
                    <AppLayout>
                      <Vendors />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/reports" element={
                  <AuthWrapper>
                    <AppLayout>
                      <Reports />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/properties" element={
                  <AuthWrapper>
                    <AppLayout>
                      <Properties />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/properties/add" element={
                  <AuthWrapper>
                    <AppLayout>
                      <AddProperty />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/properties/edit/:id" element={
                  <AuthWrapper>
                    <AppLayout>
                      <EditProperty />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/admin/users" element={
                  <AuthWrapper>
                    <AppLayout>
                      <UserManagement />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/appointments" element={
                  <AuthWrapper>
                    <AppLayout>
                      <Appointments />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/invoices" element={
                  <AuthWrapper>
                    <AppLayout>
                      <Invoices />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/service-map" element={
                  <AuthWrapper>
                    <ServiceMap />
                  </AuthWrapper>
                } />
                
                <Route path="/emergency-service/:technicianId" element={
                  <AuthWrapper>
                    <EmergencyService />
                  </AuthWrapper>
                } />
                
                <Route path="/documentation" element={
                  <AuthWrapper>
                    <AppLayout>
                      <Documentation />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/user-guide" element={
                  <AuthWrapper>
                    <AppLayout>
                      <UserGuide />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/faq" element={
                  <AuthWrapper>
                    <AppLayout>
                      <FAQ />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/maintenance-procedures" element={
                  <AuthWrapper>
                    <AppLayout>
                      <MaintenanceProcedures />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/settings" element={
                  <AuthWrapper>
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/testing" element={
                  <AuthWrapper>
                    <AppLayout>
                      <Testing />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/production-report" element={
                  <AuthWrapper>
                    <AppLayout>
                      <ProductionReport />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/production-monitor" element={
                  <AuthWrapper>
                    <AppLayout>
                      <ProductionMonitor />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/projects/:id" element={
                  <AuthWrapper>
                    <AppLayout>
                      <ProjectDetails />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/reports/expenses" element={
                  <AuthWrapper>
                    <AppLayout>
                      <ExpenseReports />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/reports/maintenance" element={
                  <AuthWrapper>
                    <AppLayout>
                      <MaintenanceReports />
                    </AppLayout>
                  </AuthWrapper>
                } />
                
                <Route path="/lifecycle-testing" element={
                  <AuthWrapper>
                    <AppLayout>
                      <LifecycleTesting />
                    </AppLayout>
                  </AuthWrapper>
                } />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
