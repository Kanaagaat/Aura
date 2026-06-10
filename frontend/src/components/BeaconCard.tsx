import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { Beacon } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { LocationImage } from './LocationImage';

const ACTIVITY_EMOJI: Record<string, string> = {
  coffee: '☕',
  yoga: '🧘',
  walk: '🚶',
  study: '📚',
};

interface BeaconCardProps {
  beacon: Beacon;
  compact?: boolean;
}

export function BeaconCard({ beacon, compact }: BeaconCardProps) {
  const navigate = useNavigate();
  const expired = beacon.is_expired || !beacon.is_active;
  const expiringSoon =
    !expired &&
    new Date(beacon.expires_at).getTime() - Date.now() < 60 * 60 * 1000;

  return (
    <Link
      to={`/beacon/${beacon.id}`}
      className={clsx(
        'block rounded-[var(--radius-card)] bg-surface border border-border overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]',
        compact ? 'min-w-[260px] shrink-0' : 'w-full',
        expired && 'opacity-60 grayscale'
      )}
    >
      <div className="relative h-32 overflow-hidden">
        <LocationImage
          src={beacon.location.photo_url}
          alt={beacon.location.name}
          category={beacon.location.category}
          className="h-full w-full"
        />
        {beacon.location.is_featured && (
          <span className="absolute top-3 left-3 rounded-full bg-accent-amber/90 px-2 py-0.5 text-xs font-medium text-text-main">
            Featured
          </span>
        )}
        {expiringSoon && !expired && (
          <span className="absolute top-3 right-3 rounded-full bg-text-main/80 px-2 py-0.5 text-xs text-white">
            <CountdownTimer expiresAt={beacon.expires_at} />
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{ACTIVITY_EMOJI[beacon.activity_type] || '✨'}</span>
          <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
            {beacon.activity_type}
          </span>
        </div>
        <p className="font-serif text-lg leading-snug mb-1">{beacon.message}</p>
        <p className="text-sm text-text-muted">{beacon.location.name}</p>
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/users/${beacon.creator.id}`);
            }}
            className="flex items-center gap-2 hover:opacity-80 text-left"
          >
            <img
              src={beacon.creator.avatar_url}
              alt=""
              className="h-6 w-6 rounded-full object-cover bg-border"
            />
            <span className="text-xs text-text-muted">{beacon.creator.display_name}</span>
          </button>
          <span className="text-xs text-primary font-medium">
            {beacon.join_count} joining
          </span>
        </div>
      </div>
    </Link>
  );
}
