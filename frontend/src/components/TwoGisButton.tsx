import { twoGisFirmUrl } from '../lib/media';

interface TwoGisButtonProps {
  twoGisId?: string | null;
  twoGisUrl?: string | null;
  locationName?: string;
  variant?: 'primary' | 'secondary';
}

export function TwoGisButton({
  twoGisId,
  twoGisUrl,
  locationName,
  variant = 'secondary',
}: TwoGisButtonProps) {
  const href = twoGisFirmUrl(twoGisId, twoGisUrl);
  if (!href) return null;

  const styles =
    variant === 'primary'
      ? 'bg-[#1C1C1A] text-white hover:opacity-90'
      : 'bg-white border border-[#EEECE8] text-[#1C1C1A] hover:bg-[#FAFAF7]';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${styles}`}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#2DB24B] text-[10px] font-bold text-white">
        2
      </span>
      Open in 2GIS{locationName ? ` · ${locationName}` : ''}
    </a>
  );
}
