// "What I like doing": cards for the hobbies page, filtered by the chips.
// Titles and subtitles are PLACEHOLDERS: swap in your own. To add a photo,
// put it in public/hobbies/ and set `src: '/hobbies/name.jpg'` plus its real
// `ratio` (width ÷ height) so the card keeps the photo's shape.

export const hobbyFilters = ['all', 'sports', 'coffee', 'reading', 'music'] as const;
export type HobbyCategory = Exclude<(typeof hobbyFilters)[number], 'all'>;

export type Hobby = {
  title: string;
  /** Grey line under the title, e.g. where or when. */
  subtitle: string;
  category: HobbyCategory;
  ratio: number;
  src?: string;
  alt?: string;
  /** Shown in the magenta hover tag. Falls back to the title. */
  caption?: string;
};

export const hobbies: Hobby[] = [
  { title: 'Bouldering', subtitle: 'sports', category: 'sports', ratio: 3 / 4 },
  { title: 'Monday pour-over', subtitle: 'coffee', category: 'coffee', ratio: 1 },
  { title: 'Currently reading', subtitle: 'reading', category: 'reading', ratio: 4 / 5 },
  { title: 'Cassette collection', subtitle: 'music', category: 'music', ratio: 4 / 3 },
  { title: 'Weekend long run', subtitle: 'sports', category: 'sports', ratio: 4 / 3 },
  { title: 'Café hopping', subtitle: 'coffee', category: 'coffee', ratio: 3 / 4 },
  { title: 'On repeat', subtitle: 'music', category: 'music', ratio: 1 },
  { title: 'Favourite book', subtitle: 'reading', category: 'reading', ratio: 3 / 4 },
  { title: 'Race day', subtitle: 'sports', category: 'sports', ratio: 4 / 5 },
  { title: 'Beans I keep buying', subtitle: 'coffee', category: 'coffee', ratio: 4 / 3 },
  { title: 'Live show', subtitle: 'music', category: 'music', ratio: 3 / 4 },
  { title: 'Reading corner', subtitle: 'reading', category: 'reading', ratio: 4 / 3 },
];
