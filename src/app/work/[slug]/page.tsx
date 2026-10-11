import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { workTapes } from '@/data/tapes';
import { caseStudies, type Block, type Figure } from '@/data/caseStudies';
import styles from '@/components/TapePage.module.css';

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

const PLACEHOLDER_SECTIONS = ['The problem', 'What I did', 'Outcome'];

export default async function CaseStudyPage({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params;
  const tape = workTapes.find((t) => t.slug === slug);
  if (!tape) notFound();
  const study = caseStudies[slug];

  return (
    <main className={`${styles.page} ${study ? styles.wide : ''}`}>
      <Link href={`/?tape=${tape.slug}`} className={styles.eject}>
        ⏏ eject
      </Link>

      <p className={styles.kicker}>side A · case study</p>
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

          {study.chapters.map((chapter) => (
            <section key={chapter.numeral} className={styles.chapter}>
              <h2 className={styles.chapterTitle}>
                <span>{chapter.numeral}.</span> {chapter.title}
              </h2>
              {chapter.parts.map((part) => (
                <div key={part.title} className={styles.part}>
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
          ))}
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
  }
}

function FigureView({ figure }: { figure: Figure }) {
  return (
    <figure className={styles.figure}>
      {figure.src ? (
        <Image
          src={figure.src}
          alt={figure.alt ?? figure.caption}
          width={1600}
          height={1000}
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
