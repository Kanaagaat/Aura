import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../i18n';

const PILL: React.CSSProperties = {
  background: '#fff',
  borderRadius: 100,
  padding: '4px 10px',
  fontSize: 11,
  fontWeight: 500,
  color: '#1C1C1A',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  whiteSpace: 'nowrap',
  fontFamily: '"DM Sans", system-ui, sans-serif',
  position: 'absolute',
};

function ScreenMap({ onNext }: { onNext: () => void }) {
  const { t } = useLanguage();
  return (
    <div style={{ flex: 1, background: '#EDE8DE', position: 'relative', overflow: 'hidden' }}>
      {/* Street grid */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 280 490"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect x="16" y="16" width="62" height="48" fill="#E0D9CE" rx="4" />
        <rect x="98" y="8"  width="72" height="52" fill="#DDD7CB" rx="4" />
        <rect x="186" y="22" width="58" height="62" fill="#E5DED3" rx="4" />
        <rect x="16" y="108" width="52" height="58" fill="#E0D9CE" rx="4" />
        <rect x="148" y="102" width="66" height="46" fill="#DDD7CB" rx="4" />
        <rect x="224" y="112" width="42" height="52" fill="#E2DBD0" rx="4" />
        <rect x="16" y="210" width="78" height="56" fill="#E5DED3" rx="4" />
        <rect x="118" y="204" width="56" height="72" fill="#DDD7CB" rx="4" />
        <rect x="196" y="214" width="62" height="54" fill="#E0D9CE" rx="4" />
        <line x1="0"   y1="90"  x2="280" y2="90"  stroke="#FAF7F2" strokeWidth="9" />
        <line x1="0"   y1="185" x2="280" y2="185" stroke="#FAF7F2" strokeWidth="7" />
        <line x1="0"   y1="296" x2="280" y2="296" stroke="#FAF7F2" strokeWidth="9" />
        <line x1="82"  y1="0"   x2="82"  y2="490" stroke="#FAF7F2" strokeWidth="7" />
        <line x1="178" y1="0"   x2="178" y2="490" stroke="#FAF7F2" strokeWidth="9" />
        <line x1="236" y1="0"   x2="236" y2="490" stroke="#FAF7F2" strokeWidth="5" />
      </svg>

      {/* ☕ Mono */}
      <div style={{ ...PILL, top: '17%', left: '8%' }}>☕ Mono</div>

      {/* ✨ Spa Ritual */}
      <div style={{ ...PILL, top: '19%', left: '54%' }}>✨ Spa Ritual</div>

      {/* 🧘 Flow Studio — beacon pulsing */}
      <div style={{ position: 'absolute', top: '42%', left: '40%' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{
            position: 'absolute', inset: -10, borderRadius: '50%',
            background: 'rgba(212,169,106,0.28)',
            animation: 'phoneDemoPulse 2s ease-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: -10, borderRadius: '50%',
            background: 'rgba(212,169,106,0.14)',
            animation: 'phoneDemoPulse 2s ease-out infinite 0.6s',
          }} />
          <div style={{
            background: '#D4A96A', borderRadius: 100, padding: '4px 10px',
            fontSize: 11, fontWeight: 600, color: '#1C1C1A',
            boxShadow: '0 2px 12px rgba(212,169,106,0.45)',
            whiteSpace: 'nowrap', position: 'relative',
            fontFamily: '"DM Sans", system-ui, sans-serif',
          }}>
            🧘 Flow Studio
          </div>
        </div>
      </div>

      {/* Bottom sheet peek */}
      <button
        type="button"
        onClick={onNext}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: '#fff', borderRadius: '16px 16px 0 0',
          padding: '10px 16px 18px', border: 'none', cursor: 'pointer',
          textAlign: 'left', boxShadow: '0 -8px 30px rgba(0,0,0,0.10)',
        }}
      >
        <div style={{ width: 32, height: 3, background: '#E0DDD8', borderRadius: 2, margin: '0 auto 10px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1A', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
              Flow Studio
            </div>
            <div style={{ fontSize: 11, color: '#8A8880', marginTop: 2, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
              🧘 Yoga · 2km
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#7A9E7E', fontWeight: 500, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
            {t('demo.tapSpot')}
          </div>
        </div>
      </button>
    </div>
  );
}

function ScreenVibeCard({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { t } = useLanguage();
  return (
    <div style={{ flex: 1, background: '#fff', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Venue photo area */}
      <div style={{
        height: 110, background: '#F5F1EA', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 44, position: 'relative',
      }}>
        🧘
        <button
          type="button"
          onClick={onBack}
          style={{
            position: 'absolute', top: 10, left: 12,
            background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
            width: 28, height: 28, cursor: 'pointer', fontSize: 12, color: '#1C1C1A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ←
        </button>
      </div>

      <div style={{ padding: '12px 14px', flex: 1 }}>
        <div style={{ fontSize: 10, color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
          🧘 {t('demo.yogaStudio')}
        </div>
        <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 18, fontWeight: 400, color: '#1C1C1A', marginBottom: 2 }}>
          Flow Studio
        </div>
        <div style={{ fontSize: 11, color: '#8A8880', marginBottom: 10, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
          07:00 – 21:00
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
          {['#MorningVibes', '#SoftLight', '#NoLaptops'].map(tag => (
            <span key={tag} style={{
              background: '#F5F1EA', color: '#8A8880', borderRadius: 100,
              padding: '2px 8px', fontSize: 10, fontFamily: '"DM Sans", system-ui, sans-serif',
            }}>
              {tag}
            </span>
          ))}
        </div>

        <div style={{
          background: '#FDF6EC', borderRadius: 10, padding: '8px 10px', marginBottom: 12,
          fontSize: 11, color: '#1C1C1A', fontFamily: '"DM Sans", system-ui, sans-serif',
        }}>
          🔆 {t('demo.peopleGoing', { n: '2' })}
        </div>

        <button
          type="button"
          onClick={onNext}
          style={{
            width: '100%', background: '#1C1C1A', color: '#fff',
            borderRadius: 100, padding: '10px 0', fontSize: 12, fontWeight: 600,
            border: 'none', cursor: 'pointer', marginBottom: 6,
            fontFamily: '"DM Sans", system-ui, sans-serif',
          }}
        >
          {t('map.venue.lightBeacon')}
        </button>
        <div style={{ textAlign: 'center', fontSize: 10, color: '#8A8880', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
          {t('demo.lightBeaconLink')}
        </div>
      </div>
    </div>
  );
}

function ScreenBeaconCreated({ onReset }: { onReset: () => void }) {
  const { t } = useLanguage();
  return (
    <div style={{ flex: 1, background: '#FAFAF7', padding: '14px', overflow: 'auto' }}>
      <div style={{
        background: '#7A9E7E', color: '#fff', borderRadius: 100,
        padding: '8px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600,
        marginBottom: 16, fontFamily: '"DM Sans", system-ui, sans-serif',
      }}>
        {t('demo.beaconLit')}
      </div>

      <div style={{
        background: '#fff', borderRadius: 16, padding: '14px 16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 12,
      }}>
        <div style={{ fontSize: 11, color: '#8A8880', marginBottom: 6, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
          🧘 Yoga · Flow Studio
        </div>
        <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 14, color: '#1C1C1A', marginBottom: 6, lineHeight: 1.4 }}>
          "Morning flow, matcha after"
        </div>
        <div style={{ fontSize: 11, color: '#8A8880', marginBottom: 6, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
          {t('demo.today')} · 10:00
        </div>
        <div style={{ fontSize: 11, color: '#7A9E7E', fontWeight: 500, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
          👤 You + 2 joined
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button type="button" style={{
          flex: 1, background: 'transparent', border: '1px solid #EEECE8',
          borderRadius: 100, padding: '8px 0', fontSize: 10, color: '#1C1C1A',
          cursor: 'pointer', fontFamily: '"DM Sans", system-ui, sans-serif',
        }}>
          {t('demo.shareStories')}
        </button>
        <button type="button" style={{
          flex: 1, background: '#7A9E7E', color: '#fff', border: 'none',
          borderRadius: 100, padding: '8px 0', fontSize: 10, fontWeight: 600,
          cursor: 'pointer', fontFamily: '"DM Sans", system-ui, sans-serif',
        }}>
          {t('demo.openTelegram')}
        </button>
      </div>

      <button
        type="button"
        onClick={onReset}
        style={{
          display: 'block', margin: '0 auto', background: 'transparent',
          border: 'none', color: '#8A8880', fontSize: 11, cursor: 'pointer',
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}
      >
        {t('demo.startOver')}
      </button>
    </div>
  );
}

export function PhoneDemo() {
  const [screen, setScreen] = useState(0);

  return (
    <div style={{
      border: '7px solid #1C1C1A',
      borderRadius: 40,
      boxShadow: '0 24px 64px rgba(28,28,26,0.22), 0 8px 20px rgba(28,28,26,0.08)',
      overflow: 'hidden',
      width: '100%',
      maxWidth: 280,
      margin: '0 auto',
      background: '#fff',
      userSelect: 'none',
    }}>
      {/* Status bar with island notch */}
      <div style={{
        height: 36, background: '#1C1C1A',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 0,
      }}>
        <div style={{
          width: 76, height: 20, background: '#0A0A0A',
          borderRadius: '0 0 16px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#222' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid #333' }} />
        </div>
      </div>

      {/* Screen content */}
      <div style={{
        height: 490, overflow: 'hidden',
        position: 'relative', display: 'flex', flexDirection: 'column',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {screen === 0 && <ScreenMap onNext={() => setScreen(1)} />}
            {screen === 1 && <ScreenVibeCard onNext={() => setScreen(2)} onBack={() => setScreen(0)} />}
            {screen === 2 && <ScreenBeaconCreated onReset={() => setScreen(0)} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Home indicator */}
      <div style={{
        height: 24, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 56, height: 4, background: '#1C1C1A', borderRadius: 2, opacity: 0.15 }} />
      </div>
    </div>
  );
}
