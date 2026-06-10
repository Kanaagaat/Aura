import { motion } from 'framer-motion';
import { fadeUp, fadeUpVariant, staggerContainer } from './animations';

const STEPS = [
  {
    num: '01',
    emoji: '🗺',
    title: 'Discover',
    body: 'Browse 34 curated wellness venues on an interactive Almaty map. Coffee, yoga, spa — filtered by vibe.',
  },
  {
    num: '02',
    emoji: '🕯',
    title: 'Connect',
    body: 'Light a Beacon at any venue. Pick a time, write a short message, and invite the city to join you for 2 hours.',
  },
  {
    num: '03',
    emoji: '💬',
    title: 'Meet',
    body: 'Someone joins your Beacon. Coordinate via Telegram deep-link. No friction, no scheduling apps.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div {...fadeUp} className="text-center mb-14">
          <h2
            className="text-[28px] md:text-[36px] font-bold leading-tight tracking-[-0.8px] text-[#1a1a18] mb-3"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
          >
            How Aura works
          </h2>
          <p className="text-[#62625b] text-base md:text-lg">Three steps to find your moment.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-6 md:grid-cols-3"
        >
          {STEPS.map((step) => (
            <motion.article
              key={step.num}
              variants={fadeUpVariant}
              className="rounded-[20px] bg-[#f6f6f3] p-8 md:p-9 relative"
            >
              <span className="text-[13px] font-medium uppercase tracking-[0.02em] text-[#91918c]">
                {step.num}
              </span>
              <span className="block text-4xl mt-4 mb-3" aria-hidden>
                {step.emoji}
              </span>
              <h3
                className="text-[20px] font-semibold text-[#1a1a18] mb-2"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                {step.title}
              </h3>
              <p className="text-[#62625b] text-base leading-relaxed">{step.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
