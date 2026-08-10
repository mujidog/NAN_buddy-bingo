import type { BuddyGame } from '../game/BuddyGame';
import { IMG } from '../game/data';
import { PIXEL_FONT, bevel } from '../ui';
import { SettingsMenu } from './SettingsMenu';

/**
 * Title, Buddy, START. The fake `NewPlayer.exe` window around the button was
 * only ever framing the name field; with the field gone it was a window titled
 * after something that no longer happens. The gear stays — it is the only way
 * to the ending collection — but sits in the corner rather than in chrome.
 */
export function TitleScreen({ game }: { game: BuddyGame }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <img
        src="assets/bg_forest.png"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      <div
        style={{
          position: 'absolute',
          left: 370,
          top: 44,
          width: 700,
          height: 110,
          background: '#c0c0c0',
          ...bevel('up', 6),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: PIXEL_FONT, fontSize: 34, color: '#026e00', letterSpacing: 2 }}>
          BUDDY'S RETRO BINGO
        </span>
      </div>

      <img
        src={IMG.WAVE}
        alt="Buddy"
        style={{ position: 'absolute', left: 120, top: 330, width: 340, height: 400, objectFit: 'contain' }}
      />

      <button
        className="bevel-up"
        onClick={() => game.begin()}
        style={{
          position: 'absolute',
          left: 700,
          top: 560,
          width: 440,
          height: 104,
          background: '#c0c0c0',
          ...bevel('up', 7),
          fontFamily: PIXEL_FONT,
          fontSize: 32,
          color: '#1a1c1c',
          letterSpacing: 2,
          cursor: 'pointer',
        }}
      >
        START
      </button>

      <div style={{ position: 'absolute', right: 28, top: 28 }}>
        {/* nothing to quit back to on the title screen */}
        <SettingsMenu game={game} canQuit={false} />
      </div>
    </div>
  );
}
