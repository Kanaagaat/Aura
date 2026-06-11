// frontend/src/components/TelegramIcon.tsx
export function TelegramIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 240"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="120" cy="120" r="120" fill="#229ED9" />
      <path
        fill="#FFFFFF"
        d="M179.7 74.4 158 176.5c-1.6 7.2-5.9 9-12 5.6l-33.1-24.4-16 15.4c-1.8 1.8-3.3 3.3-6.8 3.3l2.4-33.7 61.4-55.5c2.7-2.4-.6-3.7-4.1-1.3l-75.9 47.8-32.7-10.2c-7.1-2.2-7.2-7.1 1.5-10.5l127.8-49.3c5.9-2.2 11.1 1.3 9.2 10.7Z"
      />
    </svg>
  );
}
