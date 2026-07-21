import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth, isApiRequestError } from '@/providers/AuthProvider';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already signed in — don't show the login form.
  if (user) return <Navigate to="/" replace />;

  const redirectTo = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(isApiRequestError(err) ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-[color:var(--accent-foreground)]">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="font-display text-xl font-extrabold text-primary">Welcome back</h1>
          <p className="text-sm text-secondary">Log in to your Student Task Manager</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-default bg-surface p-6" noValidate>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-[color:var(--color-danger-500)]/30 bg-[color:var(--color-danger-500)]/10 px-3 py-2 text-sm text-[color:var(--color-danger-500)]"
            >
              {error}
            </p>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className="text-center text-sm text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-accent underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}