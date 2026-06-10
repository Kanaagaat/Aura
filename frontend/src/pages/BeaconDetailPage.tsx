import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuraStore } from '../store/useAuraStore';
import { AuraButton } from '../components/AuraButton';
import { AvatarStack } from '../components/AvatarStack';
import { LocationImage } from '../components/LocationImage';
import { StoryCardModal } from '../components/StoryCardModal';
import { TwoGisButton } from '../components/TwoGisButton';
import type { Beacon } from '../types';
import { api } from '../lib/api';

function telegramLink(handle: string) {
  const clean = (handle || '').replace('@', '');
  return `https://t.me/${clean}`;
}

export function BeaconDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // All hooks are declared unconditionally, before any early return, to keep
  // a stable hook order across renders (previously this crashed the page).
  const joinBeacon = useAuraStore((s) => s.joinBeacon);
  const profile = useAuraStore((s) => s.profile);
  const isAuthenticated = useAuraStore((s) => s.isAuthenticated);

  const [beacon, setBeacon] = useState<Beacon | null>(null);
  const [showStory, setShowStory] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoadError(null);
    api
      .getBeacon(Number(id))
      .then((data) => {
        if (!cancelled) setBeacon(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError('This beacon could not be found or has ended.');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <span className="text-4xl mb-4">🕯️</span>
        <p className="font-serif text-xl text-text-main mb-2">Beacon unavailable</p>
        <p className="text-sm text-text-muted mb-6">{loadError}</p>
        <Link
          to="/home"
          className="rounded-full bg-text-main text-white px-6 py-3 text-sm font-medium"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (!beacon) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-text-muted">
        Loading...
      </div>
    );
  }

  const joins = beacon.joins ?? [];
  const attendees = [beacon.creator, ...joins.map((j) => j.user)];
  const alreadyJoined =
    !!profile && joins.some((j) => j.user?.id === profile.id);
  const isCreator = !!profile && beacon.creator?.id === profile.id;

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setJoining(true);
    setJoinError(null);
    try {
      await joinBeacon(beacon.id, profile?.telegram_username);
      const updated = await api.getBeacon(beacon.id);
      setBeacon(updated);
    } catch (e) {
      setJoinError((e as Error).message || 'Could not join this beacon.');
    } finally {
      setJoining(false);
    }
  };

  const scheduled = new Date(beacon.scheduled_at).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const joinLabel = isCreator
    ? "You lit this beacon"
    : alreadyJoined
    ? "✓ You're in"
    : joining
    ? 'Joining...'
    : "I'm in";

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="relative h-64 md:h-80">
        {beacon.location && (
          <LocationImage
            src={beacon.location.photo_url}
            alt={beacon.location.name}
            category={beacon.location.category}
            className="h-full w-full"
          />
        )}
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 backdrop-blur"
          aria-label="Back to home"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      <div className="px-5 md:px-8 -mt-8 relative">
        <div className="rounded-[var(--radius-card)] bg-surface border border-border p-6 shadow-[var(--shadow-soft)]">
          <span className="text-xs uppercase tracking-wider text-primary font-medium">
            {beacon.activity_type}
          </span>
          <h1 className="font-serif text-3xl mt-2 mb-1">{beacon.message}</h1>
          <p className="text-text-muted">{beacon.location?.name}</p>
          <p className="text-sm text-text-muted mt-2">{scheduled}</p>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm font-medium mb-3">Who&apos;s coming</p>
            {beacon.creator && (
              <Link
                to={`/users/${beacon.creator.id}`}
                className="inline-flex items-center gap-2 text-sm text-primary-dark hover:underline mb-3"
              >
                Hosted by {beacon.creator.display_name}
              </Link>
            )}
            <AvatarStack users={attendees} linkToProfile />
            <p className="text-xs text-text-muted mt-2">
              {joins.length + 1} {joins.length + 1 === 1 ? 'person' : 'people'} interested
            </p>
          </div>

          {joinError && (
            <p className="mt-4 text-sm text-rose-500">{joinError}</p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            {!isCreator && (
              <AuraButton
                className="w-full"
                onClick={handleJoin}
                disabled={joining || alreadyJoined}
              >
                {joinLabel}
              </AuraButton>
            )}

            {beacon.creator?.telegram_username && (
              <a
                href={telegramLink(beacon.creator.telegram_username)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <AuraButton variant="telegram" className="w-full">
                  <span className="material-symbols-outlined text-lg">send</span>
                  Link Up on Telegram
                </AuraButton>
              </a>
            )}

            <AuraButton
              variant="secondary"
              className="w-full"
              onClick={() => setShowStory(true)}
            >
              Share to Stories
            </AuraButton>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="rounded-[var(--radius-card)] overflow-hidden border border-border h-40 bg-[#F5F3EF] flex items-center justify-center">
            <div className="text-center px-4">
              <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
              <p className="text-sm text-text-muted mt-1">{beacon.location?.address}</p>
            </div>
          </div>
          {beacon.location && (
            <TwoGisButton
              twoGisId={beacon.location.two_gis_id}
              twoGisUrl={beacon.location.two_gis_url}
              locationName={beacon.location.name}
              variant="primary"
            />
          )}
        </div>
      </div>

      {showStory && (
        <StoryCardModal beacon={beacon} onClose={() => setShowStory(false)} />
      )}
    </div>
  );
}
