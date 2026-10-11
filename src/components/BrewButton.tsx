'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import Image from 'next/image';
import styles from './BrewButton.module.css';

/**
 * Loading the brew scene's code also starts fetching its models and textures,
 * so by the time the visitor lands on /brew they're usually already cached.
 */
let warmed = false;
const warmBrew = () => {
  if (warmed) return;
  warmed = true;
  void import('./brew/BrewScene');
};

export function BrewButton() {
  // Also warm up quietly once the home page has settled.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));
    const t = setTimeout(() => idle(warmBrew, { timeout: 4000 }), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Link
      href="/brew"
      className={styles.button}
      aria-label="Brew a coffee"
      title="brew a coffee"
      onPointerEnter={warmBrew}
      onFocus={warmBrew}
      onTouchStart={warmBrew}
    >
      {/* a simple hand-drawn mug outline */}
      <Image src="/brew-icon.svg" alt="" width={104} height={112} unoptimized priority className={styles.icon} />
    </Link>
  );
}
