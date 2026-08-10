import {
  ANTONYM,
  ASK,
  BINGO,
  DESK_SCRIPTS,
  ENDING_SCRIPTS,
  FLEE,
  IMG,
  INTRO,
  LINE_PROGRESS,
  LINES,
  ROUND_RULES,
  SAY,
  SKIP_SCOLD,
  T,
  WORDS,
  pick,
  shuffle,
  type EndingKind,
  type Round,
} from './data';
import { recordEnding } from './save';

export type Screen = 'title' | 'play' | 'loading' | 'blackout' | 'desktop';

export interface Cell {
  word: string;
  ko: string;
  desc: string;
  marked: boolean;
  dead: boolean;
  wrong?: boolean;
  died?: boolean;
  /** what Buddy says when this tile is the one that kills you (round-3 FLEE words) */
  dieLine?: string;
  /** briefly showing its opposite instead of its word */
  flipped?: boolean;
}

export interface GameState {
  screen: Screen;
  name: string;
  round: Round;
  lives: number;
  cells: Cell[];
  target: number;
  bubble: string;
  buddy: string;
  blocked: boolean;
  correctCount: number;
  streak: number;
  ending: EndingKind | null;
  dieMode: boolean;
  typedLen: number;
  /** print `bubble` verbatim — it already carries hand-authored corruption */
  rawBubble?: boolean;
  shake: boolean;
  /** fractional life drained by round-3 idling; subtracted from `lives` for display */
  decay: number;
  revives: number;
  /** eased-in dread, 0..1 — drives every visual corruption */
  dreadShown: number;
  homeGone: boolean;
  loadBg: string;
  loadKind: 'clear' | 'fail';
  /** how long the loading screen will sit there, so the bar can fill for exactly that */
  loadMs: number;
  /** 0 none, then 1..4 as the program comes apart at the end of round 3 */
  crash: number;
  deskText: string;
  deskDialog: boolean;
  /** the jumpscare frame between the empty desktop and the notepad */
  scare: boolean;
}

export interface GameConfig {
  startRound: Round;
  lives: number;
}

const initialState = (config: GameConfig): GameState => ({
  screen: 'title',
  name: 'PLAYER_1',
  round: 1,
  lives: config.lives,
  cells: [],
  target: -1,
  bubble: '',
  buddy: IMG.WAVE,
  blocked: true,
  correctCount: 0,
  streak: 0,
  ending: null,
  dieMode: false,
  typedLen: 0,
  shake: false,
  decay: 0,
  revives: 0,
  dreadShown: 0,
  homeGone: false,
  loadBg: '#0aa300',
  loadKind: 'clear',
  loadMs: 2500,
  crash: 0,
  deskText: '',
  deskDialog: false,
  scare: false,
});

/** Round 2 gives you this long to answer before the heart it is eating runs out. */
const ANSWER_SECS = 40;
const DECAY_TICK_MS = 100;

/** Dread floor and range per round — round 3 starts already deep in the red. */
const DREAD_BASE: Record<Round, number> = { 1: 0, 2: 0.26, 3: 0.78 };
const DREAD_SPAN: Record<Round, number> = { 1: 0.22, 2: 0.34, 3: 0.22 };
const DREAD_START: Record<Round, number> = { 1: 0, 2: 0.3, 3: 0.66 };

/**
 * The whole game lives here, deliberately outside React: the flow is a chain of
 * timers that mutate state and then queue the next beat, which is far easier to
 * keep correct in one object than spread across effects. React subscribes via
 * useSyncExternalStore and only renders.
 */
export class BuddyGame {
  state: GameState;

  private config: GameConfig;
  private listeners = new Set<() => void>();
  private timers: ReturnType<typeof setTimeout>[] = [];
  private intervals: ReturnType<typeof setInterval>[] = [];
  private glitchT?: ReturnType<typeof setTimeout>;
  private flipT?: ReturnType<typeof setTimeout>;
  private nudgeT?: ReturnType<typeof setTimeout>;
  private deskIv?: ReturnType<typeof setInterval>;
  private mounted = false;
  private lastBubble = '';
  private bubbleToken = 0;
  private introDone = false;
  private scolded = false;
  private roundStart = 0;
  /** round-2 answer clock: unblocked ms spent on the current question */
  private answerMs = 0;
  private lastTick = 0;
  private skips = 0;
  private pendingAdvance?: () => void;

