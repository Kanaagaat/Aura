import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuraStore } from '../store/useAuraStore';
import { AuraButton } from '../components/AuraButton';
import { AvatarStack } from '../components/AvatarStack';
import { LocationImage } from '../components/LocationImage';
import { StoryCardModal } from '../components/StoryCardModal';
import { TwoGisButton } from '../components/TwoGisButton';
import { MiniMap } from '../components/MiniMap';
import { Skeleton } from '../components/ui/Skeleton';
import { useToastStore } from '../store/useToastStore';
import { useLanguage } from '../i18n';
import type { Beacon } from '../types';
import { api } from '../lib/api';

function telegramLink(handle: string) {
  const clean = (handle || '').replace('@', '');
  return `https://t.me/${clean}`;
}

export function BeaconDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const joinBeacon = useAuraStore((s) => s.joinBeacon);
  const showToast = useToastStore((s) => s.show);
  const profile = useAuraStore((s) => s.profile);
  const isAuthenticated = useAuraStore((s) => s.isAuthenticated);

  const [beacon, setBeacon] = useState<Beacon | null>(null);
  const [showStory, setShowStory] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [compat, setCompat] = useState<{ score: number | null; explanation: string | null } | null>(null);
  const [compatLoading, setCompatLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoadError(null);
    api
      .getBeacon(Number(id))
      .then((data) => {
        if (!cancelled) setBeacon(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(t('beacon.error.loadFailed'));
      });
    return () => { cancelled = true; };
  }, [id, t]);

  const beaconId = beacon?.id;
  const creatorId = beacon?.creator?.id;
  const profileId = profile?.id;

  useEffect(() => {
    if (!beaconId || !isAuthenticated) return;
    if (creatorId != null && profileId != null && creatorId === profileId) return;
    setCompatLoading(true);
    api.compatibility(beaconId)
      .then((data) => setCompat(data))
      .catch(() => { /* silent fallback */ })
      .finally(() => setCompatLoading(false));
  }, [beaconId, creatorId, isAuthenticated, profileId]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <span className="text-4xl mb-4">🕯️</span>
        <p className="font-serif text-xl text-text-main mb-2">{t('beacon.error.title')}</p>
        <p className="text-sm text-text-muted mb-6">{loadError}</p>
        <Link
          to="/home"
          className="rounded-full bg-text-main text-white px-6 py-3 text-sm font-medium"
        >
          {t('beacon.error.cta')}
        </Link>
      </div>
    );
  }

  if (!beacon) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-text-muted">
        {t('beacon.loading')}
      </div>
    );
  }

  const joins = beacon.joins ?? [];
  const attendees = [beacon.creator, ...joins.map((j) => j.user)];
  const alreadyJoined = !!profile && joins.some((j) => j.user?.id === profile.id);
  const isCreator = !!profile && beacon.creator?.id === profile.id;

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setJoining(true);
    setJoinError(null);
    try {
      await joinBeacon(beacon.id, profile?.telegram_username);
      const updated = await api.getBeacon(beacon.id);
      setBeacon(updated);
      showToast(t('beacon.toast.joined'));
    } catch (e) {
      setJoinError(t('beacon.error.joinFailed'));
    } finally {
      setJoining(false);
    }
  };

  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  const scheduled = new Date(beacon.scheduled_at).toLocaleString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const totalInterested = joins.length + 1;
  const interestedLabel = totalInterested === 1
    ? t('beacon.interested.singular', { n: totalInterested })
    : t('beacon.interested.plural', { n: totalInterested });

  const joinLabel = isCreator
    ? t('beacon.join.creator')
    : alreadyJoined
    ? t('beacon.join.already')
    : joining
    ? t('beacon.join.loading')
    : t('beacon.join.cta');

  return (
    <div className="max-w-2xl mx-auto pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-12">
      <div className="relative h-64 md:h-80">
        {beacon.location && (
          <LocationImage
            src={beacon.location.photo_url}
            alt={beacon.location.name}
            category={beacon.location.category}
            className="h-full w-full"
          />
        )}
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 backdrop-blur"
          aria-label="Back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      <div className="px-5 md:px-8 -mt-8 relative">
        <div className="rounded-[var(--radius-card)] bg-surface border border-border p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-primary font-medium">
              {beacon.activity_type}
            </span>
            {beacon.visibility === 'female' && (
              <span className="text-xs rounded-full bg-pink-50 text-pink-500 px-2 py-0.5">{t('beacon.visibility.women')}</span>
            )}
            {beacon.visibility === 'male' && (
              <span className="text-xs rounded-full bg-blue-50 text-blue-500 px-2 py-0.5">{t('beacon.visibility.men')}</span>
            )}
          </div>
          <h1 className="font-serif text-3xl mt-2 mb-1">{beacon.message}</h1>
          <p className="text-text-muted">{beacon.location?.name}</p>
          <p className="text-sm text-text-muted mt-2">{scheduled}</p>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm font-medium mb-3">{t('beacon.whoComing')}</p>
            {beacon.creator && (
              <Link
                to={`/users/${beacon.creator.id}`}
                className="inline-flex items-center gap-2 text-sm text-primary-dark hover:underline mb-3"
              >
                {t('beacon.hostedBy', { name: beacon.creator.display_name })}
              </Link>
            )}
            <AvatarStack users={attendees} linkToProfile />
            <p className="text-xs text-text-muted mt-2">{interestedLabel}</p>
          </div>

          {isAuthenticated && !isCreator && (
            <div className="mt-4 rounded-xl border border-[#EEECE8] bg-[#FAFAF7] p-3">
              {compatLoading ? (
                <Skeleton className="h-10 w-full rounded-lg" />
              ) : compat ? (
                <div className="flex items-center gap-3">
                  {compat.score !== null && (
                    <div
                      className="shrink-0 flex items-center justify-center rounded-full text-sm font-semibold"
                      style={{
                        width: 44, height: 44,
                        background: compat.score >= 60 ? '#EFF5F0' : compat.score >= 30 ? '#FDF6EC' : '#FFF5F5',
                        color: compat.score >= 60 ? '#5a7a5c' : compat.score >= 30 ? '#D4A96A' : '#C4978A',
                      }}
                    >
                      {compat.score}%
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#1C1C1A]">{t('beacon.vibeMatch')}</p>
                    {compat.explanation && (
                      <p className="text-xs text-[#8A8880] truncate">{compat.explanation}</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {joinError && (
            <p className="mt-4 text-sm text-rose-500">{joinError}</p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            {!isCreator && (
              <AuraButton
                className="w-full"
                onClick={handleJoin}
                disabled={joining || alreadyJoined}
              >
                {joinLabel}
              </AuraButton>
            )}

            {beacon.creator?.telegram_username && (
              <a
                href={telegramLink(beacon.creator.telegram_username)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <AuraButton variant="telegram" className="w-full">
                  <span className="material-symbols-outlined text-lg">send</span>
                  {t('beacon.telegram')}
                </AuraButton>
              </a>
            )}

            <AuraButton
              variant="secondary"
              className="w-full"
              onClick={() => setShowStory(true)}
            >
              {t('beacon.share')}
            </AuraButton>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {beacon.location && (
            <>
              <Link
                to={`/venues/${beacon.location.id}`}
                className="flex items-center justify-between rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3 text-sm font-medium text-primary-dark shadow-[var(--shadow-soft)] hover:border-primary/50"
              >
                <span>{t('beacon.viewVenue')}</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
              <MiniMap
                latitude={beacon.location.latitude}
                longitude={beacon.location.longitude}
                category={beacon.location.category}
              />
            </>
          )}
          {beacon.location && (
            <TwoGisButton
              twoGisId={beacon.location.two_gis_id}
              twoGisUrl={beacon.location.two_gis_url}
              locationName={beacon.location.name}
              variant="primary"
            />
          )}
        </div>
      </div>

      {showStory && (
        <StoryCardModal beacon={beacon} onClose={() => setShowStory(false)} />
      )}
    </div>
  );
}
