import Link from 'next/link';
import styles from './RetroButton.module.css';
import local from './BrewButton.module.css';

/** Pixel-art mug with a wisp of steam. */
export function MugIcon() {
  return (
    <svg className={styles.icon} width="18" height="18" viewBox="0 0 9 9" aria-hidden shapeRendering="crispEdges">
      <path d="M3 0h1v1H3zM5 0h1v1H5zM2 1h1v1H2zM4 1h1v1H4z" fill="#8a8a8a" />
      <path d="M1 3h6v1h1v1h1v2H8v1H7v1H1V8H1zM2 4v4h4V4z" fill="#000" />
      <path d="M2 4h4v4H2z" fill="#fff" />
      <path d="M2 4h4v1H2z" fill="#6b4226" />
      <path d="M7 5h1v1H7z" fill="#c9c9c9" />
    </svg>
  );
}

export function BrewButton() {
  return (
    <Link href="/brew" className={`${styles.button} ${local.position}`} aria-label="Brew a coffee">
      <MugIcon />
      <span className={local.label}>brew a coffee</span>
    </Link>
  );
}
