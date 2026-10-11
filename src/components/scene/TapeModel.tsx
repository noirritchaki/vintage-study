'use client';

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Mesh, type Material, type Object3D } from 'three';
import type { Tape } from '@/data/tapes';
import { makeLabelTexture } from './labelTexture';

const MODEL = '/models/cassettes.glb';

/** The tape pack is real-world size (10.2cm); the scene was laid out around a
 *  14cm tape, so scale up to keep every other measurement the same. */
const FIT = 0.14 / 0.1017;

// Hand-written label strip, in the tape pack's model units (metres).
const LABEL = { x: 0, y: 0.0215, z: 0.0052, w: 0.062, h: 0.0095 };

/** One cassette in layout units, wearing the tape's style and hand-written label. */
export function TapeModel({ tape, labelFont }: { tape: Tape; labelFont: string }) {
  const { scene } = useGLTF(MODEL);
  const model = useMemo(() => {
    const tapeNode = scene.getObjectByName(`Tape_${tape.variant}`)!;
    fixClearShells(tapeNode);
    return tapeNode.clone(true);
  }, [scene, tape.variant]);
  const side = tape.kind === 'hobbies' ? 'B' : 'A';
  const label = useMemo(
    () => (SHOW_LABEL ? makeLabelTexture(tape.title, side, labelFont) : null),
    [tape.title, side, labelFont],
  );
  useEffect(() => () => label?.dispose(), [label]);

  return (
    <group scale={FIT}>
      <primitive object={model} />
      {label && (
        <mesh position={[LABEL.x, LABEL.y, LABEL.z]}>
          <planeGeometry args={[LABEL.w, LABEL.h]} />
          <meshStandardMaterial map={label} roughness={0.85} />
        </mesh>
      )}
    </group>
  );
}

/** The tape pack has its own printed labels, so the hand-written title strip
 *  is off for now. Flip this to paste each tape's title back on. */
const SHOW_LABEL = false;

/**
 * The see-through shells are one mesh with the reels inside. GLTFLoader turns
 * depth writes off for blended materials, which lets the reels paint over the
 * label in front of them; turning them back on restores the right order.
 */
function fixClearShells(root: Object3D) {
  root.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    for (const m of ([] as Material[]).concat(o.material)) {
      if (m.transparent) m.depthWrite = true;
    }
  });
}

useGLTF.preload(MODEL);
