'use client';

import Image from 'next/image';
import { useState, useSyncExternalStore } from 'react';
import { hobbies, hobbyFilters, type Hobby } from '@/data/hobbies';
import { useHoverTag } from '@/components/HoverTag';
import styles from './Hobbies.module.css';

type Filter = (typeof hobbyFilters)[number];

/**
 * Filter chips over a masonry of photo cards, after rachelchen.tech/fun.
 * Cards are dealt left-to-right into columns, so the order reads across.
 */
export function HobbyBoard() {
  const [filter, setFilter] = useState<Filter>('all');
  const columns = useSyncExternalStore(subscribeColumns, getColumns, () => 4);
  const tag = useHoverTag();

  const shown = filter === 'all' ? hobbies : hobbies.filter((h) => h.category === filter);
  const cols: Hobby[][] = Array.from({ length: columns }, () => []);
  shown.forEach((h, i) => cols[i % columns].push(h));

  return (
    <>
      <div className={styles.chips} role="group" aria-label="Filter">
        {hobbyFilters.map((f) => (
          <button
            key={f}
            type="button"
            className={styles.chip}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* keyed by filter so a new selection fades in */}
      <div key={filter} className={`${styles.board} ${tag.containerClass ?? ''}`}>
        {cols.map((col, c) => (
          <ul key={c} className={styles.column}>
            {col.map((h) => (
              <li key={h.title} className={styles.card}>
                <div {...tag.bind(h.caption ?? h.title)}>
                  {h.src ? (
                    <Image
                      src={h.src}
                      alt={h.alt ?? h.title}
                      width={800}
                      height={Math.round(800 / h.ratio)}
                      sizes="(max-width: 720px) 50vw, 220px"
                      className={styles.photo}
                    />
                  ) : (
                    <div className={styles.placeholder} style={{ aspectRatio: h.ratio }} role="img" aria-label={h.title} />
                  )}
                </div>
                <p className={styles.title}>{h.title}</p>
                <p className={styles.subtitle}>{h.subtitle}</p>
              </li>
            ))}
          </ul>
        ))}
      </div>

      {shown.length === 0 && <p className={styles.empty}>Nothing here yet.</p>}
      {tag.element}
    </>
  );
}

// Four columns on desktop, two on phones.
const NARROW = '(max-width: 720px)';
const getColumns = () => (window.matchMedia(NARROW).matches ? 2 : 4);
function subscribeColumns(onChange: () => void) {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
