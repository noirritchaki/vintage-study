import type { Metadata } from 'next';
import { Caveat } from 'next/font/google';
import { vintagePieces } from '@/data/vintage';
import { VintageShelf } from './VintageShelf';

// The home page's handwriting, for the notes on each piece.
const caveat = Caveat({ subsets: ['latin'], weight: '700', variable: '--font-caveat' });

export const metadata: Metadata = { title: 'Vintage stuff I own · noirrit chaki' };

export default function Vintage() {
  return (
    <main className={caveat.variable}>
      <VintageShelf pieces={vintagePieces} />
    </main>
  );
}
