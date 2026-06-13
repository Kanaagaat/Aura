import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '../store/useAuraStore';
import { LocationImage } from '../components/LocationImage';
import { CountdownTimer } from '../components/CountdownTimer';
import { AvatarStack } from '../components/AvatarStack';
import { CommunityStatsBar } from '../components/CommunityStatsBar';
import { RecentJoinsTicker } from '../components/RecentJoinsTicker';
import { useLanguage } from '../i18n';
import type { ActivityType, Beacon } from '../types';

// ─── Daily Digest ────────────────────────────────────────────────────────────

function getDaySlot(hour: number) {
  if (hour >= 6 && hour < 11) return 'morning' as const;
  if (hour >= 11 && hour < 14) return 'midday' as const;
  if (hour >= 14 && hour < 18) return 'afternoon' as const;
  return 'evening' as const;
}

const SLOT_GRADIENT: Record<string, string> = {
  morning:   'linear-gradient(135deg, #FDDCB5 0%, #F5F1EA 100%)',
  midday:    'linear-gradient(135deg, #F5F1EA 0%, #FAFAF7 100%)',
  afternoon: 'linear-gradient(135deg, #FDF6EC 0%, #F5F1EA 100%)',
  evening:   'linear-gradient(135deg, #F5F1EA 0%, #EFF5F0 100%)',
};

function DailyDigestBanner({ beaconCount }: { beaconCount: number }) {
  const { t, language } = useLanguage();
  const slot = getDaySlot(new Date().getHours());
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  const dateLabel = new Date().toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
  const titleKey = `feed.slot.${slot}.title` as const;
  const subKey   = `feed.slot.${slot}.sub`   as const;

  let beaconLine = '';
  if (beaconCount > 0) {
    const countKey = beaconCount === 1 ? 'feed.beaconCount.singular' : 'feed.beaconCount.plural';
    beaconLine = t(countKey, { n: beaconCount });
  }

  return (
    <div style={{ background: SLOT_GRADIENT[slot], padding: '28px 20px 24px' }}>
      <p style={{ fontSize: 11, letterSpacing: '0.1em', color: '#7A9E7E', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>
        {dateLabel}
      </p>
      <h1
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: 32, fontWeight: 300, color: '#1C1C1A', lineHeight: 1.1, marginBottom: 6,
        }}
      >
        {t(titleKey)}
      </h1>
      <p style={{ fontSize: 14, color: '#8A8880' }}>
        {beaconLine}{t(subKey)}
      </p>
    </div>
  );
}

// ─── Filter tabs ─────────────────────────────────────────────────────────────

type FeedFilter = 'all' | ActivityType | 'female' | 'male';

// ─── Feed card ────────────────────────────────────────────────────────────────

const ACTIVITY_EMOJI: Record<string, string> = {
  coffee: '☕', yoga: '🧘', walk: '🚶', study: '📖',
};

function FeedCard({ beacon }: { beacon: Beacon }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { joinBeacon, profile, isAuthenticated } = useAuraStore();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(() =>
    !!profile && beacon.joins.some((j) => j.user?.id === profile.id)
  );

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/auth'); return; }
    if (joined || joining) return;
    setJoining(true);
    try {
      await joinBeacon(beacon.id, profile?.telegram_username);
      setJoined(true);
      if (beacon.creator.telegram_username) {
        const handle = beacon.creator.telegram_username.replace('@', '');
        const text = encodeURIComponent(`Hey! I'm joining your "${beacon.activity_type}" beacon at ${beacon.location.name} 👋`);
        window.open(`tg://resolve?domain=${handle}&text=${text}`, '_blank');
      }
    } catch { /* ignore — already joined or expired */ }
    setJoining(false);
  };

  const attendees = [beacon.creator, ...beacon.joins.map((j) => j.user)];
  const isCreator = !!profile && beacon.creator?.id === profile.id;

  const joinLabel = joined
    ? t('feed.card.joined')
    : joining
    ? t('feed.card.joining')
    : t('feed.card.join');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={`/beacon/${beacon.id}`}
        className="block rounded-[20px] bg-white border border-[#EEECE8] overflow-hidden active:scale-[0.98] transition-transform"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
      >
        <div className="relative h-40 overflow-hidden">
          <LocationImage
            src={beacon.location.photo_url}
            alt={beacon.location.name}
            category={beacon.location.category}
            className="h-full w-full"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="rounded-full bg-black/70 backdrop-blur text-white text-xs px-2.5 py-1 font-medium">
              {ACTIVITY_EMOJI[beacon.activity_type]} {beacon.activity_type}
            </span>
            {beacon.visibility === 'female' && (
              <span className="rounded-full bg-pink-500/80 backdrop-blur text-white text-xs px-2 py-1">🌸</span>
            )}
            {beacon.visibility === 'male' && (
              <span className="rounded-full bg-blue-500/80 backdrop-blur text-white text-xs px-2 py-1">💙</span>
            )}
          </div>
          <span className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur text-white text-xs px-2.5 py-1">
            <CountdownTimer expiresAt={beacon.expires_at} />
          </span>
        </div>

        <div className="px-4 py-3">
          <p className="text-xs text-[#8A8880] mb-1">{beacon.location.name}</p>
          <p
            className="font-serif text-lg leading-tight mb-2"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#1C1C1A' }}
          >
            {beacon.message}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={beacon.creator.avatar_url}
                alt=""
                className="h-6 w-6 rounded-full object-cover bg-[#EEECE8] shrink-0"
              />
              <span className="text-xs text-[#5A5750] truncate">
                {beacon.creator.display_name}
                {beacon.creator.vibe_word && (
                  <span className="text-[#8A8880]"> · {beacon.creator.vibe_word}</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <AvatarStack users={attendees.slice(0, 3)} size="sm" />
              {beacon.join_count > 0 && (
                <span className="text-xs text-[#8A8880]">{beacon.join_count}</span>
              )}

              {!isCreator && (
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={joining}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    background: joined ? '#EFF5F0' : '#1C1C1A',
                    color: joined ? '#7A9E7E' : '#fff',
                  }}
                >
                  {joinLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyFeed() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <span className="text-5xl mb-4">🕯️</span>
      <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 22, color: '#1C1C1A', marginBottom: 8 }}>
        {t('feed.empty.title')}
      </p>
      <p className="text-sm text-[#8A8880] mb-6 max-w-xs">
        {t('feed.empty.subtitle')}
      </p>
      <Link
        to="/beacon/new"
        className="rounded-full bg-[#1C1C1A] text-white px-6 py-3 text-sm font-semibold"
      >
        {t('feed.empty.cta')}
      </Link>
    </div>
  );
}

