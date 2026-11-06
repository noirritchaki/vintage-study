import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { workTapes } from '@/data/tapes';
import { caseStudies, outline, type Block, type CaseStudy, type Figure, type Solution } from '@/data/caseStudies';
import styles from '@/components/TapePage.module.css';
import { CaseStudyToc, type TocItem } from '@/components/CaseStudyToc';
import { SolutionVideo } from '@/components/SolutionVideo';

export function generateStaticParams() {
  return workTapes.map((t) => ({ slug: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const tape = workTapes.find((t) => t.slug === slug);
  return {
    title: tape ? `${tape.title} · noirrit chaki` : 'noirrit chaki',
    description: caseStudies[slug]?.lead ?? tape?.summary,
  };
}

const chapterId = (numeral: string) => `chapter-${numeral.toLowerCase()}`;
const partId = (numeral: string, i: number) => `${chapterId(numeral)}-${i + 1}`;

/** The chapter list on the left: overview, then every chapter (with its sections) including the solution. */
function tocFor(study: CaseStudy): TocItem[] {
  return [
    { id: 'overview', label: 'Overview' },
    ...outline(study).map((entry): TocItem => {
      if (entry.kind === 'solution') return { id: 'solution', label: 'The solution' };
      const { numeral, chapter } = entry;
      return {
        id: chapterId(numeral),
        label: chapter.title.charAt(0).toUpperCase() + chapter.title.slice(1),
        children:
          chapter.parts.length > 1
            ? chapter.parts.map((p, i) => ({ id: partId(numeral, i), label: p.title }))
            : undefined,
      };
    }),
  ];
}

const PLACEHOLDER_SECTIONS = ['The problem', 'What I did', 'Outcome'];

export default async function CaseStudyPage({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params;
  const tape = workTapes.find((t) => t.slug === slug);
  if (!tape) notFound();
  const study = caseStudies[slug];

  return (
    <>
      {/* outside <main>: its fade-in animation would trap a fixed element inside it */}
      {study && <CaseStudyToc items={tocFor(study)} />}
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href={`/?tape=${tape.slug}`} className={styles.crumbBack}>
          ⏏ eject
        </Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{tape.title}</span>
      </nav>
      <main className={`${styles.page} ${study ? styles.wide : ''}`}>
        <p id="overview" className={`${styles.kicker} ${styles.anchor}`}>
          side A · case study
        </p>
        {study ? (
          <>
            <h1 className={`${styles.title} ${styles.headline}`}>{study.headline}</h1>
            <p className={styles.subtitle}>{study.subtitle}</p>
            <p className={styles.intro}>
              <span className={styles.lead}>{study.lead}</span> {study.intro}
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.title}>{tape.title}</h1>
            <p className={styles.subtitle}>{tape.summary}</p>
          </>
        )}

        <dl className={styles.meta}>
          <div>
            <dt>Role</dt>
            <dd>{tape.role}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{tape.year}</dd>
          </div>
          {study?.facts.map((f) => (
            <div key={f.label} className={f.wide ? styles.metaWide : undefined}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>

        {study ? (
          <>
            <ul className={styles.stats}>
              {study.stats.map((s) => (
                <li key={s.label}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                  <span className={styles.statDetail}>{s.detail}</span>
                </li>
              ))}
            </ul>

            {outline(study).map(({ numeral, ...entry }) =>
              entry.kind === 'solution' ? (
                <SolutionView key={numeral} numeral={numeral} solution={entry.solution} />
              ) : (
                <section key={numeral} id={chapterId(numeral)} className={`${styles.chapter} ${styles.anchor}`}>
                  <h2 className={styles.chapterTitle}>
                    <span>{numeral}.</span> {entry.chapter.title}
                  </h2>
                  {entry.chapter.parts.map((part, i) => (
                    <div key={part.title} id={partId(numeral, i)} className={`${styles.part} ${styles.anchor}`}>
                      <div className={styles.partHead}>
                        <h3>{part.title}</h3>
                        {part.tag && <p className={styles.tag}>{part.tag}</p>}
                      </div>
                      <div className={styles.partBody}>
                        {part.blocks.map((block, i) => (
                          <BlockView key={i} block={block} />
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              ),
            )}
          </>
        ) : (
          PLACEHOLDER_SECTIONS.map((heading) => (
            <section key={heading} className={styles.section}>
              <h2>{heading}</h2>
              <p>
                Placeholder copy. Replace this with the story of the project: the context, the decisions, and what
                changed because of the work.
              </p>
              <div className={styles.placeholder} />
            </section>
          ))
        )}
      </main>
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return <p className={styles.body}>{block.text}</p>;
    case 'note':
      return (
        <p className={styles.note}>
          <strong>Note:</strong> {block.text}
        </p>
      );
    case 'points':
      return (
        <ul className={styles.points}>
          {block.points.map((p, i) => (
            <li key={i}>
              {p.lead && <strong>{p.lead} </strong>}
              {p.text}
            </li>
          ))}
        </ul>
      );
    case 'figure':
      return <FigureView figure={block.figure} />;
    case 'table':
      return (
        <div className={styles.tableWrap}>
          <table className={`${styles.scale} ${styles.table}`}>
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
    case 'scale':
      return (
        <table className={styles.scale}>
          <thead>
            <tr>
              <th scope="col">{block.title}</th>
              <th scope="col">What it means</th>
            </tr>
          </thead>
          <tbody>
            {block.levels.map((l) => (
              <tr key={l.label}>
                <td>
                  <span className={styles.level} data-tone={l.tone}>
                    {l.label}
                  </span>
                </td>
                <td>{l.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'quote':
      return (
        <figure className={styles.quote}>
          <blockquote>{block.text}</blockquote>
          <figcaption>{block.cite}</figcaption>
        </figure>
      );
  }
}

function SolutionView({ numeral, solution }: { numeral: string; solution: Solution }) {
  return (
    <section id="solution" className={`${styles.chapter} ${styles.anchor}`}>
      <h2 className={styles.chapterTitle}>
        <span>{numeral}.</span> The solution
      </h2>
      <p className={styles.solutionTitle}>{solution.title}</p>
      <p className={styles.solutionIntro}>{solution.intro}</p>
      <ol className={styles.solutionList}>
        {solution.items.map((item, i) => (
          <li key={item.title} className={styles.solutionItem}>
            <h3>
              <span>{String(i + 1).padStart(2, '0')} /</span> {item.title}
            </h3>
            <p>{item.text}</p>
            {item.video ? (
              <SolutionVideo src={item.video} poster={item.poster} label={item.alt ?? item.title} />
            ) : item.src ? (
              <Image
                src={item.src}
                alt={item.alt ?? item.title}
                width={1600}
                height={1000}
                sizes="(max-width: 900px) 100vw, 880px"
                className={styles.solutionMedia}
              />
            ) : (
              <div className={`${styles.placeholder} ${styles.solutionMedia}`} aria-hidden>
                <span>image coming soon</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function FigureView({ figure }: { figure: Figure }) {
  return (
    <figure className={styles.figure}>
      {figure.src && figure.backdrop ? (
        <div className={styles.backdrop}>
          <Image
            src={figure.src}
            alt={figure.alt ?? figure.caption}
            width={figure.width ?? 1600}
            height={figure.height ?? 1000}
            sizes="(max-width: 900px) 100vw, 620px"
          />
        </div>
      ) : figure.src ? (
        <Image
          src={figure.src}
          alt={figure.alt ?? figure.caption}
          width={figure.width ?? 1600}
          height={figure.height ?? 1000}
          sizes="(max-width: 900px) 100vw, 620px"
          className={styles.figureImage}
        />
      ) : (
        <div className={styles.placeholder} aria-hidden>
          <span>image coming soon</span>
        </div>
      )}
      <figcaption>
        <span>{figure.label}</span> {figure.caption}
      </figcaption>
    </figure>
  );
}
