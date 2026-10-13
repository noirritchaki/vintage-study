'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { pageIndexFor, pageNameFor, pages } from '@/data/pages';
import styles from './SiteNav.module.css';

/**
 * Loading the brew scene's code also starts fetching its models and textures,
 * so the brew page is usually ready by the time someone opens it.
 */
let warmed = false;
function warmBrew() {
  if (warmed) return;
  warmed = true;
  void import('./brew/BrewScene');
}

/**
 * Site navigation as plain text: the current page's name, top-left. Hover (or
 * focus, or tap) reveals the other pages underneath; picking one navigates and
 * the label swaps to the new page.
 */
export function SiteNav() {
  const pathname = usePathname();
  const current = pageIndexFor(pathname);
  const name = pageNameFor(pathname);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const label = useRef<HTMLButtonElement>(null);
  const lastPointer = useRef('mouse');
  const listId = useId();
  const hidden = pathname.startsWith('/work'); // case studies are for reading

  // Quietly pre-load the brew page's 3D scene once this page has settled.
  useEffect(() => {
    if (pathname === '/brew') return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const t = window.setTimeout(() => idle(warmBrew, { timeout: 4000 }), 2500);
    return () => window.clearTimeout(t);
  }, [pathname]);

  // Tap / click anywhere else closes it.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [open]);

  if (hidden) return null;

  const others = pages.filter((_, i) => i !== current);

  return (
    <nav
      ref={root}
      data-nav
      aria-label="Site"
      className={styles.nav}
      data-open={open || undefined}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
      onFocus={(e) => {
        // keyboard focus opens it; a tap's focus is left to the tap's click
        if ((e.target as HTMLElement).matches(':focus-visible')) setOpen(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setOpen(false);
          label.current?.blur();
        }
      }}
    >
      <button
        ref={label}
        type="button"
        className={styles.current}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Current page: ${name}. Show other pages`}
        onPointerDown={(e) => (lastPointer.current = e.pointerType)}
        onClick={() => {
          // mouse users open it by hovering; taps and keyboard toggle it
          if (lastPointer.current !== 'mouse') setOpen((o) => !o);
        }}
      >
        {/* keyed, so a new page's name plays the swap-in */}
        <span key={name} className={styles.swap}>
          {name}
        </span>
      </button>

      <ul id={listId} className={styles.menu}>
        {others.map((p, i) => (
          <li key={p.href} style={{ '--i': i } as CSSProperties}>
            <Link
              href={p.href}
              className={styles.item}
              tabIndex={open ? 0 : -1}
              onPointerEnter={p.href === '/brew' ? warmBrew : undefined}
              onFocus={p.href === '/brew' ? warmBrew : undefined}
              onClick={() => {
                setOpen(false);
                label.current?.blur();
              }}
            >
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
