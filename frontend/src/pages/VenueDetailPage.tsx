import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useAuraStore } from '../store/useAuraStore';
import { LocationImage } from '../components/LocationImage';
import { TwoGisButton } from '../components/TwoGisButton';
import { MiniMap } from '../components/MiniMap';
import { BeaconCard } from '../components/BeaconCard';
import { AuraButton } from '../components/AuraButton';
import { Skeleton } from '../components/ui/Skeleton';
import { useLanguage } from '../i18n';
import type { Beacon, Location } from '../types';

const EMOJI: Record<string, string> = {
  coffee: '☕',
  yoga: '🧘',
  spa: '✨',
  other: '📍',
};

export function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { beacons, fetchBeacons, isAuthenticated, profile, toggleSave } = useAuraStore();
  const { t } = useLanguage();
  const [venue, setVenue] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingHeart, setSavingHeart] = useState(false);
  const [heartPopped, setHeartPopped] = useState(false);

  const venueId = Number(id);

  useEffect(() => {
    if (!id || Number.isNaN(venueId)) return;
    setError(null);
    api
      .getLocation(venueId)
      .then(setVenue)
      .catch(() => setError(t('venue.error.subtitle')));
    fetchBeacons();
  }, [id, venueId, fetchBeacons, t]);

  const venueBeacons = useMemo(
    () => beacons.filter((b) => b.location?.id === venueId && b.is_active && !b.is_expired),
    [beacons, venueId],
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="font-serif text-xl mb-2">{t('venue.error.title')}</p>
        <p className="text-sm text-text-muted mb-6">{error}</p>
        <Link to="/map" className="rounded-full bg-accent text-white px-6 py-3 text-sm font-medium">
          {t('venue.error.cta')}
        </Link>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-8 space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  const emoji = EMOJI[venue.category] ?? '📍';
  const isSaved = (profile?.saved_location_ids ?? []).includes(venueId);

  const categoryLabelKey = `venue.category.${venue.category}` as
    | 'venue.category.coffee'
    | 'venue.category.yoga'
    | 'venue.category.spa'
    | 'venue.category.other';

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(`/venues/${venueId}`)}`);
      return;
    }
    setSavingHeart(true);
    await toggleSave(venueId);
    setSavingHeart(false);
    if (!isSaved) {
      setHeartPopped(true);
      setTimeout(() => setHeartPopped(false), 600);
    }
  };

  const lightBeacon = () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(`/venues/${venue!.id}`)}`);
      return;
    }
    navigate(`/beacon/new?location=${venue!.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto pb-12"
    >
      <div className="relative h-56 md:h-72">
        <LocationImage
          src={venue.photo_url}
          alt={venue.name}
          category={venue.category}
          className="h-full w-full"
        />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 backdrop-blur shadow-sm"
          aria-label="Go back"
        >
          ←
        </button>

        <button
          type="button"
          onClick={handleToggleSave}
          disabled={savingHeart}
          aria-label={isSaved ? 'Remove from saved' : 'Save this venue'}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 backdrop-blur shadow-sm active:scale-90 disabled:opacity-60"
        >
          <motion.span
            animate={{ scale: heartPopped ? 1.4 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            style={{ color: isSaved ? '#f43f5e' : '#8A8880', fontSize: '1.25rem', lineHeight: 1 }}
          >
            {isSaved ? '♥' : '♡'}
          </motion.span>
        </button>

        {venue.is_featured && (
          <span className="absolute bottom-4 right-4 rounded-full bg-accent-amber/90 px-3 py-1 text-xs font-semibold text-amber-900">
            {t('venue.editorPick')}
          </span>
        )}
      </div>

      <div className="px-5 md:px-8 -mt-6 relative">
        <div className="rounded-[var(--radius-modal)] bg-surface border border-border p-6 md:p-8 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">
            {emoji} {t(categoryLabelKey)}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-text-main">{venue.name}</h1>
          {venue.address && (
            <p className="text-sm text-text-muted mt-2">{venue.address}</p>
          )}
          {venue.operating_hours && (
            <p className="text-sm text-text-muted mt-1">🕐 {venue.operating_hours}</p>
          )}

          {venue.vibe_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {venue.vibe_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-cream px-3 py-1 text-xs font-medium text-[#5A5750]"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}

          {venue.editorial_note && (
            <p className="mt-6 text-base leading-relaxed text-[#5A5750] italic border-l-2 border-accent/40 pl-4">
              {venue.editorial_note}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <AuraButton className="w-full" onClick={lightBeacon}>
              {t('venue.lightBeacon')}
            </AuraButton>
            <TwoGisButton
              twoGisId={venue.two_gis_id}
              twoGisUrl={venue.two_gis_url}
              locationName={venue.name}
            />
          </div>
        </div>

        <div className="mt-6">
          <MiniMap
            latitude={venue.latitude}
            longitude={venue.longitude}
            category={venue.category}
          />
        </div>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl">{t('venue.activeBeacons')}</h2>
            {venueBeacons.length > 0 && (
              <span className="text-xs font-medium text-accent-amber">
                🔆 {t('venue.beacons.live', { n: venueBeacons.length })}
              </span>
            )}
          </div>
          {venueBeacons.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8 bg-surface-cream rounded-[var(--radius-card)]">
              {t('venue.beacons.empty')}
            </p>
          ) : (
            <div className="space-y-4">
              {venueBeacons.map((b: Beacon) => (
                <BeaconCard key={b.id} beacon={b} />
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
