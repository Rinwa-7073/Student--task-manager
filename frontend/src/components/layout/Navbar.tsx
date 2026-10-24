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
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-default bg-surface px-4 sm:px-6 shadow-2xs">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-lg font-bold tracking-tight text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="text-secondary hover:text-primary hover:bg-surface-2"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-accent" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Link
          to="/tasks/new"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[color:var(--accent-hover)] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          <span>New task</span>
        </Link>

        <div className="ml-1 flex items-center gap-2.5 border-l border-default pl-3">
          {user && (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-primary">
                {user.name}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="text-secondary hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}