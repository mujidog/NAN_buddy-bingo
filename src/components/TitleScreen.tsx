import type { BuddyGame } from '../game/BuddyGame';
import { IMG } from '../game/data';
import { KO_FONT, PIXEL_FONT, bevel } from '../ui';
import { SettingsMenu } from './SettingsMenu';

/** Win95 status-bar cell. */
function Cell({ children, flex }: { children: string; flex: number }) {
  return (
    <div
      style={{
        flex,
        ...bevel('down', 2),
        padding: '6px 14px',
        fontFamily: KO_FONT,
        fontSize: 19,
        color: '#3a3a3a',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Title, Buddy, START — one centred column. The screen read empty not because
 * things were missing but because the three elements sat in three different
 * corners with a field of green between them; filling that gap with extra
 * panels only made it a busier empty. Buddy is the product, so he takes the
 * middle at the size a mascot on a box cover would be, and the other two stack
 * on his axis. The status bar closes the bottom edge.
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
          // 6px bevel on each side, so the border box is 812 — offset to keep
          // the banner on the same 720 axis as Buddy and the button
          left: 314,
          top: 50,
          width: 800,
          height: 120,
          background: '#c0c0c0',
          ...bevel('up', 6),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: PIXEL_FONT, fontSize: 38, color: '#026e00', letterSpacing: 2 }}>
          BUDDY'S RETRO BINGO
        </span>
      </div>

      <img
        src={IMG.WAVE}
        alt="Buddy"
        style={{ position: 'absolute', left: 480, top: 210, width: 480, height: 565, objectFit: 'contain' }}
      />

      <button
        className="bevel-up"
        onClick={() => game.begin()}
        style={{
          position: 'absolute',
          left: 490,
          top: 810,
          width: 460,
          height: 110,
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

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 52,
          background: '#c0c0c0',
          ...bevel('up', 3),
          display: 'flex',
          alignItems: 'stretch',
          gap: 8,
          padding: 8,
        }}
      >
        <Cell flex={3}>BUDDY SOFT © 1998</Cell>
        <Cell flex={4}>어린이 영어 학습 프로그램</Cell>
        <Cell flex={1}>v1.0</Cell>
      </div>

      <div style={{ position: 'absolute', right: 28, top: 28 }}>
        {/* nothing to quit back to on the title screen */}
        <SettingsMenu game={game} canQuit={false} />
      </div>
    </div>
  );
}
