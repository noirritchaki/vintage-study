import type { Metadata } from 'next';
import Link from 'next/link';
import { workTapes } from '@/data/tapes';
import styles from '@/components/TapePage.module.css';

export const metadata: Metadata = { title: 'Projects — noirrit chaki' };

export default function Projects() {
  return (
    <main className={styles.page}>
      <Link href="/" className={styles.eject}>
        ⏏ eject
      </Link>

      <p className={styles.kicker}>side A · tracklist</p>
      <h1 className={styles.title}>Projects</h1>
      <p className={styles.summary}>Every case study on the shelf, in one place.</p>

      <ol className={styles.grid}>
        {workTapes.map((t, i) => (
          <li key={t.slug}>
            <Link href={`/work/${t.slug}`} className={`${styles.card} ${styles.cardLink}`}>
              <span className={styles.track}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{t.title}</h3>
              <p>{t.summary}</p>
              <p className={styles.cardMeta}>
                {t.role} · {t.year}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
