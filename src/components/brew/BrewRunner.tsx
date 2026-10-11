'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane, Raycaster, Vector2, Vector3 } from 'three';
import { advance, sim, useBrewUI } from './brewSim';
import { BED_TOP, paperRadiusAt } from './brewLayout';

const raycaster = new Raycaster();
const plane = new Plane(new Vector3(0, 1, 0), 0);
const hit = new Vector3();
const ndc = new Vector2();

/**
 * Runs the brew: advances the simulation every frame, turns press-and-hold on
 * the coffee bed into pouring (the stream follows the pointer, kept inside the
 * filter), and hands the UI a throttled snapshot. Space also pours.
 */
export function BrewRunner({ active }: { active: boolean }) {
  const { gl, camera, pointer } = useThree();
  const sinceUI = useRef(0);

  /** Where a screen point lands on the brew surface; null if outside the filter. */
  const landingAt = (x: number, y: number, clamp: boolean) => {
    ndc.set(x, y);
    raycaster.setFromCamera(ndc, camera);
    const surfaceY = Math.max(BED_TOP, sim.landing.y || BED_TOP);
    plane.constant = -surfaceY;
    if (!raycaster.ray.intersectPlane(plane, hit)) return null;
    const r = Math.hypot(hit.x, hit.z);
    const max = paperRadiusAt(surfaceY) * 0.82;
    if (r > max) {
      if (!clamp && r > paperRadiusAt(surfaceY) * 1.15) return null;
      hit.x *= max / r;
      hit.z *= max / r;
    }
    return hit;
  };

  useEffect(() => {
    if (!active) {
      sim.pouring = false;
      return;
    }
    const el = gl.domElement;
    const toNdc = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      return [((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1] as const;
    };
    const down = (e: PointerEvent) => {
      const [x, y] = toNdc(e);
      const p = landingAt(x, y, false);
      if (!p) return;
      sim.landing.copy(p);
      sim.pouring = true;
      el.setPointerCapture(e.pointerId);
    };
    const up = () => (sim.pouring = false);
    const key = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || (e.target as HTMLElement)?.closest?.('button, a, [data-nav]')) return;
      e.preventDefault();
      sim.pouring = e.type === 'keydown';
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('keydown', key);
    window.addEventListener('keyup', key);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', key);
      window.removeEventListener('keyup', key);
      sim.pouring = false;
    };
    // landingAt only reads refs/camera
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, gl, camera]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') (window as unknown as { __brew: unknown }).__brew = sim;
  }, []);

  useFrame((_, dt) => {
    // Dev-only: window.__brewSpeed fast-forwards a brew for testing.
    const speed =
      process.env.NODE_ENV === 'development' ? ((window as unknown as { __brewSpeed?: number }).__brewSpeed ?? 1) : 1;
    const step = Math.min(dt, 0.1) * speed;
    if (sim.pouring) {
      const p = landingAt(pointer.x, pointer.y, true);
      if (p) sim.landing.lerp(p, Math.min(1, step * 12));
    } else if (sim.landing.lengthSq() === 0) {
      sim.landing.set(0, BED_TOP, 0);
    }
    advance(step);

    sinceUI.current += step;
    if (sinceUI.current > 0.1) {
      sinceUI.current = 0;
      useBrewUI.getState().publish();
    }
  });
  return null;
}
