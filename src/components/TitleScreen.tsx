import { useState } from 'react';

import * as audio from '../game/audio';
import type { BuddyGame } from '../game/BuddyGame';
import { IMG } from '../game/data';
import { MONO_FONT, PIXEL_FONT, bevel } from '../ui';
import { SettingsMenu } from './SettingsMenu';

/**
 * Hard black outline on the pixel title. `paint-order` keeps the stroke behind
 * the fill so a 7px outline does not eat into the letterforms; the text-shadow
 * ring is the fallback for engines that ignore it on HTML text.
 */
const OUTLINE = (color: string) => ({
  fontFamily: PIXEL_FONT,
  fontSize: 76,
  color,
  WebkitTextStroke: '7px #000',
  paintOrder: 'stroke fill' as const,
  textShadow: '4px 4px 0 rgba(0,0,0,.45)',
  letterSpacing: 4,
});

/**
 * He introduces himself before you have agreed to anything, and says his own
 * name louder than the rest. The red is the only thing on this screen that is
 * not a children's-software colour.
 */
const LINES: { text: string; accent?: string }[] = [
  { text: 'hello,\nbuddy!' },
  { text: "I'm\nBUDDY!!", accent: 'BUDDY!!' },
  { text: "Let's play\nBingo!" },
];

/**
 * Drawn rather than stretched from `bubble_pixel.png`: that asset is 3.6:1 and
 * this bubble is nearly square, so scaling it to fit would smear the chunky
 * border it exists for. The stepped corners and the two-step tail are the same
 * shape by hand, at any size, with no resampling.
 */
function Bubble({ line }: { line: { text: string; accent?: string } }) {
  const [head, tail] = line.accent ? line.text.split(line.accent) : [line.text, ''];
  return (
    <div style={{ position: 'absolute', left: 898, top: 136, width: 500, height: 302 }}>
      <svg viewBox="-8 -8 556 336" width="100%" height="100%" style={{ display: 'block' }}>
        <path
          d="M16 0 H524 V16 H540 V199 H524 V215
             H230 V262 H196 V310 H140 V262 H110 V215
             H16 V199 H0 V16 H16 Z"
          fill="#fff"
          stroke="#000"
          strokeWidth="10"
          strokeLinejoin="miter"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 34,
          right: 30,
          top: 24,
          height: 148,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontFamily: MONO_FONT,
          fontWeight: 700,
          fontSize: 42,
          lineHeight: 1.25,
          color: '#1a1c1c',
          whiteSpace: 'pre-line',
        }}
      >
        <span>
          {head}
          {line.accent && <span style={{ color: '#8b0000', fontSize: 46 }}>{line.accent}</span>}
          {tail}
        </span>
      </div>
    </div>
  );
}

/**
 * The box art, then an intro he walks you through. Step 0 is the product shot —
 * mascot at rest, no bubble, silent, because a browser will not play audio
 * before the player has touched something anyway. The first click both starts
 * the music and starts him talking, so the autoplay rule lands on the beat the
 * screen was going to have regardless.
 *
 * START stays live the whole time. Skipping an intro is not a thing to punish.
 */
export function TitleScreen({ game }: { game: BuddyGame }) {
  const [step, setStep] = useState(0);
  const talking = step > 0;

  const advance = () => {
    if (step >= LINES.length) return;
    if (step === 0) audio.bgm('main'); // this click is the gesture that unlocks it
    setStep(step + 1);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, cursor: step < LINES.length ? 'pointer' : 'default' }} onClick={advance}>
      <img
        src="assets/bg_forest.png"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* sits in the sky band, above the horizon */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 62, display: 'flex', justifyContent: 'center', gap: 30 }}>
        <span style={OUTLINE('#eb0000')}>BUDDY</span>
        <span style={OUTLINE('#0a3ddc')}>BUNNY</span>
      </div>

      <img
        src={talking ? IMG.WAVE : IMG.IDLE}
        alt="Buddy"
        style={{ position: 'absolute', left: 410, top: 210, width: 620, height: 660, objectFit: 'contain' }}
      />

      {talking && <Bubble line={LINES[step - 1]} />}

      <div
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: 26,
          height: 100,
          boxSizing: 'border-box',
          background: '#c0c0c0',
          ...bevel('up', 6),
          padding: 10,
          display: 'flex',
          alignItems: 'stretch',
          gap: 14,
        }}
      >
        <div
          style={{
            flex: 1,
            background: '#000',
            ...bevel('down', 4),
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 26,
            overflow: 'hidden',
          }}
        >
          <span style={{ fontFamily: PIXEL_FONT, fontSize: 27, color: '#ffe000', whiteSpace: 'nowrap' }}>
            WELCOME, BUDDY! CLICK TO LEARN!
          </span>
        </div>

        <button
          className="bevel-up"
          onClick={(e) => {
            e.stopPropagation(); // starting the game is not also an intro click
            game.begin();
          }}
          style={{
            width: 250,
            background: '#c0c0c0',
            ...bevel('up', 6),
            fontFamily: PIXEL_FONT,
            fontSize: 30,
            color: '#1a1c1c',
            letterSpacing: 2,
            cursor: 'pointer',
          }}
        >
          START
        </button>
      </div>

      <div style={{ position: 'absolute', right: 28, top: 28 }} onClick={(e) => e.stopPropagation()}>
        {/* off the box art, but it is the only way into the ending collection */}
        <SettingsMenu game={game} canQuit={false} />
      </div>
    </div>
  );
}
