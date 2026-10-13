import { Caveat } from 'next/font/google';
import { Deck } from '@/components/Deck';

// Hand-writing for the cassette labels (drawn into a canvas texture).
const caveat = Caveat({ subsets: ['latin'], weight: '700', variable: '--font-caveat' });

export default function Home() {
  return (
    <main className={caveat.variable}>
      <Deck labelFont={caveat.style.fontFamily} />
    </main>
  );
}
