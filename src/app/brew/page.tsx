import type { Metadata } from 'next';
import { DM_Mono } from 'next/font/google';
import { BrewStudio } from '@/components/brew/BrewStudio';

// The illustration kit's typeface.
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dm-mono' });

export const metadata: Metadata = { title: 'Brew a coffee · noirrit chaki' };

export default function Brew() {
  return (
    <div className={dmMono.variable}>
      <BrewStudio />
    </div>
  );
}
