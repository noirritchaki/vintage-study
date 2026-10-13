import type { Metadata } from 'next';
import { Inter, Libre_Baskerville, VT323 } from 'next/font/google';
import { SiteNav } from '@/components/SiteNav';
import { JontyChat } from '@/components/jonty/JontyChat';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
// Serif for the JontyLLM chat's greeting.
const serif = Libre_Baskerville({ variable: '--font-serif', subsets: ['latin'], weight: '400' });
// Pixel font for the retro player-style nav.
const vt323 = VT323({ variable: '--font-vt323', subsets: ['latin'], weight: '400' });

export const metadata: Metadata = {
  title: 'noirrit chaki — product designer',
  description: 'Case studies and B-sides, on tape.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${inter.variable} ${vt323.variable} ${serif.variable}`}>
      <body>
        <SiteNav />
        <JontyChat />
        {children}
      </body>
    </html>
  );
}