  constructor(config: Partial<GameConfig> = {}) {
    this.config = { startRound: 1, lives: 3, ...config };
    this.state = initialState(this.config);
  }

  // ---------- store ----------
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.state;

  private setState(
    patch: Partial<GameState> | ((s: GameState) => Partial<GameState>),
    done?: () => void,
  ) {
    const next = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = { ...this.state, ...next };
    // a new line restarts the typewriter, and is glitched again unless the
    // caller says otherwise in the same patch
    if (this.lastBubble !== this.state.bubble) {
      this.lastBubble = this.state.bubble;
      const raw = next.rawBubble ?? false;
      if (this.state.typedLen !== 0 || this.state.rawBubble !== raw) {
        this.state = { ...this.state, typedLen: 0, rawBubble: raw };
      }
    }
    this.listeners.forEach((l) => l());
    done?.();
  }

  // ---------- lifecycle ----------
  mount() {
    if (this.mounted) return;
    this.mounted = true;

    this.intervals.push(
      setInterval(() => {
        const s = this.state;
        if (s.crash > 0) return; // his last sentence is cut off mid-word
        if (s.typedLen < s.bubble.length) {
          this.setState({ typedLen: s.typedLen + (s.round === 3 ? 2 : 1) });
        }
      }, 26),
      setInterval(() => {
        const s = this.state;
        if (s.screen !== 'play') return;
        const target = this.dread();
        const next = s.dreadShown + (target - s.dreadShown) * 0.06;
        if (Math.abs(next - s.dreadShown) > 0.0008) this.setState({ dreadShown: next });
      }, 120),
      setInterval(() => {
        const s = this.state;
        if (s.screen !== 'play' || s.blocked) {
          this.lastTick = 0; // paused: do not bill the player for Buddy's talking
          return;
        }

        // Round 2: the answer clock. The current heart drains over ANSWER_SECS
        // of thinking time and is actually spent when it empties. Measured off
        // the clock rather than counted in ticks, because a backgrounded tab
        // throttles intervals to a crawl and the drain would stall with it.
        if (s.round === 2) {
          const now = Date.now();
          this.answerMs += this.lastTick ? now - this.lastTick : DECAY_TICK_MS;
          this.lastTick = now;
          const decay = this.answerMs / (ANSWER_SECS * 1000);
          if (decay >= 1) this.timeUp();
          else this.setState({ decay });
          return;
        }

        // Round 3 has no clock. Its hearts go to the flee tiles instead, and a
        // timer on top of those left too little room to actually play.
      }, DECAY_TICK_MS),
    );

    window.addEventListener('keydown', this.onKey);
  }

  dispose() {
    this.mounted = false;
    window.removeEventListener('keydown', this.onKey);
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    clearInterval(this.deskIv);
    this.clear();
  }

