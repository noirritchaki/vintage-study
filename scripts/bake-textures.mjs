// Bakes the brew page's procedural textures to image files, so the browser
// doesn't paint ~250k coffee grains on the main thread when the page opens.
//   public/textures/grounds.webp — coffee bed (also its bump map: a grain's
//                                  brightness already tracks its height)
//   public/textures/foam.webp    — bloom foam
// Drawn at full size with the same seeded grains as the original canvas
// versions, then downsampled so the files stay small (~350KB / ~100KB).

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const OUT = new URL('../public/textures/', import.meta.url).pathname;

function seeded(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}

/** RGB buffer with soft-edged (anti-aliased) filled ellipses, alpha-blended. */
function canvas(size, rgb) {
  const px = new Float32Array(size * size * 3);
  for (let i = 0; i < size * size; i++) px.set(rgb, i * 3);
  const blend = (x, y, color, a) => {
    const i = (y * size + x) * 3;
    for (let k = 0; k < 3; k++) px[i + k] += (color[k] - px[i + k]) * a;
  };
  return {
    ellipse(cx, cy, rx, ry, rot, color, alpha = 1) {
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const R = Math.max(rx, ry) + 1;
      for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) {
        if (y < 0 || y >= size) continue;
        for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
          if (x < 0 || x >= size) continue;
          const dx = x + 0.5 - cx;
          const dy = y + 0.5 - cy;
          const u = (dx * cos + dy * sin) / rx;
          const v = (-dx * sin + dy * cos) / ry;
          const d = Math.sqrt(u * u + v * v);
          // ~1px soft edge
          const cover = Math.min(1, Math.max(0, (1 - d) * Math.min(rx, ry) + 0.5));
          if (cover > 0) blend(x, y, color, cover * alpha);
        }
      }
    },
    png() {
      const out = Buffer.alloc(size * size * 3);
      for (let i = 0; i < size * size * 3; i++) out[i] = Math.round(px[i]);
      return sharp(out, { raw: { width: size, height: size, channels: 3 } });
    },
  };
}

async function grounds(size = 2048) {
  const DARK = [42, 26, 16];
  const LIGHT = [112, 74, 46];
  const color = canvas(size, DARK);
  const rand = seeded(7);
  const grains = Math.round(size * size * 0.06);
  for (let i = 0; i < grains; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.8 + rand() * rand() * 3.2;
    const t = rand();
    const fines = rand() < 0.03; // the odd pale chaff / fine
    const k = fines ? 1.25 : t;
    const col = DARK.map((d, j) => Math.min(255, d + (LIGHT[j] - d) * k));
    color.ellipse(x, y, r, r * (0.7 + rand() * 0.3), rand() * Math.PI, col);
  }
  await color.png().resize(1536).webp({ quality: 74 }).toFile(`${OUT}grounds.webp`);
}

async function foam(size = 1024) {
  const c = canvas(size, [78, 50, 31]);
  const rand = seeded(3);
  for (let i = 0; i < size * size * 0.02; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.8 + rand() * rand() * 5;
    const light = rand();
    if (light > 0.6) c.ellipse(x, y, r, r, 0, [168, 131, 92], 0.35 + light * 0.4);
    else c.ellipse(x, y, r, r, 0, [40, 24, 14], Math.min(1, 0.35 + light * 0.5));
    if (light > 0.85 && r > 3) c.ellipse(x - r * 0.3, y - r * 0.3, r * 0.25, r * 0.25, 0, [255, 240, 220], 0.5);
  }
  await c.png().resize(768).webp({ quality: 78 }).toFile(`${OUT}foam.webp`);
}

await mkdir(OUT, { recursive: true });
await grounds();
await foam();
console.log('baked grounds.webp, foam.webp');
