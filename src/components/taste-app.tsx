"use client";

import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Leaf,
  Quote,
  RotateCcw,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import {
  CHOICE_PAIRS,
  DIMENSIONS,
  DIMENSION_LABELS,
  TEAS,
  type Answer,
  type BookRecord,
  type ChoicePair,
  type ChoiceSide,
  type TasteDimension,
  type TasteVector,
  type TeaProfile,
} from "@/lib/catalog";
import type {
  KeywordTag,
  RecommendationResult,
} from "@/lib/recommendation";

type Status = "idle" | "loading" | "done" | "error";

export function TasteApp() {
  const [hasStarted, setHasStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState("");

  const currentPair = CHOICE_PAIRS[step];
  const selectedForCurrent = answers.find(
    (answer) => answer.id === currentPair.id,
  )?.picked;
  const isComplete = answers.length === CHOICE_PAIRS.length;
  const progress = Math.round((answers.length / CHOICE_PAIRS.length) * 100);

  function choose(picked: "left" | "right") {
    setResult(null);
    setStatus("idle");
    setError("");
    setAnswers((previous) => {
      const withoutCurrent = previous.filter(
        (answer) => answer.id !== currentPair.id,
      );
      return [...withoutCurrent, { id: currentPair.id, picked }];
    });

    if (step < CHOICE_PAIRS.length - 1) {
      setStep((value) => value + 1);
    }
  }

  function reset() {
    setStep(0);
    setAnswers([]);
    setResult(null);
    setStatus("idle");
    setError("");
  }

  function start() {
    reset();
    setHasStarted(true);
  }

  async function analyze() {
    if (!isComplete || status === "loading") return;

    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "분석에 실패했어요.");
      }

      const recommendation = (await response.json()) as RecommendationResult;
      setResult(recommendation);
      setStatus("done");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "알 수 없는 분석 오류가 생겼어요.",
      );
      setStatus("error");
    }
  }

  const isLoading = status === "loading";
  const showResult = !!result && !isLoading;
  const shellClass = !hasStarted
    ? "app-shell landing-shell"
    : showResult
      ? "app-shell result-shell"
      : "app-shell";

  return (
    <main className={shellClass}>
      {!hasStarted ? (
        <LandingPage onStart={start} />
      ) : (
        <>
          <TopBar
            progress={progress}
            hasResult={showResult}
            isLoading={isLoading}
          />

          <div className="workspace">
            {isLoading ? (
              <LoadingArt />
            ) : showResult ? (
              <ResultReport result={result} onRestart={reset} />
            ) : (
              <ChoiceStage
                pair={currentPair}
                step={step}
                selected={selectedForCurrent}
                isComplete={isComplete}
                status={status}
                error={error}
                onChoose={choose}
                onAnalyze={analyze}
                onPrev={() => setStep((value) => Math.max(0, value - 1))}
                onNext={() =>
                  setStep((value) =>
                    Math.min(CHOICE_PAIRS.length - 1, value + 1),
                  )
                }
                onReset={reset}
              />
            )}
          </div>
        </>
      )}
    </main>
  );
}

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <section className="landing-page" aria-label="시작 화면">
      <div className="landing-poster" aria-hidden />
      <div className="landing-soften" aria-hidden />

      <div className="landing-content">
        <span className="landing-ribbon">당신의 취향으로 알아보는</span>
        <h1>
          <span className="landing-title-orange">나의 시집</span>
          <span className="landing-title-join">과</span>
          <span className="landing-title-green">나의 차</span>
        </h1>
        <p>오늘의 마음에 어울리는 시 한 편과 차 한 잔을 만나보세요.</p>
        <button className="start-button" onClick={onStart} type="button">
          <span>시작하기</span>
        </button>
      </div>
    </section>
  );
}

function TopBar({
  progress,
  hasResult,
  isLoading,
}: {
  progress: number;
  hasResult: boolean;
  isLoading: boolean;
}) {
  return (
    <header className="top-bar">
      <div className="status-pill">
        <Wand2 aria-hidden />
        <span>Taste Lab</span>
      </div>
      <div className="progress-shell" aria-label={`진행률 ${progress}%`}>
        <span style={{ width: `${hasResult || isLoading ? 100 : progress}%` }} />
      </div>
      <div className="topbar-meta">
        {hasResult ? "분석 완료" : isLoading ? "분석 중" : `${progress}%`}
      </div>
    </header>
  );
}

