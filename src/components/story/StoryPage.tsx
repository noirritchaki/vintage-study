import Image from 'next/image';
import Link from 'next/link';
import type { Hypothesis, Media, Story, StoryBlock } from '@/data/stories';
import { tapes, hrefFor } from '@/data/tapes';
import { CaseStudyToc } from '@/components/CaseStudyToc';
import { SolutionVideo } from '@/components/SolutionVideo';
import styles from './Story.module.css';
import page from '@/components/TapePage.module.css';

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

const STATUS: Record<Hypothesis['status'], string> = {
  validated: 'Validated',
  partly: 'Partly validated',
  disproved: 'Disproved',
  measuring: 'Still measuring',
};

/** Hypotheses as set at the start, or checked against what happened. */
function Hypotheses({ items, show }: { items: Hypothesis[]; show: 'set' | 'result' }) {
  return (
    <ol className={styles.hypotheses} data-show={show}>
      {items.map((h, i) => (
        <li key={i}>
          <p className={styles.hypNum}>H{i + 1}</p>
          <div>
            <p className={styles.hypBelief}>{h.belief}</p>
            {show === 'set' ? (
              <dl className={styles.hypDetail}>
                <dt>Because</dt>
                <dd>{h.because}</dd>
                <dt>We’d know by</dt>
                <dd>{h.measure}</dd>
              </dl>
            ) : (
              <>
                <span className={styles.hypStatus} data-status={h.status}>
                  {STATUS[h.status]}
                </span>
                <p className={styles.hypResult}>{h.result}</p>
              </>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Block({ block, story }: { block: StoryBlock; story: Story }) {
  switch (block.type) {
    case 'text':
      return <p className={styles.text}>{block.text}</p>;
    case 'decisions':
      return (
        <ol className={styles.decisions}>
          {block.items.map((d, i) => (
            <li key={d.title}>
              <h3>
                {String(i + 1).padStart(2, '0')} · {d.title}
              </h3>
              <p>{d.text}</p>
              {d.media && <MediaView media={d.media} label={d.title} />}
            </li>
          ))}
        </ol>
      );
    case 'hypotheses':
      return <Hypotheses items={story.hypotheses} show={block.show} />;
    case 'subhead':
      return <h3 className={styles.subhead}>{block.text}</h3>;
    case 'stats':
      return (
        <ul className={styles.stats}>
          {block.items.map((st) => (
            <li key={st.label}>
              <span className={styles.statValue}>{st.value}</span>
              <span className={styles.statLabel}>{st.label}</span>
            </li>
          ))}
        </ul>
      );
    case 'statement':
      return (
        <aside className={styles.statement}>
          <p className={styles.statementLabel}>{block.label}</p>
          <p className={styles.statementText}>{block.text}</p>
        </aside>
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
 * A case study after elaineyu.design: a meta card, the title, an intro and
 * tags, then six numbered sections and a "next stop" link, with the timeline
 * of sections pinned to the left.
 */
export function StoryPage({ slug, story }: { slug: string; story: Story }) {
  const next = story.nextUp ? tapes.find((t) => t.slug === story.nextUp) : undefined;
  return (
    <div className={styles.page} data-story>
      <nav className={page.crumbs} aria-label="Breadcrumb">
        <Link href={`/?tape=${slug}`} className={page.crumbBack}>
          ⏏ eject
        </Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{story.title}</span>
      </nav>
      <CaseStudyToc items={story.sections.map((s) => ({ id: s.id, label: s.label }))} />

      <main className={styles.main}>
        {/* the hero design anchors the page */}
        {story.hero && <MediaView media={story.hero} label={story.title} tall />}

        <h1 className={styles.title}>{story.title}</h1>
        <ul className={styles.tags}>
          {story.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <dl className={styles.meta}>
          <div>
            <dt>Role</dt>
            <dd>{story.meta.role}</dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd>{story.meta.timeline}</dd>
          </div>
          <div>
            <dt>Tools</dt>
            <dd>{story.meta.tools}</dd>
          </div>
          <div>
            <dt>Team</dt>
            <dd>{story.meta.team}</dd>
          </div>
        </dl>

        <section className={styles.tldr} aria-label="TL;DR">
          <p className={styles.tldrLabel}>TL;DR</p>
          <p className={styles.tldrText}>{story.intro}</p>
          <ul>
            {story.tldr.map((m) => (
              <li key={m.label}>
                <span className={styles.tldrValue}>
                  {m.trend && (
                    <span className={styles.trend} data-trend={m.trend} aria-label={m.trend === 'up' ? 'up' : 'down'}>
                      {m.trend === 'up' ? '↑' : '↓'}
                    </span>
                  )}
                  {m.value}
                </span>
                <span className={styles.tldrMetric}>{m.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {story.sections.map((s, i) => (
          <section key={s.id} id={s.id} className={styles.section}>
            <p className={styles.label}>
              {String(i + 1).padStart(2, '0')} — {s.label}
            </p>
            <h2 className={styles.heading}>{s.heading}</h2>
            {s.blocks.map((b, k) => (
              <Block key={k} block={b} story={story} />
            ))}
          </section>
        ))}

        {next && (
          <Link href={hrefFor(next)} className={styles.next}>
            <span className={styles.label}>Next stop →</span>
            <span className={styles.nextTitle}>{next.title}</span>
            <span className={styles.nextSummary}>{next.summary}</span>
          </Link>
        )}
      </main>
    </div>
  );
}
