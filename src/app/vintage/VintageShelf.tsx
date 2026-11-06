'use client';

import { useState, type CSSProperties } from 'react';
import type { VintagePiece } from '@/data/vintage';
import styles from './Vintage.module.css';

type Spot = { x: number; y: number; r: number };

/**
 * Spread `n` pieces around an ellipse, leaving the middle for the title.
 * x / y are percentages of the stage; r is a tilt in degrees.
 */
function ring(n: number, offset: number, wobble: (i: number) => number, tilt: (i: number) => number): Spot[] {
  return Array.from({ length: n }, (_, i) => {
    const a = offset + (i / n) * Math.PI * 2;
    const k = 1 + wobble(i);
    return { x: 50 + 36 * Math.cos(a) * k, y: 50 + 33 * Math.sin(a) * k, r: tilt(i) };
  });
}

// The first layout is fixed (so the server and browser agree); shuffle randomises.
const FIXED_WOBBLE = [0.04, -0.06, 0.08, -0.02, 0.06, -0.08, 0.02, -0.04];
const FIXED_TILT = [-8, 6, -3, 10, -6, 4, -10, 7];
const firstLayout = (n: number) =>
  ring(
    n,
    -Math.PI / 2 + 0.35,
    (i) => FIXED_WOBBLE[i % FIXED_WOBBLE.length],
    (i) => FIXED_TILT[i % FIXED_TILT.length],
  );

function shuffled(n: number): Spot[] {
  const spots = ring(
    n,
    Math.random() * Math.PI * 2,
    () => (Math.random() - 0.5) * 0.18,
    () => (Math.random() - 0.5) * 24,
  );
  // hand the spots out in a new order so pieces swap places, not just rotate
  for (let i = spots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [spots[i], spots[j]] = [spots[j], spots[i]];
  }
  return spots;
}

/**
 * "vintage stuff i own": pieces floating around the title. Hovering (or
 * tapping) one shows a handwritten note with an arrow pointing at it.
 */
export function VintageShelf({ pieces }: { pieces: VintagePiece[] }) {
  const [spots, setSpots] = useState(() => firstLayout(pieces.length));

  return (
    <section className={styles.stage}>
      <div className={styles.center}>
        <h1 className={styles.title}>
          <span>vintage stuff</span> <span>i own</span>
        </h1>
        <button type="button" className={styles.shuffle} onClick={() => setSpots(shuffled(pieces.length))}>
          shuffle
        </button>
        <p className={styles.hint}>
          <span className={styles.hintHover}>hover over the things</span>
          <span className={styles.hintTap}>tap the things</span>
        </p>
      </div>

      <ul className={styles.pieces} aria-label="Vintage pieces">
        {pieces.map((piece, i) => {
          const s = spots[i];
          return (
            <li
              key={i}
              className={styles.piece}
              tabIndex={0}
              data-below={s.y < 34 || undefined}
              style={
                {
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  '--r': `${s.r}deg`,
                  '--w': `${piece.width}px`,
                  '--bob': `${3.6 + (i % 4) * 0.55}s`,
                  '--delay': `${-i * 0.8}s`,
                } as CSSProperties
              }
            >
              <span className={styles.bob}>
                <span className={styles.tilt}>
                  {piece.src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- cut-outs keep their own aspect ratio
                    <img src={piece.src} alt={piece.name} draggable={false} />
                  ) : (
                    <span className={styles.placeholder} role="img" aria-label={piece.name}>
                      photo soon
                    </span>
                  )}
                </span>
              </span>
              <span className={styles.note} role="note">
                <svg viewBox="0 0 34 30" width="34" height="30" aria-hidden>
                  <path d="M31 3C22 4 11 9 7 25" />
                  <path d="M2.5 19.5L7 26L12.5 21" />
                </svg>
                <span>{piece.description}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
