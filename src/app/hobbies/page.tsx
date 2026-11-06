import type { Metadata } from 'next';
import page from '@/components/TapePage.module.css';
import styles from './Hobbies.module.css';
import { HobbyBoard } from './HobbyBoard';

export const metadata: Metadata = { title: 'What I like doing · noirrit chaki' };

export default function Hobbies() {
  return (
    <main className={`${page.page} ${styles.wide}`}>
      <HobbyBoard />
    </main>
  );
}
