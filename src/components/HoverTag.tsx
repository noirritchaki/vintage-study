'use client';

import { useRef, useState, useSyncExternalStore, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import styles from './HoverTag.module.css';

/**
 * The magenta "square + caption" cursor used over photos. Usage:
 *   const tag = useHoverTag();
 *   <ul className={tag.containerClass}> … <div {...tag.bind('caption')}>…</div> … </ul>
 *   {tag.element}
 */
export function useHoverTag() {
  const cursor = useRef<HTMLDivElement>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const fine = useSyncExternalStore(subscribeFine, isFine, () => false);

  const move = (e: PointerEvent) => {
    if (cursor.current) cursor.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  };

  return {
    containerClass: fine ? styles.active : undefined,
    bind: (text: string) => ({
      className: styles.target,
      onPointerEnter: (e: PointerEvent) => {
        move(e);
        setCaption(text);
      },
      onPointerMove: move,
      onPointerLeave: () => setCaption(null),
    }),
    // Portalled to <body>: the page's fade-in animates a transform, which
    // would otherwise make it the frame of reference for this fixed tag.
    element: fine
      ? createPortal(
          <div ref={cursor} className={styles.cursor} data-visible={caption ? true : undefined} aria-hidden>
            <span className={styles.cursorDot} />
            <span className={styles.cursorTag}>{caption}</span>
          </div>,
          document.body,
        )
      : null,
  };
}

// Only mouse/trackpad users get the custom cursor.
const FINE = '(hover: hover) and (pointer: fine)';
const isFine = () => window.matchMedia(FINE).matches;
function subscribeFine(onChange: () => void) {
  const mq = window.matchMedia(FINE);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
