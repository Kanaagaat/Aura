import { Link } from 'react-router-dom';
import { AuraButton } from '../AuraButton';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryTo?: string;
}

export function EmptyState({
  emoji = '✨',
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  secondaryLabel,
  secondaryTo,
}: EmptyStateProps) {
  return (
    <div className="rounded-[var(--radius-card)] bg-surface-cream border border-border p-8 md:p-10 text-center">
      <span className="text-4xl mb-4 block" aria-hidden>
        {emoji}
      </span>
      <h3 className="font-serif text-xl text-text-main mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed">{description}</p>
      {(actionLabel || secondaryLabel) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          {actionLabel && actionTo && (
            <Link to={actionTo}>
              <AuraButton>{actionLabel}</AuraButton>
            </Link>
          )}
          {actionLabel && onAction && !actionTo && (
            <AuraButton onClick={onAction}>{actionLabel}</AuraButton>
          )}
          {secondaryLabel && secondaryTo && (
            <Link
              to={secondaryTo}
              className="text-sm font-medium text-primary-dark hover:underline"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
