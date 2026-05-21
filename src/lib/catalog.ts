export type TeaId =
  | "peppermint"
  | "rooibos"
  | "chamomile"
  | "hibiscus"
  | "lemongrass";

export type TasteDimension =
  | "clarity"
  | "warmth"
  | "dream"
  | "earth"
  | "solitude"
  | "motion"
  | "bright"
  | "archive";

export type TasteVector = Record<TasteDimension, number>;

export type ChoiceSide = {
  key: "left" | "right";
  imageSheet: "left" | "right";
  imageCell: number;
  label: string;
  phrase: string;
  detail: string;
  weights: Partial<TasteVector>;
  tags: string[];
};

export type ChoicePair = {
  id: string;
  axis: string;
  question: string;
  left: ChoiceSide;
  right: ChoiceSide;
};

export type TeaProfile = {
  id: TeaId;
  nameKo: string;
  nameEn: string;
  tone: string;
  tastingNote: string;
  ritual: string;
  reportColor: string;
  dimensions: Partial<TasteVector>;
  tags: string[];
};

export type BookRecord = {
  id: string;
  no: number;
  title: string;
  author: string;
  publisher: string;
  year: number;
  isbn: string;
  subject: string;
  teaAffinity: TeaId[];
  tags: string[];
};

export type PoemRecord = {
  id: string;
  title: string;
  teaAffinity: TeaId[];
  tags: string[];
  lines: string[];
};

export type Answer = {
  id: string;
  picked: "left" | "right";
};

export const DIMENSIONS: TasteDimension[] = [
  "clarity",
  "warmth",
  "dream",
  "earth",
  "solitude",
  "motion",
  "bright",
  "archive",
];

export const DIMENSION_LABELS: Record<TasteDimension, string> = {
  clarity: "선명함",
  warmth: "온기",
  dream: "몽상",
  earth: "흙내음",
  solitude: "고요",
  motion: "움직임",
  bright: "빛",
  archive: "기억",
};

export const TEAS: TeaProfile[] = [
  {
    id: "peppermint",
    nameKo: "페퍼민트",
    nameEn: "Peppermint",
    tone: "차갑게 벼린 초록",
    tastingNote: "민트의 찬 향과 투명한 끝맛. 뒤엉킨 생각을 한 번에 잘라내는 타입입니다.",
    ritual: "창문을 열고 첫 모금 전에 오늘 버릴 생각 하나를 정하세요.",
    reportColor: "#2f7d4b",
    dimensions: { clarity: 5, solitude: 2, bright: 2, motion: 1 },
    tags: ["fresh", "clear", "green", "reset"],
  },
  {
    id: "rooibos",
    nameKo: "루이보스",
    nameEn: "Rooibos",
    tone: "붉은 흙과 담요의 중력",
    tastingNote: "고소하고 둥근 단맛. 흔들린 하루를 안쪽에서 붙잡는 차입니다.",
    ritual: "불빛을 낮추고 오늘 오래 남은 장면 하나를 천천히 복기하세요.",
    reportColor: "#c75b24",
    dimensions: { warmth: 5, earth: 4, archive: 2 },
    tags: ["warm", "earth", "comfort", "amber"],
  },
  {
    id: "chamomile",
    nameKo: "캐모마일",
    nameEn: "Chamomile",
    tone: "꽃잎 아래의 느린 잠",
    tastingNote: "은은한 꽃향과 사과 같은 부드러움. 마음의 소음을 낮추는 차입니다.",
    ritual: "꽃잎이 가라앉는 속도에 맞춰 호흡을 세 번 늦추세요.",
    reportColor: "#d99d2b",
    dimensions: { dream: 4, solitude: 4, warmth: 2, bright: 1 },
    tags: ["soft", "rest", "flower", "gentle"],
  },
  {
    id: "hibiscus",
    nameKo: "히비스커스",
    nameEn: "Hibiscus",
    tone: "붉게 치솟는 감정의 기압",
    tastingNote: "새콤하고 또렷한 붉은 맛. 감정을 숨기지 않는 선택에 어울립니다.",
    ritual: "컵을 빛 쪽으로 들고 지금 마음의 이름을 한 단어로 정하세요.",
    reportColor: "#c8354c",
    dimensions: { motion: 5, bright: 4, dream: 2, clarity: 1 },
    tags: ["vivid", "red", "bold", "pulse"],
  },
  {
    id: "lemongrass",
    nameKo: "레몬그라스",
    nameEn: "Lemongrass",
    tone: "볕과 풀잎 사이의 도약",
    tastingNote: "상큼한 레몬 향과 가벼운 풀 향. 기분의 방향을 빠르게 바꿉니다.",
    ritual: "메모지에 내일의 작은 출발 하나를 적고 첫 모금을 마시세요.",
    reportColor: "#88a932",
    dimensions: { bright: 5, motion: 3, clarity: 2, earth: 1 },
    tags: ["citrus", "light", "clean", "morning"],
  },
];

