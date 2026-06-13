import { useLanguage } from '../i18n';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const isDark = variant === 'dark';

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 100,
    overflow: 'hidden',
    border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #EEECE8',
    background: isDark ? 'rgba(255,255,255,0.08)' : '#F0EDE8',
    height: 36,
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? (isDark ? 'rgba(255,255,255,0.18)' : '#1C1C1A') : 'transparent',
    color: active ? '#fff' : (isDark ? 'rgba(255,255,255,0.55)' : '#8A8880'),
    border: 'none',
    borderRadius: 100,
    height: 32,
    minWidth: 40,
    padding: '0 12px',
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    cursor: active ? 'default' : 'pointer',
    transition: 'background 0.18s, color 0.18s',
    margin: '0 2px',
    letterSpacing: '0.04em',
  });

  return (
    <div style={baseStyle} role="group" aria-label="Change language">
      <button
        type="button"
        style={btnStyle(language === 'en')}
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        aria-label="English"
      >
        EN
      </button>
      <button
        type="button"
        style={btnStyle(language === 'ru')}
        onClick={() => setLanguage('ru')}
        aria-pressed={language === 'ru'}
        aria-label="Русский"
      >
        RU
      </button>
    </div>
  );
}
