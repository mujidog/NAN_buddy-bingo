import type { BuddyGame, GameState } from '../game/BuddyGame';
import { detectHost, wallpaper } from '../game/host';
import { KO_FONT, MONO_FONT, PIXEL_FONT, bevel } from '../ui';

const DARK = '#6b6b6b';

/**
 * Drawn rather than blocked in. Three flat rectangles labelled 내 컴퓨터 /
 * 휴지통 / BUDDY.exe read as unfinished art, which is the one thing this screen
 * cannot afford — the whole beat depends on the player believing, for a couple
 * of seconds, that the game really quit and this is their own machine.
 */
const PIX = { shapeRendering: 'crispEdges' as const, width: 60, height: 54 };

const MONITOR = (
  <svg viewBox="0 0 60 54" {...PIX}>
    <rect x="3" y="3" width="54" height="36" fill="#c8c8c8" stroke="#000" strokeWidth="3" />
    <rect x="8" y="8" width="44" height="26" fill="#1b6ea8" />
    <rect x="8" y="8" width="44" height="8" fill="#3b93d0" opacity=".55" />
    <rect x="24" y="42" width="12" height="5" fill="#a8a8a8" stroke="#000" strokeWidth="3" />
    <rect x="14" y="47" width="32" height="6" fill="#c8c8c8" stroke="#000" strokeWidth="3" />
  </svg>
);

const TRASH = (
  <svg viewBox="0 0 60 54" {...PIX}>
    <rect x="18" y="6" width="24" height="5" fill="#b8b8b8" stroke="#000" strokeWidth="3" />
    <path d="M14 13 h32 l-4 38 h-24 z" fill="#b8b8b8" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
    <path d="M24 20 v26 M30 20 v26 M36 20 v26" stroke="#6f6f6f" strokeWidth="3" />
  </svg>
);

function DesktopIcon({
  icon,
  label,
  pixel,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  pixel?: boolean;
  onClick?: () => void;
}) {
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
      <div style={{ width: 60, height: 54, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {icon}
      </div>
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

// read once: the player is not switching OS mid-jumpscare
const HOST = detectHost();

export function DesktopScreen({ state, game }: { state: GameState; game: BuddyGame }) {
  const L = HOST.labels;
  // The desktop sits empty until the scare; the notepad turning up afterwards is
  // what reads as "he opened it", instead of a window typing to nobody.
  const notepadOpen = state.deskText !== '' || state.deskDialog;
  // Everything after the scare happens on a desktop that did not go back to
  // normal. Before it, the wallpaper has to be boringly ordinary or the beat
  // gives itself away.
  const after = notepadOpen;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: after ? 'radial-gradient(ellipse at 50% 38%, #2b0707 0%, #120303 60%, #050101 100%)' : wallpaper(HOST),
        transition: 'background 2.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* he is still there, just under the brightness floor */}
      {after && (
        <img
          src="assets/buddy_horror.png"
          alt=""
          style={{
            position: 'absolute',
            left: '50%',
            top: '46%',
            transform: 'translate(-50%,-50%) scale(1.25)',
            width: 1100,
            opacity: 0.12,
            filter: 'grayscale(.4) contrast(1.3)',
            pointerEvents: 'none',
            animation: 'breathe 7s ease-in-out infinite',
          }}
        />
      )}

      <div style={{ position: 'absolute', left: 34, top: 34, display: 'flex', flexDirection: 'column', gap: 34 }}>
        <DesktopIcon icon={MONITOR} label={L.computer} />
        <DesktopIcon icon={TRASH} label={L.trash} />
        <DesktopIcon
          icon={<img src="assets/buddy_idle.png" alt="" style={{ width: 54, height: 54, objectFit: 'contain' }} />}
          label="BUDDY.exe"
          pixel
          onClick={() => game.restart()}
        />
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
          <span style={{ fontFamily: KO_FONT, fontSize: 24, color: '#fff' }}>{`${L.untitled} - ${L.notepad}`}</span>
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
          {L.file.map((m) => (
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
            <span style={{ fontFamily: KO_FONT, fontSize: 24, color: '#fff' }}>{L.notepad}</span>
          </div>
          <div style={{ padding: '30px 28px', display: 'flex', flexDirection: 'column', gap: 26 }}>
            <span style={{ fontFamily: KO_FONT, fontSize: 30, color: '#1a1c1c', lineHeight: 1.45 }}>
              {L.savePrompt(`${L.untitled}.txt`)}
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
            {L.start}
          </span>
          {notepadOpen && (
            <span style={{ fontFamily: KO_FONT, fontSize: 20, color: '#1a1c1c', background: '#b4b0a6', ...bevel('down', 4, DARK), padding: '8px 20px' }}>
              {`${L.untitled} - ${L.notepad}`}
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
