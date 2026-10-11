export type TapeKind = 'work' | 'hobbies';

export type Tape = {
  slug: string;
  kind: TapeKind;
  /** Shown on the sticky note above the tape. Keep it short. */
  title: string;
  /** One-liner shown on the case study page. */
  summary: string;
  year: string;
  role: string;
  /** Which of the six cassette styles in cassettes.glb this tape uses (0–5). */
  variant: number;
};

// Placeholder content — swap these for real case studies.
// Order here is the order on the shelf; the row loops around.
export const tapes: Tape[] = [
  {
    slug: 'case-study-one',
    kind: 'work',
    title: 'Case Study 01',
    summary: 'A short line about the problem this project solved.',
    year: '2026',
    role: 'Lead product designer',
    variant: 0,
  },
  {
    slug: 'case-study-two',
    kind: 'work',
    title: 'Case Study 02',
    summary: 'A short line about the problem this project solved.',
    year: '2025',
    role: 'Product designer',
    variant: 3,
  },
  {
    slug: 'case-study-three',
    kind: 'work',
    title: 'Case Study 03',
    summary: 'A short line about the problem this project solved.',
    year: '2024',
    role: 'Product designer',
    variant: 1,
  },
  {
    slug: 'case-study-four',
    kind: 'work',
    title: 'Case Study 04',
    summary: 'A short line about the problem this project solved.',
    year: '2023',
    role: 'Product designer',
    variant: 4,
  },
  {
    slug: 'hobbies',
    kind: 'hobbies',
    title: 'B-sides',
    summary: 'Everything I do when I am not pushing pixels.',
    year: '∞',
    role: 'Enthusiast',
    variant: 5,
  },
];

export function hrefFor(tape: Tape) {
  return tape.kind === 'hobbies' ? '/hobbies' : `/work/${tape.slug}`;
}

export function tapeAt(index: number) {
  const n = tapes.length;
  return tapes[((index % n) + n) % n];
}

export const workTapes = tapes.filter((t) => t.kind === 'work');
