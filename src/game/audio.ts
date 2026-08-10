/**
 * Sound: one looping track plus one-shot cues.
 *
 * Plain `<audio>` elements. Web Audio would buy mixing and effects the game
 * never asks for, and its context arrives suspended until a user gesture —
 * the same autoplay rule these elements are already subject to, but with an
 * extra state to keep in sync.
 *
 * Nothing sounds before START. Browsers refuse playback until the player has
 * interacted, and `begin()` runs from that click, so the first track is also
 * the first sound the policy will allow. Every `play()` is caught anyway: a
 * blocked cue must never take a turn down with it.
 */
import { loadSave } from './save';

/** One track per round, plus the one that plays over the desktop. */
export type Bgm = 'main' | 'dark' | 'round3' | 'end';
export type Sfx = 'correct' | 'wrong' | 'death' | 'notepad';

const BGM_VOL = 0.4;
const SFX_VOL = 0.75;

let on = loadSave().sound;
let current: Bgm | null = null;
let track: HTMLAudioElement | null = null;
const cache = new Map<string, HTMLAudioElement>();

/** Built on demand — creating all seven up front would pull ~8MB before the title paints. */
function el(name: string) {
  let a = cache.get(name);
  if (!a) {
    // relative, like the image src attributes, so it resolves under the Pages base path
    a = new Audio(`audio/${name}.mp3`);
    a.preload = 'auto';
    cache.set(name, a);
  }
  return a;
}

/**
 * Start fetching a track before it is needed. `bgm_dark` is 3.2MB, and asking
 * for it at the moment it should start leaves the round silent while it loads.
 */
export function prefetch(name: Bgm) {
  el(`bgm_${name}`);
}

/** Fire and forget. Restarts if the cue is already sounding. */
export function sfx(name: Sfx) {
  if (!on) return;
  const a = el(`sfx_${name}`);
  a.volume = SFX_VOL;
  a.currentTime = 0;
  a.play().catch(() => {});
}

/**
 * Swap the looping track; `null` stops everything. Asking for the track that
 * is already playing is a no-op, so re-entering a round mid-song does not
 * restart it.
 */
export function bgm(next: Bgm | null) {
  if (next === current) return;
  current = next;

  if (track) {
    track.pause();
    track.currentTime = 0;
    track = null;
  }
  if (!next) return;

  const a = el(`bgm_${next}`);
  a.loop = true;
  a.volume = BGM_VOL;
  a.currentTime = 0;
  track = a;
  if (on) a.play().catch(() => {});
}

/** The options toggle. Muting holds the track's position so unmuting resumes it. */
export function setSoundOn(v: boolean) {
  on = v;
  if (!v) {
    cache.forEach((a) => a.pause());
    return;
  }
  track?.play().catch(() => {});
}
