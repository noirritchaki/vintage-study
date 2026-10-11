'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { easing } from 'maath';
import { BufferAttribute, Group, Matrix4, Mesh, MeshPhysicalMaterial, Vector2, Vector3 } from 'three';
import { sim } from './brewSim';
import { RIM_TOP } from './brewLayout';

const MODEL = '/models/kettle.glb';

/**
 * Only the gooseneck should show while pouring — the kettle "pours from
 * off-screen". The body fades out by its distance behind the spout (kettle-
 * local z): fully visible in front of the body, gone just behind it.
 */
const fade = {
  uToKettle: { value: new Matrix4() },
  uFadeZ: { value: new Vector2(0.088, 0.112) }, // fade from z = 0.088 (gone) to 0.112 (solid)
  uPresence: { value: 0 },
};
const BODY = new MeshPhysicalMaterial({
  color: '#1d1d1f',
  roughness: 0.38,
  clearcoat: 0.4,
  clearcoatRoughness: 0.3,
  transparent: true,
});
BODY.onBeforeCompile = (shader) => {
  Object.assign(shader.uniforms, fade);
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nuniform mat4 uToKettle;\nvarying float vKettleZ;')
    .replace(
      '#include <project_vertex>',
      '#include <project_vertex>\nvKettleZ = (uToKettle * modelMatrix * vec4(transformed, 1.0)).z;',
    );
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nuniform vec2 uFadeZ;\nuniform float uPresence;\nvarying float vKettleZ;')
    .replace(
      '#include <dithering_fragment>',
      '#include <dithering_fragment>\nfloat keep = smoothstep(uFadeZ.x, uFadeZ.y, vKettleZ) * uPresence;\nif (keep < 0.01) discard;\ngl_FragColor.a *= keep;',
    );
};

/** Which way the spout points (world, horizontal) and how far it dips: the
 *  kettle sits off to the right of the brew view, spout reaching in leftward. */
const YAW = -0.95;
const TILT = 0.5;
/** Where the spout waits, off to the upper right, when nobody's pouring. */
const AWAY = new Vector3(0.054, 0.16, -0.173);
/** Spout tip height above the paper rim while pouring. */
const HOVER = 0.035;

/** Live world position of the spout tip, for the water stream. */
export const kettleTip = new Vector3();

const tipGoal = new Vector3();
const scratch = new Vector3();

/**
 * Fellow Stagg EKG, pivoting around its spout tip. While the visitor pours
 * its gooseneck glides in and the tip follows the stream's landing point.
 */
export function PouringKettle({ active }: { active: boolean }) {
  const { scene } = useGLTF(MODEL);
  const { model, tip } = useMemo(() => {
    const clone = scene.clone(true);
    let tip = new Vector3();
    clone.updateMatrixWorld(true);
    clone.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      if (o.name.startsWith('WoodenHandle')) {
        o.visible = false; // behind the body, never seen
        return;
      }
      o.material = BODY;
      // The spout tip is the body's furthest point along +z.
      const pos = o.geometry.getAttribute('position') as BufferAttribute;
      let best = -Infinity;
      for (let i = 0; i < pos.count; i++) {
        scratch.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        if (scratch.z > best) {
          best = scratch.z;
          tip = scratch.clone();
        }
      }
    });
    return { model: clone, tip };
  }, [scene]);

  const pivot = useRef<Group>(null);
  const body = useRef<Group>(null);
  const presence = useRef(0);

  useFrame((_, dt) => {
    const g = pivot.current;
    if (!g || !body.current) return;
    const pouring = active && (sim.pouring || sim.flow > 0.3);
    easing.damp(presence, 'current', pouring ? 1 : 0, pouring ? 0.2 : 0.35, dt);
    const p = presence.current;
    g.visible = p > 0.01;

    tipGoal.set(sim.landing.x, Math.max(RIM_TOP + HOVER, sim.landing.y + 0.05), sim.landing.z);
    scratch.copy(tipGoal).addScaledVector(AWAY, 1 - p);
    easing.damp3(g.position, scratch, p > 0.9 ? 0.08 : 0.15, dt);
    g.rotation.set(TILT * p, YAW, 0, 'YXZ');
    kettleTip.copy(g.position);

    fade.uPresence.value = p;
    body.current.updateMatrixWorld();
    fade.uToKettle.value.copy(body.current.matrixWorld).invert();
  });

  return (
    <group ref={pivot} visible={false}>
      <group ref={body} position={tip.clone().negate()}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL);
