import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HeroPills } from '../components/landing/HeroPills';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Features } from '../components/landing/Features';
import { FAQ } from '../components/landing/FAQ';
import { WaitlistSection } from '../components/landing/WaitlistSection';
import { fadeUp, heroItem } from '../components/landing/animations';

const TESTIMONIALS = [
  {
    quote: 'Lit a Beacon at Chaikhana, three people showed up. Wildly good morning.',
    handle: '@sara.almaty',
  },
  {
    quote: 'Finally a wellness app that gets it. No gamification, just vibes.',
    handle: '@nomad.kz',
  },
  {
    quote: 'Found my yoga crew in 20 minutes.',
    handle: '@aigerim_fit',
  },
];

function scrollToHowItWorks() {
  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
}

function scrollToWaitlist() {
  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
}

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="min-h-screen text-[#33332e]"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-[border-color] duration-300 ${
          scrolled ? 'border-b border-[#e5e5e0]' : 'border-b border-transparent'
        }`}
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <span className="text-lg font-semibold text-[#1a1a18]">Aura</span>
          <div className="flex items-center gap-3 md:gap-5">
            <button
              type="button"
              onClick={scrollToHowItWorks}
              className="text-sm font-medium text-[#62625b] hover:text-[#1a1a18] transition-colors px-2 py-2"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={scrollToWaitlist}
              className="rounded-full bg-[#c8a882] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b5936a] transition-colors"
            >
              Get early access
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#fbfbf9] pt-20">
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full"
          style={{ background: 'rgba(200, 168, 130, 0.18)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full"
          style={{ background: 'rgba(143, 170, 139, 0.14)' }}
          aria-hidden
        />
        <HeroPills />

        <div className="relative mx-auto max-w-3xl px-5 md:px-8 py-16 md:py-24 text-center">
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.15 }}
          >
            <motion.h1
              variants={heroItem}
              className="text-[40px] sm:text-[52px] md:text-[64px] font-semibold leading-[1.1] tracking-[-1.2px] text-[#1a1a18] mb-6"
            >
              Aura
              <br />
              <span className="text-[34px] sm:text-[44px] md:text-[54px]">
                Find where to go in your city — and who to go with.
              </span>
            </motion.h1>
            <motion.p
              variants={heroItem}
              className="text-[#62625b] text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10"
            >
              Aura is a social map for coffee, yoga, walks, and vibey wellness places in your city.
              Light a beacon on a place you want to visit, and people with a similar vibe can join you.
            </motion.p>
            <motion.div
              variants={heroItem}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                type="button"
                onClick={scrollToWaitlist}
                className="w-full sm:w-auto rounded-full bg-[#c8a882] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#b5936a] transition-colors shadow-[0_4px_24px_rgba(200,168,130,0.3)]"
              >
                Get early access
              </button>
              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto rounded-full border border-[#dadad3] bg-white px-8 py-3.5 text-sm font-medium text-[#33332e] hover:bg-[#f6f6f3] transition-colors"
              >
                How it works ↓
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <HowItWorks />
      <Features />
      <WaitlistSection />

      {/* Social proof */}
      <section className="bg-[#f6f6f3] py-16 md:py-24 px-5 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.p
            {...fadeUp}
            className="text-[28px] md:text-[40px] font-light italic leading-snug text-[#1a1a18] mb-12"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
          >
            &ldquo;The map for people who actually move.&rdquo;
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ staggerChildren: 0.15, duration: 0.5 }}
            className="grid gap-4 md:grid-cols-3"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.blockquote
                key={t.handle}
                initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-full bg-white px-6 py-5 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <p className="text-sm text-[#33332e] leading-relaxed mb-2">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <cite className="text-xs font-medium text-[#91918c] not-italic">{t.handle}</cite>
              </motion.blockquote>
            ))}
          </motion.div>
        </div>
      </section>

      <FAQ />

      {/* Footer CTA */}
      <section className="relative overflow-hidden bg-[#1a1a18] py-20 md:py-28 px-5 md:px-8">
        <div
          className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full opacity-30"
          style={{ background: 'rgba(200, 168, 130, 0.25)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full opacity-20"
          style={{ background: 'rgba(143, 170, 139, 0.2)' }}
          aria-hidden
        />
        <motion.div
          {...fadeUp}
          className="relative mx-auto max-w-xl text-center"
        >
          <h2 className="text-[32px] md:text-[40px] font-semibold text-white mb-3 tracking-[-0.8px]">
            Join Aura before the beta opens.
          </h2>
          <p className="text-[#91918c] text-base mb-8">Beta opening soon for your city.</p>
          <button
            type="button"
            onClick={scrollToWaitlist}
            className="inline-block rounded-full bg-[#c8a882] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#b5936a] transition-colors"
          >
            Get early access
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#dadad3] bg-white px-5 md:px-8 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-base font-semibold text-[#1a1a18]">Aura</p>
            <p className="text-[13px] text-[#62625b] mt-1">Find your people. Find your place.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#62625b]">
            <span>Privacy</span>
            <span>Terms</span>
            <span>© 2026 Aura</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
