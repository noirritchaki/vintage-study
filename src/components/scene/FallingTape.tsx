'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { easing } from 'maath';
import { Group, MathUtils } from 'three';
import { releaseState, useDeck, viewState } from '@/lib/store';
import { tapeAt } from '@/data/tapes';
import { TapeModel } from './TapeModel';
import { CASSETTE_SCALE, TAPE_HALF } from './layout';

/** Seconds a tape may sit still (e.g. on top of the player) before it goes home. */
const REST_SECONDS = 0.8;
/** Minimum time the shelf spot stays empty, so the "oops" gets its moment. */
const MIN_GONE_SECONDS = 1.1;

/**
 * A tape that was let go away from the player. Physics throws it with the
 * hand's velocity; it can bounce off the player and drops off screen. Once
 * it's gone (or has come to rest), the shelf tape pops back in.
 */
export function FallingTape({ labelFont }: { labelFont: string }) {
  const index = useDeck((s) => s.index);
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<Group>(null);
  const restingFor = useRef(0);
  const leaving = useRef(false);
  const age = useRef(0);
  // Read once, on mount: the pose the tape was let go in.
  const [start] = useState(() => ({ ...releaseState }));

  useFrame((_, dt) => {
    const b = body.current;
    const g = visual.current;
    if (!b || !g) return;
    age.current += dt;

    if (leaving.current) {
      easing.damp(g.scale, 'x', 0, 0.06, dt);
      g.scale.setScalar(g.scale.x);
      g.visible = g.scale.x > 0.03;
      if (!g.visible && age.current > MIN_GONE_SECONDS) useDeck.getState().setPhase('returning');
      return;
    }

    const p = b.translation();
    const v = b.linvel();
    const offScreen = p.y < -viewState.visibleH / 2 - 180 || Math.abs(p.x) > viewState.visibleW / 2 + 240;
    restingFor.current = Math.hypot(v.x, v.y) < 30 ? restingFor.current + dt : 0;
    if (offScreen && age.current > MIN_GONE_SECONDS) useDeck.getState().setPhase('returning');
    else if (!offScreen && restingFor.current > REST_SECONDS) leaving.current = true;
  });

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={[start.x, start.y, start.z]}
      rotation={[0, 0, start.rotZ]}
      linearVelocity={[start.vx, start.vy, 0]}
      angularVelocity={[0, 0, MathUtils.clamp(-start.vx * 0.006, -7, 7)]}
      enabledTranslations={[true, true, false]}
      enabledRotations={[false, false, true]}
      restitution={0.35}
      friction={0.5}
      ccd
    >
      <CuboidCollider args={[TAPE_HALF.w, TAPE_HALF.h, TAPE_HALF.d]} />
      <group ref={visual} scale={CASSETTE_SCALE * 1.04}>
        <TapeModel tape={tapeAt(index)} labelFont={labelFont} />
      </group>
    </RigidBody>
  );
}
