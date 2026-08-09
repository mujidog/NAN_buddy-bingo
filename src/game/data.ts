export type Round = 1 | 2 | 3;

/**
 * [english, korean, riddle asked instead of the generic question, line Buddy
 * says when this tile kills you]. The 4th slot only applies to round-3 FLEE
 * words; its glitch typography is authored by hand, so it is printed verbatim.
 */
export type WordTuple = readonly [string, string, string?, string?];

export const WORDS: Record<Round, readonly WordTuple[]> = {
  1: [
    ['family', '가족', '한 집에서 함께 사는 존재들이야!'],
    ['door', '문', '밖과 안을 분리해. 열기 전에 똑똑- 두드려 볼까?'],
    ['flower', '꽃', '예쁜 색과 향기로 피어나는 것들!'],
    ['tree', '나무', '그늘을 만들어 주는 고마운 존재. 뜨겁기만 한 태양을 피하게 해줘!'],
    ['wind', '바람', '보이지 않지만 느껴지는 흐름! 쉭쉭- 소리가 나는 것 같아!'],
    ['morning', '아침', '하루가 또 시작되는 시간이야! 저기 또 해가 밝아오네!'],
    ['night', '밤', '해가 숨고 어두워지는 시간이야!'],
    ['game', '게임', '우리가 하고 있는 것! 이기든 지든 정말 재미있지 않아?'],
    ['cake', '케이크', '특별한 날의 달콤한 음식! 촛불을 후~ 불어줘.'],
    ['milk', '우유', '하얗고 고소해! 먹으면 쑥쑥 자랄거야!'],
    ['movie', '영화', '네모 안에서 사람들이 움직여! 웃고 울고 너무 즐거워!'],
    ['song', '노래', '감미롭고 아름다운 소리! 듣기만 해도 기분이 좋아져.'],
    ['market', '시장', '무엇이든 팔리는 곳. 없는 게 없지!'],
    ['eat', '먹다', '맛있는 것을 냠냠 씹어 먹는 행동이야! 사과는 참 맛있는걸!'],
    ['sleep', '자다', '아주 오랫동안 눈을 감고 있는 거야! 아주 편안하고 행복해.'],
    ['open', '열다', '똑똑- 노크가 들리면 뭘 해야 될까?'],
    ['clean', '청소하다', '깨끗하게 만드는 행위야! 더러운 것을 치우면 행복해!'],
    ['teacher', '선생님', '널 가르쳐 주는 존경스러운 분이야! 널 굉장히 아껴줘!'],
    ['neighbor', '이웃', '아주 가깝고 근처에 있어! 만나면 반갑게 인사하자!'],
    ['birthday', '생일', '태어난 날을 축하하는 날! 만나서 반가워!'],
    ['party', '파티', '모두가 즐거워 하는 특별한 것! 맛있는 것이 가득해!'],
    ['dream', '꿈', '잠을 자면 펼쳐지는 세상이야! 거기선 뭐든 일어날 수 있어!'],
    ['funny', '재미있는', '너무 즐거워서 웃음이 멈추지 않는 상태야!'],
    ['safe', '안전한', '위험하고 무서운게 없는 상태!'],
    ['toy', '장난감', '가지고 놀면 즐거워! 아주 재밌는 것들이야!'],
  ],
  2: [
    ['shadow', '그림자', '빛이 있을 때 생기는 너의 영혼이지. 가끔 너보다 먼저 움직일 땐 모른 척하는 게 좋을 거야.'],
    ['whisper', '속삭임', '작게 들리는 널 부르는 소리. 대답해줘! 널 원하고 있어!'],
    ['mirror', '거울', '존재를 비춰주는 물건이야. 속에서 혼자 웃고 있는 또 다른 너에게 인사하자!'],
    ['breath', '숨', '후하후하- 크게 들이마쉬고 내쉬어봐! 응? 잘 안된다고?'],
    ['knock', '노크', '똑똑! 밖에서 들어오고 싶은건지, 안에서 나가고 싶은건지 참 헷갈려!'],
    ['doorbell', '초인종', '띵동! 정중한 것들을 위해 현관을 활짝 열어두는 것도 방법일거야.'],
    ['crack', '금이 간 틈', '까꿍! 작게 벌어진 틈새야. 안에서 느껴지는 너와 숨바꼭질을 하자!'],
    ['mark', '흔적', '네가 알아챘으면 해! 귀여운 자국들이 까맣고 달콤하게 썩어 들고 있어!'],
    ['letter', '편지', '친애하는 너에게…\n애정을 쑤셔 담아, 꿈틀거리는 글자를 보내.\n-네가 친애하는 BUDDY가!'],
    ['memory', '기억', '깜빡깜빡 점멸하는 뇌 속 추억 상자! 너에겐 안타깝게도, 진짜가 반절보다 많아.'],
    ['nightmare', '악몽', '이런, 달콤하고도 끔찍한 꿈을 꿨구나? 괜찮아, 꿈보다 현실은 더 감미로워!'],
    ['stare', '빤히 바라보다', '음… 시선이 느껴져! 너랑 놀고 싶은걸까? 꿈틀꿈틀- 응, 너랑 놀고 싶대!'],
    ['return', '돌아오다', '내게 다시 기어오는 것! 또, 언제나 반복될 것! 널 항상 환영해!'],
    ['hear', '듣다', '소리의 파동을 느끼는 것! 혹시 지금 어떤 파동이 느껴져?'],
    ['outside', '밖에', '안타깝게도, 안에서 벗어나게 된 것. 이건 아주아주 나빠. 원하지 마.'],
    ['inside', '안에', '밖과는 다르게 안전하지! 분명 영원히 있고 싶어져…'],
    ['nowhere', '아무 데도 없는', '외롭게 너만 혼자 있을 곳은 없어! 나는 어디든 갈 수 있으니까.'],
    ['nobody', '아무도 없음', '어떤 존재도 없는 것. 믿어도 돼, 진짜일걸?'],
    ['something', '무언가', '어떤 것. 너에게만 느껴지는 ‘어떤 것’ 말이야!'],
    ['empty', '빈', '속을 쏟아내고 난 후! 통통- 소리가 날 거 같지 않아?'],
    ['familiar', '익숙한', '친근하고 친숙해! 이런 존재를 만나면 거부하지 마.'],
    ['secret', '비밀', '꼭꼭 숨기는 것! 너와 나 사이를 더 특별하고 완전하게 해줘!'],
    ['scream', '비명', '삶을 갈망하는 처절한 노래! 너무 황홀하지 않아?'],
    ['apple', '사과', '달콤하고 맛있어! 부드러운 과육에선 붉은 즙이 흘러!'],
    ['friend', '친구', '이건 나, BUDDY! 불완전하고 상냥해! 곧 완전해질거야!'],
  ],
  3: [
    // the five that kill you once the board turns
    ['escape', '탈출하다', '🏃EXIT ← 탈출구 는 여ㄱㅣ.',
      'ㅋㅋㅋㅋㅋㅋㅋㅋ그걸 믿 었어 ¿ 넌 못 ㄴㅏㄱ ㅏ'],
    ['run', '달리다 / 도망치다', '숨이 멈 출 때까지 달려! 응? 다리가 없어? 그럼 기어서 가면 되지!',
      '자¡ 이번에는 내가 수 ㄹㅐ !̷̤͎͍̥̣̝̭͖̟̘̩̈́͌̔̚ͅͅ\n                                ㄹ'],
    ['hide', '숨다', '꼭꼭~ 숨어라 숨을~ 참아라',
      '숨소리가 들려… 여기야?\nㅊ ㅏ ㅇ ㅏ ㄷ ㅏ!̶̛͙͖̅̋͑̃\n    ㅈ      ㅆ'],
    ['leave', '떠나다', 'BUDDY를 떠나 지마! 그러면 너 무 속상해서, 배가 고 파.',
      '어딜가어디가어 디가ㅇㅓ디ㄱㅏ어̸̜͖̓ͅ어디가어어̸̜͖̓ͅ디가¿어딜어가가어 ㄷㅣ가어디가어디가어ㄷㅣ디가어어디가어̸̜͖̓ͅ'],
    ['forget', '잊다', '… 잊으려 했어? 괜찮아! 우리의 추억은 언제든 다시 새길 수 있어',
      '으 ¿ 추억 이 ㄴㅓ무 행복해 ?\nㅇ              더 쑤셔넣고 싶ㄷㅏ고?'],

    ['dark', '어두운', '어둠 속에선 오독오독- 찰박찰박- 황홀한 합주곡이 들려와!'],
    ['silence', '침묵', '쉿- 지금은 침묵해야 해! 아직 네가 성대를 찢을 차례가 아니야.'],
    ['rule', '규칙', '오래 놀고 싶다면, 규칙을 지켜야 돼! 그치만 난 규칙 어기는 애들도 좋아!'],
    ['number', '숫자', '남은 손가락 숫자를 세자! 하나, 둘, 셋… 앗 두 개가 돼버렸어!'],
    ['missing', '사라진', '그리운 사람들이 사라진다고? 음- 내 귀여운 장난감들을 말하는 거야?'],
    ['cold', '차가운', '응? 춥다고? 이상하다,내 안은 따뜻한데! 네 손끝도 벌써 녹고 있잖아.'],
    ['crying', '우는 소리', '우는 소리가 들려서 봤더니… 왜 우는 거야? 아까운 눈이 흘러내리고 있잖아.'],
    ['mistake', '실수', '그니까 그건 실수였어… 나도 더 오래 놀고 싶었다고!'],
    ['open', '열려 있는', '활짝 열어줘! 붉은 것들이 잘 보이게!'],
    ['below', '아래에', '아래를 봐! 피부 아래로 꿈틀거리며 헤험치는 것들이 느껴져?'],
    ['name', '이름', '이름표를 달자! 텅 빈 심장과 부족한 다리를 구분할 수 있게!'],
    ['unknown', '알 수 없는 것', '알 수 없는 걸 이해하려고 애쓰지 마, 그냥 모든 걸 토해낼 때까지 같 이 놀자!'],
    ['awake', '깨어 있는', '해가 숨었어! 어서 일어나, 숨 막히게 놀 시간이야!'],
    ['promise', '약속', '약속해줘! 썩어 문들어질때까지 오래오래 같이 놀기로!'],
    ['heart', '심장', '이건 사과야! 네 안에서 쿵쿵 뛰는 박동이 느껴져?'],
    ['unseen', '보이지 않는', '보이지 않지? 네 뒤! 너도 곧 볼 수 있을거야.'],
    ['nearby', '근처에', '너와 가까운 곳에 있어. 좀만 기다려줄래? 거의 다 왔어.'],
    ['smile', '미소', '기쁠 때 짓는 아름다운 표정! 입꼬리를 눈까지 찢어줘!'],
    ['eyes', '눈', '날 보고 있는 신체기관. 난 그것을 아주 좋아해. 톡톡 터지거든!'],
    ['house', '집', '포근하고 편안해! 가족끼리 처절한 노래를 부르고 위장 깊이 사랑하는 곳!'],
  ],
};

