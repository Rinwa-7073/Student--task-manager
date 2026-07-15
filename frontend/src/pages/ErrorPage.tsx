import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorPageProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Shown by the top-level error boundary (see components/common/ErrorBoundary.tsx)
 * whenever a render error escapes a route. Explains what happened and offers
 * a concrete way forward instead of a blank screen.
 */
export function ErrorPage({ message, onRetry }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-danger-500)]/10">
        <AlertTriangle
          className="h-7 w-7 text-[color:var(--color-danger-500)]"
          aria-hidden="true"
        />
      </div>
      <h1 className="font-display text-2xl font-extrabold text-primary">Something went wrong</h1>
      <p className="max-w-sm text-sm text-secondary">
        {message ??
          'An unexpected error interrupted this page. You can try again, or reload the app.'}
      </p>
      <div className="flex gap-2">
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button variant="outline" onClick={() => window.location.assign('/')}>
          Reload app
        </Button>
      </div>
    </div>
  );
}
