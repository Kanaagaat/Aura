import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const NAV = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/map', icon: 'map', label: 'Map' },
  { to: '/beacon/new', icon: 'flare', label: 'Beacon' },
  { to: '/profile', icon: 'person', label: 'Profile' },
];

export function SidebarNav() {
  return (
    <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 py-8 bg-surface/80 backdrop-blur-md border-r border-border z-50">
      <div className="px-8 mb-12">
        <h1 className="font-serif text-3xl text-primary-dark tracking-tight">Aura</h1>
        <p className="text-sm text-text-muted mt-1">Urban Wellness</p>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-4 px-6 py-3 transition-colors',
                isActive
                  ? 'text-primary-dark font-semibold border-r-4 border-primary bg-primary/10'
                  : 'text-text-muted hover:bg-background'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx('material-symbols-outlined', isActive && 'filled')}
                >
                  {icon}
                </span>
                <span className="text-sm">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      <NavLink
        to="/beacon/new"
        className="mx-6 mt-auto mb-4 flex items-center justify-center gap-2 rounded-full bg-text-main text-white py-3 text-sm font-medium shadow-[var(--shadow-soft)] hover:opacity-90"
      >
        <span className="material-symbols-outlined text-lg">add</span>
        Light a Beacon
      </NavLink>
    </nav>
  );
}

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-border px-4 py-2 safe-area-pb">
      <div className="flex justify-around">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 py-2 px-3 text-xs',
                isActive ? 'text-primary-dark font-medium' : 'text-text-muted'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx('material-symbols-outlined text-2xl', isActive && 'filled')}
                >
                  {icon}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="md:ml-64 pb-20 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}
