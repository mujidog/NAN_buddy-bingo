/**
 * The only thing that outlives a session: which endings you have reached, and
 * whether sound is on. Wrapped because localStorage throws outright in private
 * mode on some browsers, and a dead save must never take the game down with it.
 */
import type { EndingKind } from './data';

const KEY = 'buddy-bingo/save';

export interface Save {
  endings: EndingKind[];
  sound: boolean;
}

const EMPTY: Save = { endings: [], sound: true };

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<Save>;
    return {
      endings: Array.isArray(parsed.endings) ? parsed.endings.filter(isEnding) : [],
      sound: parsed.sound !== false,
    };
  } catch {
    return { ...EMPTY };
  }
}

function isEnding(v: unknown): v is EndingKind {
  return v === 'death' || v === 'bad';
}

function write(save: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* storage unavailable — the run just will not be remembered */
  }
}

/** Returns the save as it now stands, so callers can render without re-reading. */
export function recordEnding(kind: EndingKind): Save {
  const save = loadSave();
  if (!save.endings.includes(kind)) {
    save.endings = [...save.endings, kind];
    write(save);
  }
  return save;
}

export function setSound(on: boolean): Save {
  const save = loadSave();
  save.sound = on;
  write(save);
  return save;
}

/** Every ending the game can reach, in the order the collection screen lists them. */
export const ALL_ENDINGS: { kind: EndingKind; title: string; hint: string }[] = [
  { kind: 'bad', title: '영원히 놀자', hint: '세 줄을 완성했다.' },
  { kind: 'death', title: '찾았다', hint: '도망치려는 칸을 눌렀다.' },
];
