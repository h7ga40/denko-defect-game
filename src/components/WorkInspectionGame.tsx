import { useMemo, useState } from "react";
import { createInspectionRound, type InspectionGameRound, type InspectionPart } from "../data/inspectionGame";
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
          <span>施工チェックゲーム</span>
          <span>
            回答 {answeredCount} / {round.parts.length}
          </span>
        </div>
        <h2>{round.title}</h2>
        <p className="candidate-theme">
          欠陥は{round.defectCount}か所あります。毎回、工作部分と欠陥内容がランダムに変わります。
        </p>
        <div className="diagram-wrap">
          <InspectionOverviewSvg
            answers={answers}
            onSelect={setSelectedPartId}
            parts={round.parts}
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

function InspectionOverviewSvg({
  answers,
  onSelect,
  parts,
  selectedPartId,
  submitted,
}: {
  answers: InspectionAnswers;
  onSelect: (partId: string) => void;
  parts: InspectionPart[];
  selectedPartId: string;
  submitted: boolean;
}) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="施工チェック用の全体複線図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="candidate-svg-title" x="360" y="48" textAnchor="middle">
        施工チェック用 複線図
      </text>

      <OverviewWire from={[115, 190]} to={[270, 120]} color="black" />
      <OverviewWire from={[270, 120]} to={[465, 110]} color="red" />
      <OverviewWire from={[465, 110]} to={[595, 150]} color="red" />
      <OverviewWire from={[115, 190]} to={[350, 255]} color="white" />
      <OverviewWire from={[350, 255]} to={[465, 110]} color="white" />
      <OverviewWire from={[350, 255]} to={[590, 288]} color="white" />
      <OverviewWire from={[160, 305]} to={[590, 288]} color="green" />
      <OverviewWire from={[350, 255]} to={[145, 278]} color="black" />

      <OverviewNode x={115} y={190} label="電源" type="power" />
      {parts.map((part) => (
        <OverviewNode
          key={part.id}
          x={part.x}
          y={part.y}
          label={part.overviewLabel}
          type={part.overviewType}
        />
      ))}
      <OverviewNode x={160} y={305} label="接地" type="ground" />

      {parts.map((part) => {
        const selected = part.id === selectedPartId;
        const answered = Boolean(answers[part.id]);
        const answerIsCorrect = answers[part.id] === part.answer;
        const className = [
          "hotspot",
          selected ? "selected" : "",
          answered ? "answered" : "",
          submitted && answerIsCorrect ? "correct" : "",
          submitted && answered && !answerIsCorrect ? "wrong" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <g key={part.id}>
            <rect
              aria-label={`${part.title}を選択`}
              className={className}
              height={part.hotspot.height}
              onClick={() => onSelect(part.id)}
              role="button"
              tabIndex={0}
              width={part.hotspot.width}
              x={part.hotspot.x}
              y={part.hotspot.y}
            />
            <text className="hotspot-label" x={part.hotspot.x + 12} y={part.hotspot.y + 22}>
              {answered ? "回答済" : "選択"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function OverviewWire({
  color,
  from,
  to,
}: {
  color: "black" | "white" | "red" | "green";
  from: [number, number];
  to: [number, number];
}) {
  return <path className={`candidate-wire ${color}`} d={`M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`} />;
}

function OverviewNode({
  label,
  type,
  x,
  y,
}: {
  label: string;
  type: "power" | "switch" | "lamp" | "connector" | "box" | "receptacle" | "ground" | "device";
  x: number;
  y: number;
}) {
  if (type === "lamp") {
    return (
      <g>
        <circle className="candidate-device lamp" cx={x} cy={y} r="30" />
        <line className="device-mark" x1={x - 16} y1={y - 16} x2={x + 16} y2={y + 16} />
        <line className="device-mark" x1={x + 16} y1={y - 16} x2={x - 16} y2={y + 16} />
        <text className="candidate-label small-label" x={x} y={y + 50} textAnchor="middle">
          {label}
        </text>
      </g>
    );
  }

  if (type === "connector") {
    return (
      <g>
        <circle className="candidate-connector" cx={x} cy={y} r="19" />
        <text className="candidate-label small-label" x={x} y={y + 40} textAnchor="middle">
          {label}
        </text>
      </g>
    );
  }

  return (
    <g>
      <rect className={`candidate-device ${type}`} x={x - 42} y={y - 30} width="84" height="60" rx="8" />
      <text className="candidate-label small-label" x={x} y={y + 5} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}
