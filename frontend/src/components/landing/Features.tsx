import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: '🗺️',
    headline: 'Curated, not cluttered',
    body: 'Only the 40 best wellness spots in your city. Updated by editors, not algorithms.',
  },
  {
    icon: '🔆',
    headline: 'Beacons expire in 2 hours',
    body: 'No stale posts. Every beacon is happening today.',
  },
  {
    icon: '🧘',
    headline: 'Find your kind of people',
    body: 'Connect with someone heading to the same spot. Meet over matcha after.',
  },
  {
    icon: '📲',
    headline: 'No app download needed',
    body: 'Works in any browser. Add to home screen in one tap.',
  },
];

export function Features() {
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
          Everything you need. Nothing you don&apos;t.
        </motion.h2>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto"
          style={{ maxWidth: 880 }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.headline}
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
                {f.headline}
              </h3>
              <p
                style={{
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontSize: 14, color: '#8A8880', lineHeight: 1.65,
                }}
              >
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
