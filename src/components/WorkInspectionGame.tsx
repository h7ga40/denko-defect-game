import { useMemo, useState } from "react";
import { createBoxInspectionRound, type BoxInspectionPart, type BoxInspectionRound } from "../data/boxInspectionGame";
import { BoxWiringDiagram } from "./BoxWiringDiagram";
import { CandidateSvg } from "./CandidateDiagramView";

type InspectionAnswers = Record<string, string>;

export function WorkInspectionGame() {
  const [round, setRound] = useState<BoxInspectionRound>(() => createBoxInspectionRound());
  const [selectedBoxId, setSelectedBoxId] = useState(() => round.boxes[0].id);
  const [selectedPartId, setSelectedPartId] = useState(() => round.boxes[0].parts[0].id);
  const [answers, setAnswers] = useState<InspectionAnswers>({});
  const [submitted, setSubmitted] = useState(false);

  const selectedBox = round.boxes.find((box) => box.id === selectedBoxId) ?? round.boxes[0];
  const selectedPart = selectedBox.parts.find((part) => part.id === selectedPartId) ?? selectedBox.parts[0];
  const answeredCount = Object.keys(answers).length;
  const markedDefects = round.parts.filter((part) => answers[part.id] && answers[part.id] !== "欠陥なし");
  const correctCount = useMemo(() => round.parts.filter((part) => answers[part.id] === part.answer).length, [answers, round.parts]);

  function selectBox(boxId: string) {
    const box = round.boxes.find((item) => item.id === boxId);
    if (!box) return;
    setSelectedBoxId(boxId);
    setSelectedPartId(box.parts[0].id);
  }

  function selectAnswer(answer: string) {
    if (submitted) return;
    setAnswers((previous) => ({ ...previous, [selectedPart.id]: answer }));
  }

  function restart() {
    const nextRound = createBoxInspectionRound();
    setRound(nextRound);
    setSelectedBoxId(nextRound.boxes[0].id);
    setSelectedPartId(nextRound.boxes[0].parts[0].id);
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <section className="inspection-layout">
      <article className="problem-card inspection-overview">
        <div className="problem-meta">
          <span>候補問題 No.{round.candidate.no}</span>
          <span>回答 {answeredCount} / {round.parts.length}</span>
        </div>
        <h2>{round.title}</h2>
        <p className="candidate-theme">
          複線図からジョイントボックスまたはアウトレットボックスを選び、ボックス内の接続部を判定します。欠陥は{round.defectCount}か所です。
        </p>
        <div className="diagram-wrap">
          <CandidateSvg
            answers={answers}
            diagram={round.candidate}
            inspectionBoxes={round.boxes}
            onSelectBox={selectBox}
            selectedBoxId={selectedBox.id}
            submitted={submitted}
          />
        </div>
        <DefectList markedDefects={markedDefects} />
      </article>

      <article className="problem-card inspection-question">
        <div className="problem-meta">
          <span>{selectedBox.location}</span>
          <span>{answers[selectedPart.id] ? "回答済み" : "未回答"}</span>
        </div>
        <h2>{selectedBox.label}</h2>
        <div className="diagram-wrap focused-diagram">
          <BoxWiringDiagram
            answers={answers}
            box={selectedBox}
            onSelectPart={setSelectedPartId}
            selectedPartId={selectedPart.id}
            submitted={submitted}
          />
        </div>
        <h3 className="connection-title">{selectedPart.title}</h3>
        <p className="question">{selectedPart.question}</p>
        <div className="choices" role="list">
          {selectedPart.choices.map((choice) => {
            const selected = answers[selectedPart.id] === choice;
            const correct = submitted && choice === selectedPart.answer;
            const wrong = submitted && selected && choice !== selectedPart.answer;
            return (
              <button className={["choice", selected ? "selected" : "", correct ? "correct" : "", wrong ? "wrong" : ""].filter(Boolean).join(" ")} disabled={submitted} key={choice} onClick={() => selectAnswer(choice)} type="button">
                {choice}
              </button>
            );
          })}
        </div>
        {submitted ? <InspectionResult answers={answers} correctCount={correctCount} onRestart={restart} parts={round.parts} /> : (
          <button className="primary complete-button" onClick={() => setSubmitted(true)} type="button">完了して採点する</button>
        )}
      </article>
    </section>
  );
}

function DefectList({ markedDefects }: { markedDefects: BoxInspectionPart[] }) {
  return <div className="defect-list"><strong>欠陥ありとして選択した接続部</strong>{markedDefects.length === 0 ? <p>まだ欠陥ありにした接続部はありません。</p> : <ul>{markedDefects.map((part) => <li key={part.id}>{part.location}: {part.title}</li>)}</ul>}</div>;
}

function InspectionResult({ answers, correctCount, onRestart, parts }: { answers: InspectionAnswers; correctCount: number; onRestart: () => void; parts: BoxInspectionPart[] }) {
  return (
    <div className="inspection-result">
      <h3>採点結果: {correctCount} / {parts.length}</h3>
      <ul>{parts.map((part) => {
        const answer = answers[part.id] ?? "未回答";
        const correct = answer === part.answer;
        return <li className={correct ? "result-row correct-row" : "result-row wrong-row"} key={part.id}><strong>{part.location}: {part.title}</strong><span>回答: {answer}</span><span>正解: {part.answer}</span><p>{part.explanation}</p></li>;
      })}</ul>
      <button className="primary" onClick={onRestart} type="button">もう一度チェックする</button>
    </div>
  );
}
