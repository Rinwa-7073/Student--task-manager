import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
        <Compass className="h-7 w-7 text-secondary" aria-hidden="true" />
      </div>
      <p className="font-mono text-sm text-secondary">404</p>
      <h1 className="font-display text-2xl font-extrabold text-primary">This page doesn't exist</h1>
      <p className="max-w-sm text-sm text-secondary">
        The page you're looking for was moved, renamed, or never existed. Head back to your
        dashboard to keep working.
      </p>
      <Link to="/" className={buttonVariants({ variant: 'primary' })}>
        Back to dashboard
      </Link>
    </div>
  );
}
