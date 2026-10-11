import type { Metadata } from 'next';
import Link from 'next/link';
import { profile } from '@/data/profile';
import styles from '@/components/TapePage.module.css';

export const metadata: Metadata = { title: 'About — noirrit chaki' };

// Placeholder copy — swap in your own story.
const SECTIONS = [
  { heading: 'Now', body: 'Where you work today and what you spend your days on.' },
  { heading: 'Before', body: 'The places and projects that shaped how you design.' },
  { heading: 'How I work', body: 'A few principles you keep coming back to.' },
];

export default function About() {
  return (
    <main className={styles.page}>
      <Link href="/" className={styles.eject}>
        ⏏ eject
      </Link>

      <p className={styles.kicker}>liner notes</p>
      <h1 className={styles.title}>About</h1>
      <p className={styles.summary}>{profile.intro}</p>

      {SECTIONS.map((s) => (
        <section key={s.heading} className={styles.section}>
          <h2>{s.heading}</h2>
          <p>{s.body}</p>
        </section>
      ))}
    </main>
  );
}
