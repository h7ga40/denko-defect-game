import { useState } from "react";
import { createBoxInspectionRound, type BoxInspectionPart, type BoxInspectionRound, type CableInspectionPart, type DirectInspectionPart, type InspectionBox, type InspectionPart, type InspectionUnit } from "../data/boxInspectionGame";
import { createPhysicalInspectionSession, toExpectedPhysicalInspection, type PhysicalInspectionSession } from "../data/physicalInspection";
import { BoxWiringDiagram } from "./BoxWiringDiagram";
import { ConnectionDetailDiagram } from "./svg/ConnectionDetailDiagram";
import { CableInspectionDiagram } from "./svg/CableInspectionDiagram";
import { CandidateSvg } from "./CandidateDiagramView";
import { ConstructionReferencePanel } from "./ConstructionReferencePanel";
import { PhysicalInspectionControls } from "./PhysicalInspectionControls";
import { PhysicalInspectionView } from "./PhysicalInspectionView";
import { DeviceDetailShape } from "./svg/DeviceDetailShape";
import { DirectionalSheath, DirectionalWire } from "./svg/DirectionalCable";
import { WiringDiagram } from "./svg/WiringDiagram";
import { MetalConduitDiagram } from "./svg/diagrams/MetalConduitDiagram";
import { MountingFrameDiagram } from "./svg/diagrams/MountingFrameDiagram";
import { OutletBoxAccessoryDiagram } from "./svg/diagrams/OutletBoxAccessoryDiagram";
import { PfConduitDiagram } from "./svg/diagrams/PfConduitDiagram";
import { TerminalBlockDiagram } from "./svg/diagrams/TerminalBlockDiagram";

type InspectionAnswers = Record<string, string>;
type InspectionStage = "overview" | "assembly" | "defect";

