import { motion } from 'framer-motion';
import { floatAnimation } from './animations';

const PILLS = [
  { label: '☕ Coffee', className: 'top-[18%] left-[6%] md:left-[10%]' },
  { label: '🧘 Yoga', className: 'top-[12%] right-[8%] md:right-[14%]' },
  { label: '✨ Spa', className: 'top-[42%] left-[4%] md:left-[8%]' },
  { label: '🗺 Your city', className: 'top-[38%] right-[5%] md:right-[10%]' },
  { label: '🕯 Beacon', className: 'bottom-[28%] left-[12%] md:left-[18%]' },
  { label: '💬 Connect', className: 'bottom-[22%] right-[10%] md:right-[16%]' },
];

export function HeroPills() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
      {PILLS.map((pill, i) => (
        <motion.span
          key={pill.label}
          {...floatAnimation(i * 0.5)}
          className={`absolute ${pill.className} rounded-full border border-[#dadad3] bg-white px-4 py-2 text-[13px] font-medium text-[#33332e] shadow-[0_2px_12px_rgba(0,0,0,0.04)]`}
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
        >
          {pill.label}
        </motion.span>
      ))}
    </div>
  );
}
