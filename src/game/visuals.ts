import type { CSSProperties } from 'react';
import { ANTONYM } from './data';
import type { Cell, GameState } from './BuddyGame';

const GLYPHS = ['#', '%', '&', '@', '▓', '░', '■', '?'];

/**
 * Stable per-character noise. Rolling Math.random() here re-rolled on every
 * render — and the dread easing re-renders at 120ms, the typewriter at 26ms —
 * so the corrupted glyphs strobed. Keyed on position and character only (not
 * the whole string) so a letter keeps its verdict as the typewriter grows the
 * prefix around it.
 */
const noise = (i: number, code: number) => {
  let h = Math.imul(i + 1, 2654435761) ^ Math.imul(code + 1, 40503);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
};

/** Above ~0.5 dread Buddy's speech starts corrupting character by character. */
export const glitchText = (text: string, d: number) => {
  const rate = d > 0.85 ? 0.16 : d > 0.7 ? 0.1 : d > 0.5 ? 0.05 : 0;
  if (!rate) return text;
  return text
    .split('')
    .map((ch, i) => {
      if (ch === ' ' || ch === '\n') return ch;
      const r = noise(i, ch.charCodeAt(0));
      if (r >= rate) return ch;
      return GLYPHS[Math.floor((r / rate) * GLYPHS.length) % GLYPHS.length];
    })
    .join('');
};

const letterSpacing = (d: number) => (d > 0.8 ? '1.5px' : d > 0.55 ? '1px' : d > 0.3 ? '0.5px' : 'normal');

export const stageStyle = (shake: boolean): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  animation: shake ? 'shake .3s steps(6) 1' : 'none',
});

/**
 * The round-3 ending, staged as the program failing rather than a monster
 * reveal: 1 the HUD drops out, 2 the title bar admits it is not responding,
 * 3 the whole window greys and freezes, 4 the tube collapses to a line.
 */
export const crashStageStyle = (c: number): CSSProperties => {
  if (c < 3) return {};
  const dying = c >= 4;
  return {
    filter: `grayscale(${c >= 3 ? 0.85 : 0}) brightness(${dying ? 1.6 : 0.86}) contrast(${dying ? 1.4 : 1.05})`,
    transform: dying ? 'scaleY(0.004) scaleX(1.04)' : 'none',
    transformOrigin: 'center center',
    transition: dying
      ? 'transform .45s cubic-bezier(.7,0,.9,.2), filter .45s ease'
      : 'filter 1.1s ease',
  };
};

/** The frosted "this app stopped responding" wash Windows drops over a dead window. */
export const crashVeilStyle = (c: number): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 20,
  background: 'rgba(190,190,190,.35)',
  opacity: c >= 3 ? 1 : 0,
  transition: 'opacity 1.2s ease',
});

export const dayBgStyle = (d: number): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  filter: `saturate(${(1 - d * 0.65).toFixed(2)}) contrast(${(1 + d * 0.3).toFixed(2)}) brightness(${(1 - d * 0.45).toFixed(2)})`,
});

export const nightBgStyle = (d: number): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  opacity: Math.min(1, Math.max(0, (d - 0.3) / 0.45)),
  filter: `brightness(${(1 - Math.max(0, d - 0.6) * 0.55).toFixed(2)})`,
});

export const dreadStyle = (d: number): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  background: 'radial-gradient(circle at 50% 40%, rgba(140,0,0,.25), rgba(90,0,0,.85))',
  opacity: d * 0.5,
  pointerEvents: 'none',
  mixBlendMode: 'multiply',
});

export const vignetteStyle = (d: number): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,.9) 100%)',
  opacity: 0.12 + d * 0.62,
});

export const scanStyle = (d: number): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  backgroundImage: 'repeating-linear-gradient(rgba(0,0,0,.55) 0 1px, rgba(0,0,0,0) 1px 4px)',
  opacity: 0.1 + d * 0.3,
  animation: d > 0.5 ? 'flick 3.2s steps(1) infinite' : 'none',
});

