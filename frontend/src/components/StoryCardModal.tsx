import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import type { Beacon } from '../types';
import { AuraButton } from './AuraButton';

interface StoryCardModalProps {
  beacon: Beacon;
  onClose: () => void;
}

export function StoryCardModal({ beacon, onClose }: StoryCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const exportStory = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      useCORS: true,
      scale: 2,
      backgroundColor: '#FAFAF7',
    });
    const link = document.createElement('a');
    link.download = `aura-beacon-${beacon.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const time = new Date(beacon.scheduled_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-surface rounded-[var(--radius-modal)] p-6 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-serif text-xl mb-4 text-center">Share to Stories</p>

          <div
            ref={cardRef}
            className="aspect-[9/16] max-h-[420px] mx-auto rounded-2xl overflow-hidden relative bg-background"
          >
            <img
              src={beacon.location.photo_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-text-main/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="font-serif text-2xl leading-tight mb-2">{beacon.message}</p>
              <p className="text-sm opacity-90">{beacon.location.name}</p>
              <p className="text-sm opacity-75 mt-1">{time} · Almaty</p>
              <p className="mt-4 text-xs tracking-widest uppercase opacity-60">Aura</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <AuraButton variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </AuraButton>
            <AuraButton className="flex-1" onClick={exportStory}>
              Download
            </AuraButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
