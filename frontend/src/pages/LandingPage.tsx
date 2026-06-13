import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Features } from '../components/landing/Features';
import { WaitlistSection } from '../components/landing/WaitlistSection';
import { PhoneDemo } from '../components/landing/PhoneDemo';
import { AuriMascot } from '../components/AuriMascot';
import { AuraLogo } from '../components/AuraLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useLanguage } from '../i18n';

const VIBE_PILLS = ['#SoftLight', '#MorningYoga', '#MatchaRun', '#QuietCorner', '#EarlyBird'];
const PROOF_AVATARS = ['K', 'A', 'D', 'M'];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function LandingPage() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const heroTitle = t('landing.hero.title').split('\n');

  return (
    <div
      className="min-h-screen"
      style={{ background: '#FAFAF7', fontFamily: '"DM Sans", system-ui, sans-serif', color: '#1C1C1A' }}
    >
      {/* ── Section 1: Sticky Nav ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-[border-color] duration-300"
        style={{
          background: 'rgba(250,250,247,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid #EEECE8' : '1px solid transparent',
        }}
      >
        <div className="mx-auto flex items-center justify-between px-5 lg:px-8" style={{ maxWidth: 1280, height: 64 }}>
          <AuraLogo size={30} />
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => scrollTo('how-it-works')}
              className="hidden sm:block text-sm transition-colors"
              style={{ background: 'none', border: 'none', color: '#8A8880', cursor: 'pointer', padding: '8px 4px' }}
            >
              {t('nav.howItWorks')}
            </button>
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => scrollTo('waitlist')}
              className="text-sm font-medium transition-colors"
              style={{
                background: '#7A9E7E', color: '#fff', border: 'none',
                borderRadius: 100, height: 40, padding: '0 20px', cursor: 'pointer',
              }}
            >
              {t('nav.getEarlyAccess')}
            </button>
          </div>
        </div>
      </header>

      {/* ── Section 2: Hero ── */}
      <section
        className="flex items-center overflow-hidden"
        style={{ paddingTop: 64, background: '#FAFAF7' }}
      >
        <div className="mx-auto w-full px-5 lg:px-8 py-20 lg:py-24" style={{ maxWidth: 1280 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Eyebrow */}
              <p style={{
                fontSize: 11, letterSpacing: '0.12em', color: '#7A9E7E',
                textTransform: 'uppercase', fontWeight: 500, marginBottom: 24,
              }}>
                {t('landing.eyebrow')}
              </p>

              {/* Headline */}
              <h1 style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: 'clamp(40px, 5vw, 64px)',
                fontWeight: 300, lineHeight: 1.1, color: '#1C1C1A', marginBottom: 24,
              }}>
                {heroTitle[0]}<br />
                {heroTitle[1]}
              </h1>

              {/* Subline */}
              <p style={{ fontSize: 16, color: '#8A8880', lineHeight: 1.65, marginBottom: 40, maxWidth: 420 }}>
                {t('landing.hero.subtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: 40 }}>
                <button
                  type="button"
                  onClick={() => scrollTo('waitlist')}
                  style={{
                    background: '#1C1C1A', color: '#fff', border: 'none',
                    borderRadius: 100, height: 52, padding: '0 32px',
                    fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                  }}
                >
                  {t('landing.hero.cta.primary')}
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('how-it-works')}
                  style={{
                    background: 'transparent', color: '#7A9E7E', border: 'none',
                    borderRadius: 100, height: 52, padding: '0 24px',
                    fontSize: 15, cursor: 'pointer',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                  }}
                >
                  {t('landing.hero.cta.secondary')}
                </button>
              </div>

              {/* Floating vibe pills */}
              <div className="flex flex-wrap gap-2" style={{ marginBottom: 28 }}>
                {VIBE_PILLS.map((pill, i) => (
                  <motion.span
                    key={pill}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 6 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.9 }}
                    style={{
                      background: '#EFF5F0', color: '#7A9E7E', borderRadius: 100,
                      padding: '6px 14px', fontSize: 12, fontWeight: 500, display: 'inline-block',
                    }}
                  >
                    {pill}
                  </motion.span>
                ))}
              </div>

              {/* Auri mascot */}
              <AuriMascot state="idle" size={64} animate />
            </motion.div>

            {/* Right: phone mockup */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ maxWidth: 300, width: '100%' }}
              >
                <PhoneDemo />
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Section 3: How It Works ── */}
      <HowItWorks />

      {/* ── Section 4: Feature Highlights ── */}
      <Features />

      {/* ── Section 5: Social Proof Strip ── */}
      <section
        className="hidden sm:block"
        style={{ background: '#FAFAF7', borderTop: '1px solid #EEECE8', borderBottom: '1px solid #EEECE8', padding: '20px 0' }}
      >
        <div
          className="mx-auto flex items-center justify-between gap-4 flex-wrap px-5 lg:px-8"
          style={{ maxWidth: 1280 }}
        >
          <span style={{ fontSize: 13, color: '#8A8880' }}>{t('landing.proof.city')}</span>

          <div className="flex items-center gap-3">
            <div className="flex">
              {PROOF_AVATARS.map((initial, i) => (
                <div
                  key={initial}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i % 2 === 0 ? '#EFF5F0' : '#F5F1EA',
                    border: '2px solid #FAFAF7',
                    marginLeft: i > 0 ? -8 : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 600, color: '#8A8880',
                    zIndex: PROOF_AVATARS.length - i,
                    position: 'relative',
                  }}
                >
                  {initial}
                </div>
              ))}
            </div>
            <span style={{ fontSize: 13, color: '#8A8880' }}>{t('landing.proof.stats')}</span>
          </div>

          <div className="flex items-center gap-2">
            <span style={{ color: '#D4A96A', fontSize: 14 }}>★★★★★</span>
            <span style={{ fontSize: 13, color: '#8A8880', fontStyle: 'italic' }}>{t('landing.proof.quote')}</span>
          </div>
        </div>
      </section>

      {/* mobile strip — marquee */}
      <section
        className="sm:hidden overflow-hidden"
        style={{ background: '#FAFAF7', borderTop: '1px solid #EEECE8', borderBottom: '1px solid #EEECE8', padding: '16px 0' }}
      >
        <div className="marquee-track">
          {[...Array(2)].flatMap((_, ri) => [
            <span key={`almaty-${ri}`} style={{ fontSize: 13, color: '#8A8880', flexShrink: 0 }}>{t('landing.proof.city')}</span>,
            <span key={`dots-${ri}`} style={{ fontSize: 13, color: '#8A8880', flexShrink: 0 }}>{t('landing.proof.stats')}</span>,
            <span key={`stars-${ri}`} style={{ fontSize: 13, color: '#8A8880', fontStyle: 'italic', flexShrink: 0 }}>★★★★★ {t('landing.proof.quote')}</span>,
          ])}
        </div>
      </section>

      {/* ── Section 6: Waitlist (dark) ── */}
      <WaitlistSection />
    </div>
  );
}
