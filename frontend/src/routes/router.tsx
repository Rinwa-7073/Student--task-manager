import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageLoader } from '@/components/common/PageLoader';

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const TasksPage = lazy(() => import('@/pages/TasksPage').then((m) => ({ default: m.TasksPage })));
const TaskFormPage = lazy(() =>
  import('@/pages/TaskFormPage').then((m) => ({ default: m.TaskFormPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'tasks', element: withSuspense(<TasksPage />) },
      { path: 'tasks/new', element: withSuspense(<TaskFormPage />) },
      { path: 'tasks/:id/edit', element: withSuspense(<TaskFormPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
