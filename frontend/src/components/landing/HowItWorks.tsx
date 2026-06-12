import { motion } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    emoji: '🗺️',
    headline: 'Discover curated spots',
    body: 'Hand-picked yoga studios, specialty coffee, and spas — no noise, no auto-repair shops.',
  },
  {
    num: '02',
    emoji: '🔆',
    headline: 'Light a Beacon',
    body: "Tell the map where you're headed. Two taps and your intention is live for 2 hours.",
  },
  {
    num: '03',
    emoji: '🤝',
    headline: 'Show up together',
    body: 'Someone nearby joins. You meet at the venue. Simple.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '100px 0', background: '#FAFAF7' }}>
      <div className="mx-auto px-5 lg:px-8" style={{ maxWidth: 1280 }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 40, fontWeight: 400, color: '#1C1C1A',
            textAlign: 'center', marginBottom: 60, letterSpacing: '-0.3px',
          }}
        >
          Simple by design.
        </motion.h2>

        <div className="how-it-works-steps">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'relative' }}
            >
              {/* Large background step number */}
              <span
                aria-hidden
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: 96, fontWeight: 400, lineHeight: 1,
                  color: '#EEECE8',
                  position: 'absolute', top: -20, left: -6,
                  zIndex: 0, userSelect: 'none', pointerEvents: 'none',
                }}
              >
                {step.num}
              </span>

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1, paddingTop: 44 }}>
                <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }} aria-hidden>
                  {step.emoji}
                </span>
                <h3
                  style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontSize: 20, fontWeight: 400, color: '#1C1C1A', marginBottom: 8,
                  }}
                >
                  {step.headline}
                </h3>
                <p
                  style={{
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontSize: 14, color: '#8A8880', lineHeight: 1.65, maxWidth: 260,
                  }}
                >
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