/** Round 3 turns these into unclickable DIE tiles once Buddy corrupts the board. */
export const FLEE = ['escape', 'run', 'hide', 'leave', 'forget'];

// Round 3 has no way out: it ends in 'bad' on three lines, or 'death' on a FLEE
// tile. The hidden OFF/QUIT/DELETE exits and the escape ending they led to were cut.

/**
 * Every so often a round-3 tile flips to its opposite for a moment. Purely
 * atmospheric — the word underneath never changes and the answer stays the
 * same. Words with no clean opposite are simply left out.
 */
export const ANTONYM: Record<string, string> = {
  open: 'close',
  below: 'above',
  dark: 'light',
  cold: 'warm',
  awake: 'asleep',
  unseen: 'seen',
  unknown: 'known',
  nearby: 'far',
  smile: 'frown',
  crying: 'laughing',
  missing: 'found',
  silence: 'noise',
  promise: 'lie',
  // the ones that answer back
  forget: 'remember',
  hide: 'seek',
  run: 'stay',
  leave: 'stay',
  escape: 'stay',
};

/**
 * Buddy's reaction to having his lines skipped, escalating with each offence.
 * The last entry repeats once you are past the end — he stops pretending.
 */
export const SKIP_SCOLD = [
  '…내 말, 끝까지 안 들을 거야?',
  '또 넘겼네. 나는 다 기억하는데.',
  '재미없어? 나는 재미있는데.',
  '그렇게 급해? 어차피 못 가면서.',
  '…그래. 말 안 할게. 듣고 싶어질 때까지.',
];

