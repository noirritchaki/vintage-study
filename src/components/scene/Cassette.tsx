'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { Group, MathUtils, Vector3 } from 'three';
import { dragState, releaseState, useDeck } from '@/lib/store';
import { playSound } from '@/lib/sfx';
import { tapeAt } from '@/data/tapes';
import { TapeModel } from './TapeModel';
import { CASSETTE_SCALE, HELD_Z, PLAYER_SCALE, PLAYER_Y, ROW_Y, SLOT } from './layout';

const INSERT_SECONDS = 0.85;
/** Insert progress at which the tape starts pushing into the well. The sound
 *  starts here so its final clunk lands as the lid snaps shut. */
const PUSH_IN_AT = 0.55;
const RETURN_SECONDS = 0.5;
const world = new Vector3();

type Props = {
  slot: number;
  spacing: number;
  labelFont: string;
};

/** A tape on the shelf. The centre one can be picked up and put in the player. */
export function Cassette({ slot, spacing, labelFont }: Props) {
  const tape = tapeAt(slot);
  const ref = useRef<Group>(null);
  const timer = useRef(0);
  const insertFrom = useRef<{ pos: Vector3; rot: Vector3; scale: number } | null>(null);
  const isActive = useDeck((s) => s.index === slot);

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const { phase, index } = useDeck.getState();
    const baseX = slot * spacing;
    const t = state.clock.elapsedTime;
    g.visible = true;

    if (isActive && phase === 'falling') {
      // The physics body (FallingTape) is showing this tape for now.
      g.visible = false;
      return;
    }

    if (isActive && (phase === 'inserting' || phase === 'playing')) {
      // Line up in front of the tape well, then push straight in.
      if (!insertFrom.current) {
        insertFrom.current = {
          pos: g.position.clone(),
          rot: new Vector3(g.rotation.x, g.rotation.y, g.rotation.z),
          scale: g.scale.x,
        };
        timer.current = 0;
      }
      const before = timer.current;
      timer.current = Math.min(1, timer.current + dt / INSERT_SECONDS);
      if (before < PUSH_IN_AT && timer.current >= PUSH_IN_AT) playSound('insert');
      const from = insertFrom.current;
      const a = easeInOutCubic(Math.min(1, timer.current / 0.6));
      const b = easeInOutCubic(MathUtils.clamp((timer.current - PUSH_IN_AT) / (1 - PUSH_IN_AT), 0, 1));
      const front = HELD_Z - 20;
      g.position.set(
        MathUtils.lerp(from.pos.x, baseX + SLOT.x, a),
        MathUtils.lerp(from.pos.y, PLAYER_Y + SLOT.y, a),
        MathUtils.lerp(MathUtils.lerp(from.pos.z, front, a), SLOT.z, b),
      );
      g.rotation.set(from.rot.x * (1 - a), from.rot.y * (1 - a), from.rot.z * (1 - a));
      g.scale.setScalar(MathUtils.lerp(from.scale, PLAYER_SCALE, a));
      if (timer.current >= 1 && phase === 'inserting') useDeck.getState().setPhase('playing');
      return;
    }
    insertFrom.current = null;

    if (isActive && phase === 'returning') {
      // Pop back into its spot on the shelf.
      if (timer.current === 0) {
        g.position.set(baseX, ROW_Y, 20);
        g.rotation.set(0, 0, 0);
      }
      timer.current = Math.min(1, timer.current + dt / RETURN_SECONDS);
      g.scale.setScalar(CASSETTE_SCALE * Math.max(0.001, easeOutBack(timer.current)));
      if (timer.current >= 1) {
        timer.current = 0;
        useDeck.getState().setPhase('idle');
      }
      return;
    }
    timer.current = 0;

    if (isActive && phase === 'dragging') {
      // Follow the hand, swinging a little with how fast it's moving.
      easing.damp3(g.position, [baseX + dragState.x, ROW_Y + dragState.y, HELD_Z], 0.035, dt);
      const swing = MathUtils.clamp(-dragState.vx * 0.00035, -0.55, 0.55);
      const pitch = MathUtils.clamp(-dragState.vy * 0.00025, -0.4, 0.4);
      easing.dampE(g.rotation, [pitch, -swing * 0.4, swing], 0.12, dt);
      easing.damp(g.scale, 'x', CASSETTE_SCALE * 1.04, 0.15, dt);
      g.scale.setScalar(g.scale.x);
      g.getWorldPosition(world);
      releaseState.x = world.x;
      releaseState.y = world.y;
      releaseState.z = world.z;
      releaseState.rotZ = g.rotation.z;
      return;
    }

    // Resting on the shelf. The centre one floats and tilts toward the pointer.
    const centred = slot === index;
    const bob = centred ? Math.sin(t * 1.6 + slot) * 4 : 0;
    easing.damp3(g.position, [baseX, ROW_Y + bob, centred ? 20 : 0], 0.2, dt);
    const look = centred ? 1 : 0;
    easing.dampE(
      g.rotation,
      [
        -state.pointer.y * 0.18 * look,
        state.pointer.x * 0.28 * look,
        Math.sin(t * 0.9 + slot) * 0.02 * look,
      ],
      0.2,
      dt,
    );
    easing.damp(g.scale, 'x', CASSETTE_SCALE * (centred ? 1 : 0.92), 0.25, dt);
    g.scale.setScalar(g.scale.x);
  });

  return (
    <group
      ref={ref}
      position={[slot * spacing, ROW_Y, 0]}
      scale={CASSETTE_SCALE * 0.92}
      onPointerDown={(e) => {
        if (!isActive || useDeck.getState().phase !== 'idle') return;
        e.stopPropagation();
        dragState.grabbed = true;
      }}
      onPointerOver={() => {
        if (isActive) document.body.style.cursor = 'grab';
      }}
      onPointerOut={() => {
        if (useDeck.getState().phase !== 'dragging') document.body.style.cursor = '';
      }}
    >
      <TapeModel tape={tape} labelFont={labelFont} />
    </group>
  );
}

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutBack(x: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
