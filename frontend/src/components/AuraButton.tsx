import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

interface AuraButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'telegram' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export function AuraButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: AuraButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.98] disabled:opacity-50';
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };
  const variants = {
    primary: 'bg-accent text-white shadow-[0_4px_20px_rgba(200,168,130,0.35)] hover:bg-accent-hover',
    secondary: 'bg-surface border border-border text-text-main hover:bg-surface-cream',
    telegram: 'bg-[#0088cc] text-white hover:opacity-90',
    dark: 'bg-text-main text-white shadow-[var(--shadow-soft)] hover:opacity-90',
  };

  return (
    <button
      className={clsx(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
