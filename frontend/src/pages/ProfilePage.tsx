import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '../store/useAuraStore';
import { BeaconCard } from '../components/BeaconCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { InstagramIcon } from '../components/InstagramIcon';
import { TelegramIcon } from '../components/TelegramIcon';
import { LocationImage } from '../components/LocationImage';
import { client } from '../api/client';
import type { Beacon } from '../types';

const EMOJI: Record<string, string> = {
  coffee: '☕', yoga: '🧘', spa: '✨', other: '📍',
};

const MILESTONE_EMOJI: Record<string, string> = {
  first_beacon: '🕯',
  five_meetups: '☕',
  yoga_streak: '🧘',
};

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

interface HistoryData { beacons: Beacon[]; milestones: { key: string; label: string }[] }

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, beacons, savedLocations, fetchProfile, fetchBeacons, fetchSavedLocations, toggleSave, logout } = useAuraStore();
  const [tab, setTab] = useState<'active' | 'past' | 'spots' | 'journey'>('active');
  const [editing, setEditing] = useState(false);
  const [history, setHistory] = useState<HistoryData | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchBeacons();
    fetchSavedLocations();
  }, [fetchProfile, fetchBeacons, fetchSavedLocations]);

  useEffect(() => {
    if (tab === 'journey' && !history) {
      client.get('/api/v1/beacons/history/')
        .then((res) => setHistory(res.data?.data ?? res.data))
        .catch(() => { /* silent */ });
    }
  }, [tab, history]);

  const myBeacons = beacons.filter((b) => b.creator.id === profile?.id);
  const active = myBeacons.filter((b) => b.is_active && !b.is_expired);
  const past = myBeacons.filter((b) => !b.is_active || b.is_expired);
  const shown: Beacon[] = tab === 'active' ? active : past;

  const profileCompleteness = profile
    ? [!!profile.display_name, !!profile.bio, !!profile.gender, !!(profile.interests?.length)].filter(Boolean).length * 25
    : 0;
  const profileIncomplete = !!profile && (!profile.gender || !profile.interests?.length);

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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-rose-400 hover:border-rose-300 hover:bg-rose-50 transition-colors"
            aria-label="Sign out"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>

      {profileIncomplete && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-500">✦</span>
            <span className="flex-1 text-sm text-amber-800">Complete your profile to see compatibility scores</span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs font-medium text-amber-700 shrink-0"
            >
              Add →
            </button>
          </div>
          <div className="mt-2 h-1 rounded-full bg-amber-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${profileCompleteness}%` }}
            />
          </div>
        </div>
      )}

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
        {(['active', 'past', 'spots', 'journey'] as const).map((t) => (
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
            {t === 'spots' ? '♥ My Spots' : t === 'journey' ? '✦ Journey' : `${t} Beacons`}
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
                      className="block rounded-[var(--radius-card)] overflow-hidden border border-border bg-surface hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5 active:scale-[0.97] transition-all"
                    >
                      <div className="relative h-28">
                        <LocationImage
                          src={loc.photo_url}
                          alt={loc.name}
                          category={loc.category}
                          className="h-full w-full"
                        />
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
        ) : tab === 'journey' ? (
          <motion.div
            key="journey"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {!history ? (
              <div className="flex items-center justify-center py-12 text-text-muted">
                <div className="w-5 h-5 rounded-full border-2 border-[#7A9E7E] border-t-transparent animate-spin mr-2" />
                <span className="text-sm">Loading your journey…</span>
              </div>
            ) : (
              <>
                {history.milestones.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {history.milestones.map((m) => (
                      <div
                        key={m.key}
                        className="flex items-center gap-1.5 rounded-full bg-[#EFF5F0] border border-[#D4E8D6] px-3 py-1.5 text-sm font-medium text-[#4A7A4C]"
                      >
                        <span>{MILESTONE_EMOJI[m.key] ?? '✦'}</span>
                        <span>{m.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {history.beacons.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-3">🕯</p>
                    <p className="font-serif text-xl mb-2">Your journey begins here</p>
                    <p className="text-sm text-text-muted mb-6">Light your first beacon to start your wellness trail.</p>
                    <Link
                      to="/beacon/new"
                      className="rounded-full bg-text-main text-white px-6 py-2.5 text-sm font-medium"
                    >
                      Light a Beacon
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.beacons.map((b) => {
                      const date = new Date(b.scheduled_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      });
                      return (
                        <Link
                          key={b.id}
                          to={`/beacon/${b.id}`}
                          className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-3 hover:border-primary/40 active:scale-[0.97] transition-all"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#F0EDE8]">
                            {b.location?.photo_url ? (
                              <LocationImage
                                src={b.location.photo_url}
                                alt={b.location.name}
                                category={b.location.category}
                                className="w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">
                                {EMOJI[b.activity_type] ?? '📍'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {EMOJI[b.activity_type] ?? '📍'} {b.activity_type}
                              {b.location && <span className="font-normal text-text-muted"> · {b.location.name}</span>}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">{date}</p>
                          </div>
                          <span className="material-symbols-outlined text-[16px] text-text-muted shrink-0">chevron_right</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
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
