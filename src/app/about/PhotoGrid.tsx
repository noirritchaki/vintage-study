'use client';

import Image from 'next/image';
import { useRef, useState, useSyncExternalStore, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import type { PhotoGroup } from '@/data/about';
import styles from './About.module.css';

/**
 * Four-column photo grid. On hover (mouse/trackpad only) the cursor turns
 * into a small square with the photo's caption riding beside it, after
 * rachelchen.tech/about.
 */
export function PhotoGrid({ groups }: { groups: PhotoGroup[] }) {
  const cells = groups.flatMap((group, g) =>
    group.photos.map((photo, i) => ({
      key: `${g}-${i}`,
      label: i === 0 ? { n: String(g + 1).padStart(2, '0'), text: group.label } : null,
      caption: photo.caption ?? group.label,
      photo,
    })),
  );

  const cursor = useRef<HTMLDivElement>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const fine = useSyncExternalStore(subscribeFine, isFine, () => false);

  const move = (e: PointerEvent) => {
    if (cursor.current) cursor.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  };

  return (
    <>
      <ul className={styles.grid} data-custom-cursor={fine || undefined} aria-label="Photos">
        {cells.map(({ key, label, caption: text, photo }) => (
          <li key={key} className={styles.cell}>
            <p className={styles.label} aria-hidden={!label}>
              {label && (
                <>
                  {label.n} <span>/</span> {label.text}
                </>
              )}
            </p>
            <div
              className={styles.frame}
              onPointerEnter={(e) => {
                move(e);
                setCaption(text);
              }}
              onPointerMove={move}
              onPointerLeave={() => setCaption(null)}
            >
              {photo.src ? (
                <Image
                  src={photo.src}
                  alt={photo.alt ?? text}
                  width={800}
                  height={Math.round(800 / photo.ratio)}
                  sizes="(max-width: 720px) 50vw, 220px"
                  className={styles.photo}
                />
              ) : (
                <div className={styles.placeholder} style={{ aspectRatio: photo.ratio }} role="img" aria-label={text} />
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Portalled to <body>: the page's fade-in animates a transform, which
          would otherwise make it the frame of reference for this fixed tag. */}
      {fine &&
        createPortal(
          <div ref={cursor} className={styles.cursor} data-visible={caption ? true : undefined} aria-hidden>
            <span className={styles.cursorDot} />
            <span className={styles.cursorTag}>{caption}</span>
          </div>,
          document.body,
        )}
    </>
  );
}

// Only mouse/trackpad users get the custom cursor.
const FINE = '(hover: hover) and (pointer: fine)';
const isFine = () => window.matchMedia(FINE).matches;
function subscribeFine(onChange: () => void) {
  const mq = window.matchMedia(FINE);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