export const CHOICE_PAIRS: ChoicePair[] = [
  {
    id: "blank-vs-eruption",
    axis: "백지 / 폭발",
    question: "마음이 가장 먼저 향하는 표면",
    left: {
      key: "left",
      imageSheet: "left",
      imageCell: 0,
      label: "비어 있는 새벽",
      phrase: "아무것도 적히지 않은 쪽이 나를 가장 정확히 부른다.",
      detail: "여백, 정돈, 선명한 침묵을 고르는 선택",
      weights: { clarity: 5, solitude: 4, bright: 1 },
      tags: ["blank", "dawn", "quiet", "clear"],
    },
    right: {
      key: "right",
      imageSheet: "right",
      imageCell: 0,
      label: "터지는 지붕",
      phrase: "문장이 한꺼번에 쏟아질 때 나는 비로소 내 윤곽을 본다.",
      detail: "밀도, 발화, 과잉의 에너지를 고르는 선택",
      weights: { motion: 5, bright: 4, dream: 2 },
      tags: ["eruption", "city", "burst", "hot"],
    },
  },
  {
    id: "frost-vs-lantern",
    axis: "빙점 / 열기",
    question: "온도가 감정이 된다면",
    left: {
      key: "left",
      imageSheet: "left",
      imageCell: 1,
      label: "눈 덮인 마당",
      phrase: "얼어붙은 말은 상처가 아니라 보관된 빛이다.",
      detail: "차분한 거리감과 조용한 회복을 고르는 선택",
      weights: { solitude: 5, clarity: 3, archive: 2 },
      tags: ["snow", "still", "cold", "kept"],
    },
    right: {
      key: "right",
      imageSheet: "right",
      imageCell: 1,
      label: "붉은 시장",
      phrase: "젖은 골목의 등불은 숨긴 마음까지 끌어낸다.",
      detail: "열기, 소란, 붉은 감정의 즉시성을 고르는 선택",
      weights: { warmth: 4, motion: 4, bright: 3 },
      tags: ["lantern", "red", "crowded", "warm"],
    },
  },
  {
    id: "archive-vs-flight",
    axis: "보관 / 방출",
    question: "기억을 다루는 방식",
    left: {
      key: "left",
      imageSheet: "left",
      imageCell: 3,
      label: "먼지의 서랍",
      phrase: "사라지지 않도록, 나는 감정을 접어 번호를 붙인다.",
      detail: "수집, 질서, 오래 둔 마음을 고르는 선택",
      weights: { archive: 5, earth: 3, solitude: 2 },
      tags: ["archive", "order", "memory"],
    },
    right: {
      key: "right",
      imageSheet: "right",
      imageCell: 3,
      label: "날아가는 장서",
      phrase: "페이지가 흩어져야 책은 비로소 하늘의 말을 배운다.",
      detail: "해방, 우연, 흩어지는 상상력을 고르는 선택",
      weights: { dream: 4, motion: 4, bright: 2 },
      tags: ["flight", "library", "release"],
    },
  },
  {
    id: "single-line-vs-firework",
    axis: "한 줄 / 불꽃",
    question: "좋은 문장의 리듬",
    left: {
      key: "left",
      imageSheet: "left",
      imageCell: 5,
      label: "깎아낸 한 줄",
      phrase: "가장 작은 문장이 가장 멀리 파고든다.",
      detail: "정밀함, 절제, 얇은 집중을 고르는 선택",
      weights: { clarity: 5, solitude: 3, archive: 1 },
      tags: ["line", "desk", "precision"],
    },
    right: {
      key: "right",
      imageSheet: "right",
      imageCell: 5,
      label: "폭죽의 창문",
      phrase: "너무 많은 빛이 동시에 켜질 때 삶은 갑자기 달린다.",
      detail: "속도, 충돌, 화려한 전환을 고르는 선택",
      weights: { motion: 5, bright: 5, warmth: 1 },
      tags: ["firework", "train", "speed"],
    },
  },
  {
    id: "mint-vs-acid",
    axis: "무향의 칼 / 산미의 붉음",
    question: "입안에 남기고 싶은 충격",
    left: {
      key: "left",
      imageSheet: "left",
      imageCell: 6,
      label: "유리 같은 초록",
      phrase: "혀끝의 차가움이 생각의 군더더기를 벗긴다.",
      detail: "차가운 정리와 맑은 결론을 고르는 선택",
      weights: { clarity: 5, earth: 2, solitude: 2 },
      tags: ["mint", "glass", "green"],
    },
    right: {
      key: "right",
      imageSheet: "right",
      imageCell: 4,
      label: "붉은 산미",
      phrase: "새콤한 파동이 몸 안의 잠긴 문을 열어젖힌다.",
      detail: "자극, 감정의 발색, 즉각적인 생동을 고르는 선택",
      weights: { motion: 5, bright: 4, dream: 2 },
      tags: ["hibiscus", "acid", "wave"],
    },
  },
  {
    id: "stillness-vs-surge",
    axis: "정지 / 질주",
    question: "불안을 통과시키는 법",
    left: {
      key: "left",
      imageSheet: "left",
      imageCell: 7,
      label: "멈춘 물",
      phrase: "흘러가지 않아도, 마음은 바닥에서 제 얼굴을 찾는다.",
      detail: "정지, 관찰, 낮은 호흡을 고르는 선택",
      weights: { solitude: 5, dream: 3, clarity: 2 },
      tags: ["still", "water", "paper"],
    },
    right: {
      key: "right",
      imageSheet: "right",
      imageCell: 8,
      label: "검은 물살",
      phrase: "밀려가며 나는 놓아주는 법을 가장 빠르게 배운다.",
      detail: "흐름, 포기, 강한 추진력을 고르는 선택",
      weights: { motion: 5, dream: 3, bright: 1 },
      tags: ["surge", "bridge", "ink"],
    },
  },
  {
    id: "bare-room-vs-feast",
    axis: "독방 / 잔치",
    question: "좋은 시간을 증명하는 장면",
    left: {
      key: "left",
      imageSheet: "left",
      imageCell: 9,
      label: "컵 하나의 방",
      phrase: "누구도 오지 않는 방에서 취향은 가장 깊게 우러난다.",
      detail: "혼자의 깊이와 내밀한 안정감을 고르는 선택",
      weights: { solitude: 5, warmth: 1, archive: 2 },
      tags: ["alone", "room", "private"],
    },
    right: {
      key: "right",
      imageSheet: "right",
      imageCell: 7,
      label: "너무 많은 피크닉",
      phrase: "잔이 부딪히는 소리 속에서 나는 더 선명하게 웃는다.",
      detail: "공유, 풍성함, 몸을 여는 온기를 고르는 선택",
      weights: { warmth: 5, bright: 3, motion: 3 },
      tags: ["feast", "picnic", "shared"],
    },
  },
  {
    id: "earth-vs-electric",
    axis: "흙 / 전기",
    question: "발밑에서 올라오는 힘",
    left: {
      key: "left",
      imageSheet: "left",
      imageCell: 4,
      label: "마른 풀의 길",
      phrase: "흙냄새가 먼저 도착하면 마음은 다시 몸을 믿는다.",
      detail: "땅, 촉감, 느린 회복을 고르는 선택",
      weights: { earth: 5, warmth: 2, archive: 1 },
      tags: ["earth", "field", "body"],
    },
    right: {
      key: "right",
      imageSheet: "right",
      imageCell: 6,
      label: "회전하는 숲",
      phrase: "잎이 소용돌이칠 때 나는 규칙보다 전류를 따른다.",
      detail: "속도, 방향 전환, 감각의 과전류를 고르는 선택",
      weights: { motion: 5, clarity: 2, bright: 3 },
      tags: ["electric", "spiral", "forest"],
    },
  },
  {
    id: "closed-vs-bloom",
    axis: "닫힘 / 만개",
    question: "끝과 시작을 받아들이는 방식",
    left: {
      key: "left",
      imageSheet: "left",
      imageCell: 8,
      label: "안개 속 종소리",
      phrase: "끝맺음은 크게 닫히지 않고 오래 맑아진다.",
      detail: "절제된 결말과 긴 여운을 고르는 선택",
      weights: { clarity: 4, archive: 4, solitude: 2 },
      tags: ["ending", "bell", "fog"],
    },
    right: {
      key: "right",
      imageSheet: "right",
      imageCell: 9,
      label: "터져 나오는 아침",
      phrase: "시작은 늘 조금 과하고, 그래서 믿을 만하다.",
      detail: "개화, 첫 발화, 낙관적인 과잉을 고르는 선택",
      weights: { bright: 5, warmth: 3, motion: 3 },
      tags: ["bloom", "start", "gold"],
    },
  },
  {
    id: "rain-vs-citrus",
    axis: "푸른 비 / 노란 산책",
    question: "기분을 바꾸는 색",
    left: {
      key: "left",
      imageSheet: "left",
      imageCell: 2,
      label: "창가의 비",
      phrase: "젖은 유리 너머로 볼 때만 선명해지는 마음이 있다.",
      detail: "내향적인 몽상과 차분한 감도를 고르는 선택",
      weights: { dream: 5, solitude: 3, archive: 1 },
      tags: ["rain", "window", "inward"],
    },
    right: {
      key: "right",
      imageSheet: "right",
      imageCell: 2,
      label: "레몬빛 소란",
      phrase: "노란 향이 번지면 나는 망설임보다 먼저 걷는다.",
      detail: "상큼한 출발과 밝은 추진력을 고르는 선택",
      weights: { bright: 5, motion: 4, clarity: 2 },
      tags: ["citrus", "festival", "walk"],
    },
  },
];

