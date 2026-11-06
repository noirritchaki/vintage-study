'use client';

import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react';
import styles from './CaseStudyToc.module.css';

export type TocItem = { id: string; label: string; children?: { id: string; label: string }[] };

/**
 * The case study's table of contents as a timeline pinned to the far left
 * (wide screens only), after elaineyu.design: a thin line with a dot per
 * section. The section being read gets a filled dot and its name; the line
 * fills up to it as you scroll. Hovering the timeline shows every name, and
 * clicking a dot scrolls there.
 */
export function CaseStudyToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const update = () => {
      // the last section whose top has passed a line a third of the way down
      const line = window.innerHeight / 3;
      let current = 0;
      items.forEach((item, i) => {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) current = i;
      });
      setActive(current);
    };
    update();
    window.addEventListener('scroll', update, { capture: true, passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, { capture: true });
      window.removeEventListener('resize', update);
    };
  }, [items]);

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };

  const progress = items.length > 1 ? active / (items.length - 1) : 0;

  return (
    <nav className={styles.timeline} aria-label="Sections" style={{ '--progress': progress, '--count': items.length } as CSSProperties}>
      <ol>
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => go(e, item.id)}
              className={styles.stop}
              data-active={i === active || undefined}
              data-past={i < active || undefined}
              aria-current={i === active ? 'location' : undefined}
            >
              <span className={styles.dot} aria-hidden />
              <span className={styles.label}>{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
