declare global {
  interface Window { google: { accounts: { id: { initialize: (cfg: Record<string, unknown>) => void; renderButton: (el: HTMLElement, cfg: Record<string, unknown>) => void } } } | undefined; }
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '../store/useAuraStore';
import { AuriMascot } from '../components/AuriMascot';
import type { MascotState as _MS } from '../components/AuriMascot';
import type { Gender } from '../types';

// ─── constants ────────────────────────────────────────────────────────────────

const INTERESTS = [
  { emoji: '☕', label: 'Coffeeing' },
  { emoji: '🚶', label: 'Walking' },
  { emoji: '🧘', label: 'Yoga' },
  { emoji: '📖', label: 'Reading' },
  { emoji: '🌿', label: 'Wellness' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '🎨', label: 'Art' },
  { emoji: '🍵', label: 'Matcha' },
  { emoji: '✨', label: 'Spa' },
  { emoji: '🌅', label: 'Mornings' },
  { emoji: '🏃', label: 'Active' },
  { emoji: '💆', label: 'Mindful' },
];

const PLACEHOLDER_WORDS = ['calm', 'curious', 'present', 'vibrant', 'serene', 'bold', 'gentle'];

const MASCOT_STATE: Record<number, _MS> = {
  0: 'idle',
  1: 'thinking',
  2: 'happy',
  3: 'excited',
};

const MASCOT_MSG: Record<number, string> = {
  0: 'Welcome to Aura ✨',
  1: 'Nice to meet you...',
  2: 'Great taste!',
  3: 'Almost done...',
};

// ─── error message normaliser ────────────────────────────────────────────────

function friendlyAuthError(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes('no active account') || s.includes('invalid credentials') || s.includes('wrong password') || s.includes('incorrect')) {
    return 'Username or password is incorrect.';
  }
  if (s.includes('username is already taken') || s.includes('a user with that username')) {
    return 'That username is already taken. Try a different one.';
  }
  if (s.includes('email is already registered') || s.includes('already exists')) {
    return 'That email is already registered. Try signing in instead.';
  }
  if (s.includes('password') && (s.includes('short') || s.includes('least'))) {
    return 'Password must be at least 6 characters.';
  }
  if (s.includes('enter a valid email')) {
    return 'Please enter a valid email address.';
  }
  if (s.includes('this field') && s.includes('required')) {
    return 'Please fill in all required fields.';
  }
  return raw;
}

// ─── slide variants ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
};

const transition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

// ─── input style helper ───────────────────────────────────────────────────────

const inputCls =
  'w-full bg-[#FAFAF7] border border-[#EEECE8] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#7A9E7E] transition-colors placeholder:text-[#B0ACA4]';

// ─── Step 0: basic info ───────────────────────────────────────────────────────

