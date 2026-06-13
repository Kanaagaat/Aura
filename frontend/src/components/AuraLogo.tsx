interface AuraLogoProps {
  size?: number;
  /** Show the "aura" wordmark next to the mark */
  showText?: boolean;
  /** Light variant — white text and strokes, for dark backgrounds */
  dark?: boolean;
  className?: string;
}

/** The Aura circular venue-pin mark. */
export function AuraMark({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  const bg = dark ? 'rgba(255,255,255,0.12)' : '#EFF5F0';
  const ring = dark ? 'rgba(255,255,255,0.4)' : '#7A9E7E';
  const pin = dark ? '#fff' : '#7A9E7E';
  const hole = dark ? 'rgba(0,0,0,0.3)' : '#FAFAF7';
  const dotted = dark ? 'rgba(255,255,255,0.22)' : '#C4978A';

  return (
    <svg
      width={size}
      height={size}
      viewBox="-60 -60 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="0" cy="0" r="54" fill={bg} />
      <circle cx="0" cy="0" r="42" fill="none" stroke={ring} strokeWidth="1.5" />
      <circle cx="0" cy="-14" r="13" fill={pin} />
      <path d="M-13 -14 Q-13 12 0 30 Q13 12 13 -14 Z" fill={pin} />
      <circle cx="0" cy="-14" r="5" fill={hole} />
      <circle cx="0" cy="0" r="54" fill="none" stroke={dotted} strokeWidth="0.75" strokeDasharray="3 6" />
    </svg>
  );
}

/** Mark + "aura" wordmark, sized together. */
export function AuraLogo({ size = 28, showText = true, dark = false, className }: AuraLogoProps) {
  const textColor = dark ? '#fff' : '#1C1C1A';

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32, userSelect: 'none' }}
    >
      <AuraMark size={size} dark={dark} />
      {showText && (
        <span
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: size * 0.9,
            fontWeight: 600,
            color: textColor,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          aura
        </span>
      )}
    </div>
  );
}
