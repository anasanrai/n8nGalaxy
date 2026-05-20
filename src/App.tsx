import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';
import { Spinner } from './components/ui/Spinner';

import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Learn from './pages/Learn';
import Pricing from './pages/Pricing';
import Community from './pages/Community';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import Dashboard from './pages/Dashboard';
import WorkflowDetail from './pages/WorkflowDetail';
import CourseDetail from './pages/CourseDetail';
import SubmitWorkflow from './pages/SubmitWorkflow';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AdminRoute from './components/admin/AdminRoute';

const AdminOverview    = lazy(() => import('./pages/admin/AdminOverview'));
const AdminWorkflows   = lazy(() => import('./pages/admin/AdminWorkflows'));
const AdminCourses     = lazy(() => import('./pages/admin/AdminCourses'));
const AdminUsers       = lazy(() => import('./pages/admin/AdminUsers'));
const AdminRevenue     = lazy(() => import('./pages/admin/AdminRevenue'));
const AdminBlog        = lazy(() => import('./pages/admin/AdminBlog'));
const AdminSubmissions = lazy(() => import('./pages/admin/AdminSubmissions'));

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  return children;
}

const AdminSpinner = () => (
  <div className="min-h-screen bg-[#0D0D14] flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

function App() {
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
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin/*" element={<SignInPage />} />
          <Route path="/signup/*" element={<SignUpPage />} />
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
          <Route
            path="/admin/blog"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Suspense fallback={<AdminSpinner />}>
                    <AdminBlog />
                  </Suspense>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/submissions"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Suspense fallback={<AdminSpinner />}>
                    <AdminSubmissions />
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