export const ASK = [
  '{W}은(는) 영어로 뭐라고 할까?',
  '{W}! {W}은(는) 영어로 어떻게 말할까?',
  '{W}을(를) 영어로 나타내는 단어를 골라줘!',
  '이건 분명 알고 있겠지? {W}을(를) 영어로 말하면 뭘까?',
  '문제! 문제! {W}의 영어 단어를 골라줘!',
  '좋아, 다음 문제야! "{W}"을(를) 영어로 찾아봐!',
  '흠… {W}(이)라면 분명 알고 있을 텐데? 영어로는 뭐였지?',
  '{W}은(는) 영어로… 뭐였더라? 네가 골라줘.',
];

export interface RoundVoice {
  ok: string[];
  no: string[];
  last: string;
  nudge: string[];
}

export const SAY: Record<Round, RoundVoice> = {
  1: {
    ok: ['정답! 역시 넌 똑똑해!', '딩동댕! 잘했어, 친구!', '맞았어! 계속 이렇게만 해줘!'],
    no: ['앗, 아니야. 괜찮아, 다시 해보자!', '삐-! 조금 아쉬웠어. 잘 봐봐!', '음, 틀렸네. 그럴 수도 있지 뭐!'],
    last: '한 번만 더 틀리면… 안 돼. 잘 해보자.',
    nudge: ['어때? 어렵진 않지?', '천천히 골라도 괜찮아!', '여기 있어. 기다릴게!'],
  },
  2: {
    ok: ['맞아. 잘 알고 있네. 어디서 배웠어?', '정답. 너 이 단어 전에도 본 적 있지?', '그래, 그거야. 기억력이 좋구나.'],
    no: ['틀렸어. 근데 왜 그걸 골랐을까?', '아니야. 지금 뭘 생각하고 있었어?', '그건 아니지. 손이 먼저 움직였네.'],
    last: '이제 하나 남았어. 나는 아직 안 급한데.',
    nudge: ['고민 중이야? 나도 기다리는 거 좋아해.', '…아직이야?', '그 단어, 아까부터 계속 보고 있잖아.'],
  },
  3: {
    ok: ['맞았습니다. 한 칸 더 가까워졌네요.', '정답이에요. 계속 채워줘요.', '맞아요. 이 줄이 완성되면 어떻게 될까요.'],
    no: ['틀렸어요. 하나 가져갈게요.', '아니에요. 괜찮아요, 아직 남았잖아요.', '그건 아니었어요. 조금만 더 있으면 되는데.'],
    last: '하나 남았네요. 이제 진짜 곧이에요.',
    nudge: ['왜 안 눌러요.', '손이 안 움직여요?', '여기요. 여기 보고 있잖아요.', '…', '괜찮아요. 어차피 시간은 내 편이니까.'],
  },
};

