import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '@/components/TapePage.module.css';

export const metadata: Metadata = { title: 'What I like doing — noirrit chaki' };

// Placeholder list — swap for the real thing.
const HOBBIES = [
  { name: 'Hobby one', blurb: 'A line or two about it.' },
  { name: 'Hobby two', blurb: 'A line or two about it.' },
  { name: 'Hobby three', blurb: 'A line or two about it.' },
  { name: 'Hobby four', blurb: 'A line or two about it.' },
  { name: 'Hobby five', blurb: 'A line or two about it.' },
  { name: 'Hobby six', blurb: 'A line or two about it.' },
];

export default function Hobbies() {
  return (
    <main className={styles.page}>
      <Link href="/?tape=hobbies" className={styles.eject}>
        ⏏ eject
      </Link>

      <p className={styles.kicker}>side B · b-sides</p>
      <h1 className={styles.title}>What I like doing</h1>
      <p className={styles.summary}>Everything I do when I am not pushing pixels.</p>

      <div className={styles.grid}>
        {HOBBIES.map((h) => (
          <article key={h.name} className={styles.card}>
            <h3>{h.name}</h3>
            <p>{h.blurb}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
