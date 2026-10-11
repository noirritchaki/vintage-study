import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { workTapes } from '@/data/tapes';
import styles from '@/components/TapePage.module.css';

export function generateStaticParams() {
  return workTapes.map((t) => ({ slug: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const tape = workTapes.find((t) => t.slug === slug);
  return { title: tape ? `${tape.title} — noirrit chaki` : 'noirrit chaki' };
}

const SECTIONS = ['The problem', 'What I did', 'Outcome'];

export default async function CaseStudy({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params;
  const tape = workTapes.find((t) => t.slug === slug);
  if (!tape) notFound();

  return (
    <main className={styles.page}>
      <Link href={`/?tape=${tape.slug}`} className={styles.eject}>
        ⏏ eject
      </Link>

      <p className={styles.kicker}>side A · case study</p>
      <h1 className={styles.title}>{tape.title}</h1>
      <p className={styles.summary}>{tape.summary}</p>

      <dl className={styles.meta}>
        <div>
          <dt>Role</dt>
          <dd>{tape.role}</dd>
        </div>
        <div>
          <dt>Year</dt>
          <dd>{tape.year}</dd>
        </div>
        <div>
          <dt>Team</dt>
          <dd>Placeholder</dd>
        </div>
      </dl>

      {SECTIONS.map((heading) => (
        <section key={heading} className={styles.section}>
          <h2>{heading}</h2>
          <p>
            Placeholder copy. Replace this with the story of the project: the context, the decisions, and what
            changed because of the work.
          </p>
          <div className={styles.placeholder} />
        </section>
      ))}
    </main>
  );
}
