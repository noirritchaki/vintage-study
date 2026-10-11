'use client';

import { useEffect } from 'react';
import { useDeck } from '@/lib/store';

const WHEEL_IDLE_MS = 180;
const SWIPE_MIN_PX = 40;

/**
 * Wheel / trackpad / arrow keys move the shelf exactly one tape per gesture.
 * A trackpad flick fires a long tail of momentum events; we stay locked until
 * the wheel goes quiet, unless the deltas jump back up (a fresh flick).
 */
export function useShelfWheel() {
  useEffect(() => {
    let locked = false;
    let lastAbs = 0;
    let lastStepAt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (fromNav(e)) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const abs = Math.abs(d);
      clearTimeout(timer);
      timer = setTimeout(() => (locked = false), WHEEL_IDLE_MS);

      const now = performance.now();
      const freshFlick = locked && abs > 20 && abs > lastAbs * 1.6 && now - lastStepAt > 300;
      lastAbs = abs;
      if ((locked && !freshFlick) || abs < 3) return;

      locked = true;
      lastStepAt = now;
      useDeck.getState().step(d > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (fromNav(e)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') useDeck.getState().step(1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') useDeck.getState().step(-1);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, []);
}

export { SWIPE_MIN_PX };

/** Events aimed at the site nav shouldn't also move the shelf. */
function fromNav(e: Event) {
  return e.target instanceof Element && !!e.target.closest('[data-nav]');
}
