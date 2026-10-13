// Content for the About page. Everything marked PLACEHOLDER is yours to swap.

/** A few short paragraphs. Keep them conversational. */
export const aboutParagraphs = [
  'I’m a product designer at Plum, working on the parts of health insurance people only touch when something has gone wrong, like filing a claim after a hospital visit.',
  // PLACEHOLDER: a line about how you work or what you care about.
  'I like untangling messy, high-stakes flows until they feel calm and obvious. Most of my favourite work is the stuff nobody notices because it just works.',
  // PLACEHOLDER: a line about life outside work.
  'Outside of designing, I make a pour-over every Monday, collect cassettes, and spend too long tuning my portfolio.',
  // PLACEHOLDER: what you're open to / how to reach you.
  'Always happy to chat about design, coffee, or both.',
];

export type Role = {
  /** "Now" for the current role, otherwise a year. */
  when: string;
  company: string;
  title: string;
  href?: string;
};

/** Newest first. */
export const timeline: Role[] = [
  { when: 'Now', company: 'Plum Benefits', title: 'Product Designer', href: 'https://www.plumhq.com' },
  { when: '2021–22', company: 'capx.ai', title: 'Product Designer', href: 'https://capx.ai' },
];

export type Photo = {
  /** Width ÷ height, so the placeholder keeps the photo's shape. */
  ratio: number;
  /** Shown in the tag that follows the cursor on hover. Falls back to the group label. */
  caption?: string;
  src?: string;
  alt?: string;
};

export type PhotoGroup = { label: string; photos: Photo[] };

/**
 * The photo grid: four columns, each group's label sits above its first
 * photo. To add a photo, put it in public/about/ and set
 * `src: '/about/name.jpg'`, its real `ratio`, and a `caption`.
 */
export const photoGroups: PhotoGroup[] = [
  { label: 'me', photos: [{ ratio: 4 / 5 }] },
  { label: 'my friends', photos: [{ ratio: 3 / 2 }, { ratio: 3 / 4 }] },
  { label: 'climbing', photos: [{ ratio: 3 / 4 }, { ratio: 4 / 3 }] },
  { label: 'running', photos: [{ ratio: 4 / 3 }, { ratio: 4 / 5 }] },
  { label: 'coffee', photos: [{ ratio: 4 / 5 }, { ratio: 1 }] },
  { label: 'adventures', photos: [{ ratio: 3 / 4 }, { ratio: 4 / 3 }, { ratio: 3 / 4 }] },
  { label: 'vintage pieces', photos: [{ ratio: 4 / 5 }, { ratio: 4 / 3 }] },
];
