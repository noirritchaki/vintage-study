import type { Metadata } from 'next';
import { Caveat } from 'next/font/google';
import { aboutParagraphs, photoGroups, timeline } from '@/data/about';
import page from '@/components/TapePage.module.css';
import styles from './About.module.css';
import { PhotoGrid } from './PhotoGrid';

// The home page's handwriting, for the bio's hover notes.
const caveat = Caveat({ subsets: ['latin'], weight: '700', variable: '--font-caveat' });

export const metadata: Metadata = { title: 'About · noirrit chaki' };

export default function About() {
  return (
    <main className={`${page.page} ${styles.about} ${caveat.variable}`}>

      <section className={styles.bio} aria-label="About me">
        {aboutParagraphs.map((p, i) => (
          <p key={i}>
            {p.map((part, k) =>
              typeof part === 'string' ? (
                part
              ) : (
                <span key={k} className={styles.annotated} tabIndex={0}>
                  {part.text}
                  <span className={styles.note} role="note">
                    <svg viewBox="0 0 34 30" width="34" height="30" aria-hidden>
                      <path d="M31 3C22 4 11 9 7 25" />
                      <path d="M2.5 19.5L7 26L12.5 21" />
                    </svg>
                    <span>{part.note}</span>
                  </span>
                </span>
              ),
            )}
          </p>
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
