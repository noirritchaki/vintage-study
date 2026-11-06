'use client';

import { useEffect, useState } from 'react';
import type { Weather as WeatherData } from '@/app/api/weather/route';
import styles from './Weather.module.css';

type Kind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';

/** WMO weather codes (what Open-Meteo reports) grouped into the icons we draw. */
function describe(code: number): { kind: Kind; label: string } {
  if (code === 0) return { kind: 'clear', label: 'clear skies' };
  if (code === 1) return { kind: 'clear', label: 'mostly clear' };
  if (code === 2) return { kind: 'partly', label: 'partly cloudy' };
  if (code === 3) return { kind: 'cloudy', label: 'cloudy' };
  if (code === 45 || code === 48) return { kind: 'fog', label: 'foggy' };
  if (code >= 51 && code <= 57) return { kind: 'drizzle', label: 'drizzly' };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { kind: 'rain', label: 'raining' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { kind: 'snow', label: 'snowing' };
  if (code >= 95) return { kind: 'storm', label: 'thunderstorms' };
  return { kind: 'cloudy', label: 'cloudy' };
}

const CLOUD = 'M7 18.5h9.5a3.5 3.5 0 0 0 .4-6.98A5 5 0 0 0 7.3 10.7 3.9 3.9 0 0 0 7 18.5z';
// the same cloud, higher up, leaving room for rain / snow underneath
const HIGH_CLOUD = 'M7 14.5h9.5a3.5 3.5 0 0 0 .4-6.98A5 5 0 0 0 7.3 6.7 3.9 3.9 0 0 0 7 14.5z';

function Sun({ small }: { small?: boolean }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <g className={small ? styles.sunSmall : undefined}>
      <g className={styles.rays}>
        {rays.map((a) => (
          <line key={a} x1="12" y1="2.8" x2="12" y2="4.6" transform={`rotate(${a} 12 12)`} />
        ))}
      </g>
      <circle cx="12" cy="12" r="4" className={styles.accent} />
    </g>
  );
}

function Moon({ small }: { small?: boolean }) {
  return (
    <g className={small ? styles.sunSmall : undefined}>
      <path
        className={`${styles.moon} ${styles.accent}`}
        d="M15.5 15.8A6.5 6.5 0 0 1 9.2 4.6a7 7 0 1 0 9.4 9.4 6.5 6.5 0 0 1-3.1 1.8z"
      />
      <path className={styles.twinkle} d="M18.5 3.5v2.4M17.3 4.7h2.4" />
    </g>
  );
}

function WeatherIcon({ kind, isDay }: { kind: Kind; isDay: boolean }) {
  const Light = isDay ? Sun : Moon;
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" width="19" height="19" aria-hidden data-kind={kind}>
      {kind === 'clear' && <Light />}
      {kind === 'partly' && (
        <>
          <Light small />
          <path className={`${styles.cloud} ${styles.fill}`} d={CLOUD} />
        </>
      )}
      {kind === 'cloudy' && (
        <>
          <path className={`${styles.cloudBack} ${styles.fill}`} d={CLOUD} transform="translate(3 -3) scale(0.8)" />
          <path className={`${styles.cloud} ${styles.fill}`} d={CLOUD} />
        </>
      )}
      {kind === 'fog' && (
        <>
          <path className={styles.fill} d={HIGH_CLOUD} />
          <line className={styles.mist} x1="5" y1="17.5" x2="16" y2="17.5" />
          <line className={styles.mist} x1="8" y1="20.5" x2="19" y2="20.5" style={{ animationDelay: '-1.5s' }} />
        </>
      )}
      {(kind === 'drizzle' || kind === 'rain' || kind === 'storm') && (
        <>
          <path className={`${styles.cloud} ${styles.fill}`} d={HIGH_CLOUD} />
          {(kind === 'drizzle' ? [9, 15] : [8, 12, 16]).map((x, i) => (
            <line
              key={x}
              className={`${styles.drop} ${styles.accent}`}
              x1={x}
              y1="16.5"
              x2={x - 0.6}
              y2={kind === 'drizzle' ? 18.8 : 20}
              style={{
                animationDelay: `${i * -0.35}s`,
                animationDuration: kind === 'drizzle' ? '1.4s' : '0.9s',
              }}
            />
          ))}
          {kind === 'storm' && <path className={`${styles.bolt} ${styles.accent}`} d="M13 14.5l-2.2 3.6h2.4L11.6 22" />}
        </>
      )}
      {kind === 'snow' && (
        <>
          <path className={`${styles.cloud} ${styles.fill}`} d={HIGH_CLOUD} />
          {[8, 12, 16].map((x, i) => (
            <circle
              key={x}
              className={`${styles.flake} ${styles.accent}`}
              cx={x}
              cy="17.5"
              r="0.9"
              style={{ animationDelay: `${i * -0.8}s` }}
            />
          ))}
        </>
      )}
    </svg>
  );
}

// Fetched once per visit; the nav stays mounted between pages.
let cached: Promise<WeatherData | null> | null = null;
const load = () =>
  (cached ??= fetch('/api/weather')
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null));

/** Bangalore's current weather, next to the nav: an animated icon and the temperature. */
export function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let live = true;
    load().then((w) => live && setWeather(w));
    return () => {
      live = false;
    };
  }, []);

  if (!weather) return null;
  const { kind, label } = describe(weather.code);

  return (
    <p className={styles.weather} aria-label={`${label} and ${weather.temp}°C in Bangalore right now`}>
      <WeatherIcon kind={kind} isDay={weather.isDay} />
      <span aria-hidden>{weather.temp}°</span>
      {/* the conditions slide out on hover */}
      <span className={styles.more} aria-hidden>
        <span>· {label} in bangalore</span>
      </span>
    </p>
  );
}
