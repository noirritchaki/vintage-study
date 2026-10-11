'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { easing } from 'maath';
import { MeshStandardMaterial } from 'three';
import { useDeck } from '@/lib/store';
import { playSound } from '@/lib/sfx';
import { PLAYER_SCALE, PLAYER_Y } from './layout';

const MODEL = '/models/player.glb';

// Status LED placement, in model units (metres).
const LED = { x: 0.1, y: 0.06, z: 0.03 };
/** Rotation about the hinge (radians) that swings the open door shut. */
const LID_CLOSED = 1.24;
/** Where the main click sits in tape-eject.mp3; the lid pops open on it. */
const EJECT_CLICK_AT = 0.24;

export function Player() {
  const { scene } = useGLTF(MODEL);
  const lid = useMemo(() => scene.getObjectByName('Lid'), [scene]);
  const ledMat = useMemo(
    () => new MeshStandardMaterial({ color: '#2a0a20', emissive: '#ff2db4', emissiveIntensity: 0 }),
    [],
  );

  // The loaded model is cached across pages, so coming back after a tape was
  // played finds the lid still shut: play the eject and pop it open on the click.
  const ejectHold = useRef(0);
  useEffect(() => {
    if (lid && lid.rotation.x > LID_CLOSED / 2 && useDeck.getState().phase === 'idle') {
      ejectHold.current = EJECT_CLICK_AT;
      playSound('eject');
    }
  }, [lid]);

  useFrame((state, dt) => {
    const { phase, progress } = useDeck.getState();
    const t = state.clock.elapsedTime;
    let glow = 0.15 + 0.1 * Math.sin(t * 2); // idle breathing
    if (phase === 'dragging') glow = 0.3 + progress * 2.4;
    if (phase === 'inserting') glow = 2 + Math.sin(t * 30) * 1.2; // reading
    if (phase === 'playing') glow = 3.2;
    easing.damp(ledMat, 'emissiveIntensity', glow, 0.08, dt);

    // Door snaps shut once the tape is seated, and springs open after an eject.
    if (ejectHold.current > 0) {
      ejectHold.current -= dt;
      return;
    }
    if (lid) easing.damp(lid.rotation, 'x', phase === 'playing' ? LID_CLOSED : 0, phase === 'playing' ? 0.07 : 0.12, dt);
  });

  return (
    <group position={[0, PLAYER_Y, 0]} scale={PLAYER_SCALE}>
      <primitive object={scene} />
      <mesh position={[LED.x, LED.y, LED.z]} material={ledMat}>
        <sphereGeometry args={[0.0025, 16, 16]} />
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL);
