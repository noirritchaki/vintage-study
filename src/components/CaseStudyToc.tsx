'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import styles from './CaseStudyToc.module.css';

export type TocItem = { id: string; label: string; children?: { id: string; label: string }[] };

/**
 * Chapter list pinned to the left of a case study (wide screens only). The
 * section being read is highlighted, its sub-sections open underneath, and
 * clicking any entry scrolls there.
 */
export function CaseStudyToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const ids = items.flatMap((i) => [i.id, ...(i.children?.map((c) => c.id) ?? [])]);
    const update = () => {
      // the last section whose top has passed a line a third of the way down
      const line = window.innerHeight / 3;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
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

  return (
    <nav className={styles.toc} aria-label="Chapters">
      <ul>
        {items.map((item) => {
          const inside = item.id === active || item.children?.some((c) => c.id === active);
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => go(e, item.id)}
                className={styles.link}
                data-active={item.id === active || undefined}
                data-inside={inside || undefined}
                aria-current={item.id === active ? 'location' : undefined}
              >
                {item.label}
              </a>
              {item.children?.length ? (
                <ul className={styles.sub} data-open={inside || undefined}>
                  <li>
                    {/* grid row trick: animates open to its natural height */}
                    <ul>
                      {item.children.map((c) => (
                        <li key={c.id}>
                          <a
                            href={`#${c.id}`}
                            onClick={(e) => go(e, c.id)}
                            className={styles.link}
                            data-active={c.id === active || undefined}
                            aria-current={c.id === active ? 'location' : undefined}
                            tabIndex={inside ? undefined : -1}
                          >
                            {c.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
