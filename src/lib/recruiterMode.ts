'use client';

import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

// Recruiter mode: a plain, one-page summary instead of the playful home page.
// Turned on by sharing /?recruiter=true (or the nav switch), and remembered in
// this browser until switched off (/?recruiter=false or the switch again).

const KEY = 'recruiter-mode';
const EVENT = 'recruiter-mode-change';

function read() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setRecruiterMode(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Switch with the new look revealed in a circle growing from (x, y), e.g. the
 * toggle. Falls back to an instant switch where view transitions aren't
 * supported or motion is reduced.
 */
export function setRecruiterModeFrom(on: boolean, x: number, y: number) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setRecruiterMode(on);
    return;
  }
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = doc.startViewTransition(() => flushSync(() => setRecruiterMode(on)));
  t.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}

/** Apply ?recruiter=true / ?recruiter=false from the address, once per page load. */
export function syncRecruiterParam() {
  const p = new URLSearchParams(window.location.search).get('recruiter');
  if (p === 'true' || p === '1') setRecruiterMode(true);
  if (p === 'false' || p === '0') setRecruiterMode(false);
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

export function useRecruiterMode() {
  return useSyncExternalStore(subscribe, read, () => false);
}