export function WorkInspectionGame({ candidateNo, seed }: { candidateNo?: number; seed?: string }) {
  const [round, setRound] = useState<BoxInspectionRound>(() => createBoxInspectionRound({ candidateNo, seed }));
  const [selectedUnitId, setSelectedUnitId] = useState(() => round.units[0].id);
  const [selectedPartId, setSelectedPartId] = useState(() => round.units[0].parts[0].id);
  const [stage, setStage] = useState<InspectionStage>("overview");
  const [answers, setAnswers] = useState<InspectionAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [inspectionSessions, setInspectionSessions] = useState<Record<string, PhysicalInspectionSession>>({});

  const parts = round.units.reduce<InspectionPart[]>((result, unit) => {
    result.push(...unit.parts as InspectionPart[]);
    return result;
  }, []);
  const inspectionBoxes = round.units.filter((unit) => unit.kind === "box").map((unit) => unit.box);
  const directParts = round.units.reduce<DirectInspectionPart[]>((result, unit) => {
    if (unit.kind === "direct_device" || unit.kind === "mounting_frame") result.push(...unit.parts);
    return result;
  }, []);
  const cableParts = round.units.flatMap((unit) => unit.kind === "cable" ? unit.parts : []);
  const selectedUnit = round.units.find((unit) => unit.id === selectedUnitId) ?? round.units[0];
  const selectedPart = selectedUnit.parts.find((part) => part.id === selectedPartId) ?? selectedUnit.parts[0];
  const selectedBox = selectedUnit.kind === "box" ? selectedUnit.box : undefined;
  const selectedDirectPart = selectedUnit.kind === "direct_device" || selectedUnit.kind === "mounting_frame"
    ? selectedPart as DirectInspectionPart
    : undefined;
  const selectedCablePart = selectedUnit.kind === "cable" ? selectedPart as CableInspectionPart : undefined;
  const infrastructurePart = selectedBox && "connection" in selectedPart && !["ring_sleeve", "push_connector"].includes(selectedPart.connection.method)
    ? selectedPart
    : undefined;
  const inspectionSession = inspectionSessions[selectedPart.id] ?? createPhysicalInspectionSession();
  const latestObservation = inspectionSession.observations.at(-1);
  const answeredCount = Object.keys(answers).length;
  const markedDefects = parts.filter((part) => answers[part.id] && answers[part.id] !== "欠陥なし");
  const correctCount = parts.filter((part) => answers[part.id] === part.answer).length;

  function selectBox(boxId: string) {
    const unit = round.units.find((item) => item.kind === "box" && item.box.id === boxId);
    if (!unit) return;
    setSelectedUnitId(unit.id);
    setSelectedPartId(unit.parts[0].id);
    setStage("assembly");
  }

  function selectUnit(unit: InspectionUnit) {
    setSelectedUnitId(unit.id);
    setSelectedPartId(unit.parts[0].id);
    setStage(unit.kind === "direct_device" || unit.kind === "cable" ? "defect" : "assembly");
  }

  function selectDirectPart(partId: string) {
    const unit = round.units.find((item) => item.kind !== "box" && item.parts.some((part) => part.id === partId));
    if (!unit) return;
    setSelectedUnitId(unit.id);
    setSelectedPartId(unit.kind === "mounting_frame" ? unit.parts[0].id : partId);
    setStage(unit.kind === "mounting_frame" ? "assembly" : "defect");
  }

  function selectCablePart(partId: string) {
    const unit = round.units.find((item) => item.kind === "cable" && item.parts.some((part) => part.id === partId));
    if (!unit) return;
    setSelectedUnitId(unit.id);
    setSelectedPartId(partId);
    setStage("defect");
  }

  function openInspectionPart(partId: string) {
    setSelectedPartId(partId);
    setStage("defect");
  }

  function selectAnswer(answer: string) {
    if (submitted) return;
    setAnswers((previous) => ({ ...previous, [selectedPart.id]: answer }));
  }

  function updateInspectionSession(session: PhysicalInspectionSession) {
    setInspectionSessions((previous) => ({ ...previous, [selectedPart.id]: session }));
  }

  function restart() {
    const nextRound = createBoxInspectionRound({ candidateNo, seed });
    setRound(nextRound);
    setSelectedUnitId(nextRound.units[0].id);
    setSelectedPartId(nextRound.units[0].parts[0].id);
    setStage("overview");
    setAnswers({});
    setSubmitted(false);
    setInspectionSessions({});
  }

  const visualTitle = stage === "overview" ? round.title : stage === "assembly" ? selectedUnit.label : selectedPart.title;

  return (
    <section className="inspection-layout">
      <article className="problem-card inspection-visual">
        <div className="problem-meta">
          <span>候補問題 No.{round.candidate.no}</span>
        </div>
        <InspectionBreadcrumb
          onAssembly={() => setStage("assembly")}
          onOverview={() => setStage("overview")}
          part={selectedPart}
          stage={stage}
          unit={selectedUnit}
        />
        <h2>{visualTitle}</h2>
        {stage === "overview" && <p className="candidate-theme">{round.candidate.theme}</p>}
        <div className="diagram-wrap inspection-visual-diagram">
          {stage === "overview" ? (
            <CandidateSvg
              answers={answers}
              cableParts={cableParts}
              diagram={round.candidate}
              directParts={directParts}
              inspectionBoxes={inspectionBoxes}
              onSelectBox={selectBox}
              onSelectCablePart={selectCablePart}
              onSelectDirectPart={selectDirectPart}
              submitted={submitted}
            />
          ) : stage === "assembly" ? (
            selectedUnit.kind === "box" ? (
              <BoxWiringDiagram answers={answers} box={selectedUnit.assemblyBox} onSelectPart={openInspectionPart} selectedPartId="" submitted={submitted} />
            ) : selectedUnit.kind === "mounting_frame" ? (
              <MountingFrameDiagram defectType="none" frame={selectedUnit.mountingFrame} />
            ) : selectedDirectPart ? (
              <DirectDeviceDiagram part={{
                ...selectedDirectPart,
                defectType: "none",
                physicalInspection: toExpectedPhysicalInspection(selectedDirectPart.physicalInspection),
              }} />
            ) : null
          ) : (
            <PhysicalInspectionView
              latestObservation={latestObservation}
              part={selectedPart as InspectionPart}
              viewpoint={inspectionSession.viewpoint}
            >
              {selectedCablePart ? (
                <CableInspectionDiagram part={selectedCablePart} />
              ) : selectedDirectPart ? (
                <DirectDeviceDiagram part={selectedDirectPart} />
              ) : infrastructurePart ? (
                <InfrastructureDiagram part={infrastructurePart} />
              ) : (
                <ConnectionDetailDiagram part={selectedPart as BoxInspectionPart} />
              )}
            </PhysicalInspectionView>
          )}
        </div>
        <ConstructionReferencePanel candidateNo={round.candidate.no} conditions={round.candidate.constructionConditions} />
      </article>

      <article className="problem-card inspection-controls">
        <div className="problem-meta">
          <span>回答 {answeredCount} / {parts.length}</span>
        </div>
        {round.seed && <p className="inspection-seed" title={round.seed}>シード {round.seed.length > 24 ? round.seed.slice(0, 24) + "…" : round.seed}</p>}
        {stage === "overview" ? (
          <>
            <h2>工作部分を選択</h2>
            <p className="control-summary">ボックスと埋込連用取付枠は正常組立図へ進み、単独器具は欠陥判定図へ進みます。</p>
            <InspectionUnitSelector answers={answers} onSelect={selectUnit} units={round.units} />
          </>
        ) : stage === "assembly" ? (
          <>
            <h2>点検対象を選択</h2>
            <p className="control-summary">{selectedUnit.location}</p>
            <button className="inspection-back-button" onClick={() => setStage("overview")} type="button">複線図に戻る</button>
            {selectedUnit.kind === "box" && (
              <BoxPartSelector answers={answers} box={selectedUnit.assemblyBox} onSelectPart={openInspectionPart} selectedPartId="" />
            )}
            {selectedUnit.kind === "mounting_frame" && (
              <DirectPartSelector answers={answers} onSelectPart={openInspectionPart} parts={selectedUnit.parts} selectedPartId="" />
            )}
          </>
        ) : (
          <>
            <h2>{selectedPart.title}</h2>
            <p className="control-summary">{selectedPart.location}・{answers[selectedPart.id] ? "回答済み" : "未回答"}</p>
            <button className="inspection-back-button" onClick={() => setStage(selectedUnit.kind === "direct_device" || selectedUnit.kind === "cable" ? "overview" : "assembly")} type="button">
              {selectedUnit.kind === "direct_device" || selectedUnit.kind === "cable" ? "複線図に戻る" : "工作部分の組立図に戻る"}
            </button>
            <PhysicalInspectionControls
              model={selectedPart.physicalInspection}
              onChange={updateInspectionSession}
              session={inspectionSession}
            />
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
          </>
        )}
        <DefectList markedDefects={markedDefects} />
        {submitted ? <InspectionResult answers={answers} correctCount={correctCount} onRestart={restart} parts={parts} /> : (
          <button className="primary complete-button" onClick={() => setSubmitted(true)} type="button">完了して採点する</button>
        )}
      </article>
    </section>
  );
}