function ChoiceStage({
  pair,
  step,
  selected,
  isComplete,
  status,
  error,
  onChoose,
  onAnalyze,
  onPrev,
  onNext,
  onReset,
}: {
  pair: ChoicePair;
  step: number;
  selected?: "left" | "right";
  isComplete: boolean;
  status: Status;
  error: string;
  onChoose: (picked: "left" | "right") => void;
  onAnalyze: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}) {
  return (
    <section className="choice-stage" aria-label="취향 선택 카드">
      <div className="stage-header">
        <div>
          <span className="eyebrow">Slide {String(step + 1).padStart(2, "0")}</span>
          <h2>{pair.question}</h2>
        </div>
        <div className="axis-badge">{pair.axis}</div>
      </div>

      <div className="choice-grid">
        <ChoiceCard
          side={pair.left}
          active={selected === "left"}
          onChoose={() => onChoose("left")}
        />
        <div className="split-mark" aria-hidden>
          <span>vs</span>
        </div>
        <ChoiceCard
          side={pair.right}
          active={selected === "right"}
          onChoose={() => onChoose("right")}
        />
      </div>

      <footer className="stage-actions">
        <button className="icon-button" onClick={onPrev} type="button">
          <ChevronLeft aria-hidden />
          <span>이전</span>
        </button>
        <button className="ghost-button" onClick={onReset} type="button">
          <RotateCcw aria-hidden />
          <span>다시</span>
        </button>
        <button className="icon-button" onClick={onNext} type="button">
          <span>다음</span>
          <ChevronRight aria-hidden />
        </button>
        <button
          className="primary-button"
          disabled={!isComplete || status === "loading"}
          onClick={onAnalyze}
          type="button"
        >
          <Send aria-hidden />
          <span>{status === "loading" ? "분석 중" : "결과 보기"}</span>
        </button>
      </footer>

      {error ? <p className="error-text">{error}</p> : null}
    </section>
  );
}

function ChoiceCard({
  side,
  active,
  onChoose,
}: {
  side: ChoiceSide;
  active: boolean;
  onChoose: () => void;
}) {
  return (
    <button
      className={active ? "choice-card active" : "choice-card"}
      onClick={onChoose}
      type="button"
      aria-pressed={active}
    >
      <MoodImage sheet={side.imageSheet} cell={side.imageCell} />
      <div className="choice-text">
        <span className="card-label">{side.label}</span>
        <strong>{side.phrase}</strong>
      </div>
      <span className="select-mark">
        <BadgeCheck aria-hidden />
      </span>
    </button>
  );
}

function MoodImage({ sheet, cell }: { sheet: "left" | "right"; cell: number }) {
  const col = cell % 5;
  const row = Math.floor(cell / 5);

  return (
    <span
      className="mood-image"
      style={
        {
          backgroundImage: `url(/assets/mood-sprite-${sheet}.png)`,
          backgroundPosition: `${col * 25}% ${row * 100}%`,
        } as CSSProperties
      }
    />
  );
}

