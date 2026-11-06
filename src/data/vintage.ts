// The pieces floating around the "vintage stuff i own" page. Each one is a
// cut-out photo (a PNG or WebP with a transparent background works best, like
// an object photographed on a table and cut out) plus a line about it, shown in
// handwriting with an arrow when someone hovers it.
//
// To add a real piece: drop the photo in public/vintage/ and set
// `src: '/vintage/name.png'`. Until then, `src`-less items show a placeholder.

export type VintagePiece = {
  name: string;
  /** Shown on hover, in handwriting. Keep it to a sentence or two. */
  description: string;
  src?: string;
  /** Display width in px on a desktop screen (height follows the photo). */
  width: number;
};

// PLACEHOLDERS: replace with your real pieces.
export const vintagePieces: VintagePiece[] = [
  { name: 'vintage piece', description: 'a little story about this one goes here', width: 120 },
  { name: 'vintage piece', description: 'where it came from, and why it stuck', width: 96 },
  { name: 'vintage piece', description: 'a little story about this one goes here', width: 140 },
  { name: 'vintage piece', description: 'where it came from, and why it stuck', width: 110 },
  { name: 'vintage piece', description: 'a little story about this one goes here', width: 90 },
  { name: 'vintage piece', description: 'where it came from, and why it stuck', width: 130 },
  { name: 'vintage piece', description: 'a little story about this one goes here', width: 104 },
];
