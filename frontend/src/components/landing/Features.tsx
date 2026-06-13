import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n';
import type { TranslationKey } from '../../i18n/translations';

const FEATURES: { icon: string; headlineKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { icon: '🗺️', headlineKey: 'features.1.headline', bodyKey: 'features.1.body' },
  { icon: '🔆', headlineKey: 'features.2.headline', bodyKey: 'features.2.body' },
  { icon: '🧘', headlineKey: 'features.3.headline', bodyKey: 'features.3.body' },
  { icon: '📲', headlineKey: 'features.4.headline', bodyKey: 'features.4.body' },
];

export function Features() {
  const { t } = useLanguage();

  return (
    <section style={{ background: '#F5F1EA', padding: '80px 0' }}>
      <div className="mx-auto px-5 lg:px-8" style={{ maxWidth: 1280 }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 36, fontWeight: 400, color: '#1C1C1A',
            textAlign: 'center', marginBottom: 48, letterSpacing: '-0.3px',
          }}
        >
          {t('features.title')}
        </motion.h2>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto"
          style={{ maxWidth: 880 }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.headlineKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: '#fff',
                borderRadius: 20,
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                padding: '28px 24px',
              }}
            >
              <span style={{ fontSize: 32, display: 'block', marginBottom: 14 }} aria-hidden>
                {f.icon}
              </span>
              <h3
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 18, fontWeight: 400, color: '#1C1C1A', marginBottom: 8,
                }}
              >
                {t(f.headlineKey)}
              </h3>
              <p
                style={{
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontSize: 14, color: '#8A8880', lineHeight: 1.65,
                }}
              >
                {t(f.bodyKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
