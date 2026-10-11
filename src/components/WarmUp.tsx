'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Material, Mesh, Texture, type Object3D } from 'three';

/**
 * Mount inside the scene's <Suspense> so it runs once every model and texture
 * has loaded. Compiles every shader — including objects that start hidden
 * (kettle, pour stream, slurry), which would otherwise compile on the first
 * pour — and uploads every texture, then calls onReady on the next frame.
 * Keeps the GPU's one-off setup cost out of sight, behind the fade-in.
 */
export function WarmUp({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    let cancelled = false;

    const hidden: Object3D[] = [];
    scene.traverse((o) => {
      if (!o.visible) {
        hidden.push(o);
        o.visible = true;
      }
    });
    const textures = new Set<Texture>();
    scene.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      for (const m of ([] as Material[]).concat(o.material)) {
        for (const value of Object.values(m)) if (value instanceof Texture) textures.add(value);
      }
    });
    // compileAsync collects the scene synchronously, so restore right away.
    const compiled = gl.compileAsync(scene, camera);
    hidden.forEach((o) => (o.visible = false));
    textures.forEach((t) => gl.initTexture(t));

    compiled
      .catch(() => {})
      .then(() => requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && onReady())));
    return () => {
      cancelled = true;
    };
    // run once, after everything has loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
