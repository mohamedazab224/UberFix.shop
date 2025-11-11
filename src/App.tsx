import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useProductionOptimizations } from "@/hooks/useProductionOptimizations";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { protectedRoutes } from "@/routes/routes.config";
import { publicRoutes } from "@/routes/publicRoutes.config";
import { Loader2 } from "lucide-react";
import { registerServiceWorker } from "@/lib/registerServiceWorker";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'offlineFirst',
    },
  },
});

// مكون Loading مركزي لـ Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => {
  useProductionOptimizations();

  useEffect(() => {
    registerServiceWorker();
  }, []);

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
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* المسارات العامة (Public Routes) */}
                  {publicRoutes.map(({ path, element }) => (
                    <Route key={path} path={path} element={element} />
                  ))}

                  {/* المسارات المحمية (Protected Routes) */}
                  {protectedRoutes.map(({ path, element, withLayout }) => (
                    <Route
                      key={path}
                      path={path}
                      element={
                        <ProtectedRoute withLayout={withLayout}>
                          {element}
                        </ProtectedRoute>
                      }
                    />
                  ))}
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