function StepBasicInfo({
  formData,
  onChange,
  localError,
}: {
  formData: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  localError: string | null;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8880] mb-1">Username</p>
        <input type="text" name="username" value={formData.username} onChange={onChange}
          placeholder="e.g., sofia_p" className={inputCls} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8880] mb-1">Display name</p>
        <input type="text" name="display_name" value={formData.display_name} onChange={onChange}
          placeholder="e.g., Sofia P." className={inputCls} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8880] mb-1">Email</p>
        <input type="email" name="email" value={formData.email} onChange={onChange}
          placeholder="e.g., sofia@example.com" className={inputCls} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8880] mb-1">Telegram handle</p>
        <input type="text" name="telegram_username" value={formData.telegram_username} onChange={onChange}
          placeholder="@yourhandle" className={inputCls} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8880] mb-1">Password</p>
        <input type="password" name="password" value={formData.password} onChange={onChange}
          placeholder="••••••••" className={inputCls} />
      </div>
      <AnimatePresence>
        {localError && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2.5">
              <span className="text-rose-400 text-base shrink-0">⚠</span>
              <p className="text-sm text-rose-600">{localError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step 1: gender ───────────────────────────────────────────────────────────

function StepGender({ value, onChange }: { value: Gender | null; onChange: (g: Gender) => void }) {
  const options: { g: Gender; symbol: string; label: string }[] = [
    { g: 'male',   symbol: '♂', label: 'Male'   },
    { g: 'female', symbol: '♀', label: 'Female' },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 28, fontWeight: 300, color: '#1C1C1A', marginBottom: 8 }}>
        Who are you?
      </h2>
      <p className="text-sm text-[#8A8880] mb-6">We use this to personalise your experience.</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map(({ g, symbol, label }) => {
          const selected = value === g;
          return (
            <motion.button
              key={g}
              type="button"
              onClick={() => onChange(g)}
              whileTap={{ scale: 0.96 }}
              animate={selected ? { scale: 1.02 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-8 transition-colors"
              style={{
                borderColor: selected ? '#1C1C1A' : '#EEECE8',
                background: selected ? '#1C1C1A' : '#FAFAF7',
                color: selected ? '#fff' : '#1C1C1A',
              }}
            >
              <span style={{ fontSize: 40, lineHeight: 1 }}>{symbol}</span>
              <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 16 }}>{label}</span>
              {selected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#7A9E7E',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#fff',
                  }}
                >
                  ✓
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: interests ────────────────────────────────────────────────────────

function StepInterests({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter(l => l !== label));
    } else if (selected.length < 5) {
      onChange([...selected, label]);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 28, fontWeight: 300, color: '#1C1C1A', marginBottom: 8 }}>
        What&apos;s your vibe?
      </h2>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[#8A8880]">Pick 2–5 things you love.</p>
        <span className="text-xs font-medium text-[#8A8880]">{selected.length}/5</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map(({ emoji, label }) => {
          const active = selected.includes(label);
          const maxed = !active && selected.length >= 5;
          return (
            <motion.button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              whileTap={{ scale: 0.94 }}
              disabled={maxed}
              className="rounded-full border px-3 py-2 text-sm transition-colors"
              style={{
                borderColor: active ? '#1C1C1A' : '#EEECE8',
                background: active ? '#1C1C1A' : '#FAFAF7',
                color: active ? '#fff' : maxed ? '#C0BCB6' : '#1C1C1A',
                cursor: maxed ? 'not-allowed' : 'pointer',
              }}
            >
              {emoji} {label}
            </motion.button>
          );
        })}
      </div>
      {selected.length < 2 && (
        <p className="mt-4 text-xs text-[#8A8880]">Select at least 2 to continue.</p>
      )}
    </div>
  );
}

// ─── Step 3: vibe word ────────────────────────────────────────────────────────

function StepVibeWord({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [phIdx, setPhIdx] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDER_WORDS.length), 1800);
    return () => clearInterval(id);
  }, []);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 28, fontWeight: 300, color: '#1C1C1A', marginBottom: 8 }}>
        In one word...
      </h2>
      <p className="text-sm text-[#8A8880] mb-6">How would you describe yourself?</p>

      <motion.div
        animate={shake ? { x: [-5, 5, -5, 5, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <input
          type="text"
          value={value}
          onChange={e => {
            const v = e.target.value.replace(/\s/g, '');
            if (v.length <= 20) onChange(v);
          }}
          onKeyDown={handleKey}
          placeholder={PLACEHOLDER_WORDS[phIdx]}
          className={inputCls + ' text-center text-lg tracking-wide'}
          style={{ letterSpacing: '0.04em' }}
          autoFocus
        />
      </motion.div>

      {/* Large preview */}
      <AnimatePresence mode="wait">
        {value.length > 0 && (
          <motion.p
            key={value}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center mt-6"
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 48, fontWeight: 300, color: '#1C1C1A',
              lineHeight: 1, letterSpacing: '-0.5px',
            }}
          >
            {value}
          </motion.p>
        )}
      </AnimatePresence>

      {value.length === 0 && (
        <p className="text-center mt-4 text-xs text-[#B0ACA4]">No spaces — one word only.</p>
      )}
    </div>
  );
}

