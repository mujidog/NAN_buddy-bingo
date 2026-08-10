import type { BuddyGame } from '../game/BuddyGame';
import { IMG } from '../game/data';
import { PIXEL_FONT, bevel } from '../ui';
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
 * The box-art title: name on the sky, mascot standing on the grass, and a
 * marquee strip across the bottom with the button in it. No window chrome —
 * the fake `NewPlayer.exe` frame was left over from a name field that no
 * longer exists, and framing the whole screen in it made the title look like
 * a dialog rather than the front of a product.
 */
export function TitleScreen({ game }: { game: BuddyGame }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <img
        src="assets/bg_forest.png"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* sits in the sky band, above the horizon */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 62,
          display: 'flex',
          justifyContent: 'center',
          gap: 30,
        }}
      >
        <span style={OUTLINE('#eb0000')}>BUDDY</span>
        <span style={OUTLINE('#0a3ddc')}>BUNNY</span>
      </div>

      <img
        src={IMG.IDLE}
        alt="Buddy"
        style={{ position: 'absolute', left: 410, top: 210, width: 620, height: 660, objectFit: 'contain' }}
      />

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
          onClick={() => game.begin()}
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

      <div style={{ position: 'absolute', right: 28, top: 28 }}>
        {/* off the box art, but it is the only way into the ending collection */}
        <SettingsMenu game={game} canQuit={false} />
      </div>
    </div>
  );
}
