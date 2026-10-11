import type { Metadata } from 'next';
import { BrewPage } from '@/components/brew/BrewPage';

export const metadata: Metadata = { title: 'Brew a coffee — noirrit chaki' };

export default function Brew() {
  return <BrewPage />;
}
