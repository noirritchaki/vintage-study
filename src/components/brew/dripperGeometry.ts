// Geometry for the cone pour-over dripper on a conical glass carafe, ported
// from the Blender script (pourover_dripper-update.py). Nearly every part there is a
// profile revolved around the vertical axis, so it maps onto three's
// LatheGeometry: Blender (r, z) → (r, y). Units are metres.

import {
  BufferGeometry,
  CatmullRomCurve3,
  LatheGeometry,
  PlaneGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type Pt = [r: number, z: number];

// Cone: bottom (z0, r0) to top (z1, r1)
const Z0 = 0.008;
const R0 = 0.011;
const Z1 = 0.09;
const R1 = 0.058;
export const coneR = (z: number) => R0 + ((R1 - R0) * (z - Z0)) / (Z1 - Z0);

/** Same as the script's interp(): linearly subdivide a polyline. */
function interp(points: Pt[], steps = 12): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [r1, z1] = points[i];
    const [r2, z2] = points[i + 1];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      out.push([r1 + (r2 - r1) * t, z1 + (z2 - z1) * t]);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

export const lathe = (pts: Pt[], segs: number) =>
  new LatheGeometry(
    pts.map(([r, z]) => new Vector2(r, z)),
    segs,
  );

/**
 * Give an open profile thickness (the script's Solidify modifier, offset 0):
 * walk it on one side, come back on the other, as one closed profile.
 */
function solidify(pts: Pt[], thickness: number): Pt[] {
  const h = thickness / 2;
  const normals = pts.map((_, i) => {
    const [ra, za] = pts[Math.max(0, i - 1)];
    const [rb, zb] = pts[Math.min(pts.length - 1, i + 1)];
    const dr = rb - ra;
    const dz = zb - za;
    const len = Math.hypot(dr, dz) || 1;
    return [dz / len, -dr / len] as Pt; // outward (away from the axis on the cone)
  });
  const outer = pts.map(([r, z], i) => [r + normals[i][0] * h, z + normals[i][1] * h] as Pt);
  const inner = pts.map(([r, z], i) => [r - normals[i][0] * h, z - normals[i][1] * h] as Pt);
  // Lathe normals follow the profile's direction, so walk up the outside and
  // back down the inside to keep every face pointing out of the solid.
  return [...outer, ...inner.reverse(), outer[0]];
}

/** Re-weld the lathe seam and recompute smooth normals after displacing. */
function finish(geo: BufferGeometry) {
  geo.deleteAttribute('uv');
  const welded = mergeVertices(geo, 1e-7);
  welded.computeVertexNormals();
  return welded;
}

const noise = new ImprovedNoise();
/** Fractal "clouds" noise in roughly [-0.5, 0.5], like Blender's Clouds texture. */
function clouds(x: number, y: number, z: number, scale: number, octaves: number) {
  let sum = 0;
  let amp = 0.5;
  let f = 1 / scale;
  for (let o = 0; o < octaves; o++) {
    sum += noise.noise(x * f, y * f, z * f) * amp;
    amp *= 0.5;
    f *= 2;
  }
  return sum;
}

export function dripperBody() {
  const profile = [...interp([[R0, Z0], [R1, Z1]], 24), [0.063, 0.093], [0.067, 0.092]] as Pt[];
  return lathe(solidify(profile, 0.004), 128);
}

export function dripperBase() {
  const profile: Pt[] = [
    [R0, 0.0],
    [0.066, 0.0],
    [0.07, 0.0025],
    [0.069, 0.006],
    [0.064, 0.008],
    [0.024, 0.0095],
    [0.016, 0.014],
    [R0, 0.014],
    [R0, 0.0],
  ];
  return lathe(profile, 128);
}

/**
 * Loop handle; place at HANDLE.position, scaled by HANDLE.scale. The script has
 * it at x = 0.062, where it pokes ~0.3mm through the wall and shows from above
 * in the gap behind the paper, so it sits 1.5mm further out here.
 */
export const HANDLE = { position: [0.0635, 0.072, 0] as const, scale: [1, 1, 1.2] as const };
export function dripperHandle() {
  return new TorusGeometry(0.013, 0.0036, 24, 64);
}

/** Paper cone sitting a few mm inside the ceramic, flaring past the rim, crinkled. */
export function filterPaper() {
  const GAP = 0.003;
  const pts: Pt[] = [];
  for (let i = 0; i <= 60; i++) {
    const z = 0.006 + (i * (0.092 - 0.006)) / 60;
    pts.push([Math.max(coneR(z) - GAP, 0.0015), z]);
  }
  pts[0] = [0.0015, 0.006];
  pts.push([0.064, 0.104], [0.069, 0.114]);
  const geo = lathe(interp(pts, 1), 200);

  // Crinkles: push vertices along their normal by a little cloud noise.
  const pos = geo.getAttribute('position');
  const nrm = geo.getAttribute('normal');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const d = clouds(x, y, z, 0.006, 3) * 0.0016;
    pos.setXYZ(i, x + nrm.getX(i) * d, y + nrm.getY(i) * d, z + nrm.getZ(i) * d);
  }
  return finish(geo);
}

