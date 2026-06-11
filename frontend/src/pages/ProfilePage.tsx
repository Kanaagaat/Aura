import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '../store/useAuraStore';
import { BeaconCard } from '../components/BeaconCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { InstagramIcon } from '../components/InstagramIcon';
import { TelegramIcon } from '../components/TelegramIcon';
import { LocationImage } from '../components/LocationImage';
import type { Beacon } from '../types';

const EMOJI: Record<string, string> = {
  coffee: '☕', yoga: '🧘', spa: '✨', other: '📍',
};

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, beacons, savedLocations, fetchProfile, fetchBeacons, fetchSavedLocations, toggleSave, logout } = useAuraStore();
  const [tab, setTab] = useState<'active' | 'past' | 'spots'>('active');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchBeacons();
    fetchSavedLocations();
  }, [fetchProfile, fetchBeacons, fetchSavedLocations]);

  const myBeacons = beacons.filter((b) => b.creator.id === profile?.id);
  const active = myBeacons.filter((b) => b.is_active && !b.is_expired);
  const past = myBeacons.filter((b) => !b.is_active || b.is_expired);
  const shown: Beacon[] = tab === 'active' ? active : past;

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-text-muted">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <div className="text-center mb-10">
        <div className="relative inline-block">
          <img
            src={profile.avatar_url || FALLBACK_AVATAR}
            alt={profile.display_name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR;
            }}
            className="h-24 w-24 rounded-full object-cover mx-auto border-4 border-surface shadow-[var(--shadow-soft)]"
          />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-text-main text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
            aria-label="Edit profile photo"
          >
            <span className="material-symbols-outlined text-base">edit</span>
          </button>
        </div>
        <h1 className="font-serif text-3xl mt-4">{profile.display_name}</h1>
        <p className="text-text-muted text-sm mt-2 max-w-sm mx-auto">{profile.bio}</p>

        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          <button
            onClick={() => setEditing(true)}
            className="rounded-full border border-border px-4 py-2 text-sm hover:border-primary transition-colors"
          >
            Edit Profile
          </button>
          {profile.telegram_username && (
            <a
              href={`https://t.me/${profile.telegram_username.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white hover:border-[#229ED9] transition-colors"
              aria-label={`Open Telegram profile @${profile.telegram_username.replace('@', '')}`}
            >
              <TelegramIcon className="h-5 w-5" />
            </a>
          )}
          {profile.instagram_handle && (
            <a
              href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white hover:border-[#D6249F] transition-colors"
              aria-label={`Open Instagram profile @${profile.instagram_handle.replace('@', '')}`}
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          )}
          <button
            onClick={() => {
              logout();
              navigate('/auth');
            }}
            className="rounded-full border border-border px-4 py-2 text-sm text-rose-500 hover:border-rose-300 hover:bg-rose-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Beacons Lit', value: profile.beacons_lit },
          { label: 'People Met', value: beacons.reduce((s, b) => s + b.join_count, 0) },
          { label: 'My Spots', value: savedLocations.length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-[var(--radius-card)] bg-surface border border-border p-4 text-center"
          >
            <p className="font-serif text-2xl text-primary-dark">{value}</p>
            <p className="text-xs text-text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {(['active', 'past', 'spots'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize whitespace-nowrap ${
              tab === t
                ? 'bg-text-main text-white'
                : 'bg-surface border border-border text-text-muted'
            }`}
          >
            {t === 'spots' ? '♥ My Spots' : `${t} Beacons`}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'spots' ? (
          <motion.div
            key="spots"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {savedLocations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-3">♡</p>
                <p className="font-serif text-xl mb-2">No saved spots yet</p>
                <p className="text-sm text-text-muted mb-6">
                  Tap the heart on any venue to save it here.
                </p>
                <Link
                  to="/map"
                  className="rounded-full bg-text-main text-white px-6 py-2.5 text-sm font-medium"
                >
                  Browse the map
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {savedLocations.map((loc) => (
                  <motion.div
                    key={loc.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={`/venues/${loc.id}`}
                      className="block rounded-[var(--radius-card)] overflow-hidden border border-border bg-surface hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5 transition-all"
                    >
                      <div className="relative h-28">
                        <LocationImage
                          src={loc.photo_url}
                          alt={loc.name}
                          category={loc.category}
                          className="h-full w-full"
                        />
                        {/* Unsave button */}
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            await toggleSave(loc.id);
                          }}
                          aria-label="Remove from saved"
                          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 backdrop-blur shadow-sm text-rose-500 text-sm active:scale-90 transition-transform"
                        >
                          ♥
                        </button>
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] text-text-muted uppercase tracking-wide">
                          {EMOJI[loc.category] ?? '📍'} {loc.category}
                        </p>
                        <p className="font-serif text-sm mt-0.5 truncate">{loc.name}</p>
                        {(loc.active_beacon_count ?? 0) > 0 && (
                          <p className="text-[10px] text-accent-amber font-medium mt-1">
                            🔆 {loc.active_beacon_count} live
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {shown.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">
                No {tab} beacons yet.{' '}
                <Link to="/beacon/new" className="text-primary-dark underline">
                  Light one
                </Link>
              </p>
            ) : (
              shown.map((b) => <BeaconCard key={b.id} beacon={b} />)
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <EditProfileModal
        open={editing}
        profile={profile}
        onClose={() => setEditing(false)}
      />
    </div>
  );
}
