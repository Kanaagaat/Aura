// frontend/src/components/VibeCard.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LocationImage } from './LocationImage';
import { TwoGisButton } from './TwoGisButton';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useLanguage } from '../i18n';
import type { Location } from '../types';

interface VibeCardProps {
  location: Location | null;
  onClose: () => void;
  onLightBeacon?: (location: Location) => void;
}

const EMOJI: Record<string, string> = {
  coffee: '☕',
  yoga: '🧘',
  spa: '✨',
  other: '📍',
};

// ─── Desktop right-panel (≥768 px) ───────────────────────────────────────────
function DesktopPanel({ location, onClose, onLightBeacon }: VibeCardProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {location && (
        <motion.aside
          key="desktop-panel"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="hidden md:flex flex-col fixed right-0 top-0 bottom-0 w-[380px] bg-white/96 backdrop-blur-xl border-l border-[#EEECE8] z-30 shadow-[-8px_0_32px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          <PanelContent
            location={location}
            onClose={onClose}
            onLightBeacon={() => (onLightBeacon ? onLightBeacon(location) : navigate(`/beacon/new?location=${location.id}`))}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ─── Mobile bottom sheet (< 768 px) ──────────────────────────────────────────
function MobileSheet({ location, onClose, onLightBeacon }: VibeCardProps) {
  const navigate = useNavigate();
  useBodyScrollLock(Boolean(location));

  return (
    <AnimatePresence>
      {location && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/20 z-[60]"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-[70] max-h-[92dvh] flex flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-4px_40px_rgba(0,0,0,0.12)]"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-[#D4D0C8]" />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <PanelContent
                location={location}
                onClose={onClose}
                onLightBeacon={() => (onLightBeacon ? onLightBeacon(location) : navigate(`/beacon/new?location=${location.id}`))}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Shared content ───────────────────────────────────────────────────────────
function PanelContent({
  location,
  onClose,
  onLightBeacon,
}: {
  location: Location;
  onClose: () => void;
  onLightBeacon: () => void;
}) {
  const { t } = useLanguage();
  const emoji = EMOJI[location.category] ?? '📍';
  const categoryLabelKey = `venue.category.${location.category}` as
    | 'venue.category.coffee'
    | 'venue.category.yoga'
    | 'venue.category.spa'
    | 'venue.category.other';
  const categoryLabel = t(categoryLabelKey);

  return (
    <div className="flex flex-col h-full">
      {/* Photo */}
      <div className="relative shrink-0">
        <LocationImage
          src={location.photo_url}
          alt={location.name}
          category={location.category}
          className="w-full h-52 md:h-60"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Featured badge */}
        {location.is_featured && (
          <span className="absolute top-4 left-4 rounded-full bg-amber-400/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-amber-900">
            {t('venue.featured')}
          </span>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          id="vibe-card-close"
          aria-label="Close panel"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#1C1C1A] hover:bg-white transition-colors shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 px-6 py-5 gap-4 overflow-y-auto overscroll-contain">
        {/* Name + category */}
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#8A8880] uppercase mb-1">
            {emoji} {categoryLabel}
          </p>
          <h2 className="font-serif text-2xl text-[#1C1C1A] leading-tight">
            {location.name}
          </h2>
          {location.address && (
            <p className="text-sm text-[#8A8880] mt-1">{location.address}</p>
          )}
        </div>

        {/* Vibe tags */}
        {location.vibe_tags && location.vibe_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {location.vibe_tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#F0EDE8] px-3 py-1 text-xs font-medium text-[#5A5750]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Editorial note */}
        {location.editorial_note && (
          <p className="text-sm leading-relaxed text-[#5A5750] italic">
            "{location.editorial_note}"
          </p>
        )}

        {/* Hours */}
        {location.operating_hours && (
          <div className="flex items-center gap-2 text-sm text-[#8A8880]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {location.operating_hours}
          </div>
        )}

        {/* Active beacons indicator */}
        {!!location.active_beacon_count && location.active_beacon_count > 0 && (
          <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
            <span className="text-amber-500 text-lg">🔆</span>
            <p className="text-sm font-medium text-amber-800">
              {t(
                location.active_beacon_count === 1
                  ? 'map.venue.activeBeacons.singular'
                  : 'map.venue.activeBeacons.plural',
                { n: String(location.active_beacon_count) }
              )}
            </p>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTAs */}
        <button
          type="button"
          id="light-beacon-cta"
          onClick={onLightBeacon}
          className="w-full rounded-full py-4 bg-[#1C1C1A] text-white text-sm font-semibold tracking-wide hover:bg-[#2C2C2A] active:scale-[0.98] transition-all duration-150 shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
        >
          {t('map.venue.lightBeacon')}
        </button>

        <TwoGisButton
          twoGisId={location.two_gis_id}
          twoGisUrl={location.two_gis_url}
          locationName={location.name}
        />

        <Link
          to={`/venues/${location.id}`}
          className="w-full rounded-full border border-[#EEECE8] bg-white py-3 text-center text-sm font-medium text-primary-dark hover:border-[#7A9E7E]/50 transition-colors"
        >
          {t('map.venue.viewFull')}
        </Link>

        {/* Bottom padding for mobile safe area */}
        <div className="h-[calc(1rem+env(safe-area-inset-bottom))] md:hidden" />
      </div>
    </div>
  );
}

// ─── Exported component (renders both, each has its own breakpoint guard) ─────
export function VibeCard({ location, onClose, onLightBeacon }: VibeCardProps) {
  return (
    <>
      <MobileSheet location={location} onClose={onClose} onLightBeacon={onLightBeacon} />
      <DesktopPanel location={location} onClose={onClose} onLightBeacon={onLightBeacon} />
    </>
  );
}
