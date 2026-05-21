import {
  BOOKS,
  DIMENSION_LABELS,
  DIMENSIONS,
  POEMS,
  TEAS,
  type Answer,
  type BookRecord,
  type PoemRecord,
  type TasteDimension,
  type TasteVector,
  type TeaId,
  type TeaProfile,
  scoreAnswers,
} from "@/lib/catalog";

export type KeywordTag = {
  text: string;
  weight: number;
};

export type RecommendationResult = {
  engine: "gemini" | "local";
  title: string;
  archetype: string;
  summary: string;
  innerPortrait: string;
  keywords: KeywordTag[];
  tea: TeaProfile;
  teaReason: string;
  book: BookRecord;
  bookReason: string;
  poem: PoemRecord;
  poemReason: string;
  tasteVector: TasteVector;
  dominantDimensions: TasteDimension[];
  ritual: string;
  closingLine: string;
  notice?: string;
};

export type RecommendationPayload = {
  answers: Answer[];
};

const TEA_TRAIT_WEIGHTS = TEAS.reduce(
  (acc, tea) => {
    acc[tea.id] = tea.dimensions;
    return acc;
  },
  {} as Record<TeaId, Partial<TasteVector>>,
);

export function topDimensions(vector: TasteVector, count = 3) {
  return [...DIMENSIONS]
    .sort((a, b) => vector[b] - vector[a])
    .slice(0, count);
}

function fallbackKeywords(
  dominantDimensions: TasteDimension[],
  tea: TeaProfile,
): KeywordTag[] {
  const base: KeywordTag[] = dominantDimensions.map((dim, idx) => ({
    text: DIMENSION_LABELS[dim],
    weight: 3 - Math.min(2, idx),
  }));
  const teaTags = tea.tags.slice(0, 4).map((tag) => ({ text: tag, weight: 1 }));
  const extras: KeywordTag[] = [
    { text: tea.tone, weight: 2 },
    { text: "내밀한 호흡", weight: 1 },
    { text: "느린 정돈", weight: 1 },
    { text: "한 잔의 거리", weight: 1 },
  ];
  return [...base, ...extras, ...teaTags].slice(0, 12);
}

export function createLocalRecommendation(
  answers: Answer[],
  notice?: string,
): RecommendationResult {
  const tasteVector = scoreAnswers(answers);
  const dominantDimensions = topDimensions(tasteVector);
  const tea = chooseTea(tasteVector);
  const book = chooseBook(tea.id, dominantDimensions);
  const poem = choosePoem(tea.id, dominantDimensions);
  const dimensionNames = dominantDimensions
    .map((dimension) => DIMENSION_LABELS[dimension])
    .join(" · ");

  return {
    engine: "local",
    title: `${tea.tone}을 닮은 내면의 초상`,
    archetype: `${tea.tone}을 닮은 취향`,
    summary: `당신의 마음은 ${dimensionNames}의 결로 천천히 가라앉습니다. 서두르지 않는 시선과 분명한 온도가 동시에 보이는 사람입니다.`,
    innerPortrait: `당신의 시간은 자주 안쪽으로 굽어 있습니다. 큰 소리보다 한 줄의 정확한 문장에 멈추고, 빠른 결론보다 천천히 우러나는 농도를 더 신뢰합니다. ${tea.tone}이 어울리는 까닭은, 당신이 이미 자기 안에 그런 결을 한 겹 갖고 있기 때문입니다.`,
    keywords: fallbackKeywords(dominantDimensions, tea),
    tea,
    teaReason: `${tea.nameKo}의 ${tea.tastingNote.split(".")[0]} 결은 당신이 가장 자주 머무는 온도와 맞닿아 있습니다. 마시는 동안 마음의 윤곽이 조금 더 또렷해집니다.`,
    book,
    bookReason: `${book.author}의 문장 결이 당신의 ${dimensionNames} 쪽 호흡과 자연스럽게 맞물립니다.`,
    poem,
    poemReason: `천천히 읽을수록 당신의 오늘과 가장 가깝게 포개집니다.`,
    tasteVector,
    dominantDimensions,
    ritual: tea.ritual,
    closingLine: `${tea.nameKo} 한 잔과 「${poem.title}」을 곁에 두면 오늘의 내가 또렷해집니다.`,
    notice,
  };
}