/** Spoken when a new bingo line completes, indexed by line count (1 or 2). */
export const LINE_PROGRESS: Record<Round, readonly [string, string]> = {
  1: ['한 줄 완성! 우와, 너 진짜 잘하는구나!', '두 줄째야! 이러다 다 맞추겠는데?'],
  2: ['한 줄 됐네. 너 이런 거 해본 적 있지?', '두 줄. …이제 딱 하나 남았어.'],
  3: ['한 줄. 좋아요, 계속해요.', '두 줄이에요. 이제 진짜 얼마 안 남았어요.'],
};

export const INTRO = (name: string) => [
  '안녕! 난 버디야. 만나서 반가워, ' + name + '!',
  '여긴 내 놀이터야. 오늘은 너랑 영어 단어 빙고를 할 거야.',
  '내가 뜻을 설명하면, 칸에서 맞는 영어 단어를 찾아 눌러줘.',
  '가로든 세로든 대각선이든, 세 줄을 만들면 다음으로 넘어갈 수 있어!',
  '하트는 세 개야. 틀린 칸은 지워지고 다시는 못 눌러.',
  '준비됐지? 그럼 시작하자!',
];

export type EndingKind = 'death' | 'bad';

export const ENDING_SCRIPTS: Record<EndingKind, (name: string) => string[]> = {
  death: (n) => [
    '찾았다.',
    '괜찮아. 하나도 안 아플 거야.',
    '무서웠지? 이제 안 무서워해도 돼.',
    '여기서는 아무도 널 혼내지 않아.',
    '잘 자, ' + n + '.',
  ],
  bad: (n) => [
    '빙고. 정말 잘했어.',
    '약속했잖아. 다 맞추면 계속 같이 있기로.',
    '이제 아침도, 학교도, 그런 거 없어도 돼.',
    '내가 매일 놀아줄게. 매일매일.',
    '영원히 놀자, ' + n + '.',
  ],
};