export const headerStyle = (d: number): CSSProperties => ({
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  boxSizing: 'border-box',
  height: 56,
  background: d > 0.55 ? 'linear-gradient(#2a0d0d,#140505)' : 'linear-gradient(#f4f3f3,#dadada)',
  borderBottom: `4px solid ${d > 0.55 ? '#5a0000' : '#808080'}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 22px',
  filter: d > 0.75 ? 'blur(0.4px)' : 'none',
});

export const headerTitleStyle = (d: number): CSSProperties => ({
  fontFamily: "'Press Start 2P'",
  fontSize: 20,
  color: d > 0.55 ? '#eb0000' : '#bc0100',
  letterSpacing: d > 0.4 ? '1.5px' : 'normal',
});

export const headerMetaStyle = (d: number): CSSProperties => ({
  fontFamily: "'Press Start 2P'",
  fontSize: 16,
  color: d > 0.55 ? '#8a3b3b' : '#3b4b35',
});

export const homeStyle = (d: number): CSSProperties => ({
  fontFamily: "'Press Start 2P'",
  fontSize: 13,
  color: d > 0.4 ? '#e3e2e2' : '#3b4b35',
  background: d > 0.4 ? '#3a2020' : '#e8e8e8',
  borderTop: '3px solid #fff',
  borderLeft: '3px solid #fff',
  borderRight: '3px solid #808080',
  borderBottom: '3px solid #808080',
  padding: '8px 14px',
  cursor: 'pointer',
});

/** Tucked under the speech bubble's tail so it never covers the board. */
export const skipStyle = (d: number): CSSProperties => ({
  position: 'absolute',
  left: 1180,
  top: 352,
  fontFamily: "'Press Start 2P'",
  fontSize: 13,
  color: d > 0.4 ? '#e3e2e2' : '#3b4b35',
  background: d > 0.4 ? '#3a2020' : '#e8e8e8',
  borderTop: '3px solid #fff',
  borderLeft: '3px solid #fff',
  borderRight: '3px solid #808080',
  borderBottom: '3px solid #808080',
  padding: '8px 12px',
  cursor: 'pointer',
  zIndex: 5,
});

/**
 * The sprites have different aspect ratios (379x500 idle, 420x436 glitch,
 * 578x432 horror). In a 330-wide box `contain` scales the wide ones by width
 * instead of height, so Buddy visibly shrank whenever he glitched. The box is
 * wide enough that every sprite is height-limited, which pins them all to the
 * same 390px and kills the pop. Centre (315) and baseline (540) are unchanged.
 */
export const buddyStyle = (d: number): CSSProperties => ({
  position: 'absolute',
  left: 35,
  top: 150,
  width: 560,
  height: 390,
  objectFit: 'contain',
  objectPosition: 'bottom',
  transformOrigin: 'bottom center',
  transform: `scale(${(1 + d * 0.14).toFixed(3)})`,
  filter: `saturate(${(1 - d * 0.35).toFixed(2)}) contrast(${(1 + d * 0.25).toFixed(2)})`,
});

export const bubbleStyle = (d: number): CSSProperties => ({
  fontFamily: "'Do Hyeon'",
  fontSize: 36,
  color: '#1a1c1c',
  lineHeight: 1.35,
  // Korean defaults to breaking between syllables like CJK, which splits words
  // mid-eojeol ("숨바꼭질 / 을"). keep-all breaks at spaces; balance evens the
  // lines out so the last one is not a stub.
  wordBreak: 'keep-all',
  textWrap: 'balance',
  letterSpacing: letterSpacing(d),
  filter: d > 0.8 ? 'blur(0.6px)' : 'none',
  // no jitter animation: shaking the speech made round 3 unreadable
  // Deviates from the prototype, which collapses \n to a space: the round-2
  // riddles (letter especially) are written with deliberate line breaks.
  whiteSpace: 'pre-wrap',
});

export const winBarStyle = (d: number): CSSProperties => ({
  height: 48,
  background: d > 0.6 ? '#5a0000' : d > 0.3 ? '#2f4a12' : '#015300',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 14px',
});

/** Each heart is an empty sprite with a bottom-anchored clip of the full sprite over it. */
export const heartFills = (lives: number, decay: number) => {
  const hp = Math.max(0, lives - decay);
  return [0, 1, 2].map((i) => Math.max(0, Math.min(1, hp - i)));
};

const CELL_BASE: CSSProperties = {
  position: 'relative',
  height: 94,
  borderTop: '5px solid #808080',
  borderLeft: '5px solid #808080',
  borderRight: '5px solid #fff',
  borderBottom: '5px solid #fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

export interface CellView {
  label: string;
  stamped: boolean;
  style: CSSProperties;
  labelStyle: CSSProperties;
}

export const cellView = (c: Cell, s: GameState, d: number): CellView => {
  const idle = d > 0.6 ? '#8f8383' : d > 0.3 ? '#b4b0a6' : '#c0c0c0';
  const bg = c.dead
    ? '#3a0000'
    : c.wrong
      ? '#6e6363'
      : c.marked
        ? d > 0.6
          ? '#7a1414'
          : '#2f4a12'
        : idle;
  const locked = s.blocked || s.screen !== 'play';
  const inert = locked || c.marked || !!c.wrong || c.dead;

  return {
    label: c.dead ? 'DIE' : c.flipped ? (ANTONYM[c.word] ?? c.word) : c.word,
    // the prototype stamps the X over burnt tiles, not over correct ones
    stamped: !!c.wrong,
    style: {
      ...CELL_BASE,
      background: bg,
      cursor: inert ? 'default' : 'pointer',
      opacity: locked && !c.marked && !c.wrong && !c.dead ? 0.55 : 1,
      transition: 'opacity .35s ease',
    },
    labelStyle: {
      fontFamily: "'Courier Prime'",
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: letterSpacing(d),
      color: c.dead ? '#eb0000' : c.marked ? '#f1f0f0' : c.wrong ? '#4a4242' : '#1a1c1c',
      textDecoration: c.wrong ? 'line-through' : 'none',
    },
  };
};

// ---------- loading ----------

export const loadStyle = (s: GameState): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 44,
  background: s.loadBg,
  filter: s.loadKind === 'fail' ? 'contrast(1.15) saturate(.7)' : 'none',
  animation: s.loadKind === 'fail' ? 'jitter .28s steps(2) infinite' : 'none',
});

export const loadBarWrapStyle = (s: GameState): CSSProperties => ({
  width: 620,
  height: 34,
  background: '#0d0d0d',
  border: `6px solid ${s.loadKind === 'fail' ? '#5a0000' : '#f1f0f0'}`,
  padding: 4,
});

export const loadBarStyle = (s: GameState): CSSProperties => ({
  height: '100%',
  width: s.loadKind === 'fail' ? '38%' : '100%',
  background:
    s.loadKind === 'fail'
      ? 'repeating-linear-gradient(90deg,#eb0000 0 12px,#3a0000 12px 24px)'
      : 'repeating-linear-gradient(90deg,#02e600 0 12px,#015300 12px 24px)',
  transition: 'width 2.6s steps(12)',
});

export const loadLabelStyle = (s: GameState): CSSProperties => ({
  fontFamily: "'Press Start 2P'",
  fontSize: 16,
  letterSpacing: '2px',
  color: s.loadKind === 'fail' ? '#eb0000' : '#e3e2e2',
  animation: 'pulse 1s steps(2) infinite',
});

// ---------- ending ----------
// The speech bubble grows from its play-screen position until it swallows the frame.







