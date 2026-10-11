'use client';

import { useMemo } from 'react';
import { BufferGeometry, Color, DoubleSide, ShaderMaterial } from 'three';

/**
 * Real glass on a white table reads through its edges: where you look across
 * the wall at a grazing angle it goes darker. Transmission alone can't show
 * that against an empty white page, so this draws a soft fresnel rim on top.
 */
export function GlassEdges({
  geometry,
  color = '#4d545c',
  strength = 0.75,
  power = 2,
}: {
  geometry: BufferGeometry;
  color?: string;
  strength?: number;
  power?: number;
}) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uColor: { value: new Color(color) },
          uStrength: { value: strength },
          uPower: { value: power },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uStrength;
          uniform float uPower;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float facing = abs(dot(normalize(vNormal), normalize(vView)));
            float rim = pow(1.0 - facing, uPower) * uStrength;
            gl_FragColor = vec4(uColor, rim);
          }
        `,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    [color, strength, power],
  );
  return <mesh geometry={geometry} material={material} renderOrder={2} />;
}