/** Notepad text typed out after the window "closes". */
export const DESK_SCRIPTS = {
  caught: (n: string) => ['…어? 창을 닫았네.', '', '괜찮아. 나는 창 안에 없었어.', '', n + ', 이 메모장 네가 열었어?', '나도 아니야.'],
};

export const IMG = {
  IDLE: 'assets/buddy_idle.png',
  TALK: 'assets/buddy_talk.png',
  HAPPY: 'assets/buddy_happy.png',
  SATISFIED: 'assets/buddy_satisfied.png',
  WORRY: 'assets/buddy_worry.png',
  GLITCH: 'assets/buddy_glitch.png',
  HORROR: 'assets/buddy_horror.png',
  WAVE: 'assets/buddy_wave2.png',
} as const;

/** qin = lockout after a question appears, ok/no = beat after an answer, nudge = idle prod. */
export const T: Record<Round, { qin: number; ok: number; no: number; nudge: number }> = {
  1: { qin: 400, ok: 1400, no: 1800, nudge: 20000 },
  2: { qin: 300, ok: 1200, no: 1600, nudge: 14000 },
  3: { qin: 200, ok: 1000, no: 1400, nudge: 7000 },
};

/** The 12 winning lines of a 5x5 board: 5 rows, 5 columns, 2 diagonals. */
export const LINES: readonly (readonly number[])[] = (() => {
  const l: number[][] = [];
  for (let r = 0; r < 5; r++) l.push([0, 1, 2, 3, 4].map((c) => r * 5 + c));
  for (let c = 0; c < 5; c++) l.push([0, 1, 2, 3, 4].map((r) => r * 5 + c));
  l.push([0, 6, 12, 18, 24]);
  l.push([4, 8, 12, 16, 20]);
  return l;
})();

export const pick = <T>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export const shuffle = <T>(a: readonly T[]): T[] => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
