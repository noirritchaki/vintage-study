'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { pageIndexFor, pageNameFor, pages } from '@/data/pages';
import styles from './NavPlayer.module.css';

/**
 * Site navigation styled as a little retro music-player panel: a dropdown
 * with the current page, plus previous / next track buttons.
 */
export function NavPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  // -1 on pages outside the list (e.g. /brew); prev/next then go to the ends.
  const current = pageIndexFor(pathname);
  const currentName = pageNameFor(pathname);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(current);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();

  const go = (i: number) => {
    const n = pages.length;
    const target = pages[((i % n) + n) % n];
    setOpen(false);
    if (target.href !== pathname) router.push(target.href);
  };

  const openList = () => {
    setActive(Math.max(0, current));
    setOpen(true);
  };

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [open]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'ArrowDown') setActive((a) => Math.min(pages.length - 1, a + 1));
    else if (e.key === 'ArrowUp') setActive((a) => Math.max(0, a - 1));
    else if (e.key === 'Enter' || e.key === ' ') go(active);
    else if (e.key === 'Escape' || e.key === 'Tab') return setOpen(false);
    else return;
    e.preventDefault();
  };

  // Case studies are for reading: no nav, just the eject link.
  if (pathname.startsWith('/work')) return null;

  return (
    <div ref={root} className={styles.window} data-nav>
      <div className={styles.body}>
        <div className={styles.row}>
          <div className={styles.select}>
            <button
              type="button"
              className={styles.field}
              role="combobox"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={listId}
              aria-label={`Page: ${currentName}`}
              aria-activedescendant={open ? `${listId}-${active}` : undefined}
              onClick={() => (open ? setOpen(false) : openList())}
              onKeyDown={onKey}
            >
              <span className={styles.fieldText}>{currentName}</span>
              <span className={styles.arrow} aria-hidden>
                <svg width="9" height="5" viewBox="0 0 9 5">
                  <path d="M0 0h9L4.5 5z" fill="currentColor" />
                </svg>
              </span>
            </button>

            {open && (
              <ul id={listId} role="listbox" className={styles.menu} aria-label="Pages">
                {pages.map((p, i) => (
                  <li
                    key={p.href}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === current}
                    className={styles.option}
                    data-active={i === active || undefined}
                    onPointerEnter={() => setActive(i)}
                    onClick={() => go(i)}
                  >
                    <span className={styles.check} aria-hidden>
                      {i === current ? '✓' : ''}
                    </span>
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            className={styles.button}
            aria-label={`Previous: ${pages[(current + pages.length - 1) % pages.length].name}`}
            onClick={() => go(current === -1 ? pages.length - 1 : current - 1)}
          >
            <svg width="14" height="9" viewBox="0 0 14 9" aria-hidden>
              <path d="M0 0h2v9H0zM2 4.5 8 0v9zM8 4.5 14 0v9z" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.button}
            aria-label={`Next: ${pages[(current + 1) % pages.length].name}`}
            onClick={() => go(current + 1)}
          >
            <svg width="14" height="9" viewBox="0 0 14 9" aria-hidden>
              <path d="M0 0l6 4.5L0 9zM6 0l6 4.5L6 9zM12 0h2v9h-2z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
