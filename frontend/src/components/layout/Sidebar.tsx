import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: ListChecks, end: false },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-default bg-surface md:flex shadow-2xs">
      <div className="flex h-16 items-center gap-3 border-b border-default px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shadow-2xs">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-base font-bold tracking-tight text-primary">Task Manager</span>
          <span className="text-[11px] font-medium text-secondary">Student Workspace</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-3.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-surface-2 text-primary font-semibold shadow-2xs border-l-2 border-accent'
                  : 'text-secondary hover:bg-surface-2/70 hover:text-primary',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-accent' : 'text-secondary group-hover:text-primary',
                  )}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-default p-4">
        <div className="rounded-lg bg-surface-2/60 p-3 border border-default/80">
          <p className="text-xs font-semibold text-primary">Student Edition</p>
          <p className="mt-0.5 text-[11px] text-secondary">Track tasks, goals & study focus</p>
        </div>
      </div>
    </aside>
  );
}
