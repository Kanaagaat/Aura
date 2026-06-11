import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../../store/useToastStore';

const STYLES = {
  success: 'bg-[#1a1a18] text-white',
  info: 'bg-[#f6f6f3] text-[#1a1a18] border border-[#dadad3]',
  error: 'bg-rose-50 text-rose-700 border border-rose-100',
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[min(90vw,360px)] pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-auto rounded-full px-5 py-3 text-sm font-medium text-center shadow-[0_4px_24px_rgba(0,0,0,0.12)] ${STYLES[t.type]}`}
            onClick={() => dismiss(t.id)}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