export const BED_RADIUS = coneR(0.06) - 0.003 - 0.0006;

/**
 * Slightly domed bed of grounds with clumpy height noise, UV-mapped from above.
 * Built from an even grid clipped to a circle (rather than a lathe) so there's
 * no fan of thin triangles meeting in the middle to streak the shading.
 */
export function coffeeBed() {
  const r = BED_RADIUS;
  // The script's bed profile: height (z) by distance from the centre (r).
  const profile: Pt[] = [
    [0, 0.0635],
    [0.008, 0.0633],
    [0.016, 0.0627],
    [0.024, 0.0618],
    [0.031, 0.0608],
    [r - 0.002, 0.0603],
    [r, 0.06],
  ];
  const heightAt = (d: number) => {
    for (let i = 1; i < profile.length; i++) {
      const [ra, za] = profile[i - 1];
      const [rb, zb] = profile[i];
      if (d <= rb) return za + ((zb - za) * (d - ra)) / (rb - ra);
    }
    return profile[profile.length - 1][1];
  };

  const geo = new PlaneGeometry(2 * r, 2 * r, 220, 220);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let z = pos.getZ(i);
    const d = Math.hypot(x, z);
    if (d > r) {
      // Pull corner vertices onto the rim; their triangles collapse to nothing.
      x *= r / d;
      z *= r / d;
    }
    const dist = Math.min(d, r);
    const edge = Math.min(1, (r - dist) / 0.004); // keep the rim seated on the paper
    const bump = clouds(x, 0, z, 0.006, 4) * 0.0016 + clouds(x, 0, z, 0.0025, 2) * 0.0006;
    pos.setXYZ(i, x, heightAt(dist) + bump * edge, z);
  }
  geo.computeVertexNormals();
  return geo;
}

// ---------------- glass carafe ----------------

const CARAFE_PROFILE: Pt[] = [
  [0, 0.002], // the script starts at 0.5mm; 0 closes the centre of the base
  [0.066, 0.002],
  [0.073, 0.005],
  [0.076, 0.013],
  [0.0445, 0.103],
  [0.041, 0.112],
  [0.041, 0.128],
  [0.044, 0.134],
];

/** Outer radius of the carafe at height z (the script's carafe_r). */
export function carafeR(z: number) {
  for (let i = 1; i < CARAFE_PROFILE.length; i++) {
    const [r1, z1] = CARAFE_PROFILE[i - 1];
    const [r2, z2] = CARAFE_PROFILE[i];
    if (z2 > z1 && z1 <= z && z <= z2) return r1 + ((r2 - r1) * (z - z1)) / (z2 - z1);
  }
  return CARAFE_PROFILE[CARAFE_PROFILE.length - 1][0];
}

/** How far the dripper is lifted to sit on the carafe's rim. */
export const DRIPPER_LIFT = 0.1355;

export function carafe() {
  return lathe(solidify(interp(CARAFE_PROFILE, 8), 0.0025), 160);
}

/** Glass handle: a tube along a smooth curve through the script's points. */
export function carafeHandle() {
  const pts = [
    [0.041, 0.121],
    [0.073, 0.119],
    [0.087, 0.084],
    [0.064, 0.049],
  ].map(([x, z]) => new Vector3(x, z, 0));
  return new TubeGeometry(new CatmullRomCurve3(pts, false, 'centripetal'), 64, 0.0045, 16, false);
}
