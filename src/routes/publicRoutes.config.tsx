import { lazy } from "react";

// Lazy load public pages
const Index = lazy(() => import("@/pages/Index"));
const RoleSelection = lazy(() => import("@/pages/RoleSelection"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const About = lazy(() => import("@/pages/About"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Services = lazy(() => import("@/pages/Services"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Projects = lazy(() => import("@/pages/Projects"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const QuickRequest = lazy(() => import("@/pages/QuickRequest"));
const NotFound = lazy(() => import("@/pages/NotFound"));

/**
 * المسارات العامة (لا تتطلب تسجيل دخول)
 */
export const publicRoutes = [
  { path: "/", element: <Index /> },
  { path: "/role-selection", element: <RoleSelection /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/about", element: <About /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-of-service", element: <TermsOfService /> },
  { path: "/services", element: <Services /> },
  { path: "/gallery", element: <Gallery /> },
  { path: "/projects", element: <Projects /> },
  { path: "/blog", element: <Blog /> },
  { path: "/blog/:slug", element: <BlogPost /> },
  { path: "/quick-request/:propertyId", element: <QuickRequest /> },
  { path: "*", element: <NotFound /> },
];
