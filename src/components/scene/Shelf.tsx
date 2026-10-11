'use client';

import { useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { Group } from 'three';
import { useDeck } from '@/lib/store';
import { Cassette } from './Cassette';
import { SLOTS_EACH_SIDE } from './layout';

/** The looping row of tapes. Only slots near the centre are mounted. */
export function Shelf({ spacing, labelFont }: { spacing: number; labelFont: string }) {
  const index = useDeck((s) => s.index);
  const ref = useRef<Group>(null);

  // Place the shelf once on mount. After that only useFrame moves it: passing
  // `position` as a prop would snap it on every index change and kill the slide.
  useLayoutEffect(() => {
    ref.current?.position.setX(-useDeck.getState().index * spacing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, dt) => {
    if (ref.current) easing.damp(ref.current.position, 'x', -useDeck.getState().index * spacing, 0.32, dt, 2600);
  });

  const slots: number[] = [];
  for (let k = index - SLOTS_EACH_SIDE; k <= index + SLOTS_EACH_SIDE; k++) slots.push(k);

  return (
    <group ref={ref}>
      {slots.map((slot) => (
        <Cassette key={slot} slot={slot} spacing={spacing} labelFont={labelFont} />
      ))}
    </group>
  );
}
