// AuriMascot.tsx
// Drop into: src/components/AuriMascot.tsx
//
// Usage:
//   <AuriMascot state="idle" size={64} animate />
//   <AuriMascot state="excited" size={80} pulse message="98% match!" />
//   <AuriMascot state="thinking" message="Finding venues…" />

import React, { useEffect, useState } from "react";

export type MascotState =
  | "idle"
  | "happy"
  | "excited"
  | "thinking"
  | "sleepy"
  | "searching";

interface AuriMascotProps {
  state?: MascotState;
  size?: number;
  animate?: boolean;     // enables floating/bounce animation
  pulse?: boolean;       // purple glow ring (use on match/success states)
  message?: string;      // optional caption below
  className?: string;
  onClick?: () => void;
}

// ─── per-state visual tokens ─────────────────────────────────────────────────

const BODY_COLOR: Record<MascotState, string> = {
  idle:      "#AFA9EC",
  happy:     "#7F77DD",
  excited:   "#534AB7",
  thinking:  "#AFA9EC",
  sleepy:    "#5DCAA5",
  searching: "#85B7EB",
};

const GLOW_COLOR: Record<MascotState, string> = {
  idle:      "#EEEDFE",
  happy:     "#FAECE7",
  excited:   "#AFA9EC",
  thinking:  "#EEEDFE",
  sleepy:    "#E1F5EE",
  searching: "#E6F1FB",
};

// CSS animation class per state
const ANIM_CLASS: Record<MascotState, string> = {
  idle:      "auri-float",
  happy:     "",
  excited:   "auri-bounce",
  thinking:  "auri-float",
  sleepy:    "",
  searching: "auri-float",
};

// ─── SVG face drawing ─────────────────────────────────────────────────────────

function Face({ state, r, cx, cy }: { state: MascotState; r: number; cx: number; cy: number }) {
  const eyeR = r * 0.09;
  const eyeLx = cx - r * 0.28, eyeRx = cx + r * 0.28, eyeY = cy - r * 0.05;

  const blush = (
    <>
      <circle cx={cx - r * 0.42} cy={cy + r * 0.12} r={r * 0.13} fill="#F0997B" opacity={0.5} />
      <circle cx={cx + r * 0.42} cy={cy + r * 0.12} r={r * 0.13} fill="#F0997B" opacity={0.5} />
    </>
  );

  switch (state) {
    case "idle":
      return <>
        <circle cx={eyeLx} cy={eyeY} r={eyeR} fill="#534AB7" />
        <circle cx={eyeRx} cy={eyeY} r={eyeR} fill="#534AB7" />
        <path d={`M${cx - r*0.22} ${cy + r*0.22} Q${cx} ${cy + r*0.38} ${cx + r*0.22} ${cy + r*0.22}`}
          stroke="#534AB7" strokeWidth={r*0.065} fill="none" strokeLinecap="round" />
      </>;

    case "happy":
      return <>
        <circle cx={eyeLx} cy={eyeY} r={eyeR} fill="#534AB7" />
        <circle cx={eyeRx} cy={eyeY} r={eyeR} fill="#534AB7" />
        <path d={`M${cx - r*0.28} ${cy + r*0.18} Q${cx} ${cy + r*0.45} ${cx + r*0.28} ${cy + r*0.18}`}
          stroke="#534AB7" strokeWidth={r*0.07} fill="none" strokeLinecap="round" />
        {blush}
      </>;

    case "excited":
      return <>
        <path d={`M${cx - r*0.38} ${cy - r*0.18} Q${cx - r*0.28} ${cy - r*0.08} ${cx - r*0.18} ${cy - r*0.18}`}
          stroke="#534AB7" strokeWidth={r*0.065} fill="none" strokeLinecap="round" />
        <path d={`M${cx + r*0.18} ${cy - r*0.18} Q${cx + r*0.28} ${cy - r*0.08} ${cx + r*0.38} ${cy - r*0.18}`}
          stroke="#534AB7" strokeWidth={r*0.065} fill="none" strokeLinecap="round" />
        <path d={`M${cx - r*0.3} ${cy + r*0.15} Q${cx} ${cy + r*0.48} ${cx + r*0.3} ${cy + r*0.15}`}
          stroke="#534AB7" strokeWidth={r*0.075} fill="none" strokeLinecap="round" />
        <circle cx={cx - r*0.42} cy={cy + r*0.1} r={r*0.15} fill="#F0997B" opacity={0.6} />
        <circle cx={cx + r*0.42} cy={cy + r*0.1} r={r*0.15} fill="#F0997B" opacity={0.6} />
      </>;

    case "thinking":
      return <>
        <circle cx={eyeLx} cy={eyeY} r={eyeR} fill="#534AB7" />
        <circle cx={eyeRx} cy={eyeY} r={eyeR} fill="#534AB7" />
        <path d={`M${cx - r*0.2} ${cy + r*0.28} Q${cx - r*0.05} ${cy + r*0.2} ${cx + r*0.2} ${cy + r*0.28}`}
          stroke="#534AB7" strokeWidth={r*0.058} fill="none" strokeLinecap="round" />
        {/* thought bubbles */}
        <circle cx={cx + r*0.62} cy={cy - r*0.55} r={r*0.07} fill="#AFA9EC" />
        <circle cx={cx + r*0.72} cy={cy - r*0.72} r={r*0.10} fill="#AFA9EC" />
        <circle cx={cx + r*0.82} cy={cy - r*0.92} r={r*0.14} fill="#AFA9EC" />
      </>;

    case "sleepy":
      return <>
        {/* closed arc eyes */}
        <path d={`M${cx - r*0.38} ${cy - r*0.08} Q${cx - r*0.28} ${cy - r*0.18} ${cx - r*0.18} ${cy - r*0.08}`}
          stroke="#534AB7" strokeWidth={r*0.065} fill="none" strokeLinecap="round" />
        <path d={`M${cx + r*0.18} ${cy - r*0.08} Q${cx + r*0.28} ${cy - r*0.18} ${cx + r*0.38} ${cy - r*0.08}`}
          stroke="#534AB7" strokeWidth={r*0.065} fill="none" strokeLinecap="round" />
        <path d={`M${cx - r*0.2} ${cy + r*0.22} Q${cx} ${cy + r*0.14} ${cx + r*0.2} ${cy + r*0.22}`}
          stroke="#534AB7" strokeWidth={r*0.058} fill="none" strokeLinecap="round" />
      </>;

    case "searching":
      return <>
        <circle cx={eyeLx} cy={eyeY} r={eyeR} fill="#534AB7" />
        {/* bigger right eye = looking sideways */}
        <circle cx={eyeRx} cy={eyeY} r={eyeR * 1.2} fill="#534AB7" />
        <path d={`M${cx - r*0.22} ${cy + r*0.22} Q${cx} ${cy + r*0.38} ${cx + r*0.22} ${cy + r*0.22}`}
          stroke="#534AB7" strokeWidth={r*0.065} fill="none" strokeLinecap="round" />
      </>;
  }
}