// ─── Onboarding hint ─────────────────────────────────────────────────────────

function OnboardingHint({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ delay: 1, duration: 0.4 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
      style={{ width: 'max-content' }}
    >
      <div
        className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg pointer-events-auto"
        style={{ background: '#1C1C1A', color: '#fff' }}
      >
        <span>{t('feed.hint')}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1 text-[#8A8880] hover:text-white"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main FeedPage ────────────────────────────────────────────────────────────

export function FeedPage() {
  const { beacons, fetchBeacons, profile } = useAuraStore();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const [hintDismissed, setHintDismissed] = useState(
    () => localStorage.getItem('aura_onboarding_hint_dismissed') === '1'
  );

  useEffect(() => {
    fetchBeacons();
    const id = setInterval(() => fetchBeacons(), 30_000);
    return () => clearInterval(id);
  }, [fetchBeacons]);

  const activeBeacons = useMemo(() => {
    return beacons.filter((b) => {
      if (!b.is_active || b.is_expired) return false;
      if (!b.visibility || b.visibility === 'all') return true;
      if (profile && b.creator?.id === profile.id) return true;
      return Boolean(profile?.gender && b.visibility === profile.gender);
    });
  }, [beacons, profile]);

  const filtered = useMemo<Beacon[]>(() => {
    if (activeFilter === 'all') return activeBeacons;
    if (activeFilter === 'female' || activeFilter === 'male') {
      return activeBeacons.filter((b) => b.visibility === activeFilter);
    }
    return activeBeacons.filter((b) => b.activity_type === activeFilter);
  }, [activeBeacons, activeFilter]);

  const BASE_TABS: { id: FeedFilter; label: string }[] = [
    { id: 'all',    label: t('feed.filter.all')    },
    { id: 'coffee', label: t('feed.filter.coffee') },
    { id: 'yoga',   label: t('feed.filter.yoga')   },
    { id: 'walk',   label: t('feed.filter.walk')   },
    { id: 'study',  label: t('feed.filter.study')  },
  ];

  const GENDER_TABS: { id: FeedFilter; label: string }[] = [
    { id: 'female', label: t('feed.filter.women') },
    { id: 'male',   label: t('feed.filter.men')   },
  ];

  const genderTab = profile?.gender
    ? GENDER_TABS.find((tab) => tab.id === profile.gender)
    : undefined;
  const tabs = [...BASE_TABS, ...(genderTab ? [genderTab] : [])];

  const showHint = !hintDismissed && (profile?.beacons_lit ?? 0) === 0 && activeBeacons.length > 0;

  const dismissHint = () => {
    setHintDismissed(true);
    localStorage.setItem('aura_onboarding_hint_dismissed', '1');
  };

  return (
    <div className="max-w-lg mx-auto">
      <DailyDigestBanner beaconCount={activeBeacons.length} />
      <CommunityStatsBar />
      <RecentJoinsTicker />

      <div className="overflow-x-auto no-scrollbar px-4 py-3 border-b border-[#EEECE8]">
        <div className="flex gap-2 w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                background: activeFilter === tab.id ? '#1C1C1A' : '#F0EDE8',
                color: activeFilter === tab.id ? '#fff' : '#5A5750',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <EmptyFeed key="empty" />
          ) : (
            <motion.div key="list" className="space-y-3">
              {filtered.map((b) => (
                <FeedCard key={b.id} beacon={b} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showHint && <OnboardingHint onDismiss={dismissHint} />}
      </AnimatePresence>
    </div>
  );
}
