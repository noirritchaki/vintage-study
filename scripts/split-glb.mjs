// Prepares the site's web-sized models:
//   public/models/player.glb    — the Walkman: a "Body" node and a hinged "Lid" node
//   public/models/cassettes.glb — six different tapes, "Tape_0"…"Tape_5"
//   public/models/scale.glb     — pour-over scale (its kettle removed)
//   public/models/kettle.glb    — Stagg EKG kettle (its power base removed)
//
// Sources:
//   "Sony Walkman Professional WM-D6C" by Nedotyopa (CC-BY-4.0)
//   https://sketchfab.com/3d-models/sony-walkman-professional-wm-d6c-fa57b1cf2cf34746baecc3fe1736b704
//   "Cassette Tape" by Zian (CC-BY-4.0)
//   https://sketchfab.com/3d-models/cassette-tape-d12bc8517ecb470f87862e1c24250d91
//   "Fellow, Stagg Ekg electric kettle." by tiikeri (CC-BY-4.0)
//   https://sketchfab.com/3d-models/fellow-stagg-ekg-electric-kettle-9d02f50339204aceae991da3ae251869
//   "Coffee Scales and Kettle" by hakangztk (CC-BY-NC-4.0 — non-commercial use only)
//   https://sketchfab.com/3d-models/coffee-scales-and-kettle-bbe0c28124c9461e85b56bd289137c47

import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  center,
  compactPrimitive,
  dedup,
  flatten,
  meshopt,
  prune,
  textureCompress,
  transformMesh,
} from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = new URL('../assets/walkman-source.glb', import.meta.url).pathname;
const TAPES_SRC = new URL('../assets/cassette-tapes-source.glb', import.meta.url).pathname;
const SCALE_SRC = new URL('../assets/scale-source.glb', import.meta.url).pathname;
const KETTLE_SRC = new URL('../assets/kettle-source.glb', import.meta.url).pathname;
const OUT = new URL('../public/models/', import.meta.url).pathname;

// Indices of the top-level groups under RootNode in the source file.
const CASSETTE = 3;
const PLAYER_BODY = 6;
const PLAYER_WINDOW = 9;

// The source lays both objects flat on the ground at arbitrary yaw angles.
// These (column-major) matrices undo each object's world rotation so its face
// lies in the XY plane, facing +Z (towards a default camera), long edge on X.
const UPRIGHT = {
  cassette: [0.917531, 0.397664, 0, 0, 0, 0, 1, 0, 0.397664, -0.917531, 0, 0, 0, 0, 0, 1],
  player: [0.768831, -0.639452, 0, 0, 0, 0, 1, 0, -0.639452, -0.768831, 0, 0, 0, 0, 0, 1],
};

// In the upright frame the Walkman's front face sits at z ≈ 0.056m and the
// tape door is propped open towards the viewer. Any connected part reaching
// past this depth belongs to the door.
const LID_MIN_Z = 0.058;

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
// +90° about X: a tape lying face-up becomes upright, facing +Z.
const STAND_UP = [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1];
const translation = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

async function build(name, keep, textureSize) {
  const doc = await io.read(SRC);
  const nodes = doc.getRoot().listNodes();
  const keepSet = new Set(keep.map((i) => nodes[i]));
  for (const i of [CASSETTE, PLAYER_BODY, PLAYER_WINDOW]) {
    if (keepSet.has(nodes[i])) continue;
    nodes[i].traverse((n) => n.dispose());
  }

  await doc.transform(flatten(), prune());

  // Bake world transform + upright rotation into the vertices, so every mesh
  // node ends up with an identity transform.
  const scene = doc.getRoot().listScenes()[0];
  const meshNodes = doc.getRoot().listNodes().filter((n) => n.getMesh());
  for (const node of meshNodes) {
    const mesh = node.getMesh();
    transformMesh(mesh, node.getWorldMatrix());
    transformMesh(mesh, UPRIGHT[name]);
    node.setMatrix(IDENTITY);
  }
  for (const n of scene.listChildren()) scene.removeChild(n);

  const root = doc.createNode(name === 'player' ? 'Player' : 'Cassette');
  scene.addChild(root);
  if (name === 'player') buildPlayerHierarchy(doc, root, meshNodes);
  else meshNodes.forEach((n) => root.addChild(n));

  await doc.transform(
    prune(),
    dedup(),
    center({ pivot: 'center' }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [textureSize, textureSize], quality: 82 }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );

  await io.write(`${OUT}${name}.glb`, doc);
  console.log(`wrote ${name}.glb`);
}

