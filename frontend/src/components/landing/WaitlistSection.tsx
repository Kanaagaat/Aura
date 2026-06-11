// frontend/src/components/landing/WaitlistSection.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';

import { submitWaitlist } from '../../lib/waitlist';
import { fadeUp } from './animations';

const INTERESTS = [
  'Coffee',
  'Yoga',
  'Walks',
  'Wellness',
  'New people',
  'Aesthetic places',
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Email is required.');
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError('Please enter a valid email.');
      return;
    }

    setLoading(true);
    try {
      await submitWaitlist({
        email: normalizedEmail,
        telegram: telegram.trim(),
        interests,
        created_at: new Date().toISOString(),
      });
      setSuccess(true);
      setEmail('');
      setTelegram('');
      setInterests([]);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="bg-[#fbf7f3] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <motion.div {...fadeUp}>
          <p className="mb-3 inline-flex rounded-full border border-[#e7d8ca] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7d66] shadow-[0_8px_24px_rgba(188,151,125,0.08)]">
            Beta opening soon in Almaty
          </p>
          <h2 className="text-[32px] font-semibold leading-tight tracking-[-0.6px] text-[#1a1a18] md:text-[44px]">
            Join the first wave of Aura
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[#62625b] md:text-lg">
            Leave your email and Telegram username. We&apos;ll send you early access when the beta opens.
          </p>
          <p className="mt-5 text-sm text-[#9a8f83]">
            For the first Aura community members.
          </p>
        </motion.div>

        <motion.form
          id="waitlist-form"
          {...fadeUp}
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_20px_60px_rgba(156,128,103,0.13)] backdrop-blur md:p-7"
        >
          {success ? (
            <div className="rounded-[24px] bg-[#f1eee8] px-5 py-8 text-center">
              <p className="font-serif text-2xl text-[#1a1a18]">You&apos;re on the list ✨</p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#62625b]">
                We&apos;ll send you early access when Aura beta opens.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-6 rounded-full border border-[#d8c9ba] bg-white px-5 py-2.5 text-sm font-medium text-[#5f5147] transition hover:bg-[#fbf7f3]"
              >
                Add another email
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label htmlFor="waitlist-email" className="mb-2 block text-sm font-semibold text-[#4b463f]">
                  Email
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-full border border-[#e6ded5] bg-[#fffdfb] px-5 py-3.5 text-sm text-[#1a1a18] outline-none transition placeholder:text-[#b4aaa1] focus:border-[#c8a882] focus:ring-4 focus:ring-[#c8a882]/15"
                />
              </div>

              <div>
                <label htmlFor="waitlist-telegram" className="mb-2 block text-sm font-semibold text-[#4b463f]">
                  Telegram username <span className="font-normal text-[#9a8f83]">optional</span>
                </label>
                <input
                  id="waitlist-telegram"
                  type="text"
                  value={telegram}
                  onChange={(event) => setTelegram(event.target.value)}
                  placeholder="@yourhandle"
                  className="w-full rounded-full border border-[#e6ded5] bg-[#fffdfb] px-5 py-3.5 text-sm text-[#1a1a18] outline-none transition placeholder:text-[#b4aaa1] focus:border-[#c8a882] focus:ring-4 focus:ring-[#c8a882]/15"
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-[#4b463f]">
                  Interests <span className="font-normal text-[#9a8f83]">optional</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const selected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          selected
                            ? 'border-[#c8a882] bg-[#c8a882] text-white shadow-[0_8px_20px_rgba(200,168,130,0.22)]'
                            : 'border-[#e6ded5] bg-[#fffdfb] text-[#62625b] hover:border-[#d2baa2]'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#c8a882] px-8 py-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(200,168,130,0.3)] transition hover:bg-[#b5936a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Joining...' : 'Get early access'}
              </button>
            </div>
          )}
        </motion.form>
      </div>
    </section>
  );
}
