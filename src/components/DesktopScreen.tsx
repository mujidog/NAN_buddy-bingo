import type { BuddyGame, GameState } from '../game/BuddyGame';
import { KO_FONT, MONO_FONT, PIXEL_FONT, bevel } from '../ui';

const DARK = '#6b6b6b';

function DesktopIcon({ label, color, pixel, onClick }: { label: string; color: string; pixel?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        width: 120,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          width: 56,
          height: 48,
          background: color,
          ...bevel('up', 4, pixel ? '#5a0000' : DARK, pixel ? '#ff8a8a' : '#fff'),
        }}
      />
      <span
        style={{
          fontFamily: pixel ? PIXEL_FONT : KO_FONT,
          fontSize: pixel ? 12 : 22,
          color: '#fff',
          textAlign: 'center',
          lineHeight: pixel ? 1.6 : 1.4,
          textShadow: '2px 2px 0 #000',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function TitleButton({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: PIXEL_FONT,
        fontSize: 13,
        color: '#000',
        background: '#c0c0c0',
        ...bevel('up', 3, DARK),
        padding: '5px 10px',
      }}
    >
      {label}
    </span>
  );
}

export function DesktopScreen({ state, game }: { state: GameState; game: BuddyGame }) {
  // The desktop sits empty until the scare; the notepad turning up afterwards is
  // what reads as "he opened it", instead of a window typing to nobody.
  const notepadOpen = state.deskText !== '' || state.deskDialog;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0d3f3f', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 34, top: 34, display: 'flex', flexDirection: 'column', gap: 34 }}>
        <DesktopIcon label="내 컴퓨터" color="#c0c0c0" />
        <DesktopIcon label="휴지통" color="#9aa39a" />
        <DesktopIcon label="BUDDY.exe" color="#eb0000" pixel onClick={() => game.restart()} />
      </div>

      {state.scare && (
        <img
          src="assets/buddy_horror.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 50,
            animation: 'scare .09s steps(2) 3',
          }}
        />
      )}

      <div
        style={{
          display: notepadOpen ? 'block' : 'none',
          position: 'absolute',
          left: 330,
          top: 150,
          width: 900,
          background: '#c0c0c0',
          ...bevel('up', 5, DARK),
          padding: 4,
        }}
      >
        <div
          style={{
            height: 46,
            background: '#00007b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
          }}
        >
          <span style={{ fontFamily: KO_FONT, fontSize: 24, color: '#fff' }}>제목 없음 - 메모장</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <TitleButton label="_" />
            <TitleButton label="□" />
            <TitleButton label="x" />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 26,
            padding: '10px 14px',
            fontFamily: MONO_FONT,
            fontWeight: 700,
            fontSize: 20,
            color: '#1a1c1c',
          }}
        >
          {['파일', '편집', '서식', '보기', '도움말'].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>

        <div style={{ background: '#fff', ...bevel('down', 4, DARK), minHeight: 420, padding: '22px 26px' }}>
          <span
            style={{
              fontFamily: MONO_FONT,
              fontWeight: 700,
              fontSize: 26,
              color: '#1a1c1c',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}
          >
            {state.deskText}
          </span>
          <span
            style={{
              fontFamily: MONO_FONT,
              fontWeight: 700,
              fontSize: 26,
              color: '#1a1c1c',
              animation: 'blink 1s steps(1) infinite',
            }}
          >
            _
          </span>
        </div>
      </div>

      {state.deskDialog && (
        <div
          style={{
            position: 'absolute',
            left: 450,
            top: 430,
            width: 640,
            background: '#c0c0c0',
            ...bevel('up', 5, DARK),
            padding: 4,
          }}
        >
          <div style={{ height: 44, background: '#00007b', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
            <span style={{ fontFamily: KO_FONT, fontSize: 24, color: '#fff' }}>메모장</span>
          </div>
          <div style={{ padding: '30px 28px', display: 'flex', flexDirection: 'column', gap: 26 }}>
            <span style={{ fontFamily: KO_FONT, fontSize: 30, color: '#1a1c1c', lineHeight: 1.45 }}>
              변경 내용을 저장하시겠습니까?
            </span>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              {[
                { label: '예', yes: true },
                { label: '아니오', yes: false },
              ].map((b) => (
                <button
                  key={b.label}
                  className="bevel-up"
                  onClick={() => game.deskAnswer(b.yes)}
                  style={{
                    fontFamily: KO_FONT,
                    fontSize: 24,
                    color: '#1a1c1c',
                    background: '#c0c0c0',
                    ...bevel('up', 4, DARK),
                    padding: '14px 40px',
                    cursor: 'pointer',
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          height: 56,
          background: '#c0c0c0',
          borderTop: '4px solid #fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: KO_FONT, fontSize: 22, color: '#1a1c1c', background: '#c0c0c0', ...bevel('up', 4, DARK), padding: '7px 20px' }}>
            시작
          </span>
          {notepadOpen && (
            <span style={{ fontFamily: KO_FONT, fontSize: 20, color: '#1a1c1c', background: '#b4b0a6', ...bevel('down', 4, DARK), padding: '8px 20px' }}>
              제목 없음 - 메모장
            </span>
          )}
        </div>
        <span
          style={{
            fontFamily: MONO_FONT,
            fontWeight: 700,
            fontSize: 18,
            color: '#1a1c1c',
            background: '#b4b0a6',
            ...bevel('down', 4, DARK),
            padding: '9px 18px',
          }}
        >
          {new Date().toTimeString().slice(0, 5)}
        </span>
      </div>
    </div>
  );
}
