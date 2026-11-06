import { Fraunces, Source_Code_Pro } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import type { Media, Story, StoryBlock } from '@/data/stories';
import { tapes, hrefFor } from '@/data/tapes';
import { CaseStudyToc } from '@/components/CaseStudyToc';
import { SolutionVideo } from '@/components/SolutionVideo';
import styles from './Story.module.css';
import page from '@/components/TapePage.module.css';

// A light, soft serif for headings and a mono for the small labels, standing in
// for the reference's Gelica and Source Code Pro.
const serif = Fraunces({ subsets: ['latin'], weight: ['300', '400'], variable: '--font-story-serif' });
const code = Source_Code_Pro({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-code' });

/** An image, a looping video, or (until one is added) a watercolor placeholder. */
function MediaView({ media, label, tall }: { media?: Media; label: string; tall?: boolean }) {
  return (
    <div
      className={`${styles.frame} ${tall ? styles.tall : ''}`}
      data-fit={media?.fit}
      style={media?.fit && media.width && media.height ? { aspectRatio: `${media.width} / ${media.height}` } : undefined}
    >
      {media?.video ? (
        <SolutionVideo src={media.video} poster={media.poster} label={media.alt ?? label} />
      ) : media?.src ? (
        <Image
          src={media.src}
          alt={media.alt ?? label}
          width={media.width ?? 1600}
          height={media.height ?? 1000}
          sizes="(max-width: 900px) 100vw, 840px"
          className={styles.media}
        />
      ) : (
        <span className={styles.soon} aria-hidden>
          image coming soon
        </span>
      )}
    </div>
  );
}

const Pros = ({ items, sign }: { items: string[]; sign: '+' | '−' }) => (
  <ul className={styles.proscons} data-sign={sign === '+' ? 'pro' : 'con'}>
    {items.map((t) => (
      <li key={t}>
        <span aria-hidden>{sign}</span>
        <span className="sr-only">{sign === '+' ? 'Pro: ' : 'Con: '}</span>
        {t}
      </li>
    ))}
  </ul>
);

function Block({ block }: { block: StoryBlock }) {
  switch (block.type) {
    case 'text':
      return <p className={styles.text}>{block.text}</p>;
    case 'statement':
      return (
        <aside className={styles.statement}>
          <p className={styles.statementLabel}>{block.label}</p>
          <p className={styles.statementText}>{block.text}</p>
        </aside>
      );
    case 'cards':
      return (
        <ul className={styles.cards}>
          {block.cards.map((c) => (
            <li key={c.title}>
              <MediaView media={c.media} label={c.title} />
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </li>
          ))}
        </ul>
      );
    case 'options':
      return (
        <ul className={styles.options}>
          {block.options.map((o) => (
            <li key={o.title}>
              <MediaView media={o.media} label={o.title} />
              <div>
                <h3>{o.title}</h3>
                <Pros items={o.pros} sign="+" />
                <Pros items={o.cons} sign="−" />
              </div>
            </li>
          ))}
        </ul>
      );
    case 'finalPick':
      return (
        <section className={styles.finalPick}>
          <p className={styles.finalLabel}>{block.label ?? 'Final pick'}</p>
          <h3>{block.title}</h3>
          <MediaView media={block.media} label={block.title} />
          <Pros items={block.pros} sign="+" />
        </section>
      );
    case 'quote':
      return (
        <figure className={styles.quote}>
          <blockquote>{block.text}</blockquote>
          <figcaption>{block.cite}</figcaption>
        </figure>
      );
    case 'scale':
      return (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">{block.title}</th>
                <th scope="col">What it means</th>
              </tr>
            </thead>
            <tbody>
              {block.levels.map((l) => (
                <tr key={l.label}>
                  <th scope="row">
                    <span className={styles.level} data-tone={l.tone}>
                      {l.label}
                    </span>
                  </th>
                  <td>{l.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'list':
      return (
        <ul className={styles.list}>
          {block.items.map((it, i) => (
            <li key={i}>
              {it.lead && <strong>{it.lead} </strong>}
              {it.text}
            </li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {block.columns.map((c, i) => (
                  <th key={i} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) =>
                    c === 0 ? (
                      <th key={c} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={c}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'flows':
      return (
        <ol className={styles.flows}>
          {block.flows.map((f) => (
            <li key={f.title}>
              <MediaView media={f.media} label={f.title} tall />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ol>
      );
    case 'learnings':
      return (
        <ul className={styles.learnings}>
          {block.items.map((l) => (
            <li key={l.title}>
              <h3>{l.title}</h3>
              <p>{l.text}</p>
            </li>
          ))}
        </ul>
      );
    case 'figure':
      return (
        <figure className={styles.figure}>
          <MediaView media={block.media} label={block.caption} />
          <figcaption>{block.caption}</figcaption>
        </figure>
      );
  }
}

/**
 * A case study told as a story: hero, tags, title, role/team/timeline/skills,
 * impact, then labelled sections (with explorations and final picks), key
 * flows, reflection and a "next up" link. Modelled on meganyap.me/work/splunk.
 */
export function StoryPage({ slug, story }: { slug: string; story: Story }) {
  const next = story.nextUp ? tapes.find((t) => t.slug === story.nextUp) : undefined;
  return (
    <div className={`${styles.page} ${serif.variable} ${code.variable}`}>
      {/* the same "⏏ eject / title" breadcrumb as the other case studies */}
      <nav className={page.crumbs} aria-label="Breadcrumb">
        <Link href={`/?tape=${slug}`} className={page.crumbBack}>
          ⏏ eject
        </Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{story.title}</span>
      </nav>
      <CaseStudyToc items={story.sections.map((s) => ({ id: s.id, label: s.nav }))} />

      <main className={styles.main}>
        <MediaView media={story.hero} label={story.title} tall />

        <ul className={styles.tags}>
          {story.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <h1 className={styles.title}>
          <span aria-hidden className={styles.star}>
            ✳
          </span>{' '}
          {story.title}
        </h1>
        <p className={styles.summary}>{story.summary}</p>

        <dl className={styles.meta}>
          <div>
            <dt>Role</dt>
            <dd>{story.meta.role}</dd>
          </div>
          <div>
            <dt>Team</dt>
            {story.meta.team.map((t) => (
              <dd key={t}>{t}</dd>
            ))}
          </div>
          <div>
            <dt>Timeline</dt>
            {story.meta.timeline.map((t) => (
              <dd key={t}>{t}</dd>
            ))}
          </div>
          <div>
            <dt>Skills</dt>
            {story.meta.skills.map((t) => (
              <dd key={t}>{t}</dd>
            ))}
          </div>
        </dl>

        <section className={styles.impact} aria-label="Impact">
          <p className={styles.label}>Impact</p>
          <ul>
            {story.impact.map((i) => (
              <li key={i.label}>
                <span className={styles.impactValue}>{i.value}</span>
                <span className={styles.impactLabel}>{i.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {story.sections.map((s) => (
          <section key={s.id} id={s.id} className={styles.section}>
            <p className={styles.label}>{s.label}</p>
            <h2 className={styles.heading}>{s.heading}</h2>
            {s.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </section>
        ))}

        {next && (
          <Link href={hrefFor(next)} className={styles.next}>
            <span className={styles.label}>Next up</span>
            <span className={styles.nextTitle}>{next.title}</span>
            <span className={styles.nextSummary}>{next.summary}</span>
            <span className={styles.nextCta}>Read next →</span>
          </Link>
        )}
      </main>
    </div>
  );
}
