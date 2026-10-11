import { useTexture } from '@react-three/drei';
import { RepeatWrapping, SRGBColorSpace, type Texture } from 'three';

// Baked by scripts/bake-textures.mjs (npm run textures).
export const GROUNDS_URL = '/textures/grounds.webp';
export const FOAM_URL = '/textures/foam.webp';

const setup = (t: Texture) => {
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.anisotropy = 8;
};

/** Coffee bed colour map — doubles as its bump map. Suspends until loaded. */
export const useGroundsTexture = () => useTexture(GROUNDS_URL, setup);
/** Bloom foam on the slurry surface. Suspends until loaded. */
export const useFoamTexture = () => useTexture(FOAM_URL, setup);

export function preloadBrewTextures() {
  useTexture.preload(GROUNDS_URL);
  useTexture.preload(FOAM_URL);
}
