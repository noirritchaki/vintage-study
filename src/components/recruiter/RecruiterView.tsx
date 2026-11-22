import Link from 'next/link';
import { contact } from '@/data/contact';
import { timeline } from '@/data/about';
import { stories } from '@/data/stories';
import { hrefFor, workTapes } from '@/data/tapes';
import { setRecruiterModeFrom } from '@/lib/recruiterMode';
import styles from './Recruiter.module.css';

/** The recruiter-mode home: who I am, links, experience and selected work, nothing else. */
export function RecruiterView() {
  const links = [
    contact.resume && { label: 'Resume', href: contact.resume },
    contact.linkedin && { label: 'LinkedIn', href: contact.linkedin },
    contact.email && { label: 'Email', href: `mailto:${contact.email}` },
    contact.github && { label: 'GitHub', href: contact.github },
    contact.x && { label: 'X', href: contact.x },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.name}>Noirrit Chaki</h1>
        <p className={styles.bio}>
          Product designer at Plum, working on health insurance claims and preventive care. Previously at capx.ai.
        </p>
        {links.length > 0 && (
          <ul className={styles.links}>
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target={l.href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      <section className={styles.block} aria-labelledby="exp">
        <h2 id="exp" className={styles.label}>
          Experience
        </h2>
        <ul className={styles.rows}>
          {timeline.map((r) => (
            <li key={r.company}>
              <span>
                <strong>{r.company}</strong>
                <span className={styles.sub}>{r.title}</span>
              </span>
              <span className={styles.when}>{r.when === 'Now' ? 'Present' : r.when}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block} aria-labelledby="work">
        <h2 id="work" className={styles.label}>
          Selected work
        </h2>
        <ul className={styles.rows}>
          {workTapes.map((t) => {
            const ready = !!stories[t.slug];
            return (
              <li key={t.slug}>
                <span>
                  <strong className={styles.workTitle}>{t.title}</strong>
                  <span className={styles.sub}>{ready ? t.summary : 'Case study in progress'}</span>
                </span>
                {ready ? (
                  <Link href={hrefFor(t)} className={styles.cta}>
                    Case study ↗
                  </Link>
                ) : (
                  <span className={styles.when}>Coming soon</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <footer className={styles.footer}>
        {/* a little end-of-the-line scene from the brew illustration kit */}
        <div className={styles.scene} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brew/mug-full.svg" alt="" className={styles.mug} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brew/steam-1.svg" alt="" className={styles.steam} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brew/beans.svg" alt="" className={styles.beans} />
        </div>

        <div className={styles.footRow}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Noirrit Chaki" width={44} height={32} className={styles.logo} />
          <ul className={styles.icons}>
              {contact.linkedin && (
                <li>
                  <a href={contact.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zm7 0h3.8v1.5h.05c.53-1 1.83-1.75 3.42-1.75 3.66 0 4.33 2.4 4.33 5.5v5.75h-4v-5.1c0-1.22-.02-2.8-1.7-2.8-1.71 0-1.97 1.33-1.97 2.7v5.2H10z" fill="currentColor" />
                    </svg>
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} aria-label="Email">
                    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
                    </svg>
                  </a>
                </li>
              )}
              {contact.github && (
                <li>
                  <a href={contact.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" fill="currentColor" />
                    </svg>
                  </a>
                </li>
              )}
              {contact.x && (
                <li>
                  <a href={contact.x} target="_blank" rel="noreferrer" aria-label="X">
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78zm-1.08 16.2h1.7L7.4 4.7H5.57z" fill="currentColor" />
                    </svg>
                  </a>
                </li>
              )}
              {contact.resume && (
                <li>
                  <a href={contact.resume} target="_blank" rel="noreferrer" className={styles.resume}>
                    Resume ↗
                  </a>
                </li>
              )}
            </ul>
        </div>
        <p className={styles.made}>
              made with lots of coffee, care and listening to{' '}
              <a href={contact.playlist} target="_blank" rel="noreferrer">
                this playlist ↗
              </a>{' '}
              on repeat
            </p>

        <button type="button" className={styles.exit} onClick={(e) => setRecruiterModeFrom(false, e.clientX, e.clientY)}>
          See the playful version →
        </button>
      </footer>
    </main>
  );
}
