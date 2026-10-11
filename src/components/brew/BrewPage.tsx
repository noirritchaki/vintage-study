'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import retro from '../RetroButton.module.css';
import styles from './BrewPage.module.css';
import type { View } from './BrewScene';
import { BrewGuide } from './BrewGuide';
import { BrewTitle } from './BrewTitle';

const BrewScene = dynamic(() => import('./BrewScene'), { ssr: false });

export function BrewPage() {
  const [view, setView] = useState<View>('overview');
  const toggle = () => setView((v) => (v === 'overview' ? 'brew' : 'overview'));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setView('overview');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className={styles.root}>
      <BrewScene view={view} onToggle={toggle} />

      <Link href="/" className={`${retro.button} ${styles.back}`} aria-label="Back home">
        ⏏<span className={styles.backLabel}> back</span>
      </Link>

      <BrewTitle hidden={view === 'brew'} />
      {view === 'brew' && <BrewGuide />}

      <div className={styles.footer}>
        <button type="button" className={retro.button} onClick={toggle} aria-pressed={view === 'brew'}>
          {view === 'overview' ? 'brew a cup' : 'step back'}
        </button>
        <p className={styles.caption}>
          {view === 'overview'
            ? 'click the dripper to brew a cup'
            : 'press and hold on the coffee bed to pour · space works too'}
        </p>
      </div>

      <p className={styles.credit}>
        Kettle by{' '}
        <a href="https://sketchfab.com/3d-models/fellow-stagg-ekg-electric-kettle-9d02f50339204aceae991da3ae251869">
          tiikeri
        </a>{' '}
        (<a href="http://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>), scale by{' '}
        <a href="https://sketchfab.com/3d-models/coffee-scales-and-kettle-bbe0c28124c9461e85b56bd289137c47">
          hakangztk
        </a>{' '}
        (<a href="http://creativecommons.org/licenses/by-nc/4.0/">CC BY-NC 4.0</a>)
      </p>
    </main>
  );
}
