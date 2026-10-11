import type { Metadata } from 'next';
import { Inter, VT323 } from 'next/font/google';
import { NavPlayer } from '@/components/NavPlayer';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
// Pixel font for the retro player-style nav.
const vt323 = VT323({ variable: '--font-vt323', subsets: ['latin'], weight: '400' });

export const metadata: Metadata = {
  title: 'noirrit chaki — product designer',
  description: 'Case studies and B-sides, on tape.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${inter.variable} ${vt323.variable}`}>
      <body>
        <NavPlayer />
        {children}
      </body>
    </html>
  );
}