// ─── main SVG ────────────────────────────────────────────────────────────────

function MascotSVG({ state, size }: { state: MascotState; size: number }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.42;
  const body = BODY_COLOR[state];
  const glow = GLOW_COLOR[state];
  const gradId = `auriGlow_${state}`;

  const ears = [
    { x: cx - r * 0.65, y: cy - r * 0.72, rot: -20 },
    { x: cx + r * 0.65, y: cy - r * 0.72, rot:  20 },
  ];

  const isExcited = state === "excited";
  const isSleepy = state === "sleepy";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity={1} />
          <stop offset="100%" stopColor={glow} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* glow halo */}
      <circle cx={cx} cy={cy} r={r * 1.1} fill={`url(#${gradId})`} />

      {/* ears */}
      {ears.map((e, i) => (
        <g key={i} transform={`rotate(${e.rot} ${e.x} ${e.y})`}>
          <ellipse cx={e.x} cy={e.y} rx={r * 0.22} ry={r * 0.28} fill={body} />
          <ellipse cx={e.x} cy={e.y} rx={r * 0.12} ry={r * 0.15} fill={glow} />
        </g>
      ))}

      {/* body */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.95} fill={body} />

      {/* belly highlight */}
      <ellipse cx={cx} cy={cy + r * 0.2} rx={r * 0.72} ry={r * 0.55} fill="white" opacity={0.18} />

      {/* face */}
      <Face state={state} r={r} cx={cx} cy={cy} />

      {/* tail */}
      <ellipse
        cx={cx + r * 0.65} cy={cy + r * 0.62}
        rx={r * 0.18} ry={r * 0.13}
        fill={body}
        transform={`rotate(30 ${cx + r * 0.65} ${cy + r * 0.62})`}
      />

      {/* excited sparkles */}
      {isExcited && <>
        <text x={cx - r * 0.8} y={cy - r * 0.8} fontSize={size * 0.18} textAnchor="middle" fill="#AFA9EC">✦</text>
        <text x={cx + r * 0.9} y={cy - r * 0.6} fontSize={size * 0.13} textAnchor="middle" fill="#AFA9EC">✦</text>
      </>}

      {/* sleepy z's */}
      {isSleepy && <>
        <text x={cx + r * 0.7} y={cy - r * 0.5} fontSize={size * 0.16} fill="#5DCAA5" fontWeight={500}>z</text>
        <text x={cx + r * 0.85} y={cy - r * 0.72} fontSize={size * 0.12} fill="#5DCAA5" fontWeight={500}>z</text>
      </>}
    </svg>
  );
}

// ─── component ───────────────────────────────────────────────────────────────

const CSS = `
@keyframes auri-float {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
@keyframes auri-bounce {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}
@keyframes auri-pulse-ring {
  0%   { transform: scale(0.85); opacity: 0.8; }
  100% { transform: scale(1.5);  opacity: 0; }
}
.auri-float  { animation: auri-float  3s ease-in-out infinite; }
.auri-bounce { animation: auri-bounce 0.6s ease-in-out infinite; }
.auri-pulse-ring {
  position: absolute; top: 50%; left: 50%;
  border: 2px solid #AFA9EC; border-radius: 50%;
  animation: auri-pulse-ring 1.5s ease-out infinite;
  pointer-events: none;
}
`;

let styleInjected = false;

export function AuriMascot({
  state = "idle",
  size = 64,
  animate = true,
  pulse = false,
  message,
  className = "",
  onClick,
}: AuriMascotProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!styleInjected) {
      const tag = document.createElement("style");
      tag.textContent = CSS;
      document.head.appendChild(tag);
      styleInjected = true;
    }
    setMounted(true);
  }, []);

  const animClass = animate ? ANIM_CLASS[state] : "";
  const ringSize = size * 1.2;

  return (
    <div
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}
      className={className}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label={`Auri mascot — ${state}`}
    >
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* pulse ring */}
        {pulse && mounted && (
          <div
            className="auri-pulse-ring"
            style={{ width: ringSize, height: ringSize, marginLeft: -ringSize / 2, marginTop: -ringSize / 2 }}
          />
        )}
        {/* mascot */}
        <div className={mounted ? animClass : ""}>
          <MascotSVG state={state} size={size} />
        </div>
      </div>

      {message && (
        <p style={{ fontSize: 13, color: "var(--color-ink-secondary)", textAlign: "center", margin: 0, maxWidth: 180 }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default AuriMascot;