function LoadingArt() {
  const leaves = useMemo(() => {
    const palette = [
      "#356f35",
      "#88a932",
      "#d69b2d",
      "#e36d21",
      "#c8354c",
      "#4f7791",
    ];
    // Deterministic pseudo-random — keeps render pure and avoids hydration mismatch
    const noise = (seed: number) => {
      const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
      return value - Math.floor(value);
    };
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      left: noise(i + 1) * 100,
      delay: noise(i + 53) * 8,
      duration: 9 + noise(i + 109) * 8,
      size: 14 + noise(i + 211) * 22,
      drift: (noise(i + 317) - 0.5) * 280,
      rotate: 200 + noise(i + 431) * 360,
      color: palette[Math.floor(noise(i + 521) * palette.length) % palette.length],
      opacity: 0.45 + noise(i + 619) * 0.4,
    }));
  }, []);

  const orbits = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        id: i,
        size: 110 + i * 38,
        duration: 12 + i * 3.5,
        reverse: i % 2 === 0,
      })),
    [],
  );

  return (
    <section className="loading-art" aria-live="polite" aria-busy="true">
      <div className="loading-leaves" aria-hidden>
        {leaves.map((leaf) => (
          <span
            key={leaf.id}
            className="falling-leaf"
            style={
              {
                left: `${leaf.left}%`,
                animationDelay: `${leaf.delay}s`,
                animationDuration: `${leaf.duration}s`,
                color: leaf.color,
                opacity: leaf.opacity,
                "--leaf-size": `${leaf.size}px`,
                "--leaf-drift": `${leaf.drift}px`,
                "--leaf-rotate": `${leaf.rotate}deg`,
              } as CSSProperties
            }
          >
            <Leaf strokeWidth={1.4} />
          </span>
        ))}
      </div>

      <div className="loading-center">
        <div className="loading-orbits" aria-hidden>
          {orbits.map((orbit) => (
            <span
              key={orbit.id}
              className={orbit.reverse ? "orbit reverse" : "orbit"}
              style={
                {
                  width: `${orbit.size}px`,
                  height: `${orbit.size}px`,
                  animationDuration: `${orbit.duration}s`,
                } as CSSProperties
              }
            />
          ))}
          <span className="orbit-core" aria-hidden>
            <Leaf strokeWidth={1.5} />
          </span>
        </div>

        <div className="loading-copy">
          <span className="loading-eyebrow">Taste Lab · Analyzing</span>
          <h2>
            <span>당</span>
            <span>신</span>
            <span>의</span>
            &nbsp;
            <span>취</span>
            <span>향</span>
            <span>을</span>
            &nbsp;
            <span>우</span>
            <span>려</span>
            <span>내</span>
            <span>는</span>
            &nbsp;
            <span>중</span>
          </h2>
          <p>찻잎이 내려앉는 동안, 마음의 결을 천천히 읽고 있어요.</p>
        </div>
      </div>
    </section>
  );
}

