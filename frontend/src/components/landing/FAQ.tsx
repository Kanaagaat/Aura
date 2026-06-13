import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp } from './animations';
import { useLanguage } from '../../i18n';
import type { TranslationKey } from '../../i18n/translations';

const ITEMS: { qKey: TranslationKey; aKey: TranslationKey }[] = [
  { qKey: 'faq.1.q', aKey: 'faq.1.a' },
  { qKey: 'faq.2.q', aKey: 'faq.2.a' },
  { qKey: 'faq.3.q', aKey: 'faq.3.a' },
  { qKey: 'faq.4.q', aKey: 'faq.4.a' },
  { qKey: 'faq.5.q', aKey: 'faq.5.a' },
  { qKey: 'faq.6.q', aKey: 'faq.6.a' },
];

function FAQItem({ qKey, aKey }: { qKey: TranslationKey; aKey: TranslationKey }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#dadad3]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[#1a1a18]">{t(qKey)}</span>
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
            <p className="pb-5 text-[#62625b] text-base leading-relaxed">{t(aKey)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const { t } = useLanguage();

  return (
    <section className="px-5 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <motion.h2
          {...fadeUp}
          className="text-[28px] md:text-[36px] font-bold leading-tight tracking-[-0.8px] text-[#1a1a18] mb-10"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
        >
          {t('faq.title')}
        </motion.h2>
        <motion.div {...fadeUp}>
          {ITEMS.map((item) => (
            <FAQItem key={item.qKey} qKey={item.qKey} aKey={item.aKey} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
