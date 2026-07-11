import { useMemo, useState } from "react";
import { CandidateDiagramView } from "./components/CandidateDiagramView";
import { ProblemView } from "./components/ProblemView";
import { ScoreView } from "./components/ScoreView";
import { WorkInspectionGame } from "./components/WorkInspectionGame";
import { problems } from "./data/problems";

const STORAGE_KEY = "denko-defect-game-best-score";

function getStoredBestScore() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? Number(stored) || 0 : 0;
}

export default function App() {
  const [mode, setMode] = useState<"quiz" | "diagrams" | "inspection">("inspection");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [bestScore, setBestScore] = useState(getStoredBestScore);

  const currentProblem = problems[currentIndex];
  const correctCount = useMemo(
    () => answers.filter((answer, index) => answer === problems[index].answer).length,
    [answers],
  );
  const completed = currentIndex >= problems.length;

  function handleAnswer(answer: string) {
    setSelectedAnswer(answer);
    setAnswers((previous) => [...previous, answer]);
  }

  function handleNext() {
    const nextIndex = currentIndex + 1;
    const nextCompleted = nextIndex >= problems.length;

    if (nextCompleted) {
      const totalScore = answers.filter((answer, index) => answer === problems[index].answer).length;
      const nextBest = Math.max(bestScore, totalScore);
      setBestScore(nextBest);
      window.localStorage.setItem(STORAGE_KEY, String(nextBest));
    }

    setCurrentIndex(nextIndex);
    setSelectedAnswer(null);
  }

  function restart() {
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">第二種電気工事士 技能試験</p>
          <h1>
            {mode === "quiz" && "欠陥判定トレーニング"}
            {mode === "diagrams" && "候補問題 複線図"}
            {mode === "inspection" && "施工チェックゲーム"}
          </h1>
        </div>
        {mode === "quiz" && (
          <div className="score-pill" aria-label="現在のスコア">
            {correctCount} / {problems.length}
          </div>
        )}
      </header>

      <nav className="mode-switch" aria-label="学習モード">
        <button
          className={mode === "inspection" ? "mode-button selected" : "mode-button"}
          onClick={() => setMode("inspection")}
          type="button"
        >
          施工チェック
        </button>
        <button
          className={mode === "diagrams" ? "mode-button selected" : "mode-button"}
          onClick={() => setMode("diagrams")}
          type="button"
        >
          複線図
        </button>
        <button
          className={mode === "quiz" ? "mode-button selected" : "mode-button"}
          onClick={() => setMode("quiz")}
          type="button"
        >
          欠陥判定
        </button>
      </nav>

      {mode === "inspection" ? (
        <WorkInspectionGame />
      ) : mode === "diagrams" ? (
        <CandidateDiagramView />
      ) : completed ? (
        <ScoreView bestScore={bestScore} correctCount={correctCount} onRestart={restart} total={problems.length} />
      ) : (
        <ProblemView
          index={currentIndex}
          onAnswer={handleAnswer}
          onNext={handleNext}
          problem={currentProblem}
          selectedAnswer={selectedAnswer}
          total={problems.length}
        />
      )}

      <footer className="notice">
        このアプリは練習用の簡略教材です。実際の欠陥判定は試験センター等の公開資料で確認してください。
      </footer>
    </main>
  );
}
