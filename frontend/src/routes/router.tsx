import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageLoader } from '@/components/common/PageLoader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const TasksPage = lazy(() => import('@/pages/TasksPage').then((m) => ({ default: m.TasksPage })));
const TaskFormPage = lazy(() =>
  import('@/pages/TaskFormPage').then((m) => ({ default: m.TaskFormPage })),
);
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  // Public routes — no session required. LoginPage/RegisterPage redirect
  // away on their own if a session already exists (see their components).
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/register', element: withSuspense(<RegisterPage />) },

  // Everything else requires a valid session. ProtectedRoute redirects to
  // /login (preserving the intended destination) if there isn't one.
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: withSuspense(<DashboardPage />) },
          { path: 'tasks', element: withSuspense(<TasksPage />) },
          { path: 'tasks/new', element: withSuspense(<TaskFormPage />) },
          { path: 'tasks/:id/edit', element: withSuspense(<TaskFormPage />) },
          { path: '*', element: withSuspense(<NotFoundPage />) },
        ],
      },
    ],
  },
]);