import { Link } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuraStore } from '../store/useAuraStore';
import { BeaconCard } from '../components/BeaconCard';
import { LocationImage } from '../components/LocationImage';
import { CountdownTimer } from '../components/CountdownTimer';
import { AuraButton } from '../components/AuraButton';
import { EmptyState } from '../components/ui/EmptyState';
import { BeaconCardSkeleton, VenueRowSkeleton } from '../components/ui/Skeleton';
import type { Beacon, Location } from '../types';

const EMOJI: Record<string, string> = {
  coffee: '☕',
  yoga: '🧘',
  spa: '✨',
  other: '📍',
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

function timeOfDaySuggestion(hour: number): { label: string; categories: string[] } {
  if (hour < 11) return { label: 'Slow morning energy', categories: ['coffee', 'yoga'] };
  if (hour < 17) return { label: 'Afternoon reset', categories: ['coffee', 'spa', 'yoga'] };
  return { label: 'Evening unwind', categories: ['spa', 'yoga'] };
}

function VenueRow({ loc, featured }: { loc: Location; featured?: boolean }) {
  return (
    <motion.div {...fadeUp}>
      <Link
        to={`/venues/${loc.id}`}
        className={`flex gap-4 rounded-[var(--radius-card)] overflow-hidden border transition-all hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5 ${
          featured
            ? 'bg-surface-cream border-accent/30'
            : 'bg-surface border-border'
        }`}
      >
        <div className="relative w-28 h-28 shrink-0">
          <LocationImage
            src={loc.photo_url}
            alt={loc.name}
            category={loc.category}
            className="w-full h-full"
          />
          {featured && (
            <span className="absolute top-2 left-2 rounded-full bg-accent-amber/90 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
              Pick
            </span>
          )}
        </div>
        <div className="py-4 pr-4 flex flex-col justify-center min-w-0">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-0.5">
            {EMOJI[loc.category] ?? '📍'} {loc.category}
          </p>
          <p className="font-serif text-lg truncate">{loc.name}</p>
          <p className="text-sm text-text-muted line-clamp-2 mt-1">{loc.editorial_note}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {loc.vibe_tags.slice(0, 2).map((t) => (
              <span key={t} className="text-xs text-primary-dark font-medium">
                {t.startsWith('#') ? t : `#${t}`}
              </span>
            ))}
            {(loc.active_beacon_count ?? 0) > 0 && (
              <span className="text-xs text-accent-amber font-medium">
                🔆 {loc.active_beacon_count} beacon{(loc.active_beacon_count ?? 0) > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function HomePage() {
  const { beacons, locations, fetchBeacons, fetchLocations, loading, profile } = useAuraStore();

  useEffect(() => {
    fetchBeacons();
    fetchLocations();
  }, [fetchBeacons, fetchLocations]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const suggestion = timeOfDaySuggestion(hour);

  const sortedBeacons = useMemo(() => {
    return [...beacons]
      .filter((b) => b.is_active && !b.is_expired)
      .sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
      );
  }, [beacons]);

  const featured = locations.filter((l) => l.is_featured);
  const suggested = useMemo(() => {
    const pool = locations.filter((l) => suggestion.categories.includes(l.category));
    return (pool.length ? pool : locations).slice(0, 4);
  }, [locations, suggestion.categories]);

  const soonBeacon = sortedBeacons[0];

  return (
    <div className="px-5 md:px-12 py-8 max-w-4xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-sm text-text-muted uppercase tracking-widest mb-2">
          Almaty · Today
        </p>
        <h1 className="font-serif text-4xl md:text-5xl leading-tight">
          {greeting}
          {profile ? `, ${profile.display_name.split(' ')[0]}` : ''},<br />
          <span className="text-primary-dark">find your vibe.</span>
        </h1>
        <p className="text-sm text-text-muted mt-3">{suggestion.label} — explore below.</p>
      </motion.header>

      {soonBeacon && (
        <motion.section
          {...fadeUp}
          className="mb-10 rounded-[var(--radius-modal)] bg-surface-cream border border-border p-5 md:p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-amber mb-2">
            Starting soon
          </p>
          <Link to={`/beacon/${soonBeacon.id}`} className="block group">
            <p className="font-serif text-xl group-hover:text-primary-dark transition-colors">
              {soonBeacon.message}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {soonBeacon.location.name} ·{' '}
              <CountdownTimer expiresAt={soonBeacon.expires_at} />
            </p>
          </Link>
        </motion.section>
      )}

      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl">Happening Now</h2>
          <Link to="/map" className="text-sm text-primary-dark font-medium hover:underline">
            View map →
          </Link>
        </div>
        {loading && sortedBeacons.length === 0 ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5 md:mx-0 md:px-0">
            <BeaconCardSkeleton />
            <BeaconCardSkeleton />
            <BeaconCardSkeleton />
          </div>
        ) : sortedBeacons.length === 0 ? (
          <EmptyState
            emoji="🕯"
            title="No beacons lit yet"
            description="Be the first to invite someone for coffee, yoga, or a slow reset at a curated spot."
            actionLabel="Light a Beacon"
            actionTo="/beacon/new"
            secondaryLabel="Browse the map"
            secondaryTo="/map"
          />
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5 md:mx-0 md:px-0">
            {sortedBeacons.map((b: Beacon, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <BeaconCard beacon={b} compact />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl mb-4">Editor&apos;s picks</h2>
          <div className="space-y-4">
            {featured.slice(0, 4).map((loc) => (
              <VenueRow key={loc.id} loc={loc} featured />
            ))}
          </div>
        </section>
      )}

      <section className="mb-12">
        <h2 className="font-serif text-2xl mb-4">Curated for today</h2>
        {loading && locations.length === 0 ? (
          <div className="space-y-4">
            <VenueRowSkeleton />
            <VenueRowSkeleton />
          </div>
        ) : (
          <div className="space-y-4">
            {suggested.map((loc) => (
              <VenueRow key={loc.id} loc={loc} />
            ))}
          </div>
        )}
      </section>

      <motion.section {...fadeUp}>
        <div className="rounded-[var(--radius-modal)] bg-accent/10 border border-accent/25 p-8 md:p-10 text-center">
          <span className="text-4xl mb-4 block" aria-hidden>
            🌿
          </span>
          <h2 className="font-serif text-2xl mb-2">Light a Beacon</h2>
          <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto leading-relaxed">
            Broadcast your intent — matcha, yoga, a walk — and find company at your
            favorite spot. Expires in 2 hours.
          </p>
          <Link to="/beacon/new">
            <AuraButton size="lg">Light it</AuraButton>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
