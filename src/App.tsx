import { useMemo, useState } from "react";
import { ProblemView } from "./components/ProblemView";
import { ScoreView } from "./components/ScoreView";
import { problems } from "./data/problems";

const STORAGE_KEY = "denko-defect-game-best-score";

function getStoredBestScore() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? Number(stored) || 0 : 0;
}

export default function App() {
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
          <h1>欠陥判定トレーニング</h1>
        </div>
        <div className="score-pill" aria-label="現在のスコア">
          {correctCount} / {problems.length}
        </div>
      </header>

      {completed ? (
        <ScoreView
          bestScore={bestScore}
          correctCount={correctCount}
          onRestart={restart}
          total={problems.length}
        />
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
