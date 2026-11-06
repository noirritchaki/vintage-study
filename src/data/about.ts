// Content for the About page. Everything marked PLACEHOLDER is yours to swap.

/** A few short paragraphs. Keep them conversational. */
/** A run of bio text, or a phrase with a dotted underline that shows a note on hover. */
export type BioPart = string | { text: string; note: string };

export const aboutParagraphs: BioPart[][] = [
  [
    'I’m a product designer, which for me mostly means getting curious about how something actually works, going down a few rabbit holes, and coming back with something that feels simple. I care a lot about the small details, as long as they actually help someone.',
  ],
  [
    'At Plum, I work on the parts of health insurance people only touch when something has gone wrong, like filing a claim after a hospital visit. It’s messy, high-stakes stuff, and my job is to untangle it until it feels calm and obvious.',
  ],
  [
    'Outside of work, I’m usually bouldering, running, ',
    { text: 'brewing coffee', note: 'i also run a coffee brand called monday coffee' },
    ' or hunting down vintage pieces. I also recently started a little coffee brand called monday coffee.',
  ],
  ['Always happy to chat about design or my endless list of hobbies :)'],
];

/** The bio as plain text, one string per paragraph. */
export const aboutText = aboutParagraphs.map((p) => p.map((part) => (typeof part === 'string' ? part : part.text)).join(''));

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
  /** A short muted clip that autoplays and loops in place (no sound, no controls). */
  video?: string;
  /** Still frame shown while the clip loads. */
  poster?: string;
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
  { label: 'me', photos: [{ ratio: 4 / 5, src: '/about/me.webp', alt: 'Noirrit throwing a peace sign in a café', caption: 'hi, that’s me' }] },
  {
    label: 'friends',
    photos: [
      { ratio: 4 / 3, src: '/about/friends-crimp.webp', alt: 'Noirrit with two friends on a night out', caption: 'crimp cuties :)' },
      { ratio: 3 / 4, video: '/about/friends-uniqlo.mp4', poster: '/about/friends-uniqlo-poster.webp', alt: 'Friends hanging out at Uniqlo', caption: 'shopping shenanigans' },
      { ratio: 4 / 3, src: '/about/friends-colleagues.webp', alt: 'Noirrit with three friends at a party', caption: 'more than just colleagues :)' },
      { ratio: 4 / 3, src: '/about/friends-cheers.webp', alt: 'Noirrit and a friend raising drinks', caption: 'cheers :)' },
      { ratio: 3 / 4, src: '/about/friends-boys.webp', alt: 'Noirrit and seven friends sitting on a beach', caption: 'bonding with the boys' },
    ],
  },
  {
    label: 'climbing',
    photos: [
      { ratio: 3 / 4, video: '/about/climb-1.mp4', poster: '/about/climb-1-poster.webp', alt: 'Noirrit bouldering', caption: 'sending it' },
      { ratio: 1066 / 1638, src: '/about/climb-5.webp', alt: 'Noirrit spanning holds in a Friendly Neighbourhood Climbers tee', caption: 'friendly neighbourhood climber :)' },
      { ratio: 1, video: '/about/climb-2.mp4', poster: '/about/climb-2-poster.webp', alt: 'Noirrit working a boulder problem', caption: 'working the problem' },
      { ratio: 3 / 4, video: '/about/climb-3.mp4', poster: '/about/climb-3-poster.webp', alt: 'Noirrit on the wall', caption: 'one more go' },
    ],
  },
  {
    label: 'running',
    photos: [
      { ratio: 1, src: '/about/run-1.webp', alt: 'Runners on a highway at sunrise during a race', caption: 'race morning' },
      { ratio: 3 / 4, video: '/about/run-2.mp4', poster: '/about/run-2-poster.webp', alt: 'Noirrit holding up a finisher medal', caption: 'medal moment :)' },
    ],
  },
  {
    label: 'coffee',
    photos: [
      { ratio: 1, src: '/about/coffee-1.webp', alt: 'A honey cinnamon iced latte held up next to an espresso machine', caption: 'honey cinnamon iced latte' },
      { ratio: 3 / 4, src: '/about/coffee-2.webp', alt: 'A glass of iced black coffee', caption: 'iced and black, always' },
      { ratio: 1, src: '/about/coffee-3.webp', alt: 'A latte with rosetta latte art', caption: 'finally got a rosetta :’)' },
      { ratio: 3 / 4, src: '/about/coffee-4.webp', alt: 'Iced drinks and a pastry on a café tray in the sun', caption: 'slow café afternoons' },
      { ratio: 1300 / 1210, src: '/about/coffee-5.webp', alt: 'Noirrit steaming milk at an espresso machine in the Plum office', caption: 'self elected barista at plum btw' },
    ],
  },
  {
    label: 'adventures',
    photos: [
      { ratio: 3 / 4, video: '/about/adv-1.mp4', poster: '/about/adv-1-poster.webp', alt: 'Friends walking down to the sea with surfboards', caption: 'paddling out' },
      { ratio: 4 / 3, src: '/about/adv-7.webp', alt: 'A view over green hills under a cloudy sky', caption: 'hill country views' },
      { ratio: 3 / 4, video: '/about/adv-2.mp4', poster: '/about/adv-2-poster.webp', alt: 'Waves rolling in on the open sea', caption: 'salt water therapy' },
      { ratio: 900 / 875, src: '/about/adv-8.webp', alt: 'Blue tents pitched under trees at a campsite', caption: 'camp mornings' },
      { ratio: 16 / 9, video: '/about/adv-5.mp4', poster: '/about/adv-5-poster.webp', alt: 'Noirrit snorkelling in clear turquoise water', caption: 'under the sea' },
    ],
  },
  { label: 'vintage pieces', photos: [{ ratio: 4 / 5 }, { ratio: 4 / 3 }] },
];
