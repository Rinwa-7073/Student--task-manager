import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'Tasks',
  '/tasks/new': 'New task',
};

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const title = PAGE_TITLES[pathname] ?? 'Task detail';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-default bg-surface px-4 sm:px-6">
      <h1 className="font-display text-base font-bold text-primary">{title}</h1>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Link
          to="/tasks/new"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-[color:var(--accent-foreground)] transition hover:brightness-105"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New task
        </Link>

        <div className="ml-1 flex items-center gap-2 border-l border-default pl-3">
          {user && (
            <span className="hidden text-sm font-medium text-secondary sm:inline">
              {user.name.split(' ')[0]}
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}