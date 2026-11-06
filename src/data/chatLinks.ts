// Pages JontyLLM can point visitors to. When an answer is about one of these,
// the chat shows a card with its thumbnail that links there. Case studies come
// from tapes.ts (set `thumbnail` on a tape to change its card); the rest are here.

import { caseStudies } from './caseStudies';
import { stories } from './stories';
import { hrefFor, tapes, type Thumbnail } from './tapes';

export type ChatLink = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  /** Tells the bot when this page is worth linking. */
  about: string;
  thumbnail?: Thumbnail;
};

const pageLinks: ChatLink[] = [
  {
    id: 'about',
    href: '/about',
    title: 'About',
    subtitle: 'who I am, plus photos of friends, climbing, running, coffee and trips',
    about: 'my background, where I work, friends, and the photo groups (climbing, running, coffee, adventures)',
    thumbnail: { src: '/about/me.webp' },
  },
  {
    id: 'brew',
    href: '/brew',
    title: 'Brew a cup of coffee',
    subtitle: 'make my Monday pour-over yourself',
    about: 'pour-over coffee, my brew recipe, or the interactive coffee page',
    thumbnail: { src: '/thumbs/brew.webp' },
  },
  {
    id: 'projects',
    href: '/projects',
    title: 'Projects',
    subtitle: 'every case study on the shelf',
    about: "what I'm working on at Plum, my work in general, or any answer that covers more than one project",
    thumbnail: { src: '/thumbs/projects.webp' },
  },
];

const tapeLinks: ChatLink[] = tapes
  .filter((t) => t.kind === 'hobbies' || caseStudies[t.slug] || stories[t.slug])
  .map((t) => ({
    id: t.slug,
    href: hrefFor(t),
    title: t.kind === 'hobbies' ? 'What I like doing' : t.title,
    subtitle: t.kind === 'hobbies' ? 'the B-sides: hobbies and side quests' : t.summary,
    about: t.kind === 'hobbies' ? 'my hobbies and life outside work' : `the ${t.title} case study`,
    thumbnail: t.thumbnail,
  }));

export const chatLinks: ChatLink[] = [...tapeLinks, ...pageLinks];

export const chatLinkById = (id: string) => chatLinks.find((l) => l.id === id);
