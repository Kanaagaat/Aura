import { motion } from 'framer-motion';
import { fadeUp, fadeUpVariant, staggerContainer } from './animations';

const FEATURES = [
  {
    emoji: '🗺',
    title: 'Interactive Map',
    body: 'Handpicked wellness places with warm markers, soft filters, and no ads.',
    soon: false,
  },
  {
    emoji: '🕯',
    title: 'Beacons',
    body: 'Light a 2-hour spontaneous meetup at any venue. Expires automatically.',
    soon: false,
  },
  {
    emoji: '🧘',
    title: 'Vibe Tags',
    body: 'Every venue tagged with moods — focused, cozy, energising, social. Find your match.',
    soon: false,
  },
  {
    emoji: '✨',
    title: 'AI Curator',
    body: "Describe your mood in natural language. Aura's AI finds the right place.",
    soon: true,
  },
  {
    emoji: '💬',
    title: 'Telegram-native',
    body: 'No new DMs to manage. Connect directly via Telegram deep-link.',
    soon: false,
  },
  {
    emoji: '📍',
    title: 'City-first',
    body: 'Built for your city, not a noisy global feed. Every place feels personally curated.',
    soon: false,
  },
];

export function Features() {
  return (
    <section className="px-5 md:px-8 py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          {...fadeUp}
          className="text-center text-[28px] md:text-[36px] font-bold leading-tight tracking-[-0.8px] text-[#1a1a18] mb-14"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
        >
          Everything you need to find your vibe
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <motion.article
              key={f.title}
              variants={fadeUpVariant}
              className="relative rounded-[20px] bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
            >
              {f.soon && (
                <span className="absolute top-4 right-4 rounded-full bg-[#8faa8b]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#44664a]">
                  Soon
                </span>
              )}
              <span className="block text-[40px] mb-4" aria-hidden>
                {f.emoji}
              </span>
              <h3
                className="text-[20px] font-semibold text-[#1a1a18] mb-2"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                {f.title}
              </h3>
              <p className="text-[#62625b] text-base leading-relaxed">{f.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
