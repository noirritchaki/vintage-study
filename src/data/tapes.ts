export type TapeKind = 'work' | 'hobbies';

/** A small preview of a page, shown on JontyLLM's link cards (16:9, cropped to fit). */
export type Thumbnail = { src: string } | { video: string; poster?: string };

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
  /** Image or looping video for the chat's link card. */
  thumbnail?: Thumbnail;
};

// Case study 04 is still a placeholder. Long-form content lives in
// caseStudies.ts, keyed by slug.
// Order here is the order on the shelf; the row loops around.
export const tapes: Tape[] = [
  {
    slug: 'killing-the-document-update-request',
    kind: 'work',
    title: 'Killing the Document Update Request',
    summary: 'Rebuilding how people claim their health money',
    year: '2026',
    role: 'Product Designer',
    variant: 0,
    // Stand-in: the tape on the shelf. Swap for a project image or video.
    thumbnail: { src: '/thumbs/killing-the-document-update-request.webp' },
  },
  {
    slug: 'health-checkup',
    kind: 'work',
    title: 'Health Checkup',
    summary: 'Booking, tracking and reports for preventive health checkups',
    year: '2026',
    role: 'Product Designer',
    variant: 3,
    // Stand-in: the tape on the shelf. Swap for a project image or video.
    thumbnail: { src: '/thumbs/health-checkup.webp' },
  },
  {
    slug: 'when-the-insurer-says-no',
    kind: 'work',
    title: 'When the Insurer Says No',
    summary: 'Designing a fair claim dispute flow at Plum',
    year: '2026',
    role: 'Product Designer',
    variant: 1,
    // Stand-in: the tape on the shelf. Swap for a project image or video.
    thumbnail: { src: '/thumbs/when-the-insurer-says-no.webp' },
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
    thumbnail: { video: '/about/climb-1.mp4', poster: '/about/climb-1-poster.webp' },
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
