import { Source_Code_Pro } from 'next/font/google';
import localFont from 'next/font/local';

// GT Alpina (licensed, files in this folder) for case study and recruiter headings.
export const gtAlpina = localFont({
  src: [
    { path: './GT-Alpina-Standard-Light.woff2', weight: '300', style: 'normal' },
    { path: './GT-Alpina-Standard-Light-Italic.woff2', weight: '300', style: 'italic' },
    { path: './GT-Alpina-Standard-Regular.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--font-story-serif',
  display: 'swap',
});

// A mono for small labels.
export const code = Source_Code_Pro({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-code' });