type BookSeed = [
  number,
  string,
  string,
  string,
  number,
  string,
  TeaId[],
  string[],
];

const BOOK_ROWS: BookSeed[] = [
  [1, "불꽃으로 살다", "케이트 브라이언", "Designhouse", 2022, "9788970417608", ["hibiscus", "lemongrass"], ["bright", "bold", "art"]],
  [2, "애틋하고 행복한 타피오카의 꿈", "요시모토 바나나", "민음사", 2024, "9788937456220", ["chamomile", "rooibos"], ["dream", "soft", "warm"]],
  [3, "시간은 다른 얼굴로 되돌아온다", "김호영", "문학동네", 2023, "9788954694674", ["rooibos", "peppermint"], ["archive", "time", "clarity"]],
  [4, "날마다 노래 사이", "장유정", "목수책방", 2020, "9791188806188", ["lemongrass", "chamomile"], ["motion", "music", "bright"]],
  [5, "도시의 밤하늘", "김성환", "오르트", 2023, "9791197680410", ["peppermint", "hibiscus"], ["night", "city", "clear"]],
  [6, "날마다 구름 한 점", "개빈 프레터피니", "김영사", 2021, "9788934991786", ["chamomile", "lemongrass"], ["cloud", "rest", "dream"]],
  [7, "늦어 좋아요, 차를 마셔요", "윤종대", "청림Life", 2023, "9791198161499", ["rooibos", "chamomile"], ["tea", "warm", "ritual"]],
  [8, "벚꽃 수영장", "신현경", "북스그라운드", 2024, "9791168341753", ["hibiscus", "lemongrass"], ["flower", "bright", "motion"]],
  [9, "붉은 또 오고", "아드리앙 파를랑주", "봄봄", 2024, "9791193150146", ["hibiscus"], ["red", "vivid", "dream"]],
  [10, "어느 하루 눈부시지 않은 날이 없었습니다", "정덕현", "page2", 2024, "9791169850858", ["lemongrass", "peppermint"], ["bright", "daily", "clear"]],
  [11, "글빛 중소리", "김하나", "민음사", 2024, "9788937456770", ["peppermint", "chamomile"], ["word", "light", "quiet"]],
  [12, "날개 환상통", "김혜순", "문학과지성", 2019, "9788932035307", ["hibiscus", "peppermint"], ["intense", "motion", "sharp"]],
  [13, "우리들의 행복한 시간", "공지영", "해냄", 2016, "9788965745723", ["rooibos", "chamomile"], ["warm", "memory", "tender"]],
  [14, "마른 가지에 바람처럼 10", "글: 진작; 달새울", "영컴", 2023, "9791167793515", ["lemongrass", "hibiscus"], ["wind", "serial", "motion"]],
  [15, "꽃은 피어서 말하고 잎은 지면서 말한다", "고찬규", "걷는사람", 2023, "9791193412022", ["chamomile", "peppermint"], ["flower", "leaf", "quiet"]],
  [16, "하루 한시", "장유승, 박동욱", "샘터", 2015, "9788946420052", ["chamomile", "rooibos"], ["daily", "poem", "ritual"]],
  [17, "하늘 마르크 간 택배", "김경미(글)", "슈크림북", 2023, "9791190409391", ["lemongrass", "peppermint"], ["sky", "motion", "light"]],
  [18, "밝은 아주 포근해", "모수", "고양라스또", 2023, "9791169780216", ["chamomile", "rooibos"], ["soft", "warm", "bright"]],
  [19, "달빛 그림자 가게 2. 고양이의 특별한 탈출", "김우수, 정은경", "길벗스쿨", 2023, "9791164066292", ["hibiscus", "lemongrass"], ["moon", "escape", "motion"]],
  [20, "안개가 잎을 키웠다", "문지원", "문학수첩", 2023, "9791192776958", ["peppermint", "chamomile"], ["fog", "leaf", "quiet"]],
  [21, "슬픈 노래를 거둬 갔으면", "김창균", "걷는사람", 2023, "9791193412060", ["chamomile", "rooibos"], ["song", "sad", "rest"]],
  [22, "혼잣말을 달래는 사람", "휘민", "걷는사람", 2023, "9791193412107", ["chamomile", "peppermint"], ["solitude", "voice", "gentle"]],
  [23, "천왕성에서 유턴", "이경아(글)", "열림원어린이", 2024, "9788961554022", ["hibiscus", "lemongrass"], ["space", "turn", "vivid"]],
  [24, "그 여름의 서울", "이현", "창비", 2023, "9788936439262", ["lemongrass", "hibiscus"], ["summer", "city", "memory"]],
  [25, "당신은 빛이자 사랑입니다", "안나", "디아스포라", 2023, "9791187589390", ["lemongrass", "rooibos"], ["love", "light", "warm"]],
  [26, "일루미나시옹", "아르튀르 랭보", "은행", 2023, "9788931023411", ["hibiscus", "peppermint"], ["classic", "vivid", "light"]],
  [27, "달콤한 메아리", "김혜리", "상상스쿨", 2023, "9791190253666", ["rooibos", "chamomile"], ["sweet", "echo", "dream"]],
  [28, "이별은 그늘처럼", "김남국", "걷는사람", 2023, "9791193412008", ["chamomile", "peppermint"], ["parting", "shade", "quiet"]],
  [29, "겨울밤 토끼 걱정", "유희경", "현대문학", 2023, "9791167902191", ["chamomile", "rooibos"], ["winter", "night", "soft"]],
  [30, "감미롭고 간절한", "은모든", "위즈덤하우스", 2023, "9791168127272", ["rooibos", "hibiscus"], ["sweet", "longing", "warm"]],
  [31, "하늘과 바람과 별과 시", "윤동주", "자화상", 2019, "9791190298001", ["peppermint", "chamomile"], ["classic", "sky", "clear"]],
  [32, "님의 침묵 (미니북)", "한용운", "자화상", 2020, "9791190298223", ["rooibos", "chamomile"], ["classic", "silence", "archive"]],
  [33, "삶이 그대를 속일지라도", "알렉산드르 세르게예비치 푸시킨", "더클래식", 2020, "9791164451807", ["rooibos", "peppermint"], ["classic", "resilience", "clear"]],
  [34, "별(미니북)", "알퐁스 도데", "더클래식", 2017, "9791159034664", ["chamomile", "peppermint"], ["star", "classic", "dream"]],
  [35, "마지막 잎새", "오 헨리", "더클래식", 2017, "9791159034411", ["rooibos", "chamomile"], ["classic", "leaf", "warm"]],
  [36, "부디, 얼지 않게끔", "강민영", "자음과모음", 2020, "9788954445405", ["rooibos", "chamomile"], ["winter", "warm", "care"]],
  [37, "지지 않는 달", "하타노 도모미", "문학동네", 2023, "9788954696944", ["peppermint", "hibiscus"], ["moon", "clear", "resilient"]],
  [38, "여름 섬 보물들", "임상욱(글)", "지벵", 2023, "9791198248510", ["lemongrass", "hibiscus"], ["summer", "island", "bright"]],
  [39, "슬픔아 안녕", "멜매", "봄봄", 2023, "9791168630307", ["chamomile", "lemongrass"], ["farewell", "sad", "light"]],
  [40, "작은 빛", "문애준", "주주베북스", 2022, "9791197831300", ["lemongrass", "peppermint"], ["small", "light", "clear"]],
  [41, "소리의 마음들", "니나 크라우스", "위즈덤하우스", 2023, "9791168123823", ["peppermint", "chamomile"], ["sound", "mind", "clarity"]],
  [42, "쥐쥐 숲비", "박준하", "위즈덤하우스", 2024, "9791171711666", ["lemongrass", "chamomile"], ["forest", "rain", "motion"]],
  [43, "만남", "강인숙", "열림원", 2024, "9791170402626", ["rooibos", "lemongrass"], ["meeting", "warm", "start"]],
  [44, "특별하지 않은 날", "이나 소라호", "열림원", 2024, "9791170402510", ["chamomile", "rooibos"], ["daily", "ordinary", "soft"]],
  [45, "세상의 모든 시간", "토마스 기르스트", "을유문화사", 2020, "9788932474229", ["rooibos", "peppermint"], ["time", "archive", "clear"]],
  [46, "마지막 잎새", "오 헨리", "더클래식", 2017, "9791159034411", ["rooibos", "chamomile"], ["classic", "leaf", "care"]],
  [47, "날개 환상통", "김혜순", "문학과지성", 2019, "9788932035307", ["hibiscus", "peppermint"], ["intense", "wing", "sharp"]],
  [48, "상냥한 폭력의 시대", "정이현", "문학과지성", 2016, "9788932029092", ["hibiscus", "peppermint"], ["modern", "vivid", "edge"]],
  [49, "우리들의 행복한 시간", "공지영", "해냄", 2016, "9788965745723", ["rooibos", "chamomile"], ["memory", "warm", "tender"]],
  [50, "작별하지 않는다", "한강", "문학동네", 2021, "9788954682152", ["rooibos", "hibiscus"], ["memory", "deep", "red"]],
];

