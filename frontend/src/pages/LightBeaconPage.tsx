import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuraStore } from '../store/useAuraStore';
import { AuraButton } from '../components/AuraButton';
import { useLanguage } from '../i18n';
import type { ActivityType } from '../types';

const ACTIVITIES: { id: ActivityType; labelKey: 'beaconCreate.activity.coffee' | 'beaconCreate.activity.yoga' | 'beaconCreate.activity.walk' | 'beaconCreate.activity.study'; emoji: string }[] = [
  { id: 'coffee', labelKey: 'beaconCreate.activity.coffee', emoji: '☕' },
  { id: 'yoga',   labelKey: 'beaconCreate.activity.yoga',   emoji: '🧘' },
  { id: 'walk',   labelKey: 'beaconCreate.activity.walk',   emoji: '🚶' },
  { id: 'study',  labelKey: 'beaconCreate.activity.study',  emoji: '📚' },
];

export function LightBeaconPage() {
  const navigate = useNavigate();
  const { locations, createBeacon, fetchLocations } = useAuraStore();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [locationId, setLocationId] = useState<number | null>(null);
  const [activity, setActivity] = useState<ActivityType>('coffee');
  const [message, setMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLocations();
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    setScheduledAt(d.toISOString().slice(0, 16));
  }, [fetchLocations]);

  const filtered = locations.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLoc = locations.find((l) => l.id === locationId);

  const handleSubmit = async () => {
    if (!locationId || !message.trim()) return;
    setSubmitting(true);
    try {
      const beacon = await createBeacon({
        location_id: locationId,
        activity_type: activity,
        message: message.slice(0, 100),
        scheduled_at: new Date(scheduledAt).toISOString(),
      });
      navigate(`/beacon/${beacon.id}`);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <button
        type="button"
        onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
        className="flex items-center gap-2 text-text-muted mb-6"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        {t('lightBeacon.back')}
      </button>

      <h1 className="font-serif text-3xl mb-2">{t('lightBeacon.title')}</h1>
      <p className="text-text-muted text-sm mb-8">
        {t('lightBeacon.step', { step: String(step) })}
      </p>

      {step === 1 && (
        <div>
          <label className="text-sm font-medium block mb-2">{t('lightBeacon.venue.label')}</label>
          <input
            type="search"
            placeholder={t('lightBeacon.search.placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[14px] border border-border bg-surface px-4 py-3 text-sm mb-4 outline-none focus:border-primary"
          />
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filtered.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => { setLocationId(loc.id); setStep(2); }}
                className="w-full flex items-center gap-3 rounded-[var(--radius-card)] border border-border p-3 text-left hover:border-primary/50 transition-colors"
              >
                <img src={loc.photo_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div>
                  <p className="font-serif">{loc.name}</p>
                  <p className="text-xs text-text-muted capitalize">{loc.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selectedLoc && (
        <div>
          <p className="text-sm text-text-muted mb-4">{t('lightBeacon.at', { venue: selectedLoc.name })}</p>
          <label className="text-sm font-medium block mb-2">{t('lightBeacon.vibe.label')}</label>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ACTIVITIES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setActivity(a.id)}
                className={`rounded-[var(--radius-card)] border p-4 text-left transition-colors ${
                  activity === a.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <span className="text-2xl">{a.emoji}</span>
                <p className="text-sm font-medium mt-2">{t(a.labelKey)}</p>
              </button>
            ))}
          </div>
          <label className="text-sm font-medium block mb-2">{t('lightBeacon.message.label')}</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 100))}
            placeholder={t('lightBeacon.message.placeholder')}
            rows={3}
            className="w-full rounded-[14px] border border-border bg-surface px-4 py-3 text-sm mb-1 outline-none focus:border-primary resize-none"
          />
          <p className="text-xs text-text-muted mb-4">{message.length}/100</p>
          <AuraButton className="w-full" onClick={() => setStep(3)} disabled={!message.trim()}>
            {t('lightBeacon.continue')}
          </AuraButton>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="text-sm font-medium block mb-2">{t('lightBeacon.when.label')}</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-[14px] border border-border bg-surface px-4 py-3 text-sm mb-6 outline-none focus:border-primary"
          />
          <div className="rounded-[var(--radius-card)] bg-background border border-border p-4 mb-6">
            <p className="font-serif text-lg">{message}</p>
            <p className="text-sm text-text-muted mt-1">{selectedLoc?.name}</p>
            <p className="text-xs text-text-muted mt-2 capitalize">{activity}</p>
          </div>
          <AuraButton className="w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? t('lightBeacon.submit.loading') : t('lightBeacon.submit')}
          </AuraButton>
        </div>
      )}
    </div>
  );
}
