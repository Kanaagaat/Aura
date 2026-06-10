import clsx from 'clsx';
import type { Category } from '../types';

const FILTERS: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'spa', label: 'Spa' },
  { id: 'other', label: 'More' },
];

interface FilterChipsProps {
  active: Category;
  onChange: (c: Category) => void;
}

export function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {FILTERS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={clsx(
            'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            active === id
              ? 'bg-primary text-white'
              : 'bg-surface text-text-muted border border-border hover:border-primary/40'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
