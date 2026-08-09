import type { GameState } from '../game/BuddyGame';
import * as V from '../game/visuals';
import { KO_FONT } from '../ui';

export function LoadingScreen({ state }: { state: GameState }) {
  return (
    <div style={V.loadStyle(state)}>
      <img src={state.buddy} alt="Buddy" style={{ width: 360, height: 420, objectFit: 'contain' }} />
      <span
        style={{
          fontFamily: KO_FONT,
          fontSize: 44,
          color: '#fff',
          textAlign: 'center',
          maxWidth: 1000,
          lineHeight: 1.4,
          wordBreak: 'keep-all',
          textWrap: 'balance',
        }}
      >
        {state.bubble.slice(0, state.typedLen)}
      </span>
      <div style={V.loadBarWrapStyle(state)}>
        <div style={V.loadBarStyle(state)} />
      </div>
      <span style={V.loadLabelStyle(state)}>
        {state.loadKind === 'fail' ? 'RECOVERING PLAYER...' : 'LOADING...'}
      </span>
    </div>
  );
}
