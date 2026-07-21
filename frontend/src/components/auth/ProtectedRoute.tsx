import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { PageLoader } from '@/components/common/PageLoader';

/**
 * Wraps every route that requires a signed-in user. While a stored token
 * is being verified (`isLoading`), it shows a loader instead of flashing
 * the login page. `state={{ from: location }}` lets the login page send
 * the person back to whatever page they originally tried to reach.
 */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}