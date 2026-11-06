'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './JontyChat.module.css';

/** Words with their trailing whitespace, so the text re-joins exactly. */
const tokens = (text: string) => text.match(/\S+\s*|\s+/g) ?? [];

/**
 * Shows streamed text word by word at a steady pace, each word easing in
 * from faint and soft (see .word). Gemini sends answers in a few large lumps;
 * this smooths them out. Catches up faster when a lot arrives at once.
 */
export function RevealText({ text, streaming, onDone }: { text: string; streaming: boolean; onDone?: () => void }) {
  const words = tokens(text);
  const [shown, setShown] = useState(0);
  const finished = useRef(false);

  useEffect(() => {
    if (shown >= words.length) {
      if (!streaming && words.length && !finished.current) {
        finished.current = true;
        onDone?.();
      }
      return;
    }
    const backlog = words.length - shown;
    const step = backlog > 40 ? Math.ceil(backlog / 20) : 1;
    const t = setTimeout(() => setShown((n) => Math.min(words.length, n + step)), 30);
    return () => clearTimeout(t);
  }, [shown, words.length, streaming, onDone]);

  return (
    <>
      {words.slice(0, shown).map((w, i) => (
        <span key={i} className={styles.word}>
          {w}
        </span>
      ))}
    </>
  );
}