export const BOOKS: BookRecord[] = BOOK_ROWS.map(
  ([no, title, author, publisher, year, isbn, teaAffinity, tags]) => ({
    id: `book-${String(no).padStart(2, "0")}`,
    no,
    title,
    author,
    publisher,
    year,
    isbn,
    subject: "루",
    teaAffinity,
    tags,
  }),
);

export const POEMS: PoemRecord[] = [
  {
    id: "poem-clear-window",
    title: "창문을 여는 법",
    teaAffinity: ["peppermint", "lemongrass"],
    tags: ["clarity", "bright", "morning"],
    lines: [
      "컵의 가장자리에 새벽을 얹는다.",
      "민트빛 숨이 책장 사이를 지나가고",
      "오늘은 조금 더 정확한 내가 된다.",
    ],
  },
  {
    id: "poem-amber-room",
    title: "담요 아래의 문장",
    teaAffinity: ["rooibos"],
    tags: ["warmth", "archive", "earth"],
    lines: [
      "붉은 차가 식어가는 동안",
      "낡은 방은 나를 오래된 이름으로 불러준다.",
      "괜찮다는 말은 둥글게 우러난다.",
    ],
  },
  {
    id: "poem-yellow-rest",
    title: "꽃잎의 속도",
    teaAffinity: ["chamomile"],
    tags: ["dream", "solitude", "soft"],
    lines: [
      "꽃잎은 서두르지 않고 바닥에 닿는다.",
      "나는 그 느린 낙하를 따라 눈을 감고",
      "마음의 소음을 낮은 서랍에 넣는다.",
    ],
  },
  {
    id: "poem-red-current",
    title: "붉은 기압",
    teaAffinity: ["hibiscus"],
    tags: ["motion", "bright", "vivid"],
    lines: [
      "한 모금의 산미가 심장 옆을 지나간다.",
      "감정은 피하지 않아도 되는 날씨",
      "붉게 번질수록 길은 또렷해진다.",
    ],
  },
  {
    id: "poem-citrus-note",
    title: "레몬빛 쪽지",
    teaAffinity: ["lemongrass"],
    tags: ["bright", "motion", "clear"],
    lines: [
      "풀 향이 접힌 쪽지에서 깨어난다.",
      "작은 약속 하나가 주머니 속에서 빛나고",
      "가벼운 내일이 먼저 걸어간다.",
    ],
  },
  {
    id: "poem-fog-leaf",
    title: "안개와 잎",
    teaAffinity: ["peppermint", "chamomile"],
    tags: ["solitude", "dream", "green"],
    lines: [
      "흐릿한 아침에도 잎은 제 모양을 잃지 않는다.",
      "나는 망설임의 가장자리를 만져보고",
      "조금 늦게 선명해지는 일을 배운다.",
    ],
  },
  {
    id: "poem-river-paper",
    title: "흘려보내는 연습",
    teaAffinity: ["hibiscus", "lemongrass"],
    tags: ["motion", "release", "river"],
    lines: [
      "종이배는 작아서 멀리 간다.",
      "이름 붙이지 못한 마음도 물살을 만나면",
      "마침내 방향이라는 것을 갖는다.",
    ],
  },
  {
    id: "poem-library-dust",
    title: "먼지의 서가",
    teaAffinity: ["rooibos", "peppermint"],
    tags: ["archive", "book", "quiet"],
    lines: [
      "오래된 표지를 열면 오후가 천천히 일어난다.",
      "먼지는 사라진 것이 아니라",
      "기억이 가장 가볍게 앉는 방식이다.",
    ],
  },
  {
    id: "poem-snow-cup",
    title: "눈 오는 컵",
    teaAffinity: ["chamomile", "rooibos"],
    tags: ["solitude", "warmth", "winter"],
    lines: [
      "눈은 소리 없이 창밖을 덮고",
      "잔 안의 온기만 작은 방처럼 남는다.",
      "오늘의 불안은 하얗게 접어둔다.",
    ],
  },
  {
    id: "poem-picnic-start",
    title: "완성되지 않은 시작",
    teaAffinity: ["lemongrass", "chamomile"],
    tags: ["bright", "warmth", "start"],
    lines: [
      "돗자리는 조금 삐뚤게 펼쳐지고",
      "그 틈으로 계절이 웃으며 들어온다.",
      "처음은 그래서 늘 다정하다.",
    ],
  },
];

export function emptyVector(): TasteVector {
  return DIMENSIONS.reduce((acc, dimension) => {
    acc[dimension] = 0;
    return acc;
  }, {} as TasteVector);
}

export function scoreAnswers(answers: Answer[]): TasteVector {
  const vector = emptyVector();

  for (const answer of answers) {
    const pair = CHOICE_PAIRS.find((item) => item.id === answer.id);
    if (!pair) continue;

    const side = pair[answer.picked];
    for (const [dimension, value] of Object.entries(side.weights)) {
      vector[dimension as TasteDimension] += value ?? 0;
    }
  }

  return vector;
}

export function findTea(id: TeaId) {
  return TEAS.find((tea) => tea.id === id) ?? TEAS[0];
}

export function findBook(id: string) {
  return BOOKS.find((book) => book.id === id) ?? BOOKS[0];
}

export function findPoem(id: string) {
  return POEMS.find((poem) => poem.id === id) ?? POEMS[0];
}
