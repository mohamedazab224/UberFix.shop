import { lazy } from "react";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const SLADashboard = lazy(() => import("@/pages/SLADashboard"));
const Requests = lazy(() => import("@/pages/Requests"));
const AllRequests = lazy(() => import("@/pages/AllRequests"));
const RequestDetails = lazy(() => import("@/pages/RequestDetails"));
const RequestLifecycleJourney = lazy(() => import("@/pages/RequestLifecycleJourney"));
const Vendors = lazy(() => import("@/pages/Vendors"));
const VendorDetails = lazy(() => import("@/pages/VendorDetails"));
const Reports = lazy(() => import("@/pages/Reports"));
const Properties = lazy(() => import("@/pages/Properties"));
const AddProperty = lazy(() => import("@/pages/properties/AddProperty"));
const EditProperty = lazy(() => import("@/pages/properties/EditProperty"));
const PropertyDetails = lazy(() => import("@/pages/properties/PropertyDetails"));
const Appointments = lazy(() => import("@/pages/Appointments"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const ServiceMap = lazy(() => import("@/pages/ServiceMap"));
const EmergencyService = lazy(() => import("@/pages/EmergencyService"));
const Documentation = lazy(() => import("@/pages/Documentation"));
const UserGuide = lazy(() => import("@/pages/UserGuide"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const MaintenanceProcedures = lazy(() => import("@/pages/MaintenanceProcedures"));
const Settings = lazy(() => import("@/pages/Settings"));
const Testing = lazy(() => import("@/pages/Testing"));
const ProductionReport = lazy(() => import("@/pages/ProductionReport"));
const ProductionMonitor = lazy(() => import("@/pages/ProductionMonitor"));
const ServiceRequest = lazy(() => import("@/pages/ServiceRequest"));
const ProjectDetails = lazy(() => import("@/pages/ProjectDetails"));
const ExpenseReports = lazy(() => import("@/pages/ExpenseReports"));
const MaintenanceReports = lazy(() => import("@/pages/MaintenanceReports"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const WhatsAppMessages = lazy(() => import("@/pages/WhatsAppMessages"));
const MessageLogs = lazy(() => import("@/pages/MessageLogs"));
const Inbox = lazy(() => import("@/pages/Inbox"));

/**
 * تكوين المسارات المحمية (تتطلب تسجيل دخول)
 * withLayout: false للصفحات التي لا تحتاج Sidebar (مثل الخريطة)
 */
export const protectedRoutes = [
  { path: "/dashboard", element: <Dashboard />, withLayout: true },
  { path: "/sla-dashboard", element: <SLADashboard />, withLayout: true },
  { path: "/requests", element: <Requests />, withLayout: true },
  { path: "/all-requests", element: <AllRequests />, withLayout: true },
  { path: "/requests/:id", element: <RequestDetails />, withLayout: true },
  { path: "/request-lifecycle", element: <RequestLifecycleJourney />, withLayout: true },
  { path: "/service-request", element: <ServiceRequest />, withLayout: true },
  { path: "/vendors", element: <Vendors />, withLayout: true },
  { path: "/vendors/:id", element: <VendorDetails />, withLayout: true },
  { path: "/reports", element: <Reports />, withLayout: true },
  { path: "/reports/expenses", element: <ExpenseReports />, withLayout: true },
  { path: "/reports/maintenance", element: <MaintenanceReports />, withLayout: true },
  { path: "/properties", element: <Properties />, withLayout: true },
  { path: "/properties/add", element: <AddProperty />, withLayout: true },
  { path: "/properties/:id", element: <PropertyDetails />, withLayout: true },
  { path: "/properties/edit/:id", element: <EditProperty />, withLayout: true },
  { path: "/appointments", element: <Appointments />, withLayout: true },
  { path: "/invoices", element: <Invoices />, withLayout: true },
  { path: "/documentation", element: <Documentation />, withLayout: true },
  { path: "/user-guide", element: <UserGuide />, withLayout: true },
  { path: "/faq", element: <FAQ />, withLayout: true },
  { path: "/maintenance-procedures", element: <MaintenanceProcedures />, withLayout: true },
  { path: "/settings", element: <Settings />, withLayout: true },
  { path: "/testing", element: <Testing />, withLayout: true },
  { path: "/production-report", element: <ProductionReport />, withLayout: true },
  { path: "/production-monitor", element: <ProductionMonitor />, withLayout: true },
  { path: "/projects/:id", element: <ProjectDetails />, withLayout: true },
  { path: "/admin/users", element: <UserManagement />, withLayout: true },
  { path: "/whatsapp", element: <WhatsAppMessages />, withLayout: true },
  { path: "/message-logs", element: <MessageLogs />, withLayout: true },
  
  // صفحات بدون Layout
  { path: "/service-map", element: <ServiceMap />, withLayout: false },
  { path: "/emergency-service/:technicianId", element: <EmergencyService />, withLayout: false },
  { path: "/inbox", element: <Inbox />, withLayout: false },
];
