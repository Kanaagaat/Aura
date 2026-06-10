import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp } from './animations';

const ITEMS = [
  {
    q: 'Is Aura free?',
    a: 'Yes, completely free during our Almaty beta. Always will be for casual users.',
  },
  {
    q: 'Does it work outside Almaty?',
    a: "Not yet — we're intentionally city-first. Almaty is home base. Other cities TBD.",
  },
  {
    q: 'Do I need a Telegram account?',
    a: 'Only if you want to connect with someone via Beacon. Browsing the map is anonymous.',
  },
  {
    q: 'How long does a Beacon stay active?',
    a: 'Exactly 2 hours from the scheduled time. After that it disappears automatically.',
  },
  {
    q: 'Is my profile public?',
    a: 'Your vibe tags and display name are visible to others on a Beacon. No last name, no location tracking.',
  },
  {
    q: 'What makes a venue get added?',
    a: 'Every venue is personally visited or vetted. No paid placements, no sponsored spots.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#dadad3]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[#1a1a18]">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-[#91918c] text-lg"
          aria-hidden
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[#62625b] text-base leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="px-5 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <motion.h2
          {...fadeUp}
          className="text-[28px] md:text-[36px] font-bold leading-tight tracking-[-0.8px] text-[#1a1a18] mb-10"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
        >
          Questions
        </motion.h2>
        <motion.div {...fadeUp}>
          {ITEMS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
