import clsx from 'clsx';
import type { UserProfile } from '../types';

interface AvatarStackProps {
  users: UserProfile[];
  max?: number;
  size?: 'sm' | 'md';
}

export function AvatarStack({ users, max = 5, size = 'md' }: AvatarStackProps) {
  const shown = users.slice(0, max);
  const extra = users.length - max;
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <div className="flex -space-x-2">
      {shown.map((u, i) => (
        <img
          key={u.id}
          src={u.avatar_url}
          alt={u.display_name}
          title={u.display_name}
          className={clsx(
            dim,
            'rounded-full border-2 border-surface object-cover bg-border',
            'relative'
          )}
          style={{ zIndex: shown.length - i }}
        />
      ))}
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
