// Scene units are Figma pixels at the 1440×1024 desktop frame, with the
// origin at the centre of the screen and +Y up. The camera is fitted so at
// least DESIGN_H units are always visible vertically.

export const DESIGN_H = 1024;
/** Narrowest slice of the scene we'll allow on portrait screens. */
export const MIN_VISIBLE_W = 480;
export const FOV = 15;

export const ROW_Y = 31; // centre of the cassette row (Figma 421px, moved 60 down for the hero)
export const PLAYER_Y = -230; // centre of the Walkman (Figma 682px, moved 60 down for the hero)
export const SPACING_MAX = 342; // Figma: 290px slot + 52px gap

// Models come out of scripts/split-glb.mjs in metres.
export const CASSETTE_SCALE = 1100; // 0.14m → ~154 units wide
export const PLAYER_SCALE = 1350; // 0.256m → ~345 units wide

/** How many slots either side of the centre to keep mounted. */
export const SLOTS_EACH_SIDE = 4;

export function fitCamera(aspect: number) {
  const visibleH = Math.max(DESIGN_H, MIN_VISIBLE_W / aspect);
  const visibleW = visibleH * aspect;
  const distance = visibleH / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);
  const spacing = Math.min(SPACING_MAX, visibleW * 0.42);
  return { visibleH, visibleW, distance, spacing };
}

/** Depth the held / falling tape travels at, in front of the player's open lid. */
export const HELD_Z = 140;

/** Where an inserted tape ends up, relative to the player's centre (scene units). */
export const SLOT = { x: -2, y: -12, z: -60 };

/** Player body, relative to its centre (scene units). Used for drops and collisions. */
export const PLAYER_BOX = { halfW: 168, halfH: 98, offsetY: -3 };

/** Cassette half-extents at CASSETTE_SCALE (scene units). */
export const TAPE_HALF = { w: 77, h: 50, d: 8 };
