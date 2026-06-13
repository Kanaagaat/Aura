import clsx from 'clsx';
import type { Category } from '../types';
import { useLanguage } from '../i18n';

type FilterKey = 'map.filter.all' | 'map.filter.yoga' | 'map.filter.coffee' | 'map.filter.spa' | 'map.filter.other';
const FILTERS: { id: Category; labelKey: FilterKey }[] = [
  { id: 'all',    labelKey: 'map.filter.all'    },
  { id: 'yoga',   labelKey: 'map.filter.yoga'   },
  { id: 'coffee', labelKey: 'map.filter.coffee' },
  { id: 'spa',    labelKey: 'map.filter.spa'    },
  { id: 'other',  labelKey: 'map.filter.other'  },
];

interface FilterChipsProps {
  active: Category;
  onChange: (c: Category) => void;
}

export function FilterChips({ active, onChange }: FilterChipsProps) {
  const { t } = useLanguage();
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {FILTERS.map(({ id, labelKey }) => (
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
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}
