declare global {
  interface Window {
    google: any;
  }
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuraStore } from '../store/useAuraStore';
import { AuraButton } from '../components/AuraButton';

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/home';
  
  const { login, register, googleLogin, isAuthenticated, error, loading } = useAuraStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    display_name: '',
    telegram_username: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // A real Google OAuth client id ends with ".apps.googleusercontent.com".
  // When one is not configured we skip the (broken) GIS button entirely and
  // fall back to the dev bypass, instead of rendering a button that errors.
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const hasGoogleAuth =
    !!googleClientId && googleClientId.endsWith('.apps.googleusercontent.com');

  const handleGoogleCallback = useCallback(
    async (credential: string) => {
      setLocalError(null);
      try {
        await googleLogin(credential);
        navigate(redirectPath);
      } catch (e) {
        setLocalError((e as Error).message);
      }
    },
    [googleLogin, navigate, redirectPath],
  );

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Load Google Identity Services and render the button after the container mounts
  useEffect(() => {
    if (!hasGoogleAuth || !googleClientId) return;

    let cancelled = false;
    const scriptId = 'google-gsi-script';

    const mountGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleBtnRef.current) {
        return;
      }
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: { credential: string }) => {
          void handleGoogleCallback(response.credential);
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        shape: 'pill',
        type: 'standard',
        text: 'continue_with',
      });
    };

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      if (window.google?.accounts?.id) {
        mountGoogleButton();
      } else {
        existing.addEventListener('load', mountGoogleButton);
      }
      return () => {
        cancelled = true;
        existing.removeEventListener('load', mountGoogleButton);
      };
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = mountGoogleButton;
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [hasGoogleAuth, googleClientId, handleGoogleCallback]);

  const handleMockBypass = async () => {
    setLocalError(null);
    const mockUsername = mode === 'register' ? (formData.username || 'sofia_p') : 'sofia_p';
    try {
      await googleLogin(`mock_${mockUsername}`);
      navigate(redirectPath);
    } catch (e) {
      setLocalError((e as Error).message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Simple validation
    if (mode === 'register') {
      if (!formData.username || !formData.email || !formData.password) {
        setLocalError('Please fill in username, email, and password.');
        return;
      }
    } else {
      if (!formData.username || !formData.password) {
        setLocalError('Please fill in username and password.');
        return;
      }
    }

    try {
      if (mode === 'login') {
        await login({ username: formData.username, password: formData.password });
      } else {
        await register(formData);
      }
      navigate(redirectPath);
    } catch (e) {
      setLocalError((e as Error).message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-[28px] border border-[#EEECE8] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-[#1C1C1A]">
        
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl mb-2 text-[#7A9E7E]">Aura</h1>
          <p className="text-[#8A8880] text-sm">
            {mode === 'login' ? 'Find your place. Find your people.' : 'Create your mindful account'}
          </p>
        </div>

        {/* Form Submission Error */}
        {(localError || error) && (
          <div className="mb-6 bg-rose-50 border border-rose-100 rounded-xl p-3 text-sm text-rose-600">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8880] mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g., elena_r"
              className="w-full bg-[#FAFAF7] border border-[#EEECE8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7A9E7E] transition-colors"
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8880] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., elena@example.com"
                  className="w-full bg-[#FAFAF7] border border-[#EEECE8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7A9E7E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8880] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="e.g., Elena R."
                  className="w-full bg-[#FAFAF7] border border-[#EEECE8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7A9E7E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8880] mb-1">
                  Telegram Handle
                </label>
                <input
                  type="text"
                  name="telegram_username"
                  value={formData.telegram_username}
                  onChange={handleChange}
                  placeholder="e.g., elena_aura"
                  className="w-full bg-[#FAFAF7] border border-[#EEECE8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7A9E7E] transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8880] mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-[#FAFAF7] border border-[#EEECE8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7A9E7E] transition-colors"
            />
          </div>

          <AuraButton disabled={loading} className="w-full py-3 mt-2">
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Register'}
          </AuraButton>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-[#EEECE8]" />
          <span className="text-[#8A8880] text-xs px-3 uppercase tracking-wider">or</span>
          <div className="flex-1 border-t border-[#EEECE8]" />
        </div>

        {/* Google OAuth Button (only when a real client id is configured) */}
        {hasGoogleAuth && (
          <div className="flex justify-center mb-4 min-h-[44px]">
            <div ref={googleBtnRef} aria-label="Sign in with Google" />
          </div>
        )}

        {/* Continue with Google — falls back to the mock flow in dev when no
            real OAuth client id is set, so sign-in always works locally. */}
        {!hasGoogleAuth && (
          <button
            type="button"
            onClick={handleMockBypass}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-full border border-[#EEECE8] bg-white py-3 text-sm font-medium text-[#1C1C1A] hover:bg-[#FAFAF7] transition-colors disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>
        )}

        {/* Mock Sign-In Bypass (always available in dev) */}
        <button
          type="button"
          onClick={handleMockBypass}
          className="w-full mt-3 text-center text-xs text-[#8A8880] hover:text-[#7A9E7E] underline cursor-pointer"
        >
          ⚡ Dev Mode Bypass (Simulate Login)
        </button>

        <div className="text-center mt-6 text-sm text-[#8A8880]">
          {mode === 'login' ? (
            <>
              New to Aura?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-[#7A9E7E] font-medium hover:underline focus:outline-none"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-[#7A9E7E] font-medium hover:underline focus:outline-none"
              >
                Sign in
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
