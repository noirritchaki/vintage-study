'use client';

import { Suspense, useLayoutEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer } from '@react-three/postprocessing';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { useDeck, viewState } from '@/lib/store';
import { FallingTape } from './FallingTape';
import { WarmUp } from '../WarmUp';
import { FocusBlur } from './FocusBlur';
import { Player } from './Player';
import { Shelf } from './Shelf';
import { FOV, PLAYER_BOX, PLAYER_Y, ROW_Y, fitCamera } from './layout';

/** Scene units per metre are ~1100, so this is a touch lighter than real. */
const GRAVITY = -6500;

type Props = { labelFont: string; onReady?: () => void };

export default function Stage({ labelFont, onReady }: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: false }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#ffffff']} />
      <Scene labelFont={labelFont} onReady={onReady} />
    </Canvas>
  );
}

function Scene({ labelFont, onReady }: Props) {
  const { size, viewport } = useThree();
  const aspect = size.width / size.height;
  const fit = fitCamera(aspect);
  const falling = useDeck((s) => s.phase === 'falling');

  // px-per-unit for the DOM overlay, which shares the scene's coordinates.
  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--u', String(size.height / fit.visibleH));
    Object.assign(viewState, {
      unitsPerPx: fit.visibleH / size.height,
      distance: fit.distance,
      visibleW: fit.visibleW,
      visibleH: fit.visibleH,
    });
  }, [fit.distance, fit.visibleH, fit.visibleW, size.height]);

  const pxPerUnit = (size.height / fit.visibleH) * viewport.dpr;
  const cassetteW = 154 * pxPerUnit;

  return (
    <>
      <PerspectiveCamera makeDefault fov={FOV} near={10} far={20000} position={[0, 0, fit.distance]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[300, 600, 1200]} intensity={1.2} />
      <Environment resolution={256} frames={1} environmentIntensity={1.6}>
        <Lightformer form="rect" intensity={2} position={[0, 4, 6]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1} position={[-6, 0, 3]} scale={[4, 8, 1]} />
        <Lightformer form="rect" intensity={1} position={[6, 0, 3]} scale={[4, 8, 1]} />
        <Lightformer form="ring" intensity={0.6} position={[0, -5, 4]} scale={4} />
      </Environment>

      <Suspense fallback={null}>
        <Shelf spacing={fit.spacing} labelFont={labelFont} />
        <Player />
        <Physics gravity={[0, GRAVITY, 0]} lengthUnit={100}>
          {/* The Walkman, as something a dropped tape can land on. Deep in Z
              so it catches tapes travelling in front of the open lid. */}
          <RigidBody type="fixed" colliders={false} position={[0, PLAYER_Y + PLAYER_BOX.offsetY, 60]}>
            <CuboidCollider args={[PLAYER_BOX.halfW, PLAYER_BOX.halfH, 220]} restitution={0.3} friction={0.6} />
          </RigidBody>
          {falling && <FallingTape labelFont={labelFont} />}
        </Physics>
        {/* Runs once everything above has loaded: compiles shaders, then signals ready. */}
        <WarmUp onReady={() => onReady?.()} />
      </Suspense>

      <EffectComposer multisampling={4}>
        <FocusBlur
          bandHalfWidth={cassetteW * 0.62}
          ramp={fit.spacing * pxPerUnit * 0.55}
          maxRadius={7 * viewport.dpr}
          rowCenterY={(fit.visibleH / 2 + ROW_Y) * pxPerUnit}
          rowHalfHeight={95 * pxPerUnit}
          fade={0.35}
        />
      </EffectComposer>
    </>
  );
}
