'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { DOSE, STEPS, TOTAL, advance, resetSim, sim, useBrewUI, verdict } from './brewSim';
import styles from './BrewStudio.module.css';

/*
 * The brew page, drawn with the illustration kit from Figma (public/brew/*.svg).
 * Everything sits on a 1100 × 1040 stage, the size of the kit's "Brew station"
 * scene, so positions below are copied from Figma and scale with the page.
 *
 * The ritual: hold the grinder → tap the dripper for a filter, then the grounds →
 * hold the dripper to pour, following the recipe (brewSim) → it drains into the
 * server → tap the server to pour your cup.
 */

const W = 1100;
const H = 1040;
const box = (x: number, y: number, w: number, h: number): CSSProperties => ({
  left: `${(x / W) * 100}%`,
  top: `${(y / H) * 100}%`,
  width: `${(w / W) * 100}%`,
  height: `${(h / H) * 100}%`,
});

const SPOT = {
  scale: box(230, 798, 440, 190),
  server: box(310, 622, 280, 310),
  dripper: box(300, 470, 320, 270),
  stream: box(418, 336, 60, 220),
  kettlePour: box(381, 60, 470, 400),
  kettleIdle: box(650, 600, 420, 370),
  grinder: box(20, 585, 260, 400),
  bag: box(800, 640, 260, 340),
  beans: box(680, 880, 240, 110),
  mug: box(760, 760, 260, 220),
  steam: box(802, 650, 140, 170),
  drips: box(360, 690, 200, 80),
};

/** Coffee that can end up in the server (the grounds keep about twice their weight). */
const MAX_DRAINED = TOTAL - DOSE * 2;
/** Seconds of holding to grind the dose. */
const GRIND_SECONDS = 2.4;

// Where the coffee sits inside the server art (from Figma): it fills from
// y 260 up to y 106 of the server's 280 × 310 art, which is the "Level=85" art.
// The kit draws the surface domed (about 7px higher in the middle than at the
// glass), so the clip's top edge is a gentle curve, not a straight cut.
const BULGE = 7;
const surfaceY = (f: number) => 106.4 + (1 - f) * 153.8;
const serverClip = (f: number) => {
  const top = surfaceY(f);
  const pts = ['0% ' + ((top + BULGE) / 310) * 100 + '%'];
  for (let i = 0; i <= 16; i++) {
    const x = 51.6 + (i / 16) * (228.2 - 51.6);
    const y = top + BULGE * ((x - 139.9) / 88.3) ** 2; // highest in the middle
    pts.push(`${(x / 280) * 100}% ${(y / 310) * 100}%`);
  }
  pts.push(`100% ${((top + BULGE) / 310) * 100}%`, '100% 100%', '0% 100%');
  return `polygon(${pts.join(', ')})`;
};
// The grinder's grounds sit in a 75 × 64 box near its foot.
const groundsClip = (g: number) =>
  `inset(${((356.8 - g * 63.9) / 400) * 100}% ${((260 - 147.3) / 260) * 100}% ${((400 - 356.8) / 400) * 100}% ${(72.7 / 260) * 100}%)`;

type Stage = 'grind' | 'filter' | 'grounds' | 'pour' | 'serve' | 'serving' | 'done';

const STEP_OF: Record<Stage, number> = { grind: 1, filter: 2, grounds: 2, pour: 3, serve: 5, serving: 5, done: 5 };

const art = (name: string) => `/brew/${name}.svg`;

