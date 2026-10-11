'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Color, CylinderGeometry, Mesh, MeshPhysicalMaterial } from 'three';
import { sim } from './brewSim';
import { BED_TOP, STAND, dripperY, paperRadiusAt } from './brewLayout';
import { carafeR, lathe, type Pt } from './dripperGeometry';
import { kettleTip } from './PouringKettle';
import { makeFoamTexture } from './foamTexture';

// Foam texture shows through at full strength during the bloom (white tint),
// then the tint darkens it to plain brewing coffee.
const FOAM = new Color('#ffffff');
const BREW = new Color('#9a6a48');
const water = new MeshPhysicalMaterial({
  color: '#e4eef4',
  transparent: true,
  opacity: 0.55,
  roughness: 0.04,
  clearcoat: 1,
  envMapIntensity: 2.5,
});
const drip = new MeshPhysicalMaterial({ color: '#4a2410', transparent: true, opacity: 0, roughness: 0.1 });
let foamMap: ReturnType<typeof makeFoamTexture> | null = null;
const slurry = new MeshPhysicalMaterial({
  color: BREW,
  transparent: true,
  opacity: 0.95,
  roughness: 0.12,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
});
const coffee = new MeshPhysicalMaterial({ color: '#1d0d05', roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 });

// Standing water above the bed: volume (m³) of the paper cone up to height h.
const BED_R = paperRadiusAt(BED_TOP);
const s = (paperRadiusAt(BED_TOP + 0.01) - BED_R) / 0.01; // radius growth per metre of rise
const coneVolume = (h: number) => Math.PI * (BED_R * BED_R * h + BED_R * s * h * h + (s * s * h * h * h) / 3);
function levelFor(grams: number) {
  const v = grams * 1e-6;
  let lo = 0;
  let hi = 0.05;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (coneVolume(mid) < v) lo = mid;
    else hi = mid;
  }
  return lo;
}

// Coffee in the carafe: inner radius, and fill height for a given volume.
const CARAFE_FLOOR = 0.0035;
const innerR = (z: number) => carafeR(z) - 0.0022;
const fillTable: number[] = []; // cumulative m³ per 0.5mm
for (let z = CARAFE_FLOOR, v = 0; z < 0.1; z += 0.0005) {
  fillTable.push(v);
  v += Math.PI * innerR(z) ** 2 * 0.0005;
}
const fillHeight = (grams: number) => {
  const v = grams * 1e-6;
  const i = fillTable.findIndex((x) => x > v);
  return CARAFE_FLOOR + (i === -1 ? fillTable.length : i) * 0.0005;
};
function carafeCoffee(h: number) {
  const pts: Pt[] = [[0, CARAFE_FLOOR]];
  for (let i = 0; i <= 8; i++) {
    const z = CARAFE_FLOOR + ((h - CARAFE_FLOOR) * i) / 8;
    pts.push([innerR(Math.max(z, 0.006)), z]);
  }
  pts.push([0, h]);
  return lathe(pts, 96);
}

const SURFACE = new CylinderGeometry(1, 1, 0.0008, 96);


const STREAM = new CylinderGeometry(0.0019, 0.0024, 1, 16, 1, true);
const DRIP = new CylinderGeometry(0.0008, 0.0011, 1, 10, 1, true);

/** Everything wet: slurry in the filter, the pour stream, the drip, the carafe. */
export function BrewLiquids() {
  const surface = useRef<Mesh>(null);
  const stream = useRef<Mesh>(null);
  const dripStream = useRef<Mesh>(null);
  const carafe = useRef<Mesh>(null);
  const shownFill = useRef(0);
  const empty = useMemo(() => new BufferGeometry(), []);
  useEffect(() => {
    const mesh = carafe.current;
    return () => {
      if (mesh && mesh.geometry !== empty) mesh.geometry.dispose();
    };
  }, [empty]);

  useFrame(() => {
    // Slurry: covers the bed once wet, rises with standing water.
    const level = levelFor(sim.free);
    // Only while water is standing on the bed; after drawdown the wet bed shows.
    const wet = sim.free > 0.4;
    const sy = BED_TOP + 0.0004 + level;
    if (surface.current) {
      surface.current.visible = wet;
      const r = paperRadiusAt(sy) - 0.0004;
      surface.current.position.set(0, sy, 0);
      surface.current.scale.set(r, 1, r);
      if (!foamMap) {
        foamMap = makeFoamTexture();
        slurry.map = foamMap;
        slurry.needsUpdate = true;
      }
      slurry.color.copy(BREW).lerp(FOAM, sim.bloom * 0.9);
      slurry.opacity = Math.min(0.95, 0.35 + sim.free / 12);
    }

    // Pour stream: straight down from the spout tip to the surface.
    if (stream.current) {
      const len = kettleTip.y - sy;
      stream.current.visible = sim.flow > 0.25 && len > 0.002;
      stream.current.position.set(kettleTip.x, sy + len / 2, kettleTip.z);
      stream.current.scale.set(Math.min(1, sim.flow / 4), Math.max(0.001, len), Math.min(1, sim.flow / 4));
    }

    // Coffee dripping from the hole in the cone into the carafe.
    const h = fillHeight(sim.drained);
    const top = dripperY(0.004);
    const bottom = STAND + (sim.drained > 0.5 ? h : CARAFE_FLOOR);
    if (dripStream.current) {
      dripStream.current.visible = sim.drainRate > 0.05;
      drip.opacity = Math.min(0.85, sim.drainRate * 0.6);
      dripStream.current.position.set(0, (top + bottom) / 2, 0);
      dripStream.current.scale.set(1, top - bottom, 1);
    }

    // Carafe fill, rebuilt every half millimetre of rise.
    if (carafe.current && Math.abs(h - shownFill.current) >= 0.0005) {
      shownFill.current = h;
      if (carafe.current.geometry !== empty) carafe.current.geometry.dispose();
      carafe.current.geometry = sim.drained > 0.5 ? carafeCoffee(h) : empty;
    }
  });

  return (
    <>
      <mesh ref={surface} geometry={SURFACE} material={slurry} visible={false} />
      <mesh ref={stream} geometry={STREAM} material={water} visible={false} />
      <mesh ref={dripStream} geometry={DRIP} material={drip} visible={false} />
      <mesh ref={carafe} geometry={empty} material={coffee} position={[0, STAND, 0]} />
    </>
  );
}
