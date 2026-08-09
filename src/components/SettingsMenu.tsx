import { useState } from 'react';

import type { BuddyGame } from '../game/BuddyGame';
import { ALL_ENDINGS, loadSave, setSound } from '../game/save';
import { KO_FONT, PIXEL_FONT, bevel } from '../ui';

const PANEL = '#c0c0c0';

/**
 * The gear that replaced the HOME button. On the play screen it keeps HOME's
 * visibility rule, so Buddy taking your way out in round 2 still happens.
 */
export function SettingsMenu({
  game,
  d = 0,
  canQuit = true,
}: {
  game: BuddyGame;
  d?: number;
  canQuit?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [save, setSave] = useState(loadSave);
  const [tab, setTab] = useState<'menu' | 'endings'>('menu');

  const dark = d > 0.4;

  const reopen = () => {
    setSave(loadSave());
    setTab('menu');
    setOpen(true);
  };

  return (
    <>
      <button
        className="bevel-up"
        aria-label="설정"
        onClick={() => (open ? setOpen(false) : reopen())}
        style={{
          fontFamily: PIXEL_FONT,
          fontSize: 16,
          lineHeight: 1,
          color: dark ? '#e3e2e2' : '#3b4b35',
          background: dark ? '#3a2020' : '#e8e8e8',
          borderTop: '3px solid #fff',
          borderLeft: '3px solid #fff',
          borderRight: '3px solid #808080',
          borderBottom: '3px solid #808080',
          padding: '8px 12px',
          cursor: 'pointer',
        }}
      >
        ⚙
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(0,0,0,.45)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: 420,
              top: 240,
              width: 600,
              background: PANEL,
              ...bevel('up', 6),
              padding: 4,
            }}
          >
            <div
              style={{
                height: 50,
                background: '#00007b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
              }}
            >
              <span style={{ fontFamily: PIXEL_FONT, fontSize: 16, color: '#fff' }}>
                {tab === 'menu' ? 'OPTIONS' : 'ENDINGS'}
              </span>
              <button
                className="bevel-up"
                onClick={() => setOpen(false)}
                style={{
                  fontFamily: PIXEL_FONT,
                  fontSize: 14,
                  background: PANEL,
                  ...bevel('up', 3),
                  padding: '5px 11px',
                  cursor: 'pointer',
                }}
              >
                x
              </button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {tab === 'menu' ? (
                <>
                  <Row label="엔딩 수집" value={`${save.endings.length} / ${ALL_ENDINGS.length}`} onClick={() => setTab('endings')} />
                  <Row
                    label="소리"
                    value={save.sound ? 'ON' : 'OFF'}
                    onClick={() => setSave(setSound(!save.sound))}
                  />
                  {canQuit && (
                    <Row
                      label="게임 끄기"
                      value=""
                      onClick={() => {
                        setOpen(false);
                        game.onHome();
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  {ALL_ENDINGS.map((e) => {
                    const got = save.endings.includes(e.kind);
                    return (
                      <div
                        key={e.kind}
                        style={{
                          background: got ? '#fff' : '#a8a8a8',
                          ...bevel('down', 4),
                          padding: '14px 18px',
                        }}
                      >
                        <div style={{ fontFamily: KO_FONT, fontSize: 24, color: '#1a1c1c' }}>
                          {got ? e.title : '？？？'}
                        </div>
                        <div style={{ fontFamily: KO_FONT, fontSize: 18, color: '#5a5a5a', marginTop: 4 }}>
                          {got ? e.hint : '아직 보지 못했다.'}
                        </div>
                      </div>
                    );
                  })}
                  <Row label="← 돌아가기" value="" onClick={() => setTab('menu')} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button
      className="bevel-up"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: PANEL,
        ...bevel('up', 4),
        padding: '16px 18px',
        cursor: 'pointer',
        fontFamily: KO_FONT,
        fontSize: 24,
        color: '#1a1c1c',
      }}
    >
      <span>{label}</span>
      <span style={{ fontFamily: PIXEL_FONT, fontSize: 15 }}>{value}</span>
    </button>
  );
}
