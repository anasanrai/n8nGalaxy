import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { Spinner } from './components/ui/Spinner';

import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Learn from './pages/Learn';
import Pricing from './pages/Pricing';
import Community from './pages/Community';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import WorkflowDetail from './pages/WorkflowDetail';
import CourseDetail from './pages/CourseDetail';
import SubmitWorkflow from './pages/SubmitWorkflow';
import AdminRoute from './components/admin/AdminRoute';

const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminWorkflows = lazy(() => import('./pages/admin/AdminWorkflows'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'));

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

const AdminSpinner = () => (
  <div className="min-h-screen bg-[#0D0D14] flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/workflow/:slug" element={<WorkflowDetail />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/course/:slug" element={<CourseDetail />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/community" element={<Community />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmitWorkflow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Suspense fallback={<AdminSpinner />}>
                    <AdminOverview />
                  </Suspense>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/workflows"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Suspense fallback={<AdminSpinner />}>
                    <AdminWorkflows />
                  </Suspense>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Suspense fallback={<AdminSpinner />}>
                    <AdminCourses />
                  </Suspense>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Suspense fallback={<AdminSpinner />}>
                    <AdminUsers />
                  </Suspense>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/revenue"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Suspense fallback={<AdminSpinner />}>
                    <AdminRevenue />
                  </Suspense>
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
