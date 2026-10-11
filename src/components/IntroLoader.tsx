'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type RefObject } from 'react';
import styles from './IntroLoader.module.css';

const MIN_SHOW_MS = 700; // never just flash
const FLY_MS = 900;

/**
 * Full-screen white cover with the logo floating in the middle while the 3D
 * scene loads. When `ready`, the logo flies onto `target` (the real logo in
 * the hero) — measured live, so it lands exactly on it at any screen size —
 * while the cover fades away. Then it calls onDone and unmounts.
 *
 * Render it outside any fixed/stacking container (and server-side, so the
 * page never flashes before the cover appears) so it can sit above the nav.
 */
export function IntroLoader({
  ready,
  target,
  onDone,
}: {
  ready: boolean;
  target: RefObject<HTMLElement | null>;
  onDone: () => void;
}) {
  const fly = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const shownAt = useRef(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    shownAt.current = performance.now();
  }, []);

  useEffect(() => {
    if (!ready || leaving) return;
    const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - shownAt.current));
    const t = setTimeout(() => {
      const from = fly.current?.getBoundingClientRect();
      const to = target.current?.getBoundingClientRect();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (fly.current && float.current && from && to && !reduced) {
        // Freeze the idle float where it is, then ease it out during the flight.
        const pose = getComputedStyle(float.current).transform;
        float.current.style.animation = 'none';
        float.current.style.transform = pose === 'none' ? '' : pose;
        void float.current.offsetWidth;
        float.current.style.transition = `transform ${FLY_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`;
        float.current.style.transform = 'none';

        // FLIP: move the centre onto the target's centre and match its width.
        const dx = to.left + to.width / 2 - (from.left + from.width / 2);
        const dy = to.top + to.height / 2 - (from.top + from.height / 2);
        const s = to.width / from.width;
        fly.current.style.transition = `transform ${FLY_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`;
        fly.current.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
      }
      setLeaving(true);
      setTimeout(
        () => {
          onDone();
          setGone(true);
        },
        reduced ? 250 : FLY_MS,
      );
    }, wait);
    return () => clearTimeout(t);
  }, [ready, leaving, target, onDone]);

  if (gone) return null;
  return (
    <div className={styles.cover} data-leaving={leaving || undefined} aria-busy={!leaving} aria-label="Loading">
      <div ref={fly} className={styles.fly}>
        <div ref={float} className={styles.float}>
          <Image src="/logo.png" alt="" width={390} height={287} priority className={styles.logo} />
        </div>
      </div>
    </div>
  );
}
