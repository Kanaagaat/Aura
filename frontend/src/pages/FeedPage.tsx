import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '../store/useAuraStore';
import { LocationImage } from '../components/LocationImage';
import { CountdownTimer } from '../components/CountdownTimer';
import { AvatarStack } from '../components/AvatarStack';
import { CommunityStatsBar } from '../components/CommunityStatsBar';
import { RecentJoinsTicker } from '../components/RecentJoinsTicker';
import type { ActivityType, Beacon } from '../types';

// ─── Daily Digest ────────────────────────────────────────────────────────────

function getDaySlot(hour: number) {
  if (hour >= 6 && hour < 11) return {
    title: 'Rise & Reset.',
    sub: 'Start your morning right.',
    gradient: 'linear-gradient(135deg, #FDDCB5 0%, #F5F1EA 100%)',
  };
  if (hour >= 11 && hour < 14) return {
    title: 'Midday Fuel.',
    sub: 'Recharge and connect.',
    gradient: 'linear-gradient(135deg, #F5F1EA 0%, #FAFAF7 100%)',
  };
  if (hour >= 14 && hour < 18) return {
    title: 'Afternoon Flow.',
    sub: 'Slow down, find your pace.',
    gradient: 'linear-gradient(135deg, #FDF6EC 0%, #F5F1EA 100%)',
  };
  return {
    title: 'Wind Down.',
    sub: 'Good things happening tonight.',
    gradient: 'linear-gradient(135deg, #F5F1EA 0%, #EFF5F0 100%)',
  };
}

function DailyDigestBanner({ beaconCount }: { beaconCount: number }) {
  const slot = getDaySlot(new Date().getHours());
  return (
    <div
      style={{ background: slot.gradient, padding: '28px 20px 24px' }}
    >
      <p style={{ fontSize: 11, letterSpacing: '0.1em', color: '#7A9E7E', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
      <h1
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: 32, fontWeight: 300, color: '#1C1C1A', lineHeight: 1.1, marginBottom: 6,
        }}
      >
        {slot.title}
      </h1>
      <p style={{ fontSize: 14, color: '#8A8880' }}>
        {beaconCount > 0 ? `${beaconCount} active beacon${beaconCount !== 1 ? 's' : ''} right now · ` : ''}{slot.sub}
      </p>
    </div>
  );
}

// ─── Filter tabs ─────────────────────────────────────────────────────────────

type FeedFilter = 'all' | ActivityType | 'female' | 'male';

const BASE_TABS: { id: FeedFilter; label: string }[] = [
  { id: 'all',    label: '✦ All'      },
  { id: 'coffee', label: '☕ Coffee'   },
  { id: 'yoga',   label: '🧘 Yoga'    },
  { id: 'walk',   label: '🚶 Walk'    },
  { id: 'study',  label: '📖 Study'   },
];

const GENDER_TABS: { id: FeedFilter; label: string }[] = [
  { id: 'female', label: '🌸 Women'   },
  { id: 'male',   label: '💙 Men'     },
];

// ─── Feed card ────────────────────────────────────────────────────────────────

const ACTIVITY_EMOJI: Record<string, string> = {
  coffee: '☕', yoga: '🧘', walk: '🚶', study: '📖',
};

function FeedCard({ beacon }: { beacon: Beacon }) {
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
      // Open Telegram deep-link if creator has a handle
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
        {/* Photo */}
        <div className="relative h-40 overflow-hidden">
          <LocationImage
            src={beacon.location.photo_url}
            alt={beacon.location.name}
            category={beacon.location.category}
            className="h-full w-full"
          />
          {/* Activity + visibility badge */}
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
          {/* Countdown */}
          <span className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur text-white text-xs px-2.5 py-1">
            <CountdownTimer expiresAt={beacon.expires_at} />
          </span>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <p className="text-xs text-[#8A8880] mb-1">{beacon.location.name}</p>
          <p
            className="font-serif text-lg leading-tight mb-2"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#1C1C1A' }}
          >
            {beacon.message}
          </p>

          <div className="flex items-center justify-between">
            {/* Creator + vibe word */}
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
              {/* Avatar stack */}
              <AvatarStack users={attendees.slice(0, 3)} size="sm" />
              {beacon.join_count > 0 && (
                <span className="text-xs text-[#8A8880]">{beacon.join_count}</span>
              )}

              {/* Join button */}
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
                  {joined ? '✓ Joined' : joining ? '...' : 'Join ✦'}
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
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <span className="text-5xl mb-4">🕯️</span>
      <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 22, color: '#1C1C1A', marginBottom: 8 }}>
        No beacons right now
      </p>
      <p className="text-sm text-[#8A8880] mb-6 max-w-xs">
        Be the first to light one and invite people to join you.
      </p>
      <Link
        to="/beacon/new"
        className="rounded-full bg-[#1C1C1A] text-white px-6 py-3 text-sm font-semibold"
      >
        Light the first beacon
      </Link>
    </div>
  );
}

// ─── Onboarding hint ─────────────────────────────────────────────────────────

function OnboardingHint({ onDismiss }: { onDismiss: () => void }) {
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
        <span>Tap a beacon to join ✨</span>
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
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const [hintDismissed, setHintDismissed] = useState(
    () => localStorage.getItem('aura_onboarding_hint_dismissed') === '1'
  );

  // Poll for live beacons every 30s
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

  const genderTab = profile?.gender
    ? GENDER_TABS.find((tab) => tab.id === profile.gender)
    : undefined;
  const tabs = [
    ...BASE_TABS,
    ...(genderTab ? [genderTab] : []),
  ];

  const showHint = !hintDismissed && (profile?.beacons_lit ?? 0) === 0 && activeBeacons.length > 0;

  const dismissHint = () => {
    setHintDismissed(true);
    localStorage.setItem('aura_onboarding_hint_dismissed', '1');
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Daily Digest banner */}
      <DailyDigestBanner beaconCount={activeBeacons.length} />

      {/* Community stats + recent joins ticker */}
      <CommunityStatsBar />
      <RecentJoinsTicker />

      {/* Filter tabs */}
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

      {/* Feed */}
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

      {/* Onboarding tooltip */}
      <AnimatePresence>
        {showHint && <OnboardingHint onDismiss={dismissHint} />}
      </AnimatePresence>
    </div>
  );
}
