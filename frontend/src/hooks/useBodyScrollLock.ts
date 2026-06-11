// frontend/src/hooks/useBodyScrollLock.ts
import { useEffect } from 'react';

let lockCount = 0;
let scrollY = 0;
let previousBodyPosition = '';
let previousBodyTop = '';
let previousBodyWidth = '';
let previousBodyOverflow = '';

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    lockCount += 1;

    if (lockCount === 1) {
      scrollY = window.scrollY;
      previousBodyPosition = document.body.style.position;
      previousBodyTop = document.body.style.top;
      previousBodyWidth = document.body.style.width;
      previousBodyOverflow = document.body.style.overflow;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0) {
        document.body.style.position = previousBodyPosition;
        document.body.style.top = previousBodyTop;
        document.body.style.width = previousBodyWidth;
        document.body.style.overflow = previousBodyOverflow;
        window.scrollTo(0, scrollY);
      }
    };
  }, [locked]);
}