  /** Shift+1/2/3 jump rounds, Shift+4 kills you, Shift+0 fakes the window close. */
  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') return this.skip();
    if (!e.shiftKey) return;
    const jump = (r: Round) => this.setState({ screen: 'play' }, () => this.startRound(r));
    if (e.key === '!' || e.key === '1') jump(1);
    if (e.key === '@' || e.key === '2') jump(2);
    if (e.key === '#' || e.key === '3') jump(3);
    if (e.key === '$' || e.key === '4') this.end('death');
    if (e.key === ')' || e.key === '0') this.fakeClose();
  };

  private clear() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    clearTimeout(this.glitchT);
    clearTimeout(this.nudgeT);
    clearTimeout(this.flipT);
    // an abandoned speech chain leaves its advance callback behind; skip() would
    // then call a dead closure, hit the token guard, and do nothing at all
    this.pendingAdvance = undefined;
    // the notepad types on its own interval; leaving it running past a reset
    // kept filling deskText, which re-opened the window during the quiet beat
    clearInterval(this.deskIv);
  }

  /**
   * Round 3 only: once in a long while a single tile shows its opposite for a
   * blink. Rare on purpose — the old five-second reveal fired so often it read
   * as a broken screen rather than something noticing you.
   */
  private scheduleFlip() {
    clearTimeout(this.flipT);
    this.flipT = setTimeout(
      () => {
        const s = this.state;
        if (s.screen !== 'play' || s.round !== 3) return;
        const options = s.cells
          .map((c, i) => ({ c, i }))
          .filter((o) => ANTONYM[o.c.word] && !o.c.marked && !o.c.wrong && !o.c.died);
        if (options.length) {
          const { i } = pick(options);
          const set = (on: boolean) =>
            this.setState({
              cells: this.state.cells.map((c, k) => (k === i ? { ...c, flipped: on } : c)),
            });
          set(true);
          this.later(() => set(false), 420);
        }
        this.scheduleFlip();
      },
      20000 + Math.random() * 10000,
    );
  }

  private later(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms);
    this.timers.push(id);
    return id;
  }

  // ---------- dread ----------
  dread(): number {
    const s = this.state;
    const lost = (3 - s.lives) * 0.02;
    const secs = (Date.now() - this.roundStart) / 1000;
    // round 2 steps down one notch per 2 correct answers instead of drifting with time
    const p =
      s.round === 2
        ? Math.min(1, Math.floor(s.correctCount / 2) / 5)
        : Math.min(1, secs / 150) * 0.55 + Math.min(1, s.correctCount / 11) * 0.45;
    return Math.max(0, Math.min(1, DREAD_BASE[s.round] + DREAD_SPAN[s.round] * p + lost));
  }

  // ---------- flow ----------
  setName(name: string) {
    this.setState({ name });
  }

  begin() {
    // Fullscreen hides the browser chrome, so the fake desktop at the end is not
    // sitting inside an obvious tab. Must be called from the click that started
    // the game — browsers only grant it on a user gesture. Failure is fine.
    document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {});
    this.introDone = false;
    this.setState({ homeGone: false, screen: 'play' }, () => this.startRound(this.config.startRound));
  }

  startRound(round: Round) {
    this.clear();
    const bank = shuffle(WORDS[round]).slice(0, 25);
    const cells: Cell[] = bank.map((w) => ({
      word: w[0],
      ko: w[1],
      desc: w[2] ?? '',
      dieLine: w[3],
      marked: false,
      dead: false,
    }));

    this.roundStart = Date.now();

    this.setState(
      {
        screen: 'play',
        round,
        cells,
        shake: false,
        dreadShown: DREAD_START[round],
        lives: this.config.lives,
        decay: 0,
        correctCount: 0,
        streak: 0,
        dieMode: false,
        crash: 0,
        buddy: round === 3 ? IMG.HORROR : IMG.IDLE,
      },
      () => {
        this.scheduleGlitch();
        if (round === 3) this.scheduleFlip();

        if (round === 3) {
          this.setState({ blocked: true, buddy: IMG.HORROR });
          this.speak(
            ['넌 처음부터 여기 적혀 있었어.', ...(ROUND_RULES[3] ?? [])],
            () => this.ask(),
            IMG.HORROR,
          );
          return;
        }

        // round 2 changes the rules too, so it says what changed
        if (round === 2) {
          this.setState({ blocked: true, buddy: IMG.TALK });
          this.speak([...(ROUND_RULES[2] ?? [])], () => this.ask(), IMG.TALK);
          return;
        }

        if (round === 1 && !this.introDone) {
          this.introDone = true;
          this.speak([...INTRO], () => this.ask());
          return;
        }

        this.ask();
      },
    );
  }

  onHome() {
    const s = this.state;
    if (s.screen !== 'play') return;

    if (s.round === 1) {
      this.toTitle();
      return;
    }
    // round 2 lets you try to leave exactly once, then takes the button away
    if (s.round === 2 && !s.homeGone) {
      clearTimeout(this.nudgeT);
      this.setState({ homeGone: true, blocked: true, buddy: IMG.WORRY });
      this.interject('어디 가려고? 하던 건 마저 하고 가야지.', 2400, () =>
        this.setState({ blocked: false, buddy: IMG.IDLE }),
      );
    }
  }

  private toTitle() {
    this.clear();
    this.setState({
      screen: 'title',
      buddy: IMG.WAVE,
      bubble: '',
      typedLen: 0,
      revives: 0,
      decay: 0,
      dreadShown: 0,
      ending: null,
      homeGone: false,
      crash: 0,
      deskText: '',
      deskDialog: false,
    });
  }

  restart() {
    this.clear();
    this.setState({ screen: 'title', ending: null });
  }

  /** Show a line for a moment, then restore whatever Buddy was saying — unless a newer line landed. */
  private interject(line: string, ms: number, after?: () => void) {
    const keep = this.state.bubble;
    const token = ++this.bubbleToken;
    this.setState({ bubble: line });
    this.later(() => {
      if (this.bubbleToken !== token) return;
      if (this.state.screen === 'play') this.setState({ bubble: keep });
      after?.();
    }, ms);
  }

  /** `img` pins the sprite; without it he alternates talking frames. */
  private speak(lines: string[], done: () => void, img?: string) {
    const step = (i: number) => {
      if (this.state.screen !== 'play') return;
      if (i >= lines.length) {
        this.pendingAdvance = undefined;
        return done();
      }
      this.bubbleToken++;
      const token = this.bubbleToken;
      this.setState({ blocked: true, buddy: img ?? (i % 2 ? IMG.TALK : IMG.HAPPY), bubble: lines[i] });
      // exposed so skip() can pull the next line in early; the token check makes
      // the original timer a no-op once it has already fired
      const go = () => {
        if (this.bubbleToken !== token) return;
        this.pendingAdvance = undefined;
        step(i + 1);
      };
      this.pendingAdvance = go;
      this.later(go, 1700 + lines[i].length * 65);
    };
    step(0);
  }

  /**
   * Cut the current line short. Mid-chain it pulls the next line in; on a
   * standalone line it just finishes the typewriter. Buddy notices either way,
   * but only answers back outside a scripted chain — interrupting one would
   * bump the token and strand the rest of the speech.
   */
  skip() {
    const s = this.state;
    if (s.screen !== 'play') return;

    const advance = this.pendingAdvance;
    if (advance) {
      this.skips++;
      advance();
      return;
    }

    if (s.typedLen < s.bubble.length) {
      this.setState({ typedLen: s.bubble.length });
      this.skips++;
      if (this.skips % 3 === 0) {
        const scold = SKIP_SCOLD[Math.min(this.skips / 3 - 1, SKIP_SCOLD.length - 1)];
        this.interject(scold, 2200);
      }
    }
  }

  private revive() {
    this.clear();
    this.setState({
      blocked: true,
      buddy: IMG.SATISFIED,
      revives: this.state.revives + 1,
      bubble: '아, 벌써 끝났어? 나는 아직 더 놀고 싶은데.\n…두 개만 채워줄게. 이번이 마지막이야.',
    });
    this.later(() => {
      this.setState({ lives: 2, decay: 0, blocked: false, buddy: IMG.IDLE });
      this.scheduleGlitch();
      this.ask();
    }, 3200);
  }

  private scheduleGlitch() {
    clearTimeout(this.glitchT);
    const d = this.dread();
    if (d < 0.12) {
      this.glitchT = setTimeout(() => this.scheduleGlitch(), 4000);
      return;
    }
    const gap = Math.max(1600, 16000 - d * 14000) * (0.7 + Math.random() * 0.6);
    this.glitchT = setTimeout(() => {
      if (this.state.screen === 'play') this.flash(IMG.GLITCH, d > 0.6 ? 200 : 70);
      this.scheduleGlitch();
    }, gap);
  }


  private shakeStage() {
    this.setState({ shake: false });
    this.later(() => this.setState({ shake: true }), 20);
    this.later(() => this.setState({ shake: false }), 400);
  }

  private flash(img: string, ms: number) {
    if (this.state.screen !== 'play') return;
    const back = this.state.round === 3 ? IMG.HORROR : IMG.IDLE;
    this.setState({ buddy: img });
    this.later(() => this.setState((s) => ({ buddy: s.buddy === img ? back : s.buddy })), ms);
  }

  private ask() {
    this.bubbleToken++;
    const { cells, round } = this.state;
    const open = cells
      .map((c, i) => ({ c, i }))
      .filter((o) => !o.c.marked && !o.c.dead && !o.c.wrong);
    if (!open.length) return this.roundFail();

    const t = pick(open);
    // every round-2 question restarts the answer clock
    if (round === 2) {
      this.answerMs = 0;
      this.lastTick = 0;
      if (this.state.decay !== 0) this.setState({ decay: 0 });
    }
    // rounds that ship their own riddles use them; round 3 has none, so it falls
    // back to the generic "what's X in English?" template
    const line = t.c.desc ? t.c.desc : pick(ASK).split('{W}').join(t.c.ko);
    this.setState({ target: t.i, bubble: line, blocked: true, buddy: IMG.TALK });
    this.later(
      () => this.setState({ blocked: false, buddy: round === 3 ? IMG.HORROR : IMG.IDLE }),
      T[round].qin,
    );
    this.armNudge();
  }

  private armNudge() {
    clearTimeout(this.nudgeT);
    const r = this.state.round;
    this.nudgeT = setTimeout(() => {
      if (this.state.screen !== 'play' || this.state.blocked) return;
      this.interject(pick(SAY[r].nudge), 3000);
      this.armNudge();
    }, T[r].nudge);
  }

  onCell(i: number) {
    const s = this.state;
    if (s.screen !== 'play') return;

    if (s.blocked) {
      if (s.round === 1 && !this.scolded) {
        this.scolded = true;
        this.interject('잠깐! 내 말 끝나고 눌러야지.', 1600);
      }
      return;
    }

    const c = s.cells[i];
    if (!c || c.marked || c.wrong) return;
    // a flee tile takes a heart and burns itself out; the round ends only when
    // the hearts do, so one wrong grab is not instantly fatal
    if (!c.dead && FLEE.includes(c.word) && s.round === 3) return this.fleeMark(i);
    if (c.dead) return; // already spent

    clearTimeout(this.nudgeT);
    if (i === s.target) this.correct(i);
    else this.wrong(i);
  }


  private correct(i: number) {
    const s = this.state;
    const cells = s.cells.slice();
    cells[i] = { ...cells[i], marked: true };
    const streak = s.streak + 1;
    const count = s.correctCount + 1;
    const buddy = s.round === 3 ? IMG.SATISFIED : streak >= 3 ? IMG.SATISFIED : IMG.HAPPY;

    this.setState({
      cells,
      streak,
      correctCount: count,
      blocked: true,
      buddy,
      bubble: pick(SAY[s.round].ok),
    });

    const before = this.countLines(s.cells);
    const lines = this.countLines(cells);

    const next = () => {
      if (lines >= 3) this.roundClear();
      else {
        this.setState({ buddy: s.round === 3 ? IMG.HORROR : IMG.IDLE });
        this.ask();
      }
    };

    // Announce each line that just closed. Indexing by the new total meant a
    // move that closed two at once skipped "한 줄 완성", and one that jumped
    // straight to three said nothing at all — the tile at a crossing does that.
    const announce = [...LINE_PROGRESS[s.round].slice(before, Math.min(lines, 2))];
    // the third line is the win — say so instead of cutting straight to loading
    if (lines >= 3 && before < 3) announce.push(BINGO[s.round]);
    if (announce.length) this.speak(announce, next, buddy);
    else this.later(next, T[s.round].ok);
  }

  /**
   * A flee tile was pressed. It costs a heart and burns itself out — the round
   * only ends when the hearts do. Turning the whole board to DIE up front and
   * killing on the first touch left nothing to play.
   */
  private fleeMark(i: number) {
    clearTimeout(this.nudgeT);
    const s = this.state;
    const cell = s.cells[i];
    const lives = s.lives - 1;
    const cells = s.cells.slice();
    cells[i] = { ...cells[i], dead: true };

    this.shakeStage();
    this.setState({
      cells,
      lives,
      streak: 0,
      blocked: true,
      buddy: IMG.GLITCH,
      bubble: cell.dieLine ?? '어디가.',
      rawBubble: !!cell.dieLine,
    });
    if (cell.dieLine) this.setState({ typedLen: cell.dieLine.length });

    this.later(() => {
      if (lives <= 0) return this.end('death');
      if (this.livesLines(cells) < 3) return this.roundFail();
      this.setState({ buddy: IMG.HORROR, rawBubble: false });
      this.ask();
    }, 3200);
  }

  /** The round-2 answer clock ran out: costs a life, but burns no tile. */
  private timeUp() {
    clearTimeout(this.nudgeT);
    this.answerMs = 0;
    this.lastTick = 0;
    this.setState({ decay: 0 });
    this.wrong();
  }

  private wrong(i?: number) {
    const s = this.state;
    const lives = s.lives - 1;
    const buddy = s.round === 1 ? IMG.WORRY : IMG.GLITCH;

    let cells = s.cells;
    // round 3 keeps its tiles clickable; earlier rounds burn the tile you got wrong
    if (i !== undefined && s.round !== 3) {
      cells = cells.slice();
      cells[i] = { ...cells[i], wrong: true };
    }

    this.shakeStage();
    this.setState((st) => ({
      cells,
      lives,
      decay: Math.min(st.decay, Math.max(0, lives - 1)),
      streak: 0,
      blocked: true,
      buddy,
      bubble: lives === 1 ? SAY[s.round].last : pick(SAY[s.round].no),
    }));
    if (s.round === 2) this.later(() => this.setState({ buddy: IMG.WORRY }), 100);

    this.later(() => {
      if (lives <= 0) return this.roundFail();
      if (this.livesLines(cells) < 3) return this.roundFail();
      this.setState({ buddy: s.round === 3 ? IMG.HORROR : IMG.IDLE });
      this.ask();
    }, T[s.round].no);
  }


  private countLines(cells: Cell[]) {
    return LINES.filter((l) => l.every((i) => cells[i].marked)).length;
  }

  /** Lines that are still winnable — a burnt or dead tile kills the line for good. */
  private livesLines(cells: Cell[]) {
    return LINES.filter((l) => l.every((i) => !cells[i].wrong && !cells[i].dead)).length;
  }


  private roundClear() {
    const s = this.state;
    if (s.round === 1) {
      this.loading('합격이야! 넌 자격이 충분해!', IMG.WAVE, '#0aa300', 5000, () => this.startRound(2));
    } else if (s.round === 2) {
      this.loading(
        '세 줄 다 채웠네. 단어를 전부 기억하고 있구나?\n다음은… 조금 다를 거야.',
        IMG.SATISFIED,
        '#5c1a0a',
        5500,
        () => this.startRound(3),
      );
    } else {
      // the hidden exits were cut, so there is no way out of round 3 any more
      this.end('bad');
    }
  }

  private roundFail() {
    const s = this.state;
    this.clear();

    if (s.round === 1) {
      this.setState({ blocked: true, buddy: IMG.WORRY, bubble: '…이 정도도 못 하는구나.' });
      this.later(
        () =>
          this.setState({
            buddy: IMG.GLITCH,
            bubble: '가. 여긴 아무나 데려오는 데가 아니야.\n…운 좋은 줄 알아.',
          }),
        1400,
      );
      this.later(() => this.toTitle(), 4200);
      return;
    }

    if (s.round === 2) {
      if (s.revives < 1) return this.revive();
      this.setState({
        blocked: true,
        buddy: IMG.WORRY,
        bubble: '…이번엔 진짜 끝났네. 그래도 괜찮아.\n못 채운 건 내가 채울게.',
      });
      this.later(
        () =>
          this.loading(
            '실패해도 상관없어. 어차피 데려갈 거였으니까.',
            IMG.HORROR,
            '#2a0606',
            5500,
            () => this.startRound(3),
            'fail',
          ),
        2600,
      );
      return;
    }

    this.end('death');
  }

  private loading(
    text: string,
    img: string,
    bg: string,
    ms: number,
    then: () => void,
    kind: 'clear' | 'fail' = 'clear',
  ) {
    this.clear();
    this.setState({ screen: 'loading', bubble: text, buddy: img, loadBg: bg, loadKind: kind, loadMs: ms });
    // then() is startRound, which switches the screen itself. Flipping to 'play'
    // here first painted one frame of the round that just ended — the board and
    // dread of round 2 flashing before round 3 replaced them.
    this.later(then, ms);
  }

  /**
   * The ending is spoken in the ordinary speech bubble, on the ordinary board.
   * Nothing announces itself — the program simply stops working halfway through
   * his last sentence. A monster filling the screen is expected; the toy you
   * were playing with crashing is not.
   */
  private end(kind: EndingKind) {
    this.clear();
    recordEnding(kind);
    const lines = ENDING_SCRIPTS[kind]();
    this.setState({ ending: kind, blocked: true, bubble: '', crash: 0, buddy: IMG.HORROR });
    this.later(() => this.endLine(lines, 0), 700);
  }

  private endLine(lines: string[], i: number) {
    if (this.state.screen !== 'play') return;
    const line = lines[i];

    // the last line never finishes typing
    if (i === lines.length - 1) {
      this.setState({ bubble: line });
      this.later(() => this.crashSequence(), 200 + Math.min(line.length, 9) * 90);
      return;
    }

    this.setState({ bubble: line });
    this.later(() => this.endLine(lines, i + 1), 1500 + line.length * 70);
  }

  /** Hearts go, then the tiles, then the title bar admits it. Then the tube dies. */
  private crashSequence() {
    this.setState({ crash: 1 });
    this.later(() => this.setState({ crash: 2 }), 1500);
    this.later(() => this.setState({ crash: 3, shake: true }), 3100);
    this.later(() => this.setState({ shake: false }), 3500);
    this.later(() => this.setState({ crash: 4 }), 4700);
    this.later(() => this.fakeClose(), 5600);
  }

  /** Pretends the game window closed, then reveals a desktop that was never safe. */
  private fakeClose() {
    this.clear();
    // leaving fullscreen right as the window "closes" reads as the app quitting
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    this.setState({ screen: 'blackout', deskText: '', deskDialog: false, scare: false });
    this.later(() => {
      // Beat 1: an ordinary desktop, and nothing happens. Long enough that the
      // player stops bracing and starts wondering whether the game really quit.
      this.setState({ screen: 'desktop' });
      this.later(() => {
        // Beat 2: he is suddenly filling the screen.
        this.setState({ scare: true, shake: true });
        this.later(() => this.setState({ shake: false }), 400);
        this.later(() => {
          // Beat 3: gone — and the notepad is already typing itself.
          this.setState({ scare: false });
          this.deskType(DESK_SCRIPTS.caught().join('\n'), () =>
            this.later(() => this.setState({ deskDialog: true }), 900),
          );
        }, 900);
      }, 2600);
    }, 1600);
  }

  deskAnswer(yes: boolean) {
    const line = yes ? '저장했어. 이제 지울 수 없어.' : '안 지워져. 이미 저장돼 있었거든.';

    this.setState({ deskDialog: false });
    const from = this.state.deskText.length;
    const tail = '\n\n내일 또 하자.';
    this.deskType(this.state.deskText + '\n\n' + line + tail, () => this.later(() => this.toTitle(), 4000), from);
  }

  private deskType(full: string, done: () => void, from = 0) {
    clearInterval(this.deskIv);
    let i = from;
    this.deskIv = setInterval(() => {
      i++;
      this.setState({ deskText: full.slice(0, i) });
      if (i >= full.length) {
        clearInterval(this.deskIv);
        done();
      }
    }, 55);
  }
}
