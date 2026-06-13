import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuriMascot } from '../components/AuriMascot';
import { useAuraStore } from '../store/useAuraStore';
import { useLanguage } from '../i18n';
import type { Gender } from '../types';

type InterestLabelKey =
  | 'interest.coffeeing' | 'interest.walking' | 'interest.yoga'
  | 'interest.reading'   | 'interest.wellness' | 'interest.music'
  | 'interest.art'       | 'interest.matcha'   | 'interest.spa'
  | 'interest.mornings'  | 'interest.active'   | 'interest.mindful';

const INTERESTS: { emoji: string; label: string; labelKey: InterestLabelKey }[] = [
  { emoji: '☕', label: 'Coffeeing', labelKey: 'interest.coffeeing' },
  { emoji: '🚶', label: 'Walking',   labelKey: 'interest.walking'   },
  { emoji: '🧘', label: 'Yoga',      labelKey: 'interest.yoga'      },
  { emoji: '📖', label: 'Reading',   labelKey: 'interest.reading'   },
  { emoji: '🌿', label: 'Wellness',  labelKey: 'interest.wellness'  },
  { emoji: '🎵', label: 'Music',     labelKey: 'interest.music'     },
  { emoji: '🎨', label: 'Art',       labelKey: 'interest.art'       },
  { emoji: '🍵', label: 'Matcha',    labelKey: 'interest.matcha'    },
  { emoji: '✨', label: 'Spa',       labelKey: 'interest.spa'       },
  { emoji: '🌅', label: 'Mornings',  labelKey: 'interest.mornings'  },
  { emoji: '🏃', label: 'Active',    labelKey: 'interest.active'    },
  { emoji: '💆', label: 'Mindful',   labelKey: 'interest.mindful'   },
];

const GENDER_OPTIONS: { value: Gender; labelKey: 'auth.gender.male' | 'auth.gender.female'; symbol: string }[] = [
  { value: 'male', labelKey: 'auth.gender.male', symbol: '♂' },
  { value: 'female', labelKey: 'auth.gender.female', symbol: '♀' },
];

function isProfileComplete(profile: ReturnType<typeof useAuraStore.getState>['profile']): boolean {
  return Boolean(
    profile?.gender &&
      profile.vibe_word &&
      (profile.interests?.length ?? 0) >= 2,
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/feed';
  const { profile, fetchProfile, updateProfile, loading } = useAuraStore();
  const { t } = useLanguage();

  const [gender, setGender] = useState<Gender | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [vibeWord, setVibeWord] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile) return;
    if (isProfileComplete(profile)) {
      navigate(redirectPath, { replace: true });
      return;
    }
    setGender(profile.gender ?? null);
    setInterests(profile.interests ?? []);
    setVibeWord(profile.vibe_word ?? '');
  }, [navigate, profile, redirectPath]);

  const selectedCount = interests.length;
  const canContinue = useMemo(
    () => Boolean(gender && selectedCount >= 2 && vibeWord.trim()),
    [gender, selectedCount, vibeWord],
  );

  const toggleInterest = (label: string) => {
    setInterests((current) => {
      if (current.includes(label)) return current.filter((item) => item !== label);
      if (current.length >= 5) return current;
      return [...current, label];
    });
  };

  const handleSave = async () => {
    if (!gender) { setError(t('onboarding.error.gender')); return; }
    if (interests.length < 2) { setError(t('onboarding.error.interests')); return; }
    if (!vibeWord.trim()) { setError(t('onboarding.error.vibeWord')); return; }

    setSaving(true);
    setError(null);
    try {
      await updateProfile({ gender, interests, vibe_word: vibeWord.trim() });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(t('onboarding.error.save'));
    } finally {
      setSaving(false);
    }
  };

  if (!profile && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF7] px-5 text-sm text-[#8A8880]">
        {t('onboarding.loading')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-5 py-8">
      <motion.main
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center"
      >
        <div className="rounded-[28px] border border-[#EEECE8] bg-white/75 p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <AuriMascot state="happy" size={56} animate message={t('onboarding.mascot.message')} />
            <h1 className="mt-4 font-serif text-3xl font-light text-[#1C1C1A]">
              {t('onboarding.profile.title')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#8A8880]">
              {t('onboarding.profile.subtitle')}
            </p>
          </div>

          <section className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8A8880]">
              {t('onboarding.iam')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {GENDER_OPTIONS.map((option) => {
                const selected = gender === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => { setGender(option.value); setError(null); }}
                    whileTap={{ scale: 0.96 }}
                    className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-colors ${
                      selected
                        ? 'border-[#1C1C1A] bg-[#1C1C1A] text-white'
                        : 'border-[#EEECE8] bg-[#FAFAF7] text-[#1C1C1A]'
                    }`}
                  >
                    <span className="text-4xl leading-none">{option.symbol}</span>
                    <span className="font-serif text-base">{t(option.labelKey)}</span>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8880]">
                {t('onboarding.interests.sectionLabel')}
              </p>
              <span className="text-xs font-medium text-[#8A8880]">{selectedCount}/5</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(({ emoji, label, labelKey }) => {
                const selected = interests.includes(label);
                const disabled = !selected && interests.length >= 5;
                return (
                  <motion.button
                    key={label}
                    type="button"
                    onClick={() => { toggleInterest(label); setError(null); }}
                    whileTap={{ scale: 0.94 }}
                    disabled={disabled}
                    className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                      selected
                        ? 'border-[#1C1C1A] bg-[#1C1C1A] text-white'
                        : 'border-[#EEECE8] bg-[#FAFAF7] text-[#1C1C1A] disabled:text-[#C0BCB6]'
                    }`}
                  >
                    {emoji} {t(labelKey)}
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section>
            <label
              htmlFor="vibe-word"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#8A8880]"
            >
              {t('onboarding.oneWord')}
            </label>
            <input
              id="vibe-word"
              type="text"
              value={vibeWord}
              onChange={(event) => {
                setVibeWord(event.target.value.replace(/\s/g, '').slice(0, 20));
                setError(null);
              }}
              placeholder={t('onboarding.vibeWord.placeholder')}
              className="w-full rounded-2xl border border-[#EEECE8] bg-[#FAFAF7] px-4 py-3 text-center text-lg text-[#1C1C1A] outline-none transition-colors placeholder:text-[#B0ACA4] focus:border-[#7A9E7E]"
            />
            <AnimatePresence>
              {vibeWord && (
                <motion.p
                  key={vibeWord}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 text-center font-serif text-4xl font-light text-[#1C1C1A]"
                >
                  {vibeWord}
                </motion.p>
              )}
            </AnimatePresence>
          </section>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-center text-sm text-rose-600"
            >
              {error}
            </motion.p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!canContinue || saving}
            className="mt-6 w-full rounded-full bg-[#1C1C1A] py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? t('onboarding.saving') : t('onboarding.enter')}
          </button>
        </div>
      </motion.main>
    </div>
  );
}
