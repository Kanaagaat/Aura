import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuraStore } from '../store/useAuraStore';
import { AuraButton } from '../components/AuraButton';
import { AvatarStack } from '../components/AvatarStack';
import { StoryCardModal } from '../components/StoryCardModal';
import type { Beacon } from '../types';
import { api } from '../lib/api';

function telegramLink(handle: string) {
  const clean = handle.replace('@', '');
  return `https://t.me/${clean}`;
}

export function BeaconDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { joinBeacon, profile } = useAuraStore();
  const [beacon, setBeacon] = useState<Beacon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStory, setShowStory] = useState(false);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError('No beacon ID provided');
      return;
    }
    setLoading(true);
    setError(null);
    api
      .getBeacon(Number(id))
      .then((b) => {
        setBeacon(b);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load beacon:', err);
        setError('Failed to load beacon. Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-text-muted">
        Loading...
      </div>
    );
  }

  if (error || !beacon) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-text-muted mb-4">{error || 'Beacon not found'}</p>
          <p className="text-sm text-text-muted">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  const attendees = [beacon.creator, ...beacon.joins.map((j) => j.user)];

  const isAuthenticated = useAuraStore((s) => s.isAuthenticated);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setJoining(true);
    try {
      await joinBeacon(beacon.id, profile?.telegram_username);
      const updated = await api.getBeacon(beacon.id);
      setBeacon(updated);
    } catch (err) {
      console.error('Failed to join beacon:', err);
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

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="relative h-64 md:h-80">
        <img
          src={beacon.location.photo_url}
          alt={beacon.location.name}
          className="h-full w-full object-cover"
        />
        <Link
          to="/"
          className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 backdrop-blur hover:bg-surface transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
      </div>

      <div className="px-5 md:px-8 -mt-8 relative">
        <div className="rounded-[var(--radius-card)] bg-surface border border-border p-6 shadow-[var(--shadow-soft)]">
          <span className="text-xs uppercase tracking-wider text-primary font-medium">
            {beacon.activity_type}
          </span>
          <h1 className="font-serif text-3xl mt-2 mb-1">{beacon.message}</h1>
          <p className="text-text-muted">{beacon.location.name}</p>
          <p className="text-sm text-text-muted mt-2">{scheduled}</p>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm font-medium mb-3">Who's coming</p>
            <AvatarStack users={attendees} />
            <p className="text-xs text-text-muted mt-2">
              {beacon.join_count + 1} people interested
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
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
            <AuraButton
              variant="secondary"
              className="w-full"
              onClick={handleJoin}
              disabled={joining}
            >
              {joining ? 'Joining...' : "I'm in"}
            </AuraButton>
            <AuraButton
              variant="secondary"
              className="w-full"
              onClick={() => setShowStory(true)}
            >
              Share to Stories
            </AuraButton>
          </div>
        </div>

        {/* Mini map placeholder */}
        <div className="mt-6 rounded-[var(--radius-card)] overflow-hidden border border-border h-40 bg-[#F5F3EF] flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-primary text-3xl">
              location_on
            </span>
            <p className="text-sm text-text-muted mt-1">{beacon.location.address}</p>
          </div>
        </div>
      </div>

      {showStory && <StoryCardModal beacon={beacon} onClose={() => setShowStory(false)} />}
    </div>
  );
}
