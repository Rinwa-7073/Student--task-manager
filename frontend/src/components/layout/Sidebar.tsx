import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: ListChecks, end: false },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-default bg-surface md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-default px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[color:var(--accent-foreground)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
        </div>
        <span className="font-display text-sm font-bold text-primary">Task Manager</span>
      </div>

      <nav className="flex flex-col gap-0.5 p-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-secondary transition-colors',
                'hover:bg-surface-2 hover:text-primary',
                isActive && 'bg-surface-2 text-primary',
              )
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-default p-4">
        <p className="font-mono text-[11px] text-secondary">v1.0.0 — foundation build</p>
      </div>
    </aside>
  );
}