/**
 * Player → Body (static shell) + Lid (the tape door, pivoting on its hinge).
 * The door isn't its own mesh in the source, so its triangles are pulled out
 * of the body meshes by connectivity.
 */
function buildPlayerHierarchy(doc, root, meshNodes) {
  const body = doc.createNode('Body');
  const lidParts = [];

  for (const node of meshNodes) {
    const isGlass = node.getMesh().listPrimitives()[0].getMaterial()?.getAlphaMode() === 'BLEND';
    if (isGlass) {
      lidParts.push(node);
      continue;
    }
    body.addChild(node);
    for (const prim of node.getMesh().listPrimitives()) {
      const lidTris = lidTriangles(prim);
      if (!lidTris.size) continue;
      const { lid, rest } = splitIndices(prim, lidTris);
      const lidPrim = prim.clone();
      lidPrim.setIndices(doc.createAccessor().setType('SCALAR').setArray(lid));
      prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(rest));
      compactPrimitive(prim);
      compactPrimitive(lidPrim);
      const lidMesh = doc.createMesh(`${node.getMesh().getName()}_lid`).addPrimitive(lidPrim);
      lidParts.push(doc.createNode(`${node.getName()}_lid`).setMesh(lidMesh));
    }
  }

  // Hinge line runs along X, through the door's edge nearest the body.
  const pts = lidParts.flatMap((n) => positions(n.getMesh()));
  const minZ = Math.min(...pts.map((p) => p[2]));
  const nearHinge = pts.filter((p) => p[2] < minZ + 0.004);
  const hy = nearHinge.reduce((s, p) => s + p[1], 0) / nearHinge.length;
  const hz = nearHinge.reduce((s, p) => s + p[2], 0) / nearHinge.length;

  const lid = doc.createNode('Lid').setTranslation([0, hy, hz]);
  for (const part of lidParts) {
    transformMesh(part.getMesh(), translation(0, -hy, -hz));
    lid.addChild(part);
  }
  root.addChild(body).addChild(lid);
  console.log(`  lid: ${lidParts.length} parts, hinge at y=${hy.toFixed(4)} z=${hz.toFixed(4)}`);
}

function positions(mesh) {
  const out = [];
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    const idx = prim.getIndices().getArray();
    for (const i of new Set(idx)) out.push(pos.getElement(i, []));
  }
  return out;
}

