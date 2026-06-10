import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  expiresAt: string;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Expired';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m left`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const tick = () => {
      setLabel(formatRemaining(new Date(expiresAt).getTime() - Date.now()));
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return <span>{label}</span>;
}
