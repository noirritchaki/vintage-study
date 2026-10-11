'use client';

import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import { fitCamera } from '../scene/layout';
import { TypedText } from '../TypedText';
import styles from './BrewTitle.module.css';

/**
 * Logo with the page's name under it — the home page hero's exact type and
 * sizing, including the way it scales down with the window like the home page.
 */
export function BrewTitle({ hidden }: { hidden?: boolean }) {
  const [u, setU] = useState(1);
  useEffect(() => {
    const update = () => {
      const { visibleH } = fitCamera(window.innerWidth / window.innerHeight);
      setU(window.innerHeight / visibleH);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <header
      className={styles.title}
      data-hidden={hidden || undefined}
      style={{ '--u': u } as CSSProperties}
    >
      <Image src="/logo.png" alt="" width={390} height={287} priority className={styles.logo} />
      <h1 className={styles.name}>
        <span className={styles.underline}>
          <TypedText text="monday coffee" />
        </span>
      </h1>
    </header>
  );
}
