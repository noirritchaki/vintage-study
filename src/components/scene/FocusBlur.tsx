'use client';

import { forwardRef, useMemo } from 'react';
import { Effect, EffectAttribute } from 'postprocessing';
import { Uniform } from 'three';

// Screen-space blur that is zero inside a vertical band in the middle of the
// screen and ramps up towards the sides. Tapes slide through the band as the
// shelf moves, so each one sharpens as it reaches the centre.
const fragmentShader = /* glsl */ `
uniform float bandHalfWidth; // px
uniform float ramp;          // px
uniform float maxRadius;     // px
uniform float rowCenterY;    // px from the bottom
uniform float rowHalfHeight; // px
uniform float fade;          // 0..1, how much the side tapes fade out

const int TAPS = 24;
const float GOLDEN = 2.39996323;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float dx = abs(uv.x - 0.5) * resolution.x;
  float dy = abs(uv.y * resolution.y - rowCenterY);
  // Only the shelf row is blurred; the player and header stay crisp.
  float inRow = 1.0 - smoothstep(rowHalfHeight, rowHalfHeight * 1.4, dy);
  float t = smoothstep(bandHalfWidth, bandHalfWidth + ramp, dx) * inRow;
  float radius = t * maxRadius;
  if (radius < 0.25) {
    outputColor = inputColor;
    return;
  }

  vec4 sum = inputColor;
  float total = 1.0;
  for (int i = 1; i < TAPS; i++) {
    float r = sqrt(float(i) / float(TAPS)) * radius;
    float a = float(i) * GOLDEN;
    vec2 offset = vec2(cos(a), sin(a)) * r * texelSize;
    float w = 1.0 - 0.5 * (r / radius);
    sum += texture2D(inputBuffer, uv + offset) * w;
    total += w;
  }
  // Fade toward the white page as well, so the centre tape holds the focus.
  outputColor = mix(sum / total, vec4(1.0), t * fade);
}
`;

class FocusBlurEffect extends Effect {
  constructor() {
    super('FocusBlurEffect', fragmentShader, {
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform>([
        ['bandHalfWidth', new Uniform(100)],
        ['ramp', new Uniform(200)],
        ['maxRadius', new Uniform(8)],
        ['rowCenterY', new Uniform(0)],
        ['rowHalfHeight', new Uniform(0)],
        ['fade', new Uniform(0)],
      ]),
    });
  }
}

type Props = {
  /** Half-width of the sharp band, in device pixels. */
  bandHalfWidth: number;
  /** Distance over which the blur ramps from 0 to max, in device pixels. */
  ramp: number;
  /** Blur radius at full strength, in device pixels. */
  maxRadius: number;
  /** Vertical centre of the blurred row, device pixels from the bottom. */
  rowCenterY: number;
  /** Half-height of the blurred row, in device pixels. */
  rowHalfHeight: number;
  /** How far the side tapes fade toward white (0 = not at all, 1 = gone). */
  fade: number;
};

export const FocusBlur = forwardRef<FocusBlurEffect, Props>(function FocusBlur(
  { bandHalfWidth, ramp, maxRadius, rowCenterY, rowHalfHeight, fade },
  ref,
) {
  const effect = useMemo(() => new FocusBlurEffect(), []);
  effect.uniforms.get('bandHalfWidth')!.value = bandHalfWidth;
  effect.uniforms.get('ramp')!.value = ramp;
  effect.uniforms.get('maxRadius')!.value = maxRadius;
  effect.uniforms.get('rowCenterY')!.value = rowCenterY;
  effect.uniforms.get('rowHalfHeight')!.value = rowHalfHeight;
  effect.uniforms.get('fade')!.value = fade;
  return <primitive ref={ref} object={effect} dispose={null} />;
});
