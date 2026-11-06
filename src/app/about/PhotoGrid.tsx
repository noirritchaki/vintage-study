'use client';

import Image from 'next/image';
import type { PhotoGroup } from '@/data/about';
import { useHoverTag } from '@/components/HoverTag';
import styles from './About.module.css';

/**
 * Four-column photo grid with group labels. Hovering a photo shows its
 * caption in the magenta cursor tag, after rachelchen.tech/about.
 */
export function PhotoGrid({ groups }: { groups: PhotoGroup[] }) {
  const tag = useHoverTag();
  const cells = groups.flatMap((group, g) =>
    group.photos.map((photo, i) => ({
      key: `${g}-${i}`,
      label: i === 0 ? { n: String(g + 1).padStart(2, '0'), text: group.label } : null,
      caption: photo.caption ?? group.label,
      photo,
    })),
  );

  return (
    <>
      <ul className={`${styles.grid} ${tag.containerClass ?? ''}`} aria-label="Photos">
        {cells.map(({ key, label, caption: text, photo }) => (
          <li key={key} className={styles.cell}>
            <p className={styles.label} aria-hidden={!label}>
              {label && (
                <>
                  {label.n} <span>/</span> {label.text}
                </>
              )}
            </p>
            <div {...tag.bind(text)}>
              {photo.video ? (
                // Muted, inline, looping clip: no controls, can't be opened
                // full screen or picture-in-picture.
                <video
                  className={styles.photo}
                  style={{ aspectRatio: photo.ratio, objectFit: 'cover' }}
                  src={photo.video}
                  poster={photo.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  disableRemotePlayback
                  controlsList="nodownload nofullscreen noremoteplayback"
                  onContextMenu={(e) => e.preventDefault()}
                  aria-label={photo.alt ?? text}
                />
              ) : photo.src ? (
                <Image
                  src={photo.src}
                  alt={photo.alt ?? text}
                  width={800}
                  height={Math.round(800 / photo.ratio)}
                  sizes="(max-width: 720px) 50vw, 220px"
                  className={styles.photo}
                />
              ) : (
                <div className={styles.placeholder} style={{ aspectRatio: photo.ratio }} role="img" aria-label={text} />
              )}
            </div>
          </li>
        ))}
      </ul>
      {tag.element}
    </>
  );
}
