import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuraStore } from '../store/useAuraStore';
import { BeaconCard } from '../components/BeaconCard';
import { AuraButton } from '../components/AuraButton';

export function HomePage() {
  const { beacons, locations, fetchBeacons, fetchLocations, loading } = useAuraStore();

  useEffect(() => {
    fetchBeacons();
    fetchLocations();
  }, [fetchBeacons, fetchLocations]);

  const featured = locations.filter((l) => l.is_featured).slice(0, 4);
  const curated = locations.slice(0, 6);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="px-5 md:px-12 py-8 max-w-4xl mx-auto">
      <header className="mb-10">
        <p className="text-sm text-text-muted uppercase tracking-widest mb-2">
          Almaty · Today
        </p>
        <h1 className="font-serif text-4xl md:text-5xl leading-tight">
          {greeting},<br />
          <span className="text-primary-dark">find your vibe.</span>
        </h1>
      </header>

      {/* Happening Now */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl">Happening Now</h2>
          <Link to="/map" className="text-sm text-primary-dark font-medium">
            View map →
          </Link>
        </div>
        {loading && beacons.length === 0 ? (
          <p className="text-text-muted text-sm">Loading beacons...</p>
        ) : beacons.length === 0 ? (
          <p className="text-text-muted text-sm">No active beacons right now. Light one!</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5 md:mx-0 md:px-0">
            {beacons.map((b) => (
              <BeaconCard key={b.id} beacon={b} compact />
            ))}
          </div>
        )}
      </section>

      {/* Curated for Today */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl mb-4">Curated for Today</h2>
        <div className="space-y-4">
          {(featured.length ? featured : curated).map((loc) => (
            <Link
              key={loc.id}
              to="/map"
              onClick={() => useAuraStore.getState().selectLocation(loc.id)}
              className="flex gap-4 rounded-[var(--radius-card)] bg-surface border border-border overflow-hidden hover:shadow-[var(--shadow-soft)] transition-shadow"
            >
              <img
                src={loc.photo_url}
                alt={loc.name}
                className="w-28 h-28 object-cover shrink-0"
              />
              <div className="py-4 pr-4 flex flex-col justify-center">
                <p className="font-serif text-lg">{loc.name}</p>
                <p className="text-sm text-text-muted line-clamp-2 mt-1">
                  {loc.editorial_note}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {loc.vibe_tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-xs text-primary-dark">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Light a Beacon CTA */}
      <section>
        <div className="rounded-[var(--radius-card)] bg-accent-amber/15 border border-accent-amber/30 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-accent-amber mb-4">
            flare
          </span>
          <h2 className="font-serif text-2xl mb-2">Light a Beacon</h2>
          <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
            Broadcast your intent — matcha, yoga, a walk — and find company at your
            favorite spot.
          </p>
          <Link to="/beacon/new">
            <AuraButton>Light it</AuraButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
