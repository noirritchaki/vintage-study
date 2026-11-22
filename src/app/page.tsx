import { Caveat } from 'next/font/google';
import { Deck } from '@/components/Deck';
import { HomeSwitch } from '@/components/recruiter/HomeSwitch';

// Hand-writing for the cassette labels (drawn into a canvas texture).
const caveat = Caveat({ subsets: ['latin'], weight: '700', variable: '--font-caveat' });

export default function Home() {
  return (
    <HomeSwitch>
      <main className={caveat.variable}>
        <Deck labelFont={caveat.style.fontFamily} />
      </main>
    </HomeSwitch>
  );
}
