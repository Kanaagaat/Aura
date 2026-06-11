// frontend/src/components/BeaconCreate.tsx
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuraStore } from '../store/useAuraStore';
import { useToastStore } from '../store/useToastStore';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import type { ActivityType, Location } from '../types';

const ACTIVITIES: { id: ActivityType; label: string; emoji: string }[] = [
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'walk', label: 'Walk', emoji: '🚶' },
  { id: 'study', label: 'Study', emoji: '📖' },
];

const TIME_SLOTS = Array.from({ length: 15 }, (_, index) => {
  const hour = index + 8;
  return `${String(hour).padStart(2, '0')}:00`;
});

interface BeaconCreateProps {
  location: Location | null;
  onClose: () => void;
  onSuccess: (locationId: number) => void;
}

function getDefaultSlot(): string {
  const now = new Date();
  const nextHour = Math.min(Math.max(now.getHours() + 1, 8), 22);
  return `${String(nextHour).padStart(2, '0')}:00`;
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultDate(slot: string): string {
  return formatDateInput(slotToDate(formatDateInput(new Date()), slot));
}

function slotToDate(dateValue: string, slot: string): Date {
  const [hours, minutes] = slot.split(':').map(Number);
  const [year, month, day] = dateValue.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function BeaconCreate({ location, onClose, onSuccess }: BeaconCreateProps) {
  const createBeacon = useAuraStore((state) => state.createBeacon);
  const showToast = useToastStore((s) => s.show);
  useBodyScrollLock(Boolean(location));
  const [activity, setActivity] = useState<ActivityType>('coffee');
  const [timeSlot, setTimeSlot] = useState(getDefaultSlot);
  const [dateValue, setDateValue] = useState(() => getDefaultDate(getDefaultSlot()));
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheduledLabel = useMemo(() => {
    const date = slotToDate(dateValue, timeSlot);
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }, [dateValue, timeSlot]);

  const handleSubmit = async () => {
    if (!location || !message.trim()) return;
    const scheduledAt = slotToDate(dateValue, timeSlot);
    if (scheduledAt.getTime() < Date.now()) {
      setError('Please choose a future date and time.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await createBeacon({
        location_id: location.id,
        activity_type: activity,
        message: message.trim().slice(0, 100),
        scheduled_at: scheduledAt.toISOString(),
      });
      showToast('Beacon lit! It stays live for 2 hours.');
      onSuccess(location.id);
      setMessage('');
      setActivity('coffee');
      const nextSlot = getDefaultSlot();
      setTimeSlot(nextSlot);
      setDateValue(getDefaultDate(nextSlot));
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {location && (
        <>
          <motion.div
            key="beacon-create-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/25"
            onClick={onClose}
          />
          <motion.div
            key="beacon-create-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] mx-auto flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.16)] md:bottom-6 md:rounded-[28px]"
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            <div className="shrink-0 px-5 pt-3">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#D4D0C8]" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8A8880]">
                  Light a Beacon
                </p>
                <h2 className="mt-1 font-serif text-2xl leading-tight text-[#1C1C1A]">
                  {location.name}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close beacon form"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F0EDE8] text-[#1C1C1A]"
              >
                ×
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              {ACTIVITIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivity(item.id)}
                  className={`min-h-24 rounded-2xl border p-4 text-left transition ${
                    activity === item.id
                      ? 'border-[#1C1C1A] bg-[#1C1C1A] text-white'
                      : 'border-[#EEECE8] bg-[#FAFAF7] text-[#1C1C1A]'
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="mt-2 block text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-[#1C1C1A]" htmlFor="beacon-date">
                Date
              </label>
              <input
                id="beacon-date"
                type="date"
                value={dateValue}
                min={formatDateInput(new Date())}
                onChange={(event) => setDateValue(event.target.value)}
                className="w-full rounded-2xl border border-[#EEECE8] bg-[#FAFAF7] px-4 py-3 text-sm outline-none transition focus:border-[#7A9E7E]"
              />
            </div>

            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#1C1C1A]">Time</p>
                <p className="text-xs text-[#8A8880]">{scheduledLabel}</p>
              </div>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
                      timeSlot === slot
                        ? 'border-[#7A9E7E] bg-[#7A9E7E] text-white'
                        : 'border-[#EEECE8] bg-white text-[#5A5750]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <label className="mb-2 block text-sm font-semibold text-[#1C1C1A]" htmlFor="beacon-message">
              Message
            </label>
            <textarea
              id="beacon-message"
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, 100))}
              placeholder="Matcha and a slow reset?"
              rows={4}
              className="mb-1 w-full resize-none rounded-2xl border border-[#EEECE8] bg-[#FAFAF7] px-4 py-3 text-sm outline-none transition focus:border-[#7A9E7E]"
            />
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-rose-600">{error}</p>
              <p className="text-xs text-[#8A8880]">{message.length}/100</p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!message.trim() || submitting}
              className="w-full rounded-full bg-[#1C1C1A] py-4 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Lighting...' : 'Light it 🌿'}
            </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
