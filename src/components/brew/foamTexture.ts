import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

/**
 * Bloom foam: a mottled crust of tan CO₂ bubbles over dark coffee. Tinted
 * toward dark brown as the bloom settles.
 */
export function makeFoamTexture(size = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#4e321f';
  c.fillRect(0, 0, size, size);

  let seed = 3;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < size * size * 0.02; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.8 + rand() * rand() * 5;
    const light = rand();
    c.fillStyle = light > 0.6 ? `rgba(168, 131, 92, ${0.35 + light * 0.4})` : `rgba(40, 24, 14, ${0.35 + light * 0.5})`;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
    if (light > 0.85 && r > 3) {
      // a glint on the bigger bubbles
      c.fillStyle = 'rgba(255, 240, 220, 0.5)';
      c.beginPath();
      c.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
      c.fill();
    }
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  return tex;
}
