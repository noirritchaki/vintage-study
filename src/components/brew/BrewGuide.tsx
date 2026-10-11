'use client';

import { DOSE, STEPS, TOTAL, formatTime, resetSim, sim, useBrewUI, verdict } from './brewSim';
import retro from '../RetroButton.module.css';
import styles from './BrewGuide.module.css';

const range = (start: number, end: number | null) =>
  end === null ? `${formatTime(start)}+` : `${formatTime(start)}–${formatTime(end)}`;

/** Step-by-step guide for brewing along with the recipe; floats left of the set. */
export function BrewGuide() {
  const { status, t, weight, step, guide } = useBrewUI();
  const current = STEPS[step];
  const prevTarget = step > 0 ? STEPS[step - 1].target : 0;
  const isPour = current.kind === 'bloom' || current.kind === 'pour';
  const progress = isPour
    ? Math.min(1, Math.max(0, (weight - prevTarget) / Math.max(1, current.target - prevTarget)))
    : 1;

  return (
    <aside className={styles.guide}>
      {status === 'done' ? (
        <Summary />
      ) : (
        <section aria-live="polite">
          <p className={styles.clock}>{formatTime(t)}</p>
          <p className={`${styles.headline} ${styles[guide.tone]}`}>{guide.headline}</p>
          <p className={styles.detail}>{guide.detail}</p>
          <div className={styles.meter} aria-hidden>
            <div className={styles.fill} style={{ width: `${progress * 100}%` }} />
          </div>
          <p className={styles.meterLabel}>
            {weight.toFixed(1)}g <span>/ {current.target}g</span>
          </p>
        </section>
      )}

      <ol className={styles.steps} aria-label={`Recipe: ${DOSE}g coffee, ${TOTAL}g water`}>
        {STEPS.map((s, i) => {
          const done = status === 'done' || (status === 'brewing' && i < step);
          const actual = sim.stepWeights[i];
          return (
            <li
              key={i}
              className={styles.step}
              data-current={(status !== 'done' && i === step) || undefined}
              data-done={done || undefined}
            >
              <span className={styles.time}>{range(s.start, s.end)}</span>
              <span className={styles.what}>{s.kind === 'bloom' ? 'Pour 50g to bloom' : s.title}</span>
              <span className={styles.actual}>
                {done && s.kind !== 'pause' && s.kind !== 'drawdown' && actual !== undefined ? `${Math.round(actual)}g` : ''}
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function Summary() {
  const v = verdict();
  return (
    <section aria-live="polite">
      <p className={styles.clock}>{v.time}</p>
      <p className={`${styles.headline} ${styles.done}`}>{v.title}</p>
      <p className={styles.detail}>
        {v.water}g of water at {v.ratio} · {v.inCarafe}g in the carafe
      </p>
      <button type="button" className={`${retro.button} ${styles.again}`} onClick={resetSim}>
        brew again
      </button>
    </section>
  );
}
