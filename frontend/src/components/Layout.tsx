import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useLanguage } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AuraLogo } from './AuraLogo';

const CHROME_HIDDEN_ROUTES = ['/auth', '/onboarding', '/join', '/'];

const NAV_ITEMS = [
  { to: '/feed',       icon: 'explore', labelKey: 'nav.feed'    },
  { to: '/map',        icon: 'map',     labelKey: 'nav.map'     },
  { to: '/beacon/new', icon: 'flare',   labelKey: 'nav.beacon'  },
  { to: '/profile',    icon: 'person',  labelKey: 'nav.profile' },
] as const;

export function SidebarNav() {
  const { t } = useLanguage();

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
        <AuraLogo size={30} />
      </div>

      {/* Nav links */}
      <div className="flex flex-col gap-0.5 flex-1 px-3">
        {NAV_ITEMS.map(({ to, icon, labelKey }) => (
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
                <span>{t(labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Language switcher */}
      <div className="px-4 mb-3 flex justify-start">
        <LanguageSwitcher />
      </div>

      {/* Light a Beacon CTA */}
      <NavLink
        to="/beacon/new"
        className="mx-4 mt-1 mb-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors"
        style={{ background: '#1C1C1A', color: '#fff' }}
      >
        <span className="material-symbols-outlined text-lg">add</span>
        {t('nav.lightBeacon')}
      </NavLink>
    </nav>
  );
}

export function MobileNav() {
  const { t } = useLanguage();

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
        {NAV_ITEMS.map(({ to, icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center gap-0.5 py-1 px-3 text-xs relative"
          >
            {({ isActive }) => (
              <>
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
                  {t(labelKey)}
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
