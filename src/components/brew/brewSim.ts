import { create } from 'zustand';

// ---------------------------------------------------------------- recipe ---

export const DOSE = 15; // g of ground coffee in the filter
export const TOTAL = 250; // g of water

export type StepKind = 'bloom' | 'pour' | 'pause' | 'drawdown';
export type Step = {
  kind: StepKind;
  /** Brew time (s) this step starts / ends. Drawdown has no end. */
  start: number;
  end: number | null;
  /** Total weight the scale should read by the end of this step. */
  target: number;
  title: string;
};

export const STEPS: Step[] = [
  { kind: 'bloom', start: 0, end: 45, target: 50, title: 'Pour 50g to bloom' },
  { kind: 'pour', start: 45, end: 60, target: 100, title: 'Pour up to 100g' },
  { kind: 'pause', start: 60, end: 70, target: 100, title: 'Pause' },
  { kind: 'pour', start: 70, end: 80, target: 150, title: 'Pour up to 150g' },
  { kind: 'pause', start: 80, end: 90, target: 150, title: 'Pause' },
  { kind: 'pour', start: 90, end: 100, target: 200, title: 'Pour up to 200g' },
  { kind: 'pause', start: 100, end: 110, target: 200, title: 'Pause' },
  { kind: 'pour', start: 110, end: 120, target: 250, title: 'Pour up to 250g' },
  { kind: 'drawdown', start: 120, end: null, target: 250, title: 'Let it drain' },
];

