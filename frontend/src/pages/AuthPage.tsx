declare global {
  interface Window {
    google: any;
  }
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuraStore } from '../store/useAuraStore';
import { AuraButton } from '../components/AuraButton';

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  
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

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Load Google Identity Services Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1084282309590-dummy.apps.googleusercontent.com',
          callback: (response: any) => {
            handleGoogleCallback(response.credential);
          },
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'outline', size: 'large', width: 320, shape: 'pill' }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleCallback = async (credential: string) => {
    setLocalError(null);
    try {
      await googleLogin(credential);
      navigate(redirectPath);
    } catch (e) {
      setLocalError((e as Error).message);
    }
  };

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

        {/* Google OAuth Button */}
        <div className="flex justify-center mb-4">
          <div id="google-signin-btn"></div>
        </div>

        {/* Mock Sign-In Bypass for local development */}
        <button
          onClick={handleMockBypass}
          className="w-full text-center text-xs text-[#8A8880] hover:text-[#7A9E7E] underline cursor-pointer"
        >
          ⚡ Dev Mode Bypass (Simulate Google Login)
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
