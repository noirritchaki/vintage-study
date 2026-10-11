import { create } from 'zustand';

/**
 * idle      – browsing the shelf
 * dragging  – the centre tape is in the visitor's hand
 * falling   – let go away from the player; physics takes over
 * returning – the tape pops back into its spot on the shelf
 * inserting – tape is sliding into the player
 * playing   – tape is in, lid shuts; we're about to leave for its page
 */
export type Phase = 'idle' | 'dragging' | 'falling' | 'returning' | 'inserting' | 'playing';

type DeckState = {
  /** Unbounded shelf position; the visible tape is tapeAt(index). */
  index: number;
  phase: Phase;
  /** 0..1 — how close the held tape is to the player. Drives the LED. */
  progress: number;
  /** The held tape is over the player; letting go will insert it. */
  overPlayer: boolean;
  step: (dir: 1 | -1) => void;
  setIndex: (index: number) => void;
  setPhase: (phase: Phase) => void;
  setDrag: (progress: number, overPlayer: boolean) => void;
};

export const useDeck = create<DeckState>((set, get) => ({
  index: 0,
  phase: 'idle',
  progress: 0,
  overPlayer: false,
  step: (dir) => {
    if (get().phase !== 'idle') return;
    set((s) => ({ index: s.index + dir }));
  },
  setIndex: (index) => set({ index }),
  setPhase: (phase) => set({ phase }),
  setDrag: (progress, overPlayer) => {
    const s = get();
    if (s.progress !== progress || s.overPlayer !== overPlayer) set({ progress, overPlayer });
  },
}));

/**
 * Per-frame state, written by pointer handlers / physics and read inside
 * useFrame. Kept outside React state so motion doesn't re-render the tree.
 */
export const dragState = {
  /** Set by the active cassette's onPointerDown, consumed by the stage. */
  grabbed: false,
  /** Held tape's offset from its shelf spot, in scene units (+Y up). */
  x: 0,
  y: 0,
  /** Pointer velocity in scene units / second. */
  vx: 0,
  vy: 0,
};

/** The held tape's pose at the moment it was let go, for the physics body. */
export const releaseState = {
  x: 0,
  y: 0,
  z: 0,
  rotZ: 0,
  vx: 0,
  vy: 0,
};

/** Camera fit, mirrored here so DOM handlers can convert px → scene units. */
export const viewState = { unitsPerPx: 1, distance: 3890, visibleW: 1440, visibleH: 1024 };
