import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { BOOKS, CHOICE_PAIRS, POEMS, TEAS, type Answer } from "@/lib/catalog";
import {
  createLocalRecommendation,
  hydrateRecommendation,
  type RecommendationPayload,
} from "@/lib/recommendation";

export const runtime = "nodejs";

let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  aiClient ??= new GoogleGenAI({ apiKey });
  return aiClient;
}

export async function POST(request: Request) {
  let payload: RecommendationPayload;

  try {
    payload = (await request.json()) as RecommendationPayload;
  } catch {
    return NextResponse.json(
      { error: "분석할 선택 데이터가 올바르지 않아요." },
      { status: 400 },
    );
  }

  const answers = sanitizeAnswers(payload.answers);
  if (answers.length < CHOICE_PAIRS.length) {
    return NextResponse.json(
      { error: "모든 취향 카드를 선택한 뒤 분석할 수 있어요." },
      { status: 400 },
    );
  }

  const ai = getAiClient();
  const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

  if (!ai) {
    return NextResponse.json(
      createLocalRecommendation(
        answers,
        "AI 설정이 없어 로컬 추천 엔진으로 결과를 만들었어요.",
      ),
    );
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: buildPrompt(answers),
      config: {
        temperature: 0.85,
        responseMimeType: "application/json",
        responseJsonSchema: recommendationSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI returned an empty response.");

    const parsed = JSON.parse(text) as Parameters<
      typeof hydrateRecommendation
    >[0];

    return NextResponse.json(hydrateRecommendation(parsed, answers));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 호출에 실패했어요.";

    return NextResponse.json(
      createLocalRecommendation(
        answers,
        `AI 응답을 읽지 못해 로컬 추천 엔진으로 대체했어요. (${message})`,
      ),
    );
  }
}

function sanitizeAnswers(answers: unknown): Answer[] {
  if (!Array.isArray(answers)) return [];

  const validIds = new Set(CHOICE_PAIRS.map((pair) => pair.id));
  const seen = new Set<string>();
  const sanitized: Answer[] = [];

  for (const answer of answers) {
    if (!answer || typeof answer !== "object") continue;
    const candidate = answer as Partial<Answer>;
    if (!candidate.id || !validIds.has(candidate.id) || seen.has(candidate.id)) {
      continue;
    }
    if (candidate.picked !== "left" && candidate.picked !== "right") continue;

    sanitized.push({ id: candidate.id, picked: candidate.picked });
    seen.add(candidate.id);
  }

  return CHOICE_PAIRS.flatMap((pair) =>
    sanitized.find((answer) => answer.id === pair.id) ?? [],
  );
}

function buildPrompt(answers: Answer[]) {
  const selected = answers.map((answer) => {
    const pair = CHOICE_PAIRS.find((item) => item.id === answer.id);
    const picked = pair?.[answer.picked];

    return {
      axis: pair?.axis,
      question: pair?.question,
      picked: picked
        ? {
            label: picked.label,
            phrase: picked.phrase,
            detail: picked.detail,
            tags: picked.tags,
            weights: picked.weights,
          }
        : answer.picked,
    };
  });

  return [
    "너는 종이 위에 천천히 글을 쓰는 섬세한 취향 분석가다. 시집과 허브티를 추천한다.",
    "사용자는 극단적으로 대비되는 10쌍의 이미지·문구 중에서 한쪽씩 골랐다. 이 데이터는 사용자의 마음 결을 추론하기 위한 단서일 뿐이다.",
    "",
    "[절대 규칙]",
    "1. 사용자의 선택 문구나 라벨을 절대 그대로 인용하지 말 것. ('당신은 ~를 골랐기 때문에' 같은 인과 서술 금지)",
    "2. 선택들을 종합해 한 사람의 내면을 짧고 정확한 한국어 문장으로 그려낼 것. 일반론 금지.",
    "3. MBTI, 성격유형, '~한 사람입니다'식의 단정형 라벨링 금지. 대신 마음의 결을 그려라.",
    "4. 톤: 따뜻하지만 명료한, 종이에 천천히 쓴 문장. 미사여구·과장·이모지·영어 단어 남용 금지.",
    "5. 모든 필드의 한국어는 자연스럽고 시적이되 모호하지 않게.",
    "",
    "[생성 지침]",
    "- title: 8~18자의 한 줄. 이 사람의 내면을 은유한 시적 제목.",
    "- archetype: 5~10자의 한 단어 라벨 (예: '내밀한 탐구자', '느린 빛의 관찰자').",
    "- summary: 정확히 3~4문장. 이 사람만의 내밀한 마음의 결을 디테일하게 압축하여 서술. 첫 문장은 마음의 형태, 두 번째와 세 번째 문장은 그 마음이 세상을 마주하는 방식과 그 안에 숨겨진 힘.",
    "- innerPortrait: 5~6문장의 본격적이고 밀도 높은 내면 초상. 시처럼 짧고 섬세하지만 깊은 울림을 주는 풍부한 서술. 사용자가 자기 자신조차 미처 몰랐던 깊은 내면의 결을 정확하고 유의미하게 발견하도록 유도할 것.",
    "- keywords: 사용자의 마음 결을 드러내는 10~12개의 한국어 단어/짧은 구절. 각 항목은 {text, weight} 형태. weight는 1, 2, 3 중 하나 (3이 가장 핵심 키워드, 2~3개 추천; 2는 보조 키워드 3~4개; 1은 주변 키워드 4~5개). text는 2~6자.",
    "- teaId: 차 DB 중 가장 적합한 것 하나.",
    "- teaReason: 정확히 3~4문장. '이 차의 OO한 성질이 당신의 OO한 결과 맞닿는다' 식의 풍성하고 섬세한 문학적 매칭. 차의 향·온도·색·후미와 이 사람 내면의 한 지점을 구체적으로 연결하여 깊이 있는 공감을 선사할 것.",
    "- bookId: 시집 DB 중 가장 적합한 것 하나.",
    "- bookReason: 3~4문장의 상세한 서술. 이 시집이 이 사람의 어떤 고유한 결에 정확히 닿는지, 시집의 서정성과 사용자의 고독/사색이 어떻게 만나는지 문학적 깊이로 설득할 것.",
    "- poemId: 시 DB 중 가장 적합한 것 하나.",
    "- poemReason: 2~3문장의 깊이 있는 해설. 왜 오늘의 이 사람에게 특별히 이 시의 구절들이 필요한지, 지친 마음에 주는 위안을 담을 것.",
    "- ritual: 2~3문장의 구체적이고 시적인 의식. 공간의 조도, 행동의 템포, 곁들일 소리 등을 포함하여 '~하세요' 식으로 부드롭고 밀도 있게 권유.",
    "- closingLine: 마무리 한 문장. 이 페이지를 덮은 후 사용자가 하루 종일 마음에 담아둘 짧고 긴 여운을 주는 독백.",
    "",
    "[데이터]",
    JSON.stringify(
      {
        userSelections: selected,
        teas: TEAS.map(({ id, nameKo, tone, tastingNote, tags }) => ({
          id,
          nameKo,
          tone,
          tastingNote,
          tags,
        })),
        books: BOOKS.map(
          ({ id, no, title, author, publisher, year, teaAffinity, tags }) => ({
            id,
            no,
            title,
            author,
            publisher,
            year,
            teaAffinity,
            tags,
          }),
        ),
        poems: POEMS.map(({ id, title, teaAffinity, tags, lines }) => ({
          id,
          title,
          teaAffinity,
          tags,
          lines,
        })),
      },
      null,
      2,
    ),
  ].join("\n");
}

const recommendationSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    archetype: { type: "string" },
    summary: { type: "string" },
    innerPortrait: { type: "string" },
    keywords: {
      type: "array",
      minItems: 8,
      maxItems: 12,
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          weight: { type: "integer", minimum: 1, maximum: 3 },
        },
        required: ["text", "weight"],
      },
    },
    teaId: { type: "string", enum: TEAS.map((tea) => tea.id) },
    teaReason: { type: "string" },
    bookId: { type: "string", enum: BOOKS.map((book) => book.id) },
    bookReason: { type: "string" },
    poemId: { type: "string", enum: POEMS.map((poem) => poem.id) },
    poemReason: { type: "string" },
    ritual: { type: "string" },
    closingLine: { type: "string" },
  },
  required: [
    "title",
    "archetype",
    "summary",
    "innerPortrait",
    "keywords",
    "teaId",
    "teaReason",
    "bookId",
    "bookReason",
    "poemId",
    "poemReason",
    "ritual",
    "closingLine",
  ],
};
