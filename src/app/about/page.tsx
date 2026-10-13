import type { Metadata } from 'next';
import Link from 'next/link';
import { aboutParagraphs, photoGroups, timeline } from '@/data/about';
import page from '@/components/TapePage.module.css';
import styles from './About.module.css';
import { PhotoGrid } from './PhotoGrid';

export const metadata: Metadata = { title: 'About · noirrit chaki' };

export default function About() {
  return (
    <main className={`${page.page} ${styles.about}`}>
      <Link href="/" className={page.eject}>
        ⏏ eject
      </Link>

      <section className={styles.bio} aria-label="About me">
        {aboutParagraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <ol className={styles.timeline} aria-label="Where I've worked">
        {timeline.map((role, i) => (
          <li key={i}>
            {role.when === 'Now' ? (
              <span className={styles.now}>
                <span className={styles.live} aria-hidden />
                Now
              </span>
            ) : (
              <span className={styles.when}>{role.when}</span>
            )}
            <span>
              {role.href ? (
                <a href={role.href} className={styles.company}>
                  {role.company}
                </a>
              ) : (
                <span className={styles.company}>{role.company}</span>
              )}
              <span className={styles.role}>{role.title}</span>
            </span>
          </li>
        ))}
      </ol>

      <PhotoGrid groups={photoGroups} />
    </main>
  );
}