function ResultReport({
  result,
  onRestart,
}: {
  result: RecommendationResult;
  onRestart: () => void;
}) {
  const selectedTeaIndex = Math.max(
    0,
    TEAS.findIndex((tea) => tea.id === result.tea.id),
  );

  return (
    <section
      className="result-report"
      style={{ "--tea": result.tea.reportColor } as CSSProperties}
      aria-label="취향 결과 보고서"
    >
      <header className="result-header">
        <button className="ghost-button" onClick={onRestart} type="button">
          <ArrowLeft aria-hidden />
          <span>새 분석</span>
        </button>
        <div className="header-center">
          <span className="report-eyebrow">Taste Report · 내면의 초상</span>
          <h2>{result.title}</h2>
          <p>{result.summary}</p>
        </div>
        <div className="archetype-stamp">
          <span>archetype</span>
          <strong>{result.archetype}</strong>
        </div>
      </header>

      <div className="result-grid">
        <article className="card combined-card col-left">
          <section className="card-section tea-section">
            <div className="card-head">
              <Leaf aria-hidden />
              <span>오늘의 차</span>
            </div>
            <TeaPortrait index={selectedTeaIndex} tea={result.tea} />
            <div className="tea-meta">
              <h3>{result.tea.nameKo}</h3>
              <small className="card-meta">{result.tea.tone}</small>
            </div>
            <p className="card-body">{result.tea.tastingNote}</p>
            <div className="card-reason">
              <span className="reason-tag">왜 이 차인가</span>
              <p>{result.teaReason}</p>
            </div>
          </section>
          <section className="card-section ritual-section">
            <div className="card-head">
              <Sparkles aria-hidden />
              <span>오늘의 의식</span>
            </div>
            <p className="ritual-text">{result.ritual}</p>
          </section>
        </article>

        <article className="card combined-card col-center">
          <section className="card-section portrait-section">
            <div className="card-head">
              <Compass aria-hidden />
              <span>Inner Portrait</span>
            </div>
            <div className="portrait-keywords">
              <div className="keywords-head">마음의 키워드</div>
              <KeywordCloud keywords={result.keywords} />
            </div>
            <p className="portrait-body">{result.innerPortrait}</p>
            <p className="closing-line">{result.closingLine}</p>
          </section>
          <section className="card-section radar-section">
            <div className="card-head subtle">
              <span>취향 좌표</span>
            </div>
            <TasteRadar vector={result.tasteVector} />
          </section>
        </article>

        <article className="card combined-card col-right">
          <section className="card-section book-section">
            <div className="card-head">
              <BookOpen aria-hidden />
              <span>추천 시집</span>
            </div>
            <div className="book-hero">
              <BookIllustration book={result.book} />
              <div className="book-meta">
                <h3>{result.book.title}</h3>
                <small className="card-meta">
                  {result.book.author}
                  <br />
                  {result.book.publisher} · {result.book.year}
                </small>
              </div>
            </div>
            <p className="card-body">{result.bookReason}</p>
          </section>
          <section className="card-section poem-section">
            <div className="card-head">
              <Quote aria-hidden />
              <span>오늘의 시 · {result.poem.title}</span>
            </div>
            <div className="poem-lines">
              {result.poem.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="poem-reason">{result.poemReason}</p>
          </section>
        </article>
      </div>
    </section>
  );
}

function TeaPortrait({
  index,
  tea,
}: {
  index: number;
  tea: TeaProfile;
}) {
  return (
    <div
      className="tea-portrait"
      style={{ "--tea": tea.reportColor } as CSSProperties}
      title={tea.nameKo}
    >
      <span
        style={
          {
            backgroundImage: "url(/assets/tea-sprite.png)",
            backgroundPosition: `${index * 25}% 0%`,
          } as CSSProperties
        }
      />
    </div>
  );
}

function BookIllustration({ book }: { book: BookRecord }) {
  const index = Math.max(0, book.no - 1);
  const col = index % 10;
  const row = Math.floor(index / 10);

  return (
    <div className="book-illustration" title={book.title}>
      <span
        style={
          {
            backgroundImage: "url(/assets/book-symbols-sprite.png)",
            backgroundPosition: `${(col * 100) / 9}% ${(row * 100) / 4}%`,
          } as CSSProperties
        }
      />
    </div>
  );
}

function KeywordCloud({ keywords }: { keywords: KeywordTag[] }) {
  const sorted = useMemo(
    () => [...keywords].sort((a, b) => b.weight - a.weight),
    [keywords],
  );

  if (sorted.length === 0) return null;

  return (
    <div className="keyword-cloud" role="list">
      {sorted.map((keyword) => (
        <span
          key={keyword.text}
          className={`kw kw-w${keyword.weight}`}
          role="listitem"
        >
          {keyword.text}
        </span>
      ))}
    </div>
  );
}

function TasteRadar({ vector }: { vector: TasteVector }) {
  const dims = DIMENSIONS;
  const cx = 110;
  const cy = 105;
  const r = 78;
  const max = Math.max(1, ...Object.values(vector));

  const points = dims.map((dim, i) => {
    const angle = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
    const value = vector[dim] / max;
    return {
      dim,
      angle,
      value,
      x: cx + Math.cos(angle) * r * value,
      y: cy + Math.sin(angle) * r * value,
      lx: cx + Math.cos(angle) * (r + 17),
      ly: cy + Math.sin(angle) * (r + 17),
    };
  });

  const polygon = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 220 210" className="radar-svg" aria-hidden>
      {rings.map((ratio) => (
        <polygon
          key={ratio}
          className="radar-ring"
          points={dims
            .map((_, i) => {
              const a = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
              return `${(cx + Math.cos(a) * r * ratio).toFixed(1)},${(
                cy +
                Math.sin(a) * r * ratio
              ).toFixed(1)}`;
            })
            .join(" ")}
        />
      ))}
      {dims.map((dim, i) => {
        const a = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
        return (
          <line
            key={dim}
            className="radar-axis"
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(a) * r}
            y2={cy + Math.sin(a) * r}
          />
        );
      })}
      <polygon className="radar-fill" points={polygon} />
      <polygon className="radar-stroke" points={polygon} />
      {points.map((p) => (
        <circle
          key={`dot-${p.dim}`}
          className="radar-dot"
          cx={p.x}
          cy={p.y}
          r={2.6}
        />
      ))}
      {points.map((p) => (
        <text
          key={`lbl-${p.dim}`}
          className="radar-label"
          x={p.lx}
          y={p.ly}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {DIMENSION_LABELS[p.dim as TasteDimension]}
        </text>
      ))}
    </svg>
  );
}
