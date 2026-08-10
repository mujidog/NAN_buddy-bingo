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
export type Sfx = 'correct' | 'wrong' | 'death' | 'notepad' | 'load';

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

/**
 * Same, for a cue. The loading jingle needs it for a second reason: `sfxTimes`
 * spaces its repeats by `duration`, which reads NaN until metadata lands, so a
 * cold first play fell back to a 900ms guess and the triple came out lopsided.
 */
export function prefetchSfx(name: Sfx) {
  el(`sfx_${name}`);
}

/** Fire and forget. Restarts if the cue is already sounding. */
export function sfx(name: Sfx) {
  if (!on) return;
  const a = el(`sfx_${name}`);
  a.volume = SFX_VOL;
  a.currentTime = 0;
  a.play().catch(() => {});
}

let repeatT: ReturnType<typeof setTimeout> | undefined;

/**
 * Play a cue back to back, `times` in all — the loading screen's jingle. Chained
 * off a timer rather than the `ended` event so a cue that fails to decode cannot
 * stall the chain, and so a second call cleanly replaces a run still in flight.
 */
export function sfxTimes(name: Sfx, times: number) {
  clearTimeout(repeatT);
  if (!on || times < 1) return;

  const a = el(`sfx_${name}`);
  let left = times;
  const go = () => {
    a.volume = SFX_VOL;
    a.currentTime = 0;
    a.play().catch(() => {});
    if (--left <= 0) return;
    // duration is only known once metadata lands; the fallback just has to be
    // long enough not to cut the clip off on the first play of a cold load
    const gap = Number.isFinite(a.duration) && a.duration > 0 ? a.duration * 1000 : 900;
    repeatT = setTimeout(go, gap);
  };
  go();
}

/** Cut a repeat short — the loading screen handing over to a round. */
export function stopRepeat() {
  clearTimeout(repeatT);
}

/**
 * Swap the looping track; `null` stops everything. Asking for the track that
 * is already playing is a no-op, so re-entering a round mid-song does not
 * restart it.
 */
export function bgm(next: Bgm | null) {
  if (next === current) {
    // A blocked autoplay leaves the right track loaded and `current` already
    // set, so a plain no-op here would mean the track never starts however many
    // times it is asked for. Retry instead: the first call that happens to sit
    // inside a user gesture is the one that gets through.
    if (next && track?.paused && on) track.play().catch(() => {});
    return;
  }
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

/**
 * Everything off. `bgm(null)` only takes the looping track down, and the
 * notepad cue runs 21 seconds — long enough to follow the player back to the
 * title screen and keep typing there. Leaving a screen means leaving its sound.
 */
export function silence() {
  clearTimeout(repeatT);
  bgm(null);
  cache.forEach((a) => {
    a.pause();
    a.currentTime = 0;
  });
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
