import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocations } from '../hooks/useLocations';
import { AuraMap } from '../components/AuraMap';
import { VibeCard } from '../components/VibeCard';
import { BeaconCreate } from '../components/BeaconCreate';
import { FilterChips } from '../components/FilterChips';
import { useAuraStore } from '../store/useAuraStore';
import { useToastStore } from '../store/useToastStore';
import { useLanguage } from '../i18n';
import { api } from '../lib/api';
import type { Category } from '../types';

const EMOJI: Record<string, string> = {
  coffee: '☕',
  yoga: '🧘',
  spa: '✨',
  other: '📍',
};

export function MapPage() {
  const { locations, loading, error } = useLocations();
  const { beacons, profile } = useAuraStore();
  const showToast = useToastStore((s) => s.show);
  const { t } = useLanguage();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [beaconLocationId, setBeaconLocationId] = useState<number | null>(null);
  const [freshBeaconLocationIds, setFreshBeaconLocationIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<Category>('all');
  const [search, setSearch] = useState('');

  const [vibeOpen, setVibeOpen] = useState(false);
  const [vibe, setVibe] = useState('');
  const [vibeLoading, setVibeLoading] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<number[]>([]);
  const vibeInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return locations.filter((loc) => {
      if (filter !== 'all' && loc.category !== filter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.vibe_tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [locations, filter, search]);

  const selected = filtered.find((l) => l.id === selectedId) ?? null;

  const beaconMarkers = useMemo(() => {
    const seen = new Map<number, string>();
    beacons.filter((b) => {
      if (!b.is_active) return false;
      if (!b.visibility || b.visibility === 'all') return true;
      if (profile && b.creator?.id === profile.id) return true;
      return Boolean(profile?.gender && b.visibility === profile.gender);
    }).forEach((b) => {
      seen.set(b.location.id, b.visibility ?? 'all');
    });
    freshBeaconLocationIds.forEach((id) => {
      if (!seen.has(id)) seen.set(id, 'all');
    });
    return Array.from(seen.entries()).map(([locationId, visibility]) => ({ locationId, visibility }));
  }, [beacons, freshBeaconLocationIds, profile]);

  const activeBeaconLocationIds = useMemo(
    () => beaconMarkers.map((m) => m.locationId),
    [beaconMarkers]
  );

  const beaconLocation = locations.find((loc) => loc.id === beaconLocationId) ?? null;

  const handleVibeSearch = async () => {
    if (!vibe.trim() || vibeLoading) return;
    setVibeLoading(true);
    try {
      const result = await api.vibeSearch(vibe.trim());
      const ids = result.locations.map((l) => l.id);
      setHighlightedIds(ids);
      if (result.vibe_summary) showToast(result.vibe_summary);
      setVibeOpen(false);
      setVibe('');
    } catch {
      showToast('Could not complete vibe search right now.');
    }
    setVibeLoading(false);
  };

  return (
    <div className="relative h-[calc(100vh-5rem)] md:h-screen overflow-hidden">
      <div className="absolute top-4 left-4 right-4 z-20 md:left-6 md:right-auto md:w-96 space-y-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-white/95 backdrop-blur-md border border-[#EEECE8] px-4 py-3 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8880" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            id="map-search"
            placeholder={t('map.search.placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#B0ACA4] text-[#1C1C1A]"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="text-[#8A8880] hover:text-[#1C1C1A]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div className="pointer-events-auto">
          <FilterChips active={filter} onChange={setFilter} />
        </div>
      </div>

      <div className="absolute inset-0 z-0">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F5F3EF] z-10">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#7A9E7E] border-t-transparent animate-spin mx-auto" />
              <p className="text-sm text-[#8A8880]">{t('map.loading.text')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F5F3EF] z-10">
            <div className="text-center max-w-xs px-6">
              <p className="text-2xl mb-2">🗺️</p>
              <p className="font-serif text-lg text-[#1C1C1A] mb-1">{t('map.error.title')}</p>
              <p className="text-sm text-[#8A8880]">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <AuraMap
            locations={filtered}
            selectedId={selectedId}
            activeBeaconLocationIds={activeBeaconLocationIds}
            beaconMarkers={beaconMarkers}
            highlightedIds={highlightedIds}
            onSelect={(id) => setSelectedId((prev) => (prev === id ? null : id))}
          />
        )}
      </div>

      {!selected && (
        <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-[380px] flex-col bg-white/92 backdrop-blur-xl border-l border-[#EEECE8] z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-6 border-b border-[#EEECE8]">
            <h1 className="font-serif text-2xl text-[#1C1C1A]">{t('map.sidebar.title')}</h1>
            <p className="text-sm text-[#8A8880] mt-1">{t('map.sidebar.subtitle')}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filtered.map((loc) => (
              <div
                key={loc.id}
                className="rounded-2xl border border-[#EEECE8] hover:border-[#7A9E7E]/40 hover:bg-[#FAFAF7] transition-all overflow-hidden"
              >
                <button
                  type="button"
                  id={`location-list-item-${loc.id}`}
                  onClick={() => setSelectedId(loc.id)}
                  className="w-full text-left p-4 group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{EMOJI[loc.category] ?? '📍'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[#1C1C1A] truncate">{loc.name}</p>
                      <p className="text-xs text-[#8A8880] capitalize mt-0.5">{loc.category}</p>
                      {loc.vibe_tags.slice(0, 2).length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {loc.vibe_tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="rounded-full bg-[#F0EDE8] px-2 py-0.5 text-[10px] text-[#5A5750]">
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {!!loc.active_beacon_count && loc.active_beacon_count > 0 && (
                      <span className="shrink-0 text-amber-500 text-sm font-semibold">
                        🔆 {loc.active_beacon_count}
                      </span>
                    )}
                  </div>
                </button>
                <div className="px-4 pb-3 -mt-1">
                  <Link to={`/venues/${loc.id}`} className="text-xs font-medium text-primary-dark hover:underline">
                    {t('map.venue.link')}
                  </Link>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-[#8A8880]">
                <p className="text-3xl mb-3">🧘</p>
                <p className="text-sm">{t('map.empty.noSpots')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <VibeCard
        location={selected}
        onClose={() => setSelectedId(null)}
        onLightBeacon={(location) => setBeaconLocationId(location.id)}
      />

      <BeaconCreate
        location={beaconLocation}
        onClose={() => setBeaconLocationId(null)}
        onSuccess={(locationId) => {
          setFreshBeaconLocationIds((ids) => [...new Set([...ids, locationId])]);
          setSelectedId(locationId);
        }}
      />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 md:left-6 md:translate-x-0">
        <AnimatePresence mode="wait">
          {!vibeOpen ? (
            <motion.button
              key="pill"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              type="button"
              onClick={() => { setVibeOpen(true); setTimeout(() => vibeInputRef.current?.focus(), 50); }}
              className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg"
              style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid #EEECE8', color: '#8A8880' }}
            >
              <span>✦</span>
              <span>{t('map.vibe.button')}</span>
              {highlightedIds.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setHighlightedIds([]); }}
                  className="ml-1 text-[#7A9E7E] text-xs"
                >
                  ×{highlightedIds.length}
                </button>
              )}
            </motion.button>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2 rounded-full px-4 py-2.5 shadow-lg"
              style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)', border: '1px solid #7A9E7E', width: 280 }}
            >
              <input
                ref={vibeInputRef}
                type="text"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleVibeSearch(); if (e.key === 'Escape') setVibeOpen(false); }}
                placeholder={t('map.vibe.placeholder')}
                className="flex-1 bg-transparent text-sm outline-none text-[#1C1C1A] placeholder:text-[#B0ACA4]"
              />
              <button
                type="button"
                onClick={handleVibeSearch}
                disabled={vibeLoading}
                className="text-[#7A9E7E] text-sm font-medium"
              >
                {vibeLoading ? t('map.vibe.searching') : '→'}
              </button>
              <button type="button" onClick={() => setVibeOpen(false)} className="text-[#8A8880]">×</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
