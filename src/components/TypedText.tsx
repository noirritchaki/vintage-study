import type { CSSProperties } from 'react';
import styles from './TypedText.module.css';

/**
 * Text that types itself in, one character at a time. Every character is laid
 * out from the start (just invisible), so nothing reflows while it types.
 */
export function TypedText({ text, delay = 0.3, step = 0.045 }: { text: string; delay?: number; step?: number }) {
  return (
    <span aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className={styles.char}
          style={{ '--d': `${delay + i * step}s` } as CSSProperties}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
