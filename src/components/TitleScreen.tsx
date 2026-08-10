import { useEffect, useState } from 'react';

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

/** Step 0 is the product shot; each line then holds long enough to read twice. */
const HOLD = [1400, 2600, 2600, 2600];

/**
 * The box art, then an intro that plays itself — it is patter, not dialogue, so
 * making the player click through it would turn a greeting into a chore. A
 * click still skips ahead for anyone who reads faster than the timer.
 *
 * Sound is the one thing the timer cannot drive: a browser refuses audio until
 * the player has touched something. So the music is *attempted* on mount, which
 * succeeds only if this is a return trip to the title, and every click retries
 * it. `bgm()` treats a loaded-but-silent track as still owing a play, so the
 * first attempt that lands inside a real gesture is the one that gets through.
 *
 * START stays live the whole time. Skipping an intro is not a thing to punish.
 */
export function TitleScreen({ game }: { game: BuddyGame }) {
  const [step, setStep] = useState(0);
  const talking = step > 0;
  const done = step >= LINES.length;

  useEffect(() => {
    audio.bgm('main');
  }, []);

  useEffect(() => {
    if (step >= LINES.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), HOLD[step]);
    return () => clearTimeout(t);
  }, [step]);

  const advance = () => {
    audio.bgm('main'); // a real gesture — the mount attempt may have been refused
    setStep((s) => Math.min(s + 1, LINES.length));
  };

  return (
    <div style={{ position: 'absolute', inset: 0, cursor: done ? 'default' : 'pointer' }} onClick={advance}>
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