function Art({ name, className, style }: { name: string; className?: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element -- small inline-scaled SVG illustrations
  return <img src={art(name)} alt="" draggable={false} className={`${styles.art} ${className ?? ''}`} style={style} />;
}

const mmss = (t: number) => {
  const s = Math.max(0, Math.floor(t));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export function BrewStudio() {
  const ui = useBrewUI();
  const [stage, setStage] = useState<Stage>('grind');
  const [ground, setGround] = useState(0); // 0..1 of the dose ground
  const [grinding, setGrinding] = useState(false);
  const stageRef = useRef(stage);
  const grindingRef = useRef(false);
  const groundRef = useRef(0);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  // The brew page has its own colour: tell the nav and chat launcher to go white.
  useEffect(() => {
    document.documentElement.dataset.surface = 'blue';
    resetSim();
    return () => {
      delete document.documentElement.dataset.surface;
      sim.pouring = false;
    };
  }, []);

  // One loop for everything that moves over time: grinding, and the brew itself.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let sinceUI = 0;
    const tick = (now: number) => {
      // dev-only: window.__brewSpeed fast-forwards a brew for testing
      const speed =
        process.env.NODE_ENV === 'development'
          ? ((window as unknown as { __brewSpeed?: number }).__brewSpeed ?? 1)
          : 1;
      const dt = Math.min((now - last) / 1000, 0.1) * speed;
      last = now;
      const st = stageRef.current;
      if (st === 'grind' && grindingRef.current) {
        groundRef.current = Math.min(1, groundRef.current + dt / GRIND_SECONDS);
        setGround(groundRef.current);
        if (groundRef.current >= 1) {
          grindingRef.current = false;
          setGrinding(false);
          setStage('filter');
        }
      }
      if (st === 'pour') {
        advance(dt);
        sinceUI += dt;
        if (sinceUI > 0.08) {
          sinceUI = 0;
          useBrewUI.getState().publish();
        }
        if (sim.status === 'done') {
          sim.pouring = false;
          useBrewUI.getState().publish();
          setStage('serve');
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /** Press-and-hold: grinding during the grind stage, pouring during the pour. */
  const hold = useCallback((on: boolean) => {
    const st = stageRef.current;
    if (st === 'grind') {
      grindingRef.current = on;
      setGrinding(on);
    } else if (st === 'pour' && sim.status !== 'done') {
      sim.pouring = on;
      useBrewUI.getState().publish();
    }
  }, []);

  // Space pours (or grinds) from anywhere on the page, like the old version.
  useEffect(() => {
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      if ((e.target as HTMLElement)?.closest?.('button, a, input, textarea, [data-nav], [data-chat]')) return;
      const st = stageRef.current;
      if (st !== 'grind' && st !== 'pour') return;
      e.preventDefault();
      hold(e.type === 'keydown');
    };
    const stop = () => hold(false);
    window.addEventListener('keydown', key);
    window.addEventListener('keyup', key);
    window.addEventListener('blur', stop);
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener('keyup', key);
      window.removeEventListener('blur', stop);
    };
  }, [hold]);

  const holdProps = {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      hold(true);
    },
    onPointerUp: () => hold(false),
    onPointerCancel: () => hold(false),
    onLostPointerCapture: () => hold(false),
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        e.preventDefault();
        e.stopPropagation();
        hold(true);
      }
    },
    onKeyUp: (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.stopPropagation();
        hold(false);
      }
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };

  const serve = () => {
    setStage('serving');
    window.setTimeout(() => setStage('done'), 2200);
  };

  const again = () => {
    resetSim();
    groundRef.current = 0;
    setGround(0);
    setStage('grind');
  };

  // ---- what each piece of art shows right now ----
  const kind = STEPS[ui.step]?.kind;
  const pouring = stage === 'pour' && ui.pouring;
  const started = stage !== 'pour' || ui.weight > 0 || ui.pouring; // kettle lifted once the first pour starts
  const dripper =
    stage === 'grind' || stage === 'filter'
      ? 'empty'
      : stage === 'grounds'
        ? 'filter'
        : stage === 'pour' && ui.bloom > 0.3 && ui.t < 50
          ? 'bloom'
          : stage === 'pour' && ui.free > 4
            ? 'brewing'
            : 'grounds';
  const fill = stage === 'serving' || stage === 'done' ? 0 : Math.min(1, ui.drained / MAX_DRAINED);
  const fillTop = 622 + surfaceY(fill); // the coffee's surface, on the stage
  const dripping = stage === 'pour' && ui.drainRate > 0.35;
  const grinderGrounds = stage === 'grind' ? ground : stage === 'filter' || stage === 'grounds' ? 1 : 0;
  const mugFull = stage === 'serving' || stage === 'done';

  const step = stage === 'pour' && kind === 'drawdown' ? 4 : STEP_OF[stage];
  const phase =
    stage === 'grind'
      ? grinding
        ? 'GRINDING'
        : 'READY'
      : stage === 'filter' || stage === 'grounds'
        ? 'PREP'
        : stage === 'pour'
          ? pouring
            ? 'POURING'
            : kind === 'drawdown'
              ? 'DRAWDOWN'
              : ui.status === 'ready'
                ? 'READY TO POUR'
                : kind === 'bloom'
                  ? 'BLOOM'
                  : kind === 'pause'
                    ? 'PAUSE'
                    : 'POUR'
          : stage === 'done'
            ? 'ENJOY'
            : 'SERVING';

  const caption =
    stage === 'grind'
      ? {
          headline: 'hold the grinder to grind 15g',
          detail: ground > 0 ? `${(ground * DOSE).toFixed(1)}g ground` : 'enough for one cup',
        }
      : stage === 'filter'
        ? { headline: 'tap the dripper to add a filter', detail: 'the grounds are ready' }
        : stage === 'grounds'
          ? { headline: 'tap again to add the grounds', detail: 'then we pour' }
          : stage === 'pour'
            ? ui.guide
            : stage === 'serve'
              ? { headline: 'all drained', detail: 'tap the server to pour your cup' }
              : stage === 'serving'
                ? { headline: 'pouring your cup...', detail: '' }
                : null;

  const result = stage === 'done' ? verdict() : null;

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <header className={styles.hud}>
          <span className={styles.badge} aria-label={`Step ${step} of 5`}>
            {String(step).padStart(2, '0')}
          </span>
          <h1 className={styles.title}>monday coffee</h1>
          <p className={styles.pill} aria-hidden>
            <span>{phase}</span>
            <span>·</span>
            <span>{mmss(ui.t).replace(/^0/, '')}</span>
            <span>·</span>
            <span>{Math.round(ui.weight)} G</span>
            <span className={styles.dots}>
              {[1, 2, 3, 4, 5].map((d) => (
                <i key={d} data-on={d <= step || undefined} />
              ))}
            </span>
          </p>
        </header>

        <div className={styles.stageArea}>
          <div
            className={styles.scene}
            data-stage={stage}
            data-pouring={pouring || undefined}
            data-grinding={grinding || undefined}
          >
            <Art name="scale" style={SPOT.scale} />
            <div className={styles.display} style={box(280 + 230, 123 + 798, 100, 15.4)} aria-hidden>
              <span>{mmss(ui.t)}</span>
              <span>{ui.weight.toFixed(1)} g</span>
            </div>

            <div className={`${styles.piece} ${styles.server}`} style={SPOT.server}>
              <Art name="server-empty" />
              <Art name="server-full" className={styles.fill} style={{ clipPath: serverClip(fill) }} />
            </div>
            <Art name="drips" className={styles.drips} style={{ ...SPOT.drips, opacity: dripping ? 1 : 0 }} />
            {/* the splash's droplets hang above the coffee in blue; its rings
                sit on the coffee in white, like the rings in the brewing dripper */}
            <div
              className={`${styles.piece} ${styles.splash}`}
              style={{ ...box(360, fillTop - 24, 180, 70), opacity: dripping && fill > 0.08 ? 1 : 0 }}
            >
              <Art name="splash" style={{ clipPath: 'inset(0 0 62% 0)' }} />
              <Art name="splash" className={styles.onCoffee} style={{ clipPath: 'inset(38% 0 0 0)' }} />
            </div>


            <div className={`${styles.piece} ${styles.dripper}`} style={SPOT.dripper}>
              {(['empty', 'filter', 'grounds', 'bloom', 'brewing'] as const).map((s) => (
                <Art key={s} name={`dripper-${s}`} style={{ opacity: dripper === s ? 1 : 0 }} />
              ))}
            </div>

            {/* in front of the dripper, so the water lands on the bed */}
            <div className={`${styles.piece} ${styles.frames} ${styles.stream}`} style={{ ...SPOT.stream, opacity: pouring ? 1 : 0 }}>
              <Art name="stream-1" />
              <Art name="stream-2" />
              <Art name="stream-3" />
            </div>

            <Art
              name="kettle-pour"
              className={styles.kettlePour}
              style={{
                ...SPOT.kettlePour,
                opacity: stage === 'pour' && started && kind !== 'drawdown' ? 1 : 0,
                // drawn mid-pour; 34° clockwise stands it upright again
                transform: pouring ? 'none' : 'rotate(34deg)',
              }}
            />
            <Art
              name="kettle-idle"
              className={styles.kettleIdle}
              style={{
                ...SPOT.kettleIdle,
                opacity: stage === 'filter' || stage === 'grounds' || (stage === 'pour' && !started) ? 1 : 0,
              }}
            />

            <div
              className={`${styles.piece} ${styles.grinder}`}
              style={{ ...SPOT.grinder, opacity: stage === 'grind' || stage === 'filter' || stage === 'grounds' ? 1 : 0 }}
            >
              <Art name="grinder-empty" />
              <Art name="grinder" className={styles.fill} style={{ clipPath: groundsClip(grinderGrounds) }} />
            </div>
            <Art name="bag" className={styles.fade} style={{ ...SPOT.bag, opacity: stage === 'grind' ? 1 : 0 }} />
            <Art
              name="beans"
              className={styles.fade}
              style={{ ...SPOT.beans, opacity: stage === 'grind' ? 1 - ground * 0.85 : 0 }}
            />

            <div
              className={`${styles.piece} ${styles.mug}`}
              style={{ ...SPOT.mug, opacity: stage === 'serve' || stage === 'serving' || stage === 'done' ? 1 : 0 }}
            >
              <Art name="mug-empty" style={{ opacity: mugFull ? 0 : 1 }} />
              <Art name="mug-full" className={styles.mugFill} style={{ opacity: mugFull ? 1 : 0 }} />
            </div>
            <div className={`${styles.piece} ${styles.frames} ${styles.steam}`} style={{ ...SPOT.steam, opacity: mugFull ? 1 : 0 }}>
              <Art name="steam-1" />
              <Art name="steam-2" />
              <Art name="steam-3" />
            </div>

            {/* what you can touch, laid over the art */}
            {stage === 'grind' && (
              <button
                type="button"
                className={styles.hit}
                style={box(40, 600, 220, 380)}
                aria-label="Hold to grind the beans"
                {...holdProps}
              />
            )}
            {(stage === 'filter' || stage === 'grounds') && (
              <button
                type="button"
                className={styles.hit}
                style={SPOT.dripper}
                aria-label={stage === 'filter' ? 'Add a filter to the dripper' : 'Add the grounds to the dripper'}
                onClick={() => setStage(stage === 'filter' ? 'grounds' : 'pour')}
              />
            )}
            {stage === 'pour' && ui.status !== 'done' && (
              <button
                type="button"
                className={styles.hit}
                style={SPOT.dripper}
                aria-label="Hold to pour water"
                {...holdProps}
              />
            )}
            {stage === 'serve' && (
              <button
                type="button"
                className={styles.hit}
                style={box(310, 700, 280, 240)}
                aria-label="Pour the coffee into your mug"
                onClick={serve}
              />
            )}
          </div>
        </div>

        <section className={styles.caption} aria-live="polite">
          {result ? (
            <>
              <p className={styles.headline}>{result.title}</p>
              <p className={styles.detail}>
                {result.time} · {result.water}g water · {result.ratio}
              </p>
              <p className={styles.detail}>
                {result.pours.map((p) => `${p.target}→${p.actual}`).join('  ')}
              </p>
              <button type="button" className={styles.again} onClick={again}>
                brew another
              </button>
            </>
          ) : caption ? (
            <>
              <p className={styles.headline}>{caption.headline}</p>
              {caption.detail && <p className={styles.detail}>{caption.detail}</p>}
              <p className={styles.recipe}>
                {DOSE}g coffee · {TOTAL}g water
              </p>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
