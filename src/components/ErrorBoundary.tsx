import { Component, type ErrorInfo, type ReactNode } from 'react';

import { PIXEL_FONT } from '../ui';

/**
 * Without this, one throw anywhere in the tree unmounts everything and the
 * player is left staring at a white page with no way back. The game is a chain
 * of timers driving a lot of derived styling, so a bad state is plausible.
 * Stay in character: the program crashing is already part of the story.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('BUDDY.EXE crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0a0a0a',
          color: '#eb0000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          fontFamily: PIXEL_FONT,
          textAlign: 'center',
          padding: 24,
        }}
      >
        <div style={{ fontSize: 20, lineHeight: 1.8 }}>BUDDY.EXE</div>
        <div style={{ fontSize: 13, color: '#8a3b3b', lineHeight: 2 }}>
          치명적 오류가 발생했습니다.
          <br />
          다시 시작해 주세요.
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: 13,
            color: '#1a1c1c',
            background: '#c0c0c0',
            borderTop: '3px solid #fff',
            borderLeft: '3px solid #fff',
            borderRight: '3px solid #808080',
            borderBottom: '3px solid #808080',
            padding: '12px 20px',
            cursor: 'pointer',
          }}
        >
          RESTART
        </button>
      </div>
    );
  }
}
