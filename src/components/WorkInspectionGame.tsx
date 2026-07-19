import { useMemo, useState } from "react";
import { createBoxInspectionRound, type BoxInspectionPart, type BoxInspectionRound, type DirectInspectionPart } from "../data/boxInspectionGame";
import { BoxWiringDiagram } from "./BoxWiringDiagram";
import { CandidateSvg } from "./CandidateDiagramView";
import { CandidateMaterials } from "./CandidateMaterials";
import { DeviceDetailShape } from "./svg/DeviceDetailShape";
import { DirectionalSheath, DirectionalWire } from "./svg/DirectionalCable";
import { WiringDiagram } from "./svg/WiringDiagram";
import { MetalConduitDiagram } from "./svg/diagrams/MetalConduitDiagram";
import { MountingFrameDiagram } from "./svg/diagrams/MountingFrameDiagram";
import { OutletBoxAccessoryDiagram } from "./svg/diagrams/OutletBoxAccessoryDiagram";
import { PfConduitDiagram } from "./svg/diagrams/PfConduitDiagram";
import { TerminalBlockDiagram } from "./svg/diagrams/TerminalBlockDiagram";

type InspectionAnswers = Record<string, string>;

export function WorkInspectionGame({ candidateNo, seed }: { candidateNo?: number; seed?: string }) {
  const [round, setRound] = useState<BoxInspectionRound>(() => createBoxInspectionRound({ candidateNo, seed }));
  const [selectedBoxId, setSelectedBoxId] = useState(() => round.boxes[0].id);
  const [selectedPartId, setSelectedPartId] = useState(() => round.boxes[0].parts[0].id);
  const [selectedDirectPartId, setSelectedDirectPartId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<InspectionAnswers>({});
  const [submitted, setSubmitted] = useState(false);

  const selectedBox = round.boxes.find((box) => box.id === selectedBoxId) ?? round.boxes[0];
  const selectedDirectPart = round.directParts.find((part) => part.id === selectedDirectPartId);
  const selectedPart = selectedDirectPart ?? selectedBox.parts.find((part) => part.id === selectedPartId) ?? selectedBox.parts[0];
  const selectedFrameId = selectedDirectPart?.parentMountingFrameId ?? selectedDirectPart?.mountingFrame?.id;
  const selectedFrameParts = selectedFrameId
    ? round.directParts.filter((part) => part.mountingFrame?.id === selectedFrameId || part.parentMountingFrameId === selectedFrameId)
    : [];
  const infrastructurePart = !selectedDirectPart && "connection" in selectedPart && !["ring_sleeve", "push_connector"].includes(selectedPart.connection.method)
    ? selectedPart
    : undefined;
  const answeredCount = Object.keys(answers).length;
  const markedDefects = round.parts.filter((part) => answers[part.id] && answers[part.id] !== "欠陥なし");
  const correctCount = useMemo(() => round.parts.filter((part) => answers[part.id] === part.answer).length, [answers, round.parts]);

  function selectBox(boxId: string) {
    const box = round.boxes.find((item) => item.id === boxId);
    if (!box) return;
    setSelectedBoxId(boxId);
    setSelectedDirectPartId(null);
    setSelectedPartId(box.parts[0].id);
  }

  function selectDirectPart(partId: string) {
    setSelectedDirectPartId(partId);
  }

  function selectAnswer(answer: string) {
    if (submitted) return;
    setAnswers((previous) => ({ ...previous, [selectedPart.id]: answer }));
  }

  function restart() {
    const nextRound = createBoxInspectionRound({ candidateNo, seed });
    setRound(nextRound);
    setSelectedBoxId(nextRound.boxes[0].id);
    setSelectedPartId(nextRound.boxes[0].parts[0].id);
    setSelectedDirectPartId(null);
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <section className="inspection-layout">
      <article className="problem-card inspection-overview">
        <div className="problem-meta">
          <span>候補問題 No.{round.candidate.no}</span>
          {round.seed && <span title={round.seed}>シード {round.seed.length > 20 ? round.seed.slice(0, 20) + "…" : round.seed}</span>}
          <span>回答 {answeredCount} / {round.parts.length}</span>
        </div>
        <h2>{round.title}</h2>
        <p className="candidate-theme">
          ランプ・スイッチ・コンセントなどは複線図から直接選択し、リングスリーブと差込形コネクタはボックス内で選択します。欠陥は{round.defectCount}か所です。
        </p>
        <CandidateMaterials candidateNo={round.candidate.no} />
        <div className="diagram-wrap">
          <CandidateSvg
            answers={answers}
            diagram={round.candidate}
            directParts={round.directParts}
            inspectionBoxes={round.boxes}
            onSelectBox={selectBox}
            onSelectDirectPart={selectDirectPart}
            selectedBoxId={selectedDirectPart ? undefined : selectedBox.id}
            selectedDirectPartId={selectedDirectPart?.id}
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
        <h2>{selectedDirectPart ? selectedPart.title : selectedBox.label}</h2>
        <div className="diagram-wrap focused-diagram">
          {selectedDirectPart ? (
            <DirectDeviceDiagram part={selectedDirectPart} />
          ) : infrastructurePart ? (
            <InfrastructureDiagram part={infrastructurePart} />
          ) : (
            <BoxWiringDiagram
              answers={answers}
              box={selectedBox}
              onSelectPart={setSelectedPartId}
              selectedPartId={selectedPart.id}
              submitted={submitted}
            />
          )}
        </div>
        {selectedDirectPart && selectedFrameParts.length > 1 && (
          <DirectPartSelector
            answers={answers}
            onSelectPart={selectDirectPart}
            parts={selectedFrameParts}
            selectedPartId={selectedDirectPart.id}
          />
        )}
        {!selectedDirectPart && (
          <>
            <BoxPartSelector answers={answers} box={selectedBox} onSelectPart={setSelectedPartId} selectedPartId={selectedPart.id} />
            <h3 className="connection-title">{selectedPart.title}</h3>
          </>
        )}
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

function DirectPartSelector({
  answers,
  onSelectPart,
  parts,
  selectedPartId,
}: {
  answers: InspectionAnswers;
  onSelectPart: (partId: string) => void;
  parts: DirectInspectionPart[];
  selectedPartId: string;
}) {
  return (
    <div className="box-part-selector" aria-label="埋込連用取付枠の点検部">
      {parts.map((part) => (
        <button
          className={["box-part-button", part.id === selectedPartId ? "selected" : "", answers[part.id] ? "answered" : ""].filter(Boolean).join(" ")}
          key={part.id}
          onClick={() => onSelectPart(part.id)}
          type="button"
        >
          {part.mountingFrame ? "取付枠" : part.mountingFrameMember?.label ?? part.title}
        </button>
      ))}
    </div>
  );
}

function DefectList({ markedDefects }: { markedDefects: Array<BoxInspectionPart | DirectInspectionPart> }) {
  return <div className="defect-list"><strong>欠陥ありとして選択した接続部</strong>{markedDefects.length === 0 ? <p>まだ欠陥ありにした接続部はありません。</p> : <ul>{markedDefects.map((part) => <li key={part.id}>{part.location}: {part.title}</li>)}</ul>}</div>;
}

function InspectionResult({ answers, correctCount, onRestart, parts }: { answers: InspectionAnswers; correctCount: number; onRestart: () => void; parts: Array<BoxInspectionPart | DirectInspectionPart> }) {
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

function BoxPartSelector({
  answers,
  box,
  onSelectPart,
  selectedPartId,
}: {
  answers: InspectionAnswers;
  box: BoxInspectionRound["boxes"][number];
  onSelectPart: (partId: string) => void;
  selectedPartId: string;
}) {
  return (
    <div className="box-part-selector" aria-label="ボックス内の点検部">
      {box.parts.map((part) => (
        <button
          className={["box-part-button", part.id === selectedPartId ? "selected" : "", answers[part.id] ? "answered" : ""].filter(Boolean).join(" ")}
          key={part.id}
          onClick={() => onSelectPart(part.id)}
          type="button"
        >
          {part.title.split("（")[0]}
        </button>
      ))}
    </div>
  );
}

function InfrastructureDiagram({ part }: { part: BoxInspectionPart }) {
  if (part.connection.method === "metal_conduit") {
    return <MetalConduitDiagram defectType={part.defectType} />;
  }
  if (part.connection.method === "pf_conduit") {
    return <PfConduitDiagram defectType={part.defectType} />;
  }
  return <OutletBoxAccessoryDiagram defectType={part.defectType} />;
}
function DirectDeviceDiagram({ part }: { part: DirectInspectionPart }) {
  if (part.mountingFrame) {
    return <MountingFrameDiagram defectType={part.defectType} frame={part.mountingFrame} />;
  }
  if (part.deviceVariant === "terminal_block" || part.deviceVariant === "timer_switch" || part.deviceVariant === "automatic_switch") {
    return (
      <TerminalBlockDiagram
        defect={part.defectType !== "none"}
        terminalBlock={part.terminalBlock}
        terminalConnections={part.terminalConnections}
        title={part.title}
        variant={part.deviceVariant}
      />
    );
  }
  if (part.defectType !== "none") {
    return <WiringDiagram cableEntrySide={part.cableEntrySide} defectType={part.defectType} deviceName={part.title} deviceVariant={part.deviceVariant} />;
  }

  const inlineDevice = part.deviceVariant === "circuit_breaker"
    || part.deviceVariant === "earth_leakage_breaker";
  const horizontal = part.cableEntrySide === "left" || part.cableEntrySide === "right";
  const targetX = part.cableEntrySide === "left" ? 296 : part.cableEntrySide === "right" ? 424 : 360;
  const targetY = part.cableEntrySide === "top" ? 112 : part.cableEntrySide === "bottom" ? 268 : 190;

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={part.title + "の施工図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="55" textAnchor="middle">{part.title}</text>
      {inlineDevice ? (
        <>
          <path className="wire black" d="M 72 170 C 160 170, 225 170, 296 170" />
          <path className="wire white" d="M 72 210 C 160 210, 225 210, 296 210" />
          <path className="wire black" d="M 424 170 C 495 170, 560 170, 648 170" />
          <path className="wire white" d="M 424 210 C 495 210, 560 210, 648 210" />
        </>
      ) : (
        <>
          <DirectionalSheath side={part.cableEntrySide} />
          <DirectionalWire
            className="wire black"
            lane={-20}
            side={part.cableEntrySide}
            targetX={targetX + (horizontal ? 0 : -20)}
            targetY={targetY + (horizontal ? -20 : 0)}
          />
          <DirectionalWire
            className="wire white"
            lane={20}
            side={part.cableEntrySide}
            targetX={targetX + (horizontal ? 0 : 20)}
            targetY={targetY + (horizontal ? 20 : 0)}
          />
        </>
      )}
      <DeviceDetailShape variant={part.deviceVariant} x={360} y={190} />
      <text className="small" x="360" y={part.cableEntrySide === "bottom" ? 88 : 314} textAnchor="middle">正常施工</text>
    </svg>
  );
}
