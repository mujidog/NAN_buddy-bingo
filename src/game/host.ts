/**
 * What the player's machine actually looks like, so the fake desktop at the end
 * resembles the one behind the browser. A page cannot see the real desktop —
 * that is sandboxed — but it can match the platform, theme and locale, which is
 * what sells it. Everything degrades to the Windows look if detection fails.
 */
export type HostOS = 'windows' | 'mac';

export interface Host {
  os: HostOS;
  dark: boolean;
  /** localised labels for the desktop chrome */
  labels: {
    computer: string;
    trash: string;
    notepad: string;
    untitled: string;
    start: string;
    file: string[];
    savePrompt: (name: string) => string;
    save: string;
    dontSave: string;
  };
}

const KO = {
  computer: '내 컴퓨터',
  trash: '휴지통',
  notepad: '메모장',
  untitled: '제목 없음',
  start: '시작',
  file: ['파일', '편집', '서식', '보기', '도움말'],
  savePrompt: (n: string) => `${n}의 변경 내용을 저장하시겠습니까?`,
  save: '저장',
  dontSave: '저장 안 함',
};

const EN = {
  computer: 'This PC',
  trash: 'Recycle Bin',
  notepad: 'Notepad',
  untitled: 'Untitled',
  start: 'Start',
  file: ['File', 'Edit', 'Format', 'View', 'Help'],
  savePrompt: (n: string) => `Do you want to save changes to ${n}?`,
  save: 'Save',
  dontSave: "Don't Save",
};

const MAC_KO = { ...KO, computer: 'Macintosh HD', trash: '휴지통', notepad: '텍스트 편집기' };
const MAC_EN = { ...EN, computer: 'Macintosh HD', trash: 'Trash', notepad: 'TextEdit' };

export function detectHost(): Host {
  let os: HostOS = 'windows';
  let korean = true;
  let dark = false;

  try {
    // userAgentData is the non-deprecated route; platform/userAgent is the fallback
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const plat = (nav.userAgentData?.platform || navigator.platform || navigator.userAgent || '').toLowerCase();
    if (/mac|iphone|ipad|ipod/.test(plat)) os = 'mac';
    korean = (navigator.language || 'ko').toLowerCase().startsWith('ko');
    dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  } catch {
    /* every field already holds a sane default */
  }

  const labels = os === 'mac' ? (korean ? MAC_KO : MAC_EN) : korean ? KO : EN;
  return { os, dark, labels };
}

/** Wallpaper roughly matching each OS's stock look, dark variant included. */
export function wallpaper(host: Host): string {
  if (host.os === 'mac') {
    return host.dark
      ? 'linear-gradient(160deg,#11162b 0%,#242a4d 45%,#3a2f55 100%)'
      : 'linear-gradient(160deg,#3a6ea5 0%,#5b8fc7 45%,#9ec5e8 100%)';
  }
  return host.dark
    ? 'linear-gradient(150deg,#0b1a2b 0%,#123050 55%,#1d4a73 100%)'
    : 'linear-gradient(150deg,#1e5c8a 0%,#2b7fb8 55%,#57a8d8 100%)';
}