function InspectionBreadcrumb({
  onAssembly,
  onOverview,
  part,
  stage,
  unit,
}: {
  onAssembly: () => void;
  onOverview: () => void;
  part: InspectionPart;
  stage: InspectionStage;
  unit: InspectionUnit;
}) {
  const partLabel = "connection" in part ? part.title.split("（")[0].trim() : part.title;
  return (
    <nav className="inspection-breadcrumb" aria-label="施工チェックの現在位置">
      {stage === "overview" ? (
        <span aria-current="page">複線図</span>
      ) : (
        <button onClick={onOverview} type="button">複線図</button>
      )}
      {stage !== "overview" && <span className="breadcrumb-separator" aria-hidden="true">›</span>}
      {stage === "assembly" && <span aria-current="page">{unit.label}</span>}
      {stage === "defect" && (unit.kind === "direct_device" || unit.kind === "cable") && <span aria-current="page">{partLabel}</span>}
      {stage === "defect" && unit.kind !== "direct_device" && unit.kind !== "cable" && (
        <>
          <button onClick={onAssembly} type="button">{unit.label}</button>
          <span className="breadcrumb-separator" aria-hidden="true">›</span>
          <span aria-current="page">{partLabel}</span>
        </>
      )}
    </nav>
  );
}

function InspectionUnitSelector({
  answers,
  onSelect,
  units,
}: {
  answers: InspectionAnswers;
  onSelect: (unit: InspectionUnit) => void;
  units: InspectionUnit[];
}) {
  return (
    <div className="inspection-unit-selector" aria-label="工作部分一覧">
      {units.map((unit) => {
        const answered = unit.parts.filter((part) => answers[part.id]).length;
        const kindLabel = unit.kind === "box" ? "配線" : unit.kind === "mounting_frame" ? "配置" : unit.kind === "cable" ? "ケーブル" : "器具";
        return (
          <button className="inspection-unit-button" key={unit.id} onClick={() => onSelect(unit)} type="button">
            <span className="inspection-unit-kind">{kindLabel}</span>
            <strong>{unit.label}</strong>
            <span>{answered} / {unit.parts.length}</span>
          </button>
        );
      })}
    </div>
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

function DefectList({ markedDefects }: { markedDefects: InspectionPart[] }) {
  return <div className="defect-list"><strong>欠陥ありとして選択した接続部</strong>{markedDefects.length === 0 ? <p>まだ欠陥ありにした接続部はありません。</p> : <ul>{markedDefects.map((part) => <li key={part.id}>{part.location}: {part.title}</li>)}</ul>}</div>;
}

function InspectionResult({ answers, correctCount, onRestart, parts }: { answers: InspectionAnswers; correctCount: number; onRestart: () => void; parts: InspectionPart[] }) {
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
  box: InspectionBox;
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
export function DirectDeviceDiagram({ part }: { part: DirectInspectionPart }) {
  if (part.mountingFrame) {
    return <MountingFrameDiagram defectType={part.defectType} frame={part.mountingFrame} />;
  }
  if (part.deviceVariant === "terminal_block" || part.deviceVariant === "timer_switch" || part.deviceVariant === "automatic_switch") {
    return (
      <TerminalBlockDiagram
        defect={part.defectType === "terminal_block_wrong_terminal"}
        terminalBlock={part.terminalBlock}
        terminalConnections={part.terminalConnections}
        title={part.title}
        variant={part.deviceVariant}
      />
    );
  }
  const physicalOnlyDefect = part.defectType === "push_in_retention_failure"
    || (part.defectType === "terminal_screw_loose" && part.deviceVariant !== "lamp_receptacle");
  if (part.deviceVariant === "ceiling_connector" || part.deviceVariant === "lamp_receptacle" || part.deviceVariant === "exposed_receptacle" || (part.defectType !== "none" && !physicalOnlyDefect)) {
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
