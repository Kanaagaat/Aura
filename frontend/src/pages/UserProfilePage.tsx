import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuraStore } from '../store/useAuraStore';
import { BeaconCard } from '../components/BeaconCard';
import { InstagramIcon } from '../components/InstagramIcon';
import { TelegramIcon } from '../components/TelegramIcon';
import { api } from '../lib/api';
import type { Beacon, UserProfile } from '../types';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile: myProfile, beacons, fetchBeacons } = useAuraStore();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profileId = Number(id);
  const isOwnProfile = myProfile?.id === profileId;

  useEffect(() => {
    if (!id || Number.isNaN(profileId)) return;
    if (isOwnProfile) {
      navigate('/profile', { replace: true });
      return;
    }
    setError(null);
    api
      .getProfileById(profileId)
      .then(setUser)
      .catch(() => setError('This profile could not be found.'));
  }, [id, profileId, isOwnProfile, navigate]);

  useEffect(() => {
    fetchBeacons();
  }, [fetchBeacons]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="font-serif text-xl mb-2">Profile unavailable</p>
        <p className="text-sm text-text-muted mb-6">{error}</p>
        <Link to="/home" className="rounded-full bg-text-main text-white px-6 py-3 text-sm">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-text-muted">
        Loading profile...
      </div>
    );
  }

  const userBeacons = beacons.filter((b) => b.creator?.id === user.id);
  const active = userBeacons.filter((b) => b.is_active && !b.is_expired);
  const past = userBeacons.filter((b) => !b.is_active || b.is_expired);
  const shown: Beacon[] = [...active, ...past];

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-muted text-sm mb-6 hover:text-text-main"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back
      </button>

      <div className="text-center mb-10">
        <img
          src={user.avatar_url || FALLBACK_AVATAR}
          alt={user.display_name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR;
          }}
          className="h-24 w-24 rounded-full object-cover mx-auto border-4 border-surface shadow-[var(--shadow-soft)]"
        />
        <h1 className="font-serif text-3xl mt-4">{user.display_name}</h1>
        {user.bio && (
          <p className="text-text-muted text-sm mt-2 max-w-sm mx-auto">{user.bio}</p>
        )}

        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          {user.telegram_username && (
            <a
              href={`https://t.me/${user.telegram_username.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white hover:border-[#229ED9] transition-colors"
              aria-label={`Open Telegram profile @${user.telegram_username.replace('@', '')}`}
            >
              <TelegramIcon className="h-5 w-5" />
            </a>
          )}
          {user.instagram_handle && (
            <a
              href={`https://instagram.com/${user.instagram_handle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white hover:border-[#D6249F] transition-colors"
              aria-label={`Open Instagram profile @${user.instagram_handle.replace('@', '')}`}
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="rounded-[var(--radius-card)] bg-surface border border-border p-4 text-center">
          <p className="font-serif text-2xl text-primary-dark">{user.beacons_lit}</p>
          <p className="text-xs text-text-muted mt-1">Beacons Lit</p>
        </div>
        <div className="rounded-[var(--radius-card)] bg-surface border border-border p-4 text-center">
          <p className="font-serif text-2xl text-primary-dark">{active.length}</p>
          <p className="text-xs text-text-muted mt-1">Active Now</p>
        </div>
      </div>

      <h2 className="font-serif text-2xl mb-4">Beacons</h2>
      <div className="space-y-4">
        {shown.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-8">No beacons yet.</p>
        ) : (
          shown.map((b) => <BeaconCard key={b.id} beacon={b} />)
        )}
      </div>
    </div>
  );
}
