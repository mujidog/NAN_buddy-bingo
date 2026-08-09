import type { CSSProperties } from 'react';

/** Win95 bevel: `up` reads raised, `down` reads sunken (inset fields, pressed buttons). */
export const bevel = (dir: 'up' | 'down', w: number, dark = '#808080', light = '#fff'): CSSProperties => {
  const [tl, br] = dir === 'up' ? [light, dark] : [dark, light];
  return {
    borderTop: `${w}px solid ${tl}`,
    borderLeft: `${w}px solid ${tl}`,
    borderRight: `${w}px solid ${br}`,
    borderBottom: `${w}px solid ${br}`,
  };
};

export const PIXEL_FONT = "'Press Start 2P'";
export const MONO_FONT = "'Courier Prime'";
export const KO_FONT = "'Do Hyeon'";
