'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { easing } from 'maath';
import { Color, DoubleSide, Group, MeshStandardMaterial, PerspectiveCamera, Vector3 } from 'three';
import {
  DRIPPER_LIFT,
  HANDLE,
  carafe,
  carafeHandle,
  coffeeBed,
  dripperBase,
  dripperBody,
  dripperHandle,
  filterPaper,
} from './dripperGeometry';
import { BrewLiquids } from './BrewLiquids';
import { BrewRunner } from './BrewRunner';
import { sim } from './brewSim';
import { SCALE_YAW, STAND } from './brewLayout';
import { GlassEdges } from './GlassEdges';
import { PouringKettle } from './PouringKettle';
import { Scale } from './Scale';
import { WarmUp } from '../WarmUp';
import { makeGlazeRings } from './glazeTexture';
import { preloadBrewTextures, useGroundsTexture } from './brewTextures';

// Start fetching textures as soon as this module loads (e.g. prefetched from home).
preloadBrewTextures();

// Colours from the Blender script (linear) — three converts them for display.
const CERAMIC = new Color().setRGB(0.93, 0.92, 0.89);
const PAPER = new Color().setRGB(0.97, 0.955, 0.92);
/** Glossy glazed ceramic: a hard clear coat over a smooth white body. */
const GLAZE = {
  color: CERAMIC,
  roughness: 0.14,
  clearcoat: 1,
  clearcoatRoughness: 0.03,
  envMapIntensity: 1.3,
};
/** Clear glass: barely there, but glossy enough to catch the strip lights. */
const GLASS = {
  color: '#eef4f7',
  transparent: true,
  opacity: 0.12,
  roughness: 0.02,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  envMapIntensity: 3,
  side: DoubleSide,
  depthWrite: false,
} as const;

/** The script's camera direction (Blender Z-up → Y-up), aimed at its focus. */
const SCRIPT_DIRECTION = new Vector3(0.46, 0.3 - 0.125, 0.56).normalize();
/** Aim at the middle of the set, and stand well back so it floats in the white. */
const FOCUS = new Vector3(0, 0.145, 0);
const DISTANCE = 2.05;

/**
 * Brewing view: looking down at the scale's side at a steep angle, so the
 * coffee bed (top) and the scale's screen (bottom) are both in frame.
 */
const FACING = new Vector3(Math.sin(SCALE_YAW), 0, Math.cos(SCALE_YAW));
const BREW_TARGET = new Vector3(0, 0.13, 0).addScaledVector(FACING, 0.035);
const BREW_ELEVATION = (57 * Math.PI) / 180;
const BREW_DISTANCE = 0.95;

export const VIEWS = {
  overview: { position: SCRIPT_DIRECTION.clone().multiplyScalar(DISTANCE).add(FOCUS), target: FOCUS },
  brew: {
    position: FACING.clone()
      .multiplyScalar(Math.cos(BREW_ELEVATION))
      .add(new Vector3(0, Math.sin(BREW_ELEVATION), 0))
      .multiplyScalar(BREW_DISTANCE)
      .add(BREW_TARGET),
    target: BREW_TARGET,
  },
} as const;
export type View = keyof typeof VIEWS;

/** 70mm lens on a 36mm sensor, as in the script. */
const FOV = 28.8;
const goal = new Vector3();

type Props = { view: View; onToggle: () => void; onReady?: () => void };

export default function BrewScene({ view, onToggle, onReady }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: FOV, near: 0.01, far: 10, position: VIEWS.overview.position.toArray() }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={({ camera }) => camera.lookAt(VIEWS.overview.target)}
    >
      <color attach="background" args={['#ffffff']} />
      <CameraRig view={view} />
      <Lights />
      <Suspense fallback={null}>
        <Scale rotation={[0, SCALE_YAW, 0]} />
        {/* the carafe and dripper stand on the scale's pad */}
        <group position={[0, STAND, 0]}>
          <PourOver onClick={view === 'overview' ? onToggle : undefined} />
        </group>
        <BrewLiquids />
        <PouringKettle active={view === 'brew'} />
        <WarmUp onReady={() => onReady?.()} />
      </Suspense>
      <BrewRunner active={view === 'brew'} />
      <Set />
    </Canvas>
  );
}

/** Eases the camera between the overview and the look-down-into-the-bed view. */
function CameraRig({ view }: { view: View }) {
  const { camera, size, pointer } = useThree();
  const target = useRef(VIEWS.overview.target.clone());

  useEffect(() => {
    camera.lookAt(VIEWS.overview.target);
  }, [camera]);

  useFrame((_, dt) => {
    const v = VIEWS[view];
    // Back off on tall, narrow screens so the dripper still fits.
    const aspect = size.width / size.height;
    const fit = aspect < 1 ? Math.min(2.4, (view === 'overview' ? 0.55 : 0.85) / aspect) : 1;
    goal.copy(v.position).sub(v.target).multiplyScalar(fit).add(v.target);
    // A little parallax with the pointer in the overview.
    if (view === 'overview') {
      goal.x += pointer.x * 0.02;
      goal.y += pointer.y * 0.012;
    }
    easing.damp3(camera.position, goal, 0.45, dt);
    easing.damp3(target.current, v.target, 0.45, dt);
    camera.lookAt(target.current);
    (camera as PerspectiveCamera).updateProjectionMatrix();
  });
  return null;
}

