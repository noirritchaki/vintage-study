'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, CanvasTexture, Matrix4, Mesh, Quaternion, SRGBColorSpace, Vector3 } from 'three';
import { formatTime, sim, DOSE, TOTAL } from './brewSim';

const MODEL = '/models/scale.glb';
const W = 1024;
const H = 400;

/** Pour-over scale; its screen shows the live weight and brew timer. */
export function Scale(props: { rotation?: [number, number, number] }) {
  const { scene } = useGLTF(MODEL);
  const model = useMemo(() => scene.clone(true), [scene]);

  // Lay a display over the screen panel, oriented to the panel's slope.
  const screen = useMemo(() => {
    let panel: Mesh | undefined;
    model.traverse((o) => {
      if (o instanceof Mesh && o.material.name === 'plastik3-ekran') panel = o;
    });
    if (!panel) return null;
    model.updateMatrixWorld(true);
    const box = new Box3().setFromObject(panel);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    // The panel rises from front to back; its normal tilts up and forward.
    const normal = new Vector3(0, size.z, size.y).normalize();
    const across = new Vector3(1, 0, 0);
    const up = new Vector3().crossVectors(normal, across).normalize();
    const q = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(across, up, normal));
    return {
      position: center.add(normal.clone().multiplyScalar(0.0012)),
      quaternion: q,
      width: size.x * 0.9,
      height: Math.hypot(size.y, size.z) * 0.8,
    };
  }, [model]);

  const shown = useRef('');
  useFrame(() => {
    const key = `${sim.poured.toFixed(1)}|${Math.floor(sim.t)}`;
    if (key === shown.current) return;
    shown.current = key;
    const lcd = getLCD();
    drawLCD(lcd.canvas, sim.poured, sim.t);
    lcd.texture.needsUpdate = true;
  });

  return (
    <group {...props}>
      <primitive object={model} />
      {screen && (
        <mesh position={screen.position} quaternion={screen.quaternion}>
          <planeGeometry args={[screen.width, screen.height]} />
          <meshBasicMaterial map={getLCD().texture} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

// There's one scale, so its screen is a single shared canvas texture.
let lcdSingleton: { canvas: HTMLCanvasElement; texture: CanvasTexture } | null = null;
function getLCD() {
  if (!lcdSingleton) {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    lcdSingleton = { canvas, texture };
  }
  return lcdSingleton;
}

const AMBER = '#e9d36c';

/** A scale LCD: big weight, timer, target and ratio, in the original's yellow. */
function drawLCD(canvas: HTMLCanvasElement, weight: number, t: number) {
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#1b1b1c';
  c.fillRect(0, 0, W, H);
  c.textBaseline = 'alphabetic';
  const font = (size: number) => `600 ${size}px ui-monospace, "SF Mono", Menlo, monospace`;

  // weight
  c.textAlign = 'right';
  c.font = font(138);
  c.fillStyle = AMBER;
  c.fillText(weight.toFixed(1), 600, 236);
  c.font = font(50);
  c.textAlign = 'left';
  c.fillText('g', 612, 236);

  // timer
  c.textAlign = 'right';
  c.font = font(76);
  c.fillStyle = AMBER;
  c.fillText(formatTime(t), 960, 200);

  // labels
  c.font = font(34);
  c.fillStyle = AMBER;
  c.textAlign = 'left';
  c.fillText(`Target ${TOTAL.toFixed(1)}`, 130, 330);
  c.textAlign = 'right';
  c.fillText(`Ratio 1:${(TOTAL / DOSE).toFixed(1)}`, 960, 330);
  c.fillText('M', 960, 104);
  c.textAlign = 'left';
  c.fillText('T', 60, 236);
}

useGLTF.preload(MODEL);
