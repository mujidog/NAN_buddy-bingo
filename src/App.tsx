import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { BuddyGame } from './game/BuddyGame';
import { DesktopScreen } from './components/DesktopScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { PlayScreen } from './components/PlayScreen';
import { TitleScreen } from './components/TitleScreen';

const STAGE_W = 1440;
const STAGE_H = 1080;

/**
 * Fit the fixed 1440x1080 stage into whatever space it is given.
 * Measures the container rather than listening for `resize`: the window event
 * does not fire for every size change (devtools docking, embedded frames,
 * restoring a backgrounded tab), and a stale scale is what makes the stage
 * spill past the viewport and get clipped.
 */
function useStageScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setScale(Math.min(width / STAGE_W, height / STAGE_H));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    // ResizeObserver delivers on animation frames, which are throttled to a
    // standstill in a backgrounded or non-compositing tab. The window event is
    // a plain task, so it still lands there.
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);
  return [ref, scale] as const;
}

export default function App() {
  const game = useMemo(() => new BuddyGame(), []);
  const state = useSyncExternalStore(game.subscribe, game.getSnapshot);
  const [fitRef, scale] = useStageScale();

  useEffect(() => {
    game.mount();
    if (import.meta.env.DEV) (window as unknown as { game: BuddyGame }).game = game;
    return () => game.dispose();
  }, [game]);

  // the ending screen keeps the play stage behind it, but frozen at the raw dread value
  const d = state.screen === 'play' ? state.dreadShown : game.dread();
  const showPlay = state.screen === 'play';

  return (
    <div
      ref={fitRef}
      style={{
        width: '100%',
        height: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Sized to the scaled stage so the layout box matches what is painted —
          a transform alone leaves a 1440x1080 box that can overflow and clip. */}
      <div
        style={{
          width: STAGE_W * scale,
          height: STAGE_H * scale,
          position: 'relative',
          overflow: 'hidden',
          flex: 'none',
        }}
      >
      <div
        style={{
          width: STAGE_W,
          height: STAGE_H,
          position: 'relative',
          overflow: 'hidden',
          background: '#0a0a0a',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {state.screen === 'title' && <TitleScreen game={game} name={state.name} />}
        {showPlay && <PlayScreen state={state} game={game} d={d} />}
        {state.screen === 'loading' && <LoadingScreen state={state} />}
        {state.screen === 'blackout' && <div style={{ position: 'absolute', inset: 0, background: '#000' }} />}
        {state.screen === 'desktop' && <DesktopScreen state={state} game={game} />}
      </div>
      </div>
    </div>
  );
}
