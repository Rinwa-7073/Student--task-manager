import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { router } from '@/routes/router';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <ToastProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </ToastProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;