function PourOver({ onClick }: { onClick?: () => void }) {
  const geo = useMemo(
    () => ({
      body: dripperBody(),
      base: dripperBase(),
      handle: dripperHandle(),
      paper: filterPaper(),
      bed: coffeeBed(),
      carafe: carafe(),
      carafeHandle: carafeHandle(),
    }),
    [],
  );
  const grounds = useGroundsTexture();
  const glaze = useMemo(() => makeGlazeRings(), []);
  const bedMaterial = useRef<MeshStandardMaterial>(null);
  const bed = useRef<Group>(null);
  // Grounds darken as they soak and puff up a few mm while they bloom.
  useFrame(() => {
    const wet = Math.min(1, sim.absorbed / 30);
    bedMaterial.current?.color.setScalar(1 - 0.5 * wet);
    if (bed.current) bed.current.position.y = 0.0025 * sim.bloom + 0.001 * wet;
  });
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      glaze.dispose();
    },
    [geo, glaze],
  );

  return (
    <group
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => (document.body.style.cursor = onClick ? 'pointer' : 'crosshair')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      {/* Empty conical glass carafe: a faint, glossy see-through surface
          (front and back walls), so the shadow, the handle and the far wall all
          show through it; GlassEdges darkens the edges like real glass. */}
      <mesh geometry={geo.carafe} renderOrder={1}>
        <meshPhysicalMaterial {...GLASS} />
      </mesh>
      <mesh geometry={geo.carafeHandle} renderOrder={1}>
        <meshPhysicalMaterial {...GLASS} opacity={0.18} />
      </mesh>
      <GlassEdges geometry={geo.carafe} strength={0.42} power={2.6} />
      <GlassEdges geometry={geo.carafeHandle} strength={0.38} power={2.4} />

      {/* The dripper, sitting on the carafe's rim. */}
      <group position={[0, DRIPPER_LIFT, 0]}>
        <mesh geometry={geo.body} castShadow receiveShadow>
          <meshPhysicalMaterial {...GLAZE} bumpMap={glaze} bumpScale={0.16} />
        </mesh>
        <mesh geometry={geo.base} castShadow receiveShadow>
          <meshPhysicalMaterial {...GLAZE} />
        </mesh>
        <mesh geometry={geo.handle} position={HANDLE.position} scale={HANDLE.scale} castShadow>
          <meshPhysicalMaterial {...GLAZE} />
        </mesh>
        <mesh geometry={geo.paper} castShadow receiveShadow>
          <meshStandardMaterial color={PAPER} roughness={0.92} side={DoubleSide} />
        </mesh>
        <group ref={bed}>
        <mesh geometry={geo.bed} receiveShadow>
          <meshStandardMaterial
            ref={bedMaterial}
            map={grounds}
            bumpMap={grounds}
            bumpScale={1.2}
            roughness={0.85}
          />
        </mesh>
        </group>
      </group>
    </group>
  );
}

/** Key / fill / rim, after the script's three area lights. */
function Lights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <spotLight
        position={[0.6, 0.75, 0.45]}
        angle={0.5}
        penumbra={1}
        intensity={6}
        decay={0}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.0004}
        shadow-radius={6}
        shadow-camera-near={0.2}
        shadow-camera-far={2}
      />
      <pointLight position={[-0.65, 0.35, 0.3]} intensity={0.9} decay={0} color="#e6f0ff" />
      <directionalLight position={[-0.15, 0.6, -0.5]} intensity={1.3} />
      {/* A little studio for the glaze and glass to reflect: a big softbox,
          two tall strip lights and a ceiling bar give the crisp streaks. */}
      <Environment resolution={512} frames={1}>
        <Lightformer form="rect" intensity={0.35} position={[0, 0, 9]} scale={[20, 12, 1]} />
        <Lightformer form="rect" intensity={3.5} position={[4.5, 5.5, 3.5]} scale={[3, 5, 1]} color="#fff4e6" />
        {/* tall strips behind the camera: these streak down the cone and carafe */}
        <Lightformer form="rect" intensity={6} position={[3.4, 2.2, 5.4]} scale={[0.22, 8, 1]} />
        <Lightformer form="rect" intensity={4} position={[5.2, 2, 3]} scale={[0.4, 8, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-5, 2, 2.5]} scale={[0.5, 9, 1]} />
        <Lightformer form="rect" intensity={2} position={[0, 7, -2]} scale={[9, 0.4, 1]} />
        <Lightformer form="ring" intensity={1.4} position={[-1.5, 4, -5]} scale={2.5} />
        {/* the cone faces slightly down, so it mirrors the "table": a soft floor
            bounce plus a low strip give the glaze its sheen */}
        <Lightformer form="rect" intensity={0.9} position={[0, -4, 1]} scale={[14, 14, 1]} />
        <Lightformer form="rect" intensity={5} position={[3, -1.2, 5.2]} scale={[0.25, 5, 1]} />
        <Lightformer form="rect" intensity={3} position={[5, -1, 2.6]} scale={[0.4, 5, 1]} />
      </Environment>
    </>
  );
}

/** No room — just a soft shadow so the set sits on the white page. */
function Set() {
  return <ContactShadows position={[0, 0.0005, 0]} scale={0.6} blur={2.6} opacity={0.3} far={0.3} />;
}
