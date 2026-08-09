import type { BuddyGame, GameState } from '../game/BuddyGame';
import * as V from '../game/visuals';
import { PIXEL_FONT, bevel } from '../ui';
import { SettingsMenu } from './SettingsMenu';

function Hearts({ lives, decay }: { lives: number; decay: number }) {
  return (
    <div style={{ position: 'absolute', left: 28, top: 78, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
      {V.heartFills(lives, decay).map((fill, i) => (
        <div key={i} style={{ position: 'relative', width: 44, height: 40 }}>
          <img src="assets/heart_empty.png" alt="" style={{ position: 'absolute', left: 0, bottom: 0, width: 44, height: 40 }} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: 44,
              height: fill * 40,
              overflow: 'hidden',
              transition: 'height .12s linear',
            }}
          >
            <img src="assets/heart_full.png" alt="" style={{ position: 'absolute', left: 0, bottom: 0, width: 44, height: 40 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SpeechBubble({ text, d, more }: { text: string; d: number; more: boolean }) {
  return (
    <div style={{ position: 'absolute', left: 520, top: 150, width: 860, height: 240 }}>
      <img src="assets/bubble_pixel.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 24,
          right: 56,
          height: 134,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <span style={V.bubbleStyle(d)}>{text}</span>
      </div>
      {more && <span style={V.nextArrowStyle(d)}>▼</span>}
    </div>
  );
}

function BingoBoard({ state, game, d }: { state: GameState; game: BuddyGame; d: number }) {
  const dead = state.crash > 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        top: 420,
        width: 1300,
        background: '#c0c0c0',
        ...bevel('up', 6),
        padding: 6,
      }}
    >
      <div style={V.winBarStyle(d)}>
        <span style={{ fontFamily: PIXEL_FONT, fontSize: 18, color: '#fff' }}>
          {state.round === 3 ? 'JUDGMENT.EXE — ERROR 666' : 'BINGO.EXE'}
        </span>
        <span style={{ fontFamily: PIXEL_FONT, fontSize: 14, color: '#fff' }}>_ □ x</span>
      </div>

      <div
        style={{
          marginTop: 6,
          padding: 8,
          background: '#9a9a9a',
          display: 'grid',
          gridTemplateColumns: 'repeat(5,1fr)',
          gap: 6,
        }}
      >
        {state.cells.map((c, i) => {
          const view = V.cellView(c, state, d);
          return (
            <div key={i} onClick={() => !dead && game.onCell(i)} style={view.style}>
              <span style={view.labelStyle}>{dead ? '' : view.label}</span>
              {view.stamped && (
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: PIXEL_FONT,
                    fontSize: 52,
                    color: '#bc0100',
                    opacity: 0.85,
                    animation: 'stamp .22s steps(4) both',
                  }}
                >
                  ✕
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PlayScreen({ state, game, d }: { state: GameState; game: BuddyGame; d: number }) {
  const crash = state.crash;
  // he is mid-sentence: the board is inert anyway, so a stage click is free to skip
  const skippable = !crash && state.blocked && state.bubble !== '' && !state.rawBubble;
  const showHome = !crash && state.screen === 'play' && (state.round === 1 || (state.round === 2 && !state.homeGone));

  return (
    <div
      style={{ ...V.stageStyle(state.shake), ...V.crashStageStyle(crash) }}
      onClick={() => skippable && game.skip()}
    >
      <img src="assets/bg_forest.png" alt="" style={V.dayBgStyle(d)} />
      <img src="assets/bg_forest_night.png" alt="" style={V.nightBgStyle(d)} />
      <div style={V.dreadStyle(d)} />
      <div style={V.vignetteStyle(d)} />
      <div style={V.scanStyle(d)} />

      <div style={V.headerStyle(d)}>
        <span style={V.headerTitleStyle(d)}>
          {crash >= 2 ? 'BUDDY.EXE — 응답 없음' : "♥ BUDDY'S PLAYGROUND"}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {crash < 2 && (
            <span style={V.headerMetaStyle(d)}>
              {'ROUND ' + state.round + '  /  ' + (state.name || 'PLAYER_1').toUpperCase()}
            </span>
          )}
          {showHome && <SettingsMenu game={game} d={d} />}
        </div>
      </div>

      {/* the HUD is the first thing to go */}
      {!crash && <Hearts lives={state.lives} decay={state.decay} />}

      <img src={state.buddy} alt="Buddy" style={V.buddyStyle(d)} />

      <SpeechBubble
        text={
          state.rawBubble
            ? state.bubble
            : V.glitchText(state.bubble.slice(0, state.typedLen), d)
        }
        d={d}
        more={skippable}
      />

      <BingoBoard state={state} game={game} d={d} />

      {crash >= 3 && <div style={V.crashVeilStyle(crash)} />}
    </div>
  );
}

