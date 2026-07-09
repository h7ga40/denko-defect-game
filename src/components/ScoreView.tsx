import type { CSSProperties } from "react";

type ScoreViewProps = {
  correctCount: number;
  total: number;
  bestScore: number;
  onRestart: () => void;
};

export function ScoreView({ correctCount, total, bestScore, onRestart }: ScoreViewProps) {
  const rate = Math.round((correctCount / total) * 100);

  return (
    <section className="score-card" aria-labelledby="score-title">
      <p className="eyebrow">結果</p>
      <h2 id="score-title">
        {correctCount} / {total} 問正解
      </h2>
      <div className="score-ring" style={{ "--rate": `${rate}%` } as CSSProperties}>
        <span>{rate}%</span>
      </div>
      <p className="score-copy">
        最高記録: {bestScore} / {total} 問。解説を見直して、欠陥名と図の特徴を結びつけて覚えましょう。
      </p>
      <button className="primary" onClick={onRestart} type="button">
        もう一度練習する
      </button>
    </section>
  );
}
