import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { UserProfile } from '../types';

interface AvatarStackProps {
  users: UserProfile[];
  max?: number;
  size?: 'sm' | 'md';
  linkToProfile?: boolean;
}

export function AvatarStack({
  users,
  max = 5,
  size = 'md',
  linkToProfile = false,
}: AvatarStackProps) {
  const shown = users.slice(0, max);
  const extra = users.length - max;
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <div className="flex -space-x-2">
      {shown.map((u, i) => {
        const img = (
          <img
            src={u.avatar_url}
            alt={u.display_name}
            title={u.display_name}
            className={clsx(
              dim,
              'rounded-full border-2 border-surface object-cover bg-border',
              'relative',
              linkToProfile && 'hover:ring-2 hover:ring-primary/40 transition-shadow',
            )}
            style={{ zIndex: shown.length - i }}
          />
        );
        return linkToProfile ? (
          <Link key={u.id} to={`/users/${u.id}`} className="relative" style={{ zIndex: shown.length - i }}>
            {img}
          </Link>
        ) : (
          <span key={u.id} className="relative" style={{ zIndex: shown.length - i }}>
            {img}
          </span>
        );
      })}
      {extra > 0 && (
        <div
          className={clsx(
            dim,
            'rounded-full border-2 border-surface bg-primary/20 flex items-center justify-center text-xs font-medium text-primary-dark'
          )}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