/** Triangle indices of every connected part that reaches past LID_MIN_Z. */
function lidTriangles(prim) {
  const pos = prim.getAttribute('POSITION');
  const idx = prim.getIndices().getArray();
  // Weld by position so UV seams don't split parts apart.
  const weldId = new Map();
  const vid = new Int32Array(pos.getCount());
  const p = [];
  for (let i = 0; i < pos.getCount(); i++) {
    pos.getElement(i, p);
    const key = p.map((v) => v.toFixed(5)).join(',');
    if (!weldId.has(key)) weldId.set(key, weldId.size);
    vid[i] = weldId.get(key);
  }
  const parent = Int32Array.from({ length: weldId.size }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  for (let t = 0; t < idx.length; t += 3) {
    const a = find(vid[idx[t]]);
    parent[find(vid[idx[t + 1]])] = a;
    parent[find(vid[idx[t + 2]])] = a;
  }
  const maxZ = new Map();
  for (let i = 0; i < pos.getCount(); i++) {
    const r = find(vid[i]);
    maxZ.set(r, Math.max(maxZ.get(r) ?? -Infinity, pos.getElement(i, p)[2]));
  }
  const tris = new Set();
  for (let t = 0; t < idx.length; t += 3) {
    if (maxZ.get(find(vid[idx[t]])) > LID_MIN_Z) tris.add(t / 3);
  }
  return tris;
}

function splitIndices(prim, lidTris) {
  const idx = prim.getIndices().getArray();
  const lid = [];
  const rest = [];
  for (let t = 0; t < idx.length / 3; t++) {
    (lidTris.has(t) ? lid : rest).push(idx[t * 3], idx[t * 3 + 1], idx[t * 3 + 2]);
  }
  const Arr = idx.constructor;
  return { lid: new Arr(lid), rest: new Arr(rest) };
}

/**
 * The tape pack lays six tapes (two shell styles × three labels) flat in a
 * grid. Each one is baked upright and centred on its own origin, so the site
 * can pick any of them by name.
 */
async function buildTapes() {
  const doc = await io.read(TAPES_SRC);
  await doc.transform(flatten(), prune());
  const scene = doc.getRoot().listScenes()[0];
  const tapes = doc
    .getRoot()
    .listNodes()
    .filter((n) => n.getMesh())
    .sort((a, b) => a.getName().localeCompare(b.getName()));

  for (const n of scene.listChildren()) scene.removeChild(n);
  const root = doc.createNode('Tapes');
  scene.addChild(root);

  tapes.forEach((node, i) => {
    const mesh = node.getMesh();
    transformMesh(mesh, node.getWorldMatrix());
    node.setMatrix(IDENTITY);
    const { min, max } = getBounds(node);
    transformMesh(mesh, translation(-(min[0] + max[0]) / 2, -(min[1] + max[1]) / 2, -(min[2] + max[2]) / 2));
    transformMesh(mesh, STAND_UP);
    node.setName(`Tape_${i}`);
    root.addChild(node);
    console.log(`  Tape_${i} ← ${mesh.getName()}`);
  });

  await doc.transform(
    prune(),
    dedup(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [2048, 2048], quality: 82 }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  await io.write(`${OUT}cassettes.glb`, doc);
  console.log('wrote cassettes.glb');
}

/**
 * Drop the named nodes (and everything under them), bake every remaining
 * mesh's world transform plus `bake` into its vertices, and gather the meshes
 * under one named root.
 */
async function bakeParts(doc, rootName, drop, bake) {
  for (const node of doc.getRoot().listNodes()) {
    if (drop.includes(node.getName())) node.traverse((n) => n.dispose());
  }
  await doc.transform(flatten(), prune());
  const scene = doc.getRoot().listScenes()[0];
  const parts = doc.getRoot().listNodes().filter((n) => n.getMesh());
  for (const n of scene.listChildren()) scene.removeChild(n);
  const root = doc.createNode(rootName);
  scene.addChild(root);
  for (const node of parts) {
    transformMesh(node.getMesh(), node.getWorldMatrix());
    transformMesh(node.getMesh(), bake);
    node.setMatrix(IDENTITY);
    root.addChild(node);
  }
  return parts;
}

/** Source units are ~cm: scale to metres and move (x, y, z) to the origin. */
const cmToMetres = (x, y, z) => [0.01, 0, 0, 0, 0, 0.01, 0, 0, 0, 0, 0.01, 0, -x * 0.01, -y * 0.01, -z * 0.01, 1];

/** The scale pack also has a gooseneck kettle ("Circle.001"); keep only the scale. */
async function buildScale() {
  const doc = await io.read(SCALE_SRC);
  // Centre on the weighing pad (x −121.55, z −3.31), bottom on y = 0.
  await bakeParts(doc, 'Scale', ['Circle.001'], cmToMetres(-121.55, 0, -3.31));
  await doc.transform(
    prune(),
    dedup(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 85 }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  await io.write(`${OUT}scale.glb`, doc);
  console.log('wrote scale.glb');
}

/** Stagg EKG without its two-part power base and cable, standing on y = 0. */
async function buildKettle() {
  const doc = await io.read(KETTLE_SRC);
  const SCALE = 0.009; // source ~cm, with the kettle's bottom at y ≈ 3.4 (above the base)
  const bake = [SCALE, 0, 0, 0, 0, SCALE, 0, 0, 0, 0, SCALE, 0, 0, -3.4 * SCALE, 0, 1];
  await bakeParts(doc, 'Kettle', ['KattleFull_Wall_0', 'Base', 'BezierCurve'], bake);
  await doc.transform(prune(), dedup(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await io.write(`${OUT}kettle.glb`, doc);
  console.log('wrote kettle.glb');
}

await mkdir(OUT, { recursive: true });
await build('player', [PLAYER_BODY, PLAYER_WINDOW], 2048);
await buildTapes();
await buildScale();
await buildKettle();
