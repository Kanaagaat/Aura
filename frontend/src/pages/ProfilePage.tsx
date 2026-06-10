import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuraStore } from '../store/useAuraStore';
import { BeaconCard } from '../components/BeaconCard';
import { EditProfileModal } from '../components/EditProfileModal';
import type { Beacon } from '../types';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, beacons, fetchProfile, fetchBeacons, logout } = useAuraStore();
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchBeacons();
  }, [fetchProfile, fetchBeacons]);

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
              className="rounded-full border border-border px-4 py-2 text-sm hover:border-primary transition-colors"
            >
              Telegram
            </a>
          )}
          {profile.instagram_handle && (
            <a
              href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-4 py-2 text-sm hover:border-primary transition-colors"
            >
              Instagram
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
          { label: 'Places', value: 12 },
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

      <div className="flex gap-2 mb-6">
        {(['active', 'past'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? 'bg-text-main text-white'
                : 'bg-surface border border-border text-text-muted'
            }`}
          >
            {t} Beacons
          </button>
        ))}
      </div>

      <div className="space-y-4">
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
      </div>

      <EditProfileModal
        open={editing}
        profile={profile}
        onClose={() => setEditing(false)}
      />
    </div>
  );
}