// ─── progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === step ? 20 : 6,
            background: i <= step ? '#7A9E7E' : '#EEECE8',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{ height: 6, borderRadius: 100 }}
        />
      ))}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/feed';

  const { login, register, googleLogin, isAuthenticated, profile, error, loading } = useAuraStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registerStep, setRegisterStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', display_name: '', telegram_username: '',
  });
  const [gender, setGender] = useState<Gender | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [vibeWord, setVibeWord] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const hasGoogleAuth = !!googleClientId && googleClientId.endsWith('.apps.googleusercontent.com');

  const handleGoogleCallback = useCallback(async (credential: string) => {
    setLocalError(null);
    try {
      await googleLogin(credential);
    } catch (e) { setLocalError(friendlyAuthError((e as Error).message)); }
  }, [googleLogin]);

  useEffect(() => {
    if (!isAuthenticated || !profile) return;
    const needsProfile = !profile.gender || !profile.vibe_word || (profile.interests?.length ?? 0) < 2;
    if (needsProfile) {
      navigate(`/onboarding?redirect=${encodeURIComponent(redirectPath)}`, { replace: true });
      return;
    }
    navigate(redirectPath, { replace: true });
  }, [isAuthenticated, navigate, profile, redirectPath]);

  useEffect(() => {
    if (!hasGoogleAuth || !googleClientId || mode !== 'login') return;
    let cancelled = false;
    const scriptId = 'google-gsi-script';
    const mount = () => {
      if (cancelled || !window.google?.accounts?.id || !googleBtnRef.current) return;
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.initialize({ client_id: googleClientId, callback: (r: { credential: string }) => void handleGoogleCallback(r.credential) });
      window.google.accounts.id.renderButton(googleBtnRef.current, { theme: 'outline', size: 'large', width: 320, shape: 'pill', type: 'standard', text: 'continue_with' });
    };
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      if (window.google?.accounts?.id) { mount(); } else { existing.addEventListener('load', mount); }
      return () => { cancelled = true; existing.removeEventListener('load', mount); };
    }
    const script = document.createElement('script');
    script.id = scriptId; script.src = 'https://accounts.google.com/gsi/client'; script.async = true; script.defer = true; script.onload = mount;
    document.head.appendChild(script);
    return () => { cancelled = true; };
  }, [hasGoogleAuth, googleClientId, handleGoogleCallback, mode]);

  const handleMockBypass = async () => {
    setLocalError(null);
    try {
      await googleLogin(`mock_${formData.username || 'sofia_p'}`);
    } catch (e) { setLocalError(friendlyAuthError((e as Error).message)); }
  };

  // ── login submit ──
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!formData.username || !formData.password) { setLocalError('Fill in username and password.'); return; }
    try {
      await login({ username: formData.username, password: formData.password });
    } catch (e) { setLocalError(friendlyAuthError((e as Error).message)); }
  };

  // ── register step navigation ──
  const goNext = () => {
    if (registerStep === 0) {
      if (!formData.username || !formData.email || !formData.password) { setLocalError('Fill in username, email and password.'); return; }
      if (formData.password.length < 6) { setLocalError('Password must be at least 6 characters.'); return; }
      setLocalError(null);
    }
    if (registerStep === 1 && !gender) { setLocalError('Please choose a gender.'); return; }
    if (registerStep === 2 && interests.length < 2) { setLocalError('Pick at least 2 interests.'); return; }
    setLocalError(null);
    setDirection(1);
    setRegisterStep(s => s + 1);
  };

  const goBack = () => {
    setLocalError(null);
    setDirection(-1);
    setRegisterStep(s => s - 1);
  };

  // ── register final submit ──
  const handleRegisterSubmit = async () => {
    if (!vibeWord.trim()) { setLocalError('Type one word to describe yourself.'); return; }
    setLocalError(null);
    try {
      await register({ ...formData, gender: gender ?? undefined, interests, vibe_word: vibeWord.trim() });
    } catch (e) { setLocalError(friendlyAuthError((e as Error).message)); }
  };

  const TOTAL_STEPS = 4;

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4 py-8">
      <div className="w-full max-w-md">
        {/* ── Login mode ── */}
        {mode === 'login' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="bg-white/70 backdrop-blur-md rounded-[28px] border border-[#EEECE8] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
          >
            <div className="flex flex-col items-center mb-8">
              <AuriMascot state="idle" size={56} animate />
              <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 36, fontWeight: 300, color: '#7A9E7E', marginTop: 12, marginBottom: 4 }}>
                aura
              </h1>
              <p className="text-[#8A8880] text-sm">Find your place. Find your people.</p>
            </div>

            <AnimatePresence>
              {(localError || error) && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                    <span className="text-rose-400 text-base shrink-0">⚠</span>
                    <p className="text-sm text-rose-600">{localError || error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <input type="text" name="username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="Username" className={inputCls} />
              <input type="password" name="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password" className={inputCls} />
              <button type="submit" disabled={loading}
                className="w-full rounded-full bg-[#1C1C1A] py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-[#EEECE8]" />
              <span className="text-[#8A8880] text-xs px-3 uppercase tracking-wider">or</span>
              <div className="flex-1 border-t border-[#EEECE8]" />
            </div>

            {hasGoogleAuth ? (
              <div className="flex justify-center mb-3 min-h-[44px]"><div ref={googleBtnRef} /></div>
            ) : (
              <button type="button" onClick={handleMockBypass} disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-full border border-[#EEECE8] bg-white py-3 text-sm font-medium text-[#1C1C1A] hover:bg-[#FAFAF7] transition-colors disabled:opacity-60">
                <GoogleIcon />
                Continue with Google
              </button>
            )}

            <button type="button" onClick={handleMockBypass}
              className="w-full mt-3 text-center text-xs text-[#8A8880] hover:text-[#7A9E7E] underline">
              ⚡ Dev Mode Bypass
            </button>

            <p className="text-center mt-5 text-sm text-[#8A8880]">
              New to Aura?{' '}
              <button onClick={() => { setMode('register'); setRegisterStep(0); setLocalError(null); }}
                className="text-[#7A9E7E] font-medium hover:underline">
                Create an account
              </button>
            </p>
          </motion.div>
        )}

        {/* ── Register multi-step ── */}
        {mode === 'register' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="bg-white/70 backdrop-blur-md rounded-[28px] border border-[#EEECE8] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
          >
            {/* Mascot + progress */}
            <div className="flex flex-col items-center mb-4">
              <AuriMascot
                state={MASCOT_STATE[registerStep]}
                size={52}
                animate
                message={MASCOT_MSG[registerStep]}
                pulse={registerStep === 3}
              />
            </div>
            <ProgressDots step={registerStep} total={TOTAL_STEPS} />

            {/* Step content */}
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={registerStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
              >
                {registerStep === 0 && (
                  <StepBasicInfo formData={formData} onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} localError={localError} />
                )}
                {registerStep === 1 && (
                  <StepGender value={gender} onChange={g => { setGender(g); setLocalError(null); }} />
                )}
                {registerStep === 2 && (
                  <StepInterests selected={interests} onChange={v => { setInterests(v); setLocalError(null); }} />
                )}
                {registerStep === 3 && (
                  <StepVibeWord value={vibeWord} onChange={setVibeWord} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Error display for steps 1–3 (step 0 shows inline inside StepBasicInfo) */}
            <AnimatePresence>
              {localError && registerStep > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2.5">
                    <span className="text-rose-400 text-base shrink-0">⚠</span>
                    <p className="text-sm text-rose-600">{localError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {registerStep > 0 && (
                <button type="button" onClick={goBack}
                  className="flex-none rounded-full border border-[#EEECE8] px-5 py-3 text-sm text-[#8A8880] hover:border-[#1C1C1A] hover:text-[#1C1C1A] transition-colors">
                  ←
                </button>
              )}
              {registerStep < TOTAL_STEPS - 1 ? (
                <button type="button" onClick={goNext}
                  className="flex-1 rounded-full bg-[#1C1C1A] py-3 text-sm font-semibold text-white transition active:scale-[0.98]">
                  Continue
                </button>
              ) : (
                <button type="button" onClick={handleRegisterSubmit} disabled={loading}
                  className="flex-1 rounded-full bg-[#7A9E7E] py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60">
                  {loading ? 'Creating account...' : 'Join Aura 🌿'}
                </button>
              )}
            </div>

            <p className="text-center mt-4 text-sm text-[#8A8880]">
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setLocalError(null); }}
                className="text-[#7A9E7E] font-medium hover:underline">
                Sign in
              </button>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
