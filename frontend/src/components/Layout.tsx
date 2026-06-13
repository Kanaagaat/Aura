import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const CHROME_HIDDEN_ROUTES = ['/auth', '/onboarding', '/join', '/'];

const NAV = [
  { to: '/feed',       icon: 'explore', label: 'Feed'    },
  { to: '/map',        icon: 'map',     label: 'Map'     },
  { to: '/beacon/new', icon: 'flare',   label: 'Beacon'  },
  { to: '/profile',    icon: 'person',  label: 'Profile' },
];

export function SidebarNav() {
  return (
    <nav
      className="hidden lg:flex flex-col fixed left-0 top-0 h-screen py-8 z-50"
      style={{
        width: 220,
        background: 'rgba(245,241,234,0.92)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid #EEECE8',
      }}
    >
      {/* Wordmark */}
      <div className="px-7 mb-10">
        <h1
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 28, fontWeight: 400, color: '#1C1C1A', letterSpacing: '-0.3px',
          }}
        >
          aura
        </h1>
      </div>

      {/* Nav links */}
      <div className="flex flex-col gap-0.5 flex-1 px-3">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm',
                isActive
                  ? 'bg-[#EFF5F0] text-[#5a7a5c] font-semibold'
                  : 'text-[#8A8880] hover:bg-[#FAFAF7] hover:text-[#1C1C1A]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={clsx('material-symbols-outlined text-xl', isActive && 'filled')}>
                  {icon}
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Light a Beacon CTA */}
      <NavLink
        to="/beacon/new"
        className="mx-4 mt-auto mb-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors"
        style={{ background: '#1C1C1A', color: '#fff' }}
      >
        <span className="material-symbols-outlined text-lg">add</span>
        Light a Beacon
      </NavLink>
    </nav>
  );
}

export function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-2 py-2"
      style={{
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid #EEECE8',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex justify-around">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center gap-0.5 py-1 px-3 text-xs relative"
          >
            {({ isActive }) => (
              <>
                {/* Sage underline pill for active */}
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                    style={{ width: 20, height: 2.5, background: '#7A9E7E', borderRadius: 100, marginTop: 0 }}
                  />
                )}
                <span
                  className={clsx(
                    'material-symbols-outlined text-2xl transition-colors',
                    isActive ? 'text-[#5a7a5c]' : 'text-[#8A8880]'
                  )}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" : undefined }}
                >
                  {icon}
                </span>
                <span className={clsx('transition-colors', isActive ? 'text-[#5a7a5c] font-medium' : 'text-[#8A8880]')}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideChrome = CHROME_HIDDEN_ROUTES.some(
    (route) => location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  if (hideChrome) {
    return <div className="min-h-screen" style={{ background: '#FAFAF7' }}>{children}</div>;
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAFAF7' }}>
      <SidebarNav />
      <main className="lg:ml-[220px] pb-20 lg:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}
