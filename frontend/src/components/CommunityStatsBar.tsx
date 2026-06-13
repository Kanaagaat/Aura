import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { useLanguage } from '../i18n';

interface Stats {
  active_beacons: number;
  beacons_today: number;
  total_users: number;
}

export function CommunityStatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const cached = sessionStorage.getItem('aura_stats');
    const cachedAt = Number(sessionStorage.getItem('aura_stats_at') || 0);
    if (cached && Date.now() - cachedAt < 60_000) {
      setStats(JSON.parse(cached));
      return;
    }
    client.get('/api/v1/stats/')
      .then((res) => {
        const data: Stats = res.data?.data ?? res.data;
        setStats(data);
        sessionStorage.setItem('aura_stats', JSON.stringify(data));
        sessionStorage.setItem('aura_stats_at', String(Date.now()));
      })
      .catch(() => { /* silently fail */ });
  }, []);

  if (!stats) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-[#8A8880]"
      style={{ borderBottom: '1px solid #EEECE8', background: '#FAFAF7' }}
    >
      <span>{t('stats.spots')}</span>
      <span className="text-[#D4D0C8]">·</span>
      <span>{t('stats.active', { n: String(stats.total_users) })}</span>
      <span className="text-[#D4D0C8]">·</span>
      <span>{t('stats.today', { n: String(stats.beacons_today) })}</span>
    </div>
  );
}