export const formatTime = (t: number) => {
  const s = Math.max(0, Math.floor(t));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// ------------------------------------------------------------ simulation ---

/** Pour rate from the gooseneck, g/s. */
const FLOW = 5;
/** Grounds hold about twice their weight in water and never give it back. */
const RETAINED = DOSE * 2;

export type Status = 'ready' | 'brewing' | 'done';

/**
 * Mutable brew state, advanced every frame by `advance()`. The page reads a
 * throttled snapshot of it (see useBrewUI) to draw the scale, server and dripper.
 */
export const sim = {
  status: 'ready' as Status,
  t: 0,
  pouring: false,
  /** Smoothed flow, g/s. */
  flow: 0,
  /** Everything poured so far: what the scale reads. */
  poured: 0,
  /** Soaked into the grounds. */
  absorbed: 0,
  /** Standing water above the bed. */
  free: 0,
  /** Dripped through into the carafe. */
  drained: 0,
  /** Current drip rate, g/s. */
  drainRate: 0,
  /** 0..1, the foamy CO₂ dome during the bloom. */
  bloom: 0,
  /** Scale reading at the end of each step (index → grams). */
  stepWeights: [] as (number | undefined)[],
  /** The recipe step we're on (index into STEPS). */
  step: 0,
  /** Brew time when that step began. */
  stepStart: 0,
};

/** Within this many grams of a target counts as reaching it. */
const NEAR = 2;
/** The one test for "this pour is done": the guide's "stop" and the step moving on both use it. */
const nearTarget = (poured: number, target: number) => target - poured <= NEAR;

export function resetSim() {
  Object.assign(sim, {
    status: 'ready',
    t: 0,
    pouring: false,
    flow: 0,
    poured: 0,
    absorbed: 0,
    free: 0,
    drained: 0,
    drainRate: 0,
    bloom: 0,
    stepWeights: [],
    step: 0,
    stepStart: 0,
  });
  useBrewUI.getState().publish();
}

export function advance(dt: number) {
  const target = sim.pouring && sim.status !== 'done' ? FLOW : 0;
  sim.flow += (target - sim.flow) * Math.min(1, dt * 10);
  if (sim.flow < 0.01 && target === 0) sim.flow = 0;

  if (sim.status === 'ready' && sim.flow > 0.2) sim.status = 'brewing';
  if (sim.status === 'brewing') sim.t += dt;

  const added = sim.flow * dt;
  sim.poured += added;
  const soak = Math.min(added * 0.85, Math.max(0, RETAINED - sim.absorbed));
  sim.absorbed += soak;
  sim.free += added - soak;

  // Drawdown: faster with more water standing on the bed; slow while blooming.
  const k = sim.t < 45 ? 0.05 : 0.11;
  const drain = Math.min(sim.free, k * Math.pow(sim.free, 0.8) * dt);
  sim.free -= drain;
  sim.drained += drain;
  sim.drainRate = dt > 0 ? drain / dt : 0;

  // Bloom foam builds as the first water hits dry coffee, then settles.
  if (sim.poured > 0 && sim.t < 50) sim.bloom = Math.min(1, sim.bloom + (added / 30) * 1.5);
  else sim.bloom = Math.max(0, sim.bloom - dt * 0.08);

  // Move through the recipe. Pours end when you reach the target and let go,
  // however long that takes; the waits are timed (the bloom runs to its end
  // time, and each pause counts from when the pour before it finished).
  if (sim.status === 'brewing') {
    const s = STEPS[sim.step];
    const reached = !sim.pouring && nearTarget(sim.poured, s.target);
    const next = () => {
      sim.stepWeights[sim.step] = sim.poured;
      sim.step += 1;
      sim.stepStart = sim.t;
    };
    if (s.kind === 'bloom' && reached && sim.t >= (s.end ?? 0)) next();
    else if (s.kind === 'pour' && reached) next();
    else if (s.kind === 'pause' && sim.t - sim.stepStart >= (s.end ?? s.start) - s.start) next();
    else if (s.kind === 'drawdown' && !sim.pouring && sim.free < 0.6) {
      sim.stepWeights[sim.step] = sim.poured;
      sim.status = 'done';
    }
  }
}

// ------------------------------------------------------------ guidance ---

export type Guidance = { headline: string; detail: string; tone: 'go' | 'wait' | 'warn' | 'done' };

export function guidance(s: typeof sim): Guidance {
  if (s.status === 'ready') {
    return { headline: 'pour 50g to bloom', detail: 'press and hold the dripper to pour', tone: 'go' };
  }
  if (s.status === 'done') return { headline: 'all drained', detail: 'tap the server to pour your cup', tone: 'done' };

  const i = s.step;
  const step = STEPS[i];
  const toGo = Math.ceil(step.target - s.poured);
  // seconds left of a wait: the bloom runs to its end time, a pause for its length
  const left = Math.max(
    0,
    Math.ceil(
      step.kind === 'pause'
        ? (step.end ?? step.start) - step.start - (s.t - s.stepStart)
        : (step.end ?? s.t) - s.t,
    ),
  );

  if (step.kind === 'drawdown') {
    return { headline: 'let it drain', detail: 'almost there, the last of it is dripping through', tone: 'wait' };
  }
  const blooming = step.kind === 'bloom' && nearTarget(s.poured, step.target) && !s.pouring;
  if (step.kind === 'pause' || blooming) {
    const next = STEPS[i + 1];
    if (s.pouring) return { headline: 'hold off for now', detail: `next pour in ${left}s`, tone: 'warn' };
    return {
      headline: step.kind === 'bloom' ? 'let it bloom' : 'pause',
      detail: next ? `${next.title.replace('Pour up to', 'pour to')} in ${left}s` : `${left}s`,
      tone: 'wait',
    };
  }
  // A pour (or the bloom pour).
  if (nearTarget(s.poured, step.target) && toGo >= -6) return { headline: `${step.target}g, stop`, detail: 'spot on, let it settle', tone: 'done' };
  if (toGo < -6) return { headline: 'a little over', detail: 'no stress, ease off the next pour', tone: 'warn' };
  return {
    headline: step.kind === 'bloom' ? 'pour 50g to bloom' : `pour to ${step.target}g`,
    detail: `${toGo}g to go`,
    tone: 'go',
  };
}

/** How the finished brew went, for the summary card. */
export function verdict() {
  const pours = STEPS.map((s, i) => ({ s, w: sim.stepWeights[i] })).filter(({ s }) => s.kind === 'bloom' || s.kind === 'pour');
  const misses = pours.map(({ s, w }) => Math.abs((w ?? sim.poured) - s.target));
  const avg = misses.reduce((a, b) => a + b, 0) / Math.max(1, misses.length);
  const title = avg < 6 ? 'barista-level' : avg < 14 ? 'lovely cup' : avg < 30 ? 'not bad at all' : 'an experimental brew';
  return {
    title,
    time: formatTime(sim.t),
    water: Math.round(sim.poured),
    inCarafe: Math.round(sim.drained),
    ratio: `1:${(sim.poured / DOSE).toFixed(1)}`,
    pours: pours.map(({ s, w }) => ({ target: s.target, actual: Math.round(w ?? sim.poured) })),
  };
}

// ------------------------------------------------------------ UI store ---

type Snapshot = {
  status: Status;
  t: number;
  weight: number;
  step: number;
  pouring: boolean;
  /** Coffee in the server, g. */
  drained: number;
  /** Water standing on the bed, g. */
  free: number;
  /** 0..1 bloom foam. */
  bloom: number;
  /** Drip rate into the server, g/s. */
  drainRate: number;
  guide: Guidance;
  publish: () => void;
};

/** A throttled copy of `sim` for the DOM overlay. */
export const useBrewUI = create<Snapshot>((set) => ({
  status: 'ready',
  t: 0,
  weight: 0,
  step: 0,
  pouring: false,
  drained: 0,
  free: 0,
  bloom: 0,
  drainRate: 0,
  guide: guidance(sim),
  publish: () =>
    set({
      status: sim.status,
      t: sim.t,
      weight: sim.poured,
      step: sim.step,
      pouring: sim.pouring,
      drained: sim.drained,
      free: sim.free,
      bloom: sim.bloom,
      drainRate: sim.drainRate,
      guide: guidance(sim),
    }),
}));
