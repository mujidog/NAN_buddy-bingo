// Word-bank invariants. These are data mistakes, not logic bugs: a duplicate or
// a short bank fails silently at runtime (a board with blank tiles, an exit that
// reads like a real answer), so assert them here instead.
import { describe, expect, it } from 'vitest';

import { FLEE, WORDS } from './data';

const ROUNDS = [1, 2, 3] as const;

describe('word banks', () => {
  // exactly 25, not "at least": a 26th word would silently sit out every game
  it.each(ROUNDS)('round %i is exactly one board', (r) => {
    expect(WORDS[r].length).toBe(25);
  });

  it('no english answer is reused across rounds', () => {
    const all = ROUNDS.flatMap((r) => WORDS[r].map((w) => w[0]));
    const dupes = all.filter((w, i) => all.indexOf(w) !== i);
    expect(dupes).toEqual([]);
  });

  it.each(ROUNDS)('round %i has no duplicate answers', (r) => {
    const seen = WORDS[r].map((w) => w[0]);
    expect(new Set(seen).size).toBe(seen.length);
  });

  it.each(ROUNDS)('round %i asks something for every tile', (r) => {
    const mute = WORDS[r].filter((w) => !w[2]?.trim()).map((w) => w[0]);
    expect(mute).toEqual([]);
  });

  it('every flee word is on the round-3 board and carries a death line', () => {
    const round3 = new Map(WORDS[3].map((w) => [w[0], w]));
    for (const word of FLEE) {
      const entry = round3.get(word);
      expect(entry, `${word} missing from round 3`).toBeDefined();
      expect(entry?.[3]?.trim(), `${word} has no death line`).toBeTruthy();
    }
  });

  it('round 3 still has ordinary tiles between the traps', () => {
    const safe = WORDS[3].filter((w) => !FLEE.includes(w[0]));
    expect(safe.length).toBeGreaterThan(FLEE.length);
  });
});
