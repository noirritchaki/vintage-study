'use client';

import { useRef, useState } from 'react';
import styles from './TapePage.module.css';

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <rect x="6.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" />
      <rect x="14" y="5" width="3.5" height="14" rx="1" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

/**
 * A silent, looping walkthrough in a solution panel. Hovering the panel shows
 * pause / play and replay buttons in the video's top-left corner.
 */
export function SolutionVideo({
  src,
  poster,
  label,
}: {
  src: string | { src: string; type: string }[];
  poster?: string;
  label: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  const replay = () => {
    const v = video.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play();
  };

  return (
    <div className={styles.videoWrap}>
      <video
        ref={video}
        src={typeof src === 'string' ? src : undefined}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
        className={styles.solutionMedia}
        aria-label={label}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      >
        {typeof src === 'string' ? null : src.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
      </video>
      <div className={styles.videoControls}>
        <button type="button" onClick={toggle} aria-label={paused ? 'Play video' : 'Pause video'}>
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
        <button type="button" onClick={replay} aria-label="Replay video from the start">
          <ReplayIcon />
        </button>
      </div>
    </div>
  );
}
