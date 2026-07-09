import type { Problem } from "../data/problems";
import { WiringDiagram } from "./svg/WiringDiagram";

type ProblemViewProps = {
  problem: Problem;
  index: number;
  total: number;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
  onNext: () => void;
};

export function ProblemView({
  problem,
  index,
  total,
  selectedAnswer,
  onAnswer,
  onNext,
}: ProblemViewProps) {
  const answered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === problem.answer;

  return (
    <section className="problem-card" aria-labelledby="problem-title">
      <div className="problem-meta">
        <span>
          問題 {index + 1} / {total}
        </span>
        <span>{problem.circuitName}</span>
      </div>
      <h2 id="problem-title">{problem.title}</h2>
      <div className="diagram-wrap">
        <WiringDiagram defectType={problem.defectType} />
      </div>
      <p className="question">{problem.question}</p>
      <div className="choices" role="list">
        {problem.choices.map((choice) => {
          const selected = selectedAnswer === choice;
          const correct = answered && choice === problem.answer;
          return (
            <button
              className={[
                "choice",
                selected ? "selected" : "",
                correct ? "correct" : "",
                answered && selected && !correct ? "wrong" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={answered}
              key={choice}
              onClick={() => onAnswer(choice)}
              type="button"
            >
              {choice}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={isCorrect ? "feedback correct-box" : "feedback wrong-box"}>
          <strong>{isCorrect ? "正解" : "不正解"}</strong>
          <p>正しい答え: {problem.answer}</p>
          <p>{problem.explanation}</p>
          <button className="primary" onClick={onNext} type="button">
            {index + 1 === total ? "結果を見る" : "次の問題へ"}
          </button>
        </div>
      )}
    </section>
  );
}
