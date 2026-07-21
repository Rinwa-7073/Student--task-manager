import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth, isApiRequestError } from '@/providers/AuthProvider';

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name, email, password });
      navigate('/', { replace: true });
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
          <h1 className="font-display text-xl font-extrabold text-primary">Create your account</h1>
          <p className="text-sm text-secondary">Start tracking your placement prep</p>
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
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-secondary">At least 8 characters.</p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}