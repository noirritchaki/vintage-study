import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

// Ground coffee, drawn grain by grain: the script's Voronoi "grind" shader
// ramps between these two browns.
const DARK = [42, 26, 16];
const LIGHT = [112, 74, 46];

/**
 * Colour + height maps for the coffee bed, generated on a canvas so the
 * top-down close-up has real grain to look at. Same random seed for both.
 */
export function makeGroundsTextures(size = 2048) {
  const color = document.createElement('canvas');
  const height = document.createElement('canvas');
  color.width = color.height = height.width = height.height = size;
  const c = color.getContext('2d')!;
  const h = height.getContext('2d')!;

  c.fillStyle = `rgb(${DARK.join(',')})`;
  c.fillRect(0, 0, size, size);
  h.fillStyle = '#202020';
  h.fillRect(0, 0, size, size);

  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const grains = Math.round(size * size * 0.06);
  for (let i = 0; i < grains; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.8 + rand() * rand() * 3.2;
    const t = rand();
    const fines = rand() < 0.03; // the odd pale chaff / fine
    const k = fines ? 1.25 : t;
    const col = DARK.map((d, j) => Math.round(Math.min(255, d + (LIGHT[j] - d) * k)));
    c.fillStyle = `rgb(${col.join(',')})`;
    c.beginPath();
    c.ellipse(x, y, r, r * (0.7 + rand() * 0.3), rand() * Math.PI, 0, Math.PI * 2);
    c.fill();

    const v = Math.round(60 + t * 150 + r * 12);
    h.fillStyle = `rgb(${v},${v},${v})`;
    h.beginPath();
    h.arc(x, y, r, 0, Math.PI * 2);
    h.fill();
  }

  const map = new CanvasTexture(color);
  map.colorSpace = SRGBColorSpace;
  const bump = new CanvasTexture(height);
  for (const t of [map, bump]) {
    t.wrapS = t.wrapT = RepeatWrapping;
    t.anisotropy = 8;
  }
  return { map, bump };
}
