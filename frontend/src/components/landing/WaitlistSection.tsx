import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitWaitlist } from '../../lib/waitlist';

const INTERESTS = [
  { emoji: '☕', label: 'Coffee' },
  { emoji: '🧘', label: 'Yoga' },
  { emoji: '✨', label: 'Spa' },
  { emoji: '🚶', label: 'Walks' },
  { emoji: '📖', label: 'Study' },
];

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 14,
  height: 52,
  padding: '0 18px',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  fontFamily: '"DM Sans", system-ui, sans-serif',
  boxSizing: 'border-box',
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function WaitlistSection() {
  const [email, setEmail]       = useState('');
  const [city, setCity]         = useState('Almaty');
  const [telegram, setTelegram] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [emailError, setEmailError] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      const seenKey = `aura_ref_seen_${ref}`;
      if (sessionStorage.getItem(seenKey) === '1') return;
      const key = `aura_refs_${ref}`;
      const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
      localStorage.setItem(key, String(count));
      sessionStorage.setItem(seenKey, '1');
    }
  }, []);

  useEffect(() => {
    if (success) {
      const handle = email.trim().toLowerCase().split('@')[0];
      const count = parseInt(localStorage.getItem(`aura_refs_${handle}`) || '0', 10);
      setReferralCount(count);
    }
  }, [success, email]);

  const referralHandle = email.trim().toLowerCase().split('@')[0];
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/join?ref=${encodeURIComponent(referralHandle)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  const toggleInterest = (label: string) => {
    setInterests(cur => cur.includes(label) ? cur.filter(i => i !== label) : [...cur, label]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) { setEmailError('Email is required.'); return; }
    if (!isValidEmail(normalizedEmail)) { setEmailError('Enter a valid email address.'); return; }

    setLoading(true);
    try {
      await submitWaitlist({
        email: normalizedEmail,
        city: city.trim(),
        telegram: telegram.trim(),
        interests,
        created_at: new Date().toISOString(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" style={{ background: '#1C1C1A', padding: '100px 0 0' }}>
      <div className="mx-auto px-5" style={{ maxWidth: 520 }}>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
              style={{ paddingBottom: 80 }}
            >
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: '#7A9E7E',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', fontSize: 32, color: '#fff',
              }}>
                ✓
              </div>
              <h2 style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: 32, fontWeight: 400, color: '#fff', marginBottom: 12,
              }}>
                You're on the list.
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, fontFamily: '"DM Sans", system-ui, sans-serif', marginBottom: 32 }}>
                We'll reach out on Telegram as soon as we launch in your city.
              </p>

              {/* Referral section */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 16,
                  padding: '20px 20px 16px',
                  textAlign: 'left',
                }}
              >
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: '"DM Sans", system-ui, sans-serif', marginBottom: 4 }}>
                  Skip the line — invite 2 friends
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: '"DM Sans", system-ui, sans-serif', marginBottom: 14 }}>
                  Move up the waitlist when friends join with your link.
                </p>

                {/* Referral link + copy */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <div style={{
                    flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '10px 14px', fontSize: 12,
                    color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {referralLink}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      background: copied ? '#7A9E7E' : 'rgba(255,255,255,0.1)',
                      border: 'none', borderRadius: 10, padding: '0 16px',
                      fontSize: 13, color: '#fff', cursor: 'pointer',
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      transition: 'background 0.2s', whiteSpace: 'nowrap',
                    }}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>

                {/* Progress tracker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4, background: '#7A9E7E',
                      width: `${Math.min(referralCount, 2) * 50}%`,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: '"DM Sans", system-ui, sans-serif', whiteSpace: 'nowrap' }}>
                    {referralCount}/2 referred
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Headline */}
              <h2
                className="text-center"
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: 44, fontWeight: 400, color: '#fff',
                  marginBottom: 14, letterSpacing: '-0.5px',
                }}
              >
                Be first in your city.
              </h2>
              <p
                className="text-center"
                style={{
                  fontSize: 15, color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1.6, marginBottom: 40,
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                }}
              >
                We're launching in Almaty. Join the waitlist and get early access.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Email */}
                <div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                    style={{
                      ...INPUT_STYLE,
                      borderColor: emailError ? '#C4978A' : 'rgba(255,255,255,0.15)',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#7A9E7E'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = emailError ? '#C4978A' : 'rgba(255,255,255,0.15)'; }}
                  />
                  {emailError && (
                    <p style={{ marginTop: 6, fontSize: 12, color: '#C4978A', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
                      {emailError}
                    </p>
                  )}
                </div>

                {/* City */}
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={INPUT_STYLE}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7A9E7E'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                />

                {/* Telegram */}
                <input
                  type="text"
                  placeholder="@yourhandle (optional)"
                  value={telegram}
                  onChange={e => setTelegram(e.target.value)}
                  style={INPUT_STYLE}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7A9E7E'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                />

                {/* Interests */}
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 10, fontFamily: '"DM Sans", system-ui, sans-serif', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Interests
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(({ emoji, label }) => {
                      const selected = interests.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleInterest(label)}
                          style={{
                            borderRadius: 100, padding: '7px 16px', fontSize: 13,
                            fontFamily: '"DM Sans", system-ui, sans-serif',
                            cursor: 'pointer', border: 'none',
                            background: selected ? '#fff' : 'rgba(255,255,255,0.08)',
                            color: selected ? '#1C1C1A' : 'rgba(255,255,255,0.6)',
                            transition: 'background 0.2s, color 0.2s',
                          }}
                        >
                          {emoji} {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generic error */}
                {error && (
                  <p style={{ fontSize: 13, color: '#C4978A', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', background: '#fff', color: '#1C1C1A',
                    border: 'none', borderRadius: 100, height: 52,
                    fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1, marginTop: 4,
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {loading ? 'Joining…' : 'Join the waitlist'}
                </button>

                <p className="text-center" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
                  No spam. Just your early access link when we launch.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer — inside dark section */}
      <footer style={{ marginTop: 80, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '32px 20px 40px' }}>
        <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4" style={{ maxWidth: 520 }}>
          <div className="text-center sm:text-left">
            <span style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 22, fontWeight: 400, color: '#fff' }}>
              aura
            </span>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
              Starting in Almaty · 2025
            </p>
          </div>
          <div className="flex gap-5">
            {['Privacy', 'Contact'].map(link => (
              <button
                key={link}
                type="button"
                style={{ background: 'none', border: 'none', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </section>
  );
}