export function hydrateRecommendation(
  raw: {
    title?: string;
    archetype?: string;
    summary?: string;
    innerPortrait?: string;
    keywords?: KeywordTag[];
    teaId?: string;
    teaReason?: string;
    bookId?: string;
    bookReason?: string;
    poemId?: string;
    poemReason?: string;
    ritual?: string;
    closingLine?: string;
  },
  answers: Answer[],
): RecommendationResult {
  const fallback = createLocalRecommendation(answers);
  const tea = TEAS.find((item) => item.id === raw.teaId) ?? fallback.tea;
  const book = BOOKS.find((item) => item.id === raw.bookId) ?? fallback.book;
  const poem = POEMS.find((item) => item.id === raw.poemId) ?? fallback.poem;
  const tasteVector = scoreAnswers(answers);

  const sanitizedKeywords = Array.isArray(raw.keywords)
    ? raw.keywords
        .filter(
          (item): item is KeywordTag =>
            !!item &&
            typeof item.text === "string" &&
            typeof item.weight === "number",
        )
        .map((item) => ({
          text: item.text.trim(),
          weight: Math.max(1, Math.min(3, Math.round(item.weight))),
        }))
        .filter((item) => item.text.length > 0)
        .slice(0, 14)
    : [];

  return {
    engine: "gemini",
    title: raw.title?.trim() || fallback.title,
    archetype: raw.archetype?.trim() || fallback.archetype,
    summary: raw.summary?.trim() || fallback.summary,
    innerPortrait: raw.innerPortrait?.trim() || fallback.innerPortrait,
    keywords: sanitizedKeywords.length ? sanitizedKeywords : fallback.keywords,
    tea,
    teaReason: raw.teaReason?.trim() || fallback.teaReason,
    book,
    bookReason: raw.bookReason?.trim() || fallback.bookReason,
    poem,
    poemReason: raw.poemReason?.trim() || fallback.poemReason,
    tasteVector,
    dominantDimensions: topDimensions(tasteVector),
    ritual: raw.ritual?.trim() || tea.ritual,
    closingLine: raw.closingLine?.trim() || fallback.closingLine,
  };
}

function chooseTea(vector: TasteVector) {
  let winner = TEAS[0];
  let topScore = Number.NEGATIVE_INFINITY;

  for (const tea of TEAS) {
    const score = dot(vector, TEA_TRAIT_WEIGHTS[tea.id]);
    if (score > topScore) {
      winner = tea;
      topScore = score;
    }
  }

  return winner;
}

function chooseBook(teaId: TeaId, dimensions: TasteDimension[]) {
  return [...BOOKS]
    .map((book) => ({
      book,
      score:
        (book.teaAffinity.includes(teaId) ? 8 : 0) +
        dimensions.reduce(
          (sum, dimension) =>
            sum + (book.tags.includes(dimension) ? 2 : 0),
          0,
        ) +
        (book.no % 7) / 10,
    }))
    .sort((a, b) => b.score - a.score)[0].book;
}

function choosePoem(teaId: TeaId, dimensions: TasteDimension[]) {
  return [...POEMS]
    .map((poem) => ({
      poem,
      score:
        (poem.teaAffinity.includes(teaId) ? 8 : 0) +
        dimensions.reduce(
          (sum, dimension) =>
            sum + (poem.tags.includes(dimension) ? 2 : 0),
          0,
        ),
    }))
    .sort((a, b) => b.score - a.score)[0].poem;
}

function dot(vector: TasteVector, weights: Partial<TasteVector>) {
  return DIMENSIONS.reduce(
    (sum, dimension) => sum + vector[dimension] * (weights[dimension] ?? 0),
    0,
  );
}
