import { useMemo, useState } from "react";
import { createInspectionRound, type InspectionGameRound, type InspectionPart } from "../data/inspectionGame";
import { CandidateSvg } from "./CandidateDiagramView";
import { WiringDiagram } from "./svg/WiringDiagram";

type InspectionAnswers = Record<string, string>;

export function WorkInspectionGame() {
  const [round, setRound] = useState<InspectionGameRound>(() => createInspectionRound());
  const [selectedPartId, setSelectedPartId] = useState(() => round.parts[0].id);
  const [answers, setAnswers] = useState<InspectionAnswers>({});
  const [submitted, setSubmitted] = useState(false);

  const selectedPart = round.parts.find((part) => part.id === selectedPartId) ?? round.parts[0];
  const markedDefects = round.parts.filter((part) => {
    const answer = answers[part.id];
    return answer && answer !== "欠陥なし";
  });
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => round.parts.filter((part) => answers[part.id] === part.answer).length,
    [answers, round.parts],
  );

  function selectAnswer(answer: string) {
    if (submitted) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [selectedPart.id]: answer,
    }));
  }

  function restart() {
    const nextRound = createInspectionRound();
    setRound(nextRound);
    setAnswers({});
    setSubmitted(false);
    setSelectedPartId(nextRound.parts[0].id);
  }

  return (
    <section className="inspection-layout">
      <article className="problem-card inspection-overview">
        <div className="problem-meta">
          <span>候補問題 No.{round.candidate.no}</span>
          <span>
            回答 {answeredCount} / {round.parts.length}
          </span>
        </div>
        <h2>{round.title}</h2>
        <p className="candidate-theme">
          {round.candidate.title}から出題しています。欠陥は{round.defectCount}か所あります。
          毎回、候補問題と工作部分、欠陥内容がランダムに変わります。
        </p>
        <div className="diagram-wrap">
          <CandidateSvg
            answers={answers}
            diagram={round.candidate}
            inspectionParts={round.parts}
            onSelectPart={setSelectedPartId}
            selectedPartId={selectedPart.id}
            submitted={submitted}
          />
        </div>
        <DefectList markedDefects={markedDefects} />
      </article>

      <article className="problem-card inspection-question">
        <div className="problem-meta">
          <span>{selectedPart.location}</span>
          <span>{answers[selectedPart.id] ? "回答済み" : "未回答"}</span>
        </div>
        <h2>{selectedPart.title}</h2>
        <div className="diagram-wrap focused-diagram">
          <WiringDiagram defectType={selectedPart.defectType} />
        </div>
        <p className="question">{selectedPart.question}</p>
        <div className="choices" role="list">
          {selectedPart.choices.map((choice) => {
            const selected = answers[selectedPart.id] === choice;
            const correct = submitted && choice === selectedPart.answer;
            const wrong = submitted && selected && choice !== selectedPart.answer;
            return (
              <button
                className={[
                  "choice",
                  selected ? "selected" : "",
                  correct ? "correct" : "",
                  wrong ? "wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={submitted}
                key={choice}
                onClick={() => selectAnswer(choice)}
                type="button"
              >
                {choice}
              </button>
            );
          })}
        </div>

        {submitted ? (
          <InspectionResult answers={answers} correctCount={correctCount} onRestart={restart} parts={round.parts} />
        ) : (
          <button className="primary complete-button" onClick={() => setSubmitted(true)} type="button">
            完了して採点する
          </button>
        )}
      </article>
    </section>
  );
}

function DefectList({ markedDefects }: { markedDefects: InspectionPart[] }) {
  return (
    <div className="defect-list">
      <strong>欠陥ありとして選択した部分</strong>
      {markedDefects.length === 0 ? (
        <p>まだ欠陥ありにした部分はありません。</p>
      ) : (
        <ul>
          {markedDefects.map((part) => (
            <li key={part.id}>
              {part.title}: {part.location}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InspectionResult({
  answers,
  correctCount,
  onRestart,
  parts,
}: {
  answers: InspectionAnswers;
  correctCount: number;
  onRestart: () => void;
  parts: InspectionPart[];
}) {
  return (
    <div className="inspection-result">
      <h3>
        採点結果: {correctCount} / {parts.length}
      </h3>
      <ul>
        {parts.map((part) => {
          const answer = answers[part.id] ?? "未回答";
          const correct = answer === part.answer;
          return (
            <li className={correct ? "result-row correct-row" : "result-row wrong-row"} key={part.id}>
              <strong>{part.title}</strong>
              <span>回答: {answer}</span>
              <span>正解: {part.answer}</span>
              <p>{part.explanation}</p>
            </li>
          );
        })}
      </ul>
      <button className="primary" onClick={onRestart} type="button">
        もう一度チェックする
      </button>
    </div>
  );
}
