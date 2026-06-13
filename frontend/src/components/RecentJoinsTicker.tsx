import { useEffect, useState } from 'react';
import { client } from '../api/client';
import { useLanguage } from '../i18n';

interface JoinItem {
  user_name: string;
  activity: string;
  location_name: string;
}

const ACTIVITY_EMOJI: Record<string, string> = {
  coffee: '☕', yoga: '🧘', walk: '🚶', study: '📖',
};

export function RecentJoinsTicker() {
  const [items, setItems] = useState<JoinItem[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    client.get('/api/v1/beacons/recent-joins/')
      .then((res) => {
        const data: JoinItem[] = res.data?.data ?? res.data ?? [];
        setItems(data);
      })
      .catch(() => { /* silent */ });
  }, []);

  if (items.length === 0) return null;

  const text = items
    .map((i) => `${i.user_name} ${t('ticker.joined')} ${ACTIVITY_EMOJI[i.activity] ?? '✨'} ${i.activity} ${t('ticker.at')} ${i.location_name}`)
    .join('   ·   ');

  return (
    <div
      className="overflow-hidden py-2 text-xs text-[#8A8880]"
      style={{ borderBottom: '1px solid #EEECE8', background: '#FAFAF7' }}
      aria-hidden
    >
      <div className="marquee-track whitespace-nowrap">
        {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
      </div>
    </div>
  );
}
