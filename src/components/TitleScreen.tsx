import type { BuddyGame } from '../game/BuddyGame';
import { IMG } from '../game/data';
import { MONO_FONT, PIXEL_FONT, bevel } from '../ui';
import { SettingsMenu } from './SettingsMenu';

export function TitleScreen({ game, name }: { game: BuddyGame; name: string }) {
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

      <div
        style={{
          position: 'absolute',
          left: 530,
          top: 390,
          width: 790,
          background: '#c0c0c0',
          ...bevel('up', 6),
          padding: '0 0 28px 0',
        }}
      >
        <div
          style={{
            height: 52,
            background: '#00007b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            margin: 4,
          }}
        >
          <span style={{ fontFamily: PIXEL_FONT, fontSize: 18, color: '#fff' }}>NewPlayer.exe</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* no quit item here — there is nothing to quit back to yet */}
            <SettingsMenu game={game} canQuit={false} />
            <span
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: 16,
              color: '#000',
              background: '#c0c0c0',
              ...bevel('up', 3),
              padding: '6px 12px',
            }}
          >
              x
            </span>
          </div>
        </div>

        <div style={{ padding: '26px 34px 0 34px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* No name field: a player-chosen handle turns Buddy's lines comic.
              The tag is assigned, and shown so the name in his dialogue lands. */}
          <span style={{ fontFamily: PIXEL_FONT, fontSize: 20, color: '#1a1c1c' }}>Player:</span>
          <div
            style={{
              height: 60,
              background: '#fff',
              ...bevel('down', 5),
              fontFamily: MONO_FONT,
              fontWeight: 700,
              fontSize: 28,
              padding: '0 16px',
              color: '#1a1c1c',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {name}
          </div>
          <button
            className="bevel-up"
            onClick={() => game.begin()}
            style={{
              height: 78,
              background: '#c0c0c0',
              ...bevel('up', 6),
              fontFamily: PIXEL_FONT,
              fontSize: 26,
              color: '#1a1c1c',
              cursor: 'pointer',
            }}
          >
            START
          </button>
        </div>
      </div>
    </div>
  );
}
