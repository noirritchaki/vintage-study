import { CanvasTexture, RepeatWrapping } from 'three';

/**
 * Height map of faint "throwing rings" — the soft horizontal ripples a glazed,
 * wheel-thrown piece has. Used as a bump map along the dripper's lathe (v runs
 * up the profile), it breaks the highlights into gentle bands like real ceramic.
 */
export function makeGlazeRings(rings = 46) {
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(4, H);

  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // Slightly uneven ring spacing and depth, like a hand-thrown piece.
  const phases = Array.from({ length: 3 }, () => rand() * Math.PI * 2);
  for (let y = 0; y < H; y++) {
    const t = y / H;
    const wobble = Math.sin(t * Math.PI * 2 * 3 + phases[0]) * 0.35;
    const ring = Math.sin((t * rings + wobble) * Math.PI * 2);
    const depth = 0.65 + 0.35 * Math.sin(t * Math.PI * 2 * 5 + phases[1]);
    const v = Math.round(128 + ring * depth * 90 + Math.sin(t * 640 + phases[2]) * 6);
    for (let x = 0; x < 4; x++) {
      const i = (y * 4 + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  return tex;
}
