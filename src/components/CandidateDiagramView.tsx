import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { candidateDiagrams, type CandidateDevice, type CandidateDiagram } from "../data/candidateDiagrams";
import type { DirectInspectionPart, InspectionBox } from "../data/boxInspectionGame";
import { CandidateMaterials } from "./CandidateMaterials";

type InspectionAnswers = Record<string, string>;
type SelectionStatus = "idle" | "selected" | "answered" | "correct" | "wrong";

type CandidateSvgProps = {
  diagram: CandidateDiagram;
  inspectionBoxes?: InspectionBox[];
  directParts?: DirectInspectionPart[];
  answers?: InspectionAnswers;
  selectedBoxId?: string;
  selectedDirectPartId?: string;
  submitted?: boolean;
  onSelectBox?: (boxId: string) => void;
  onSelectDirectPart?: (partId: string) => void;
};

type Interaction = {
  label: string;
  status: SelectionStatus;
  onSelect: () => void;
};

export function CandidateDiagramView() {
  const [selectedNo, setSelectedNo] = useState(1);
  const selected = useMemo(
    () => candidateDiagrams.find((diagram) => diagram.no === selectedNo) ?? candidateDiagrams[0],
    [selectedNo],
  );

  return (
    <section className="candidate-layout">
      <aside className="candidate-list" aria-label="候補問題一覧">
        {candidateDiagrams.map((diagram) => (
          <button
            className={diagram.no === selected.no ? "candidate-tab selected" : "candidate-tab"}
            key={diagram.no}
            onClick={() => setSelectedNo(diagram.no)}
            type="button"
          >
            <span>No.{diagram.no}</span>
            {diagram.title}
          </button>
        ))}
      </aside>

      <article className="problem-card candidate-card">
        <div className="problem-meta">
          <span>候補問題 No.{selected.no}</span>
          <span>学習用簡略複線図</span>
        </div>
        <h2>{selected.title}</h2>
        <p className="candidate-theme">{selected.theme}</p>
        <CandidateMaterials candidateNo={selected.no} />
        <div className="diagram-wrap">
          <CandidateSvg diagram={selected} />
        </div>
        <ul className="point-list">
          {selected.points.map((point) => <li key={point}>{point}</li>)}
        </ul>
      </article>
    </section>
  );
}

export function CandidateSvg({
  answers = {},
  diagram,
  inspectionBoxes = [],
  directParts = [],
  onSelectBox,
  onSelectDirectPart,
  selectedBoxId,
  selectedDirectPartId,
  submitted = false,
}: CandidateSvgProps) {
  const devicesById = new Map(diagram.devices.map((device) => [device.id, device]));
  const boxesByDeviceId = new Map(inspectionBoxes.map((box) => [box.sourceDeviceId, box]));
  const partsByDeviceId = new Map(directParts.map((part) => [part.sourceDeviceId, part]));

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={"候補問題" + diagram.no + "の複線図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="candidate-svg-title" x="360" y="54" textAnchor="middle">
        No.{diagram.no} {diagram.title}
      </text>

      {diagram.connections.map((connection, index) => {
        const from = devicesById.get(connection.from);
        const to = devicesById.get(connection.to);
        if (!from || !to) return null;

        const offset = getParallelOffset(index, from, to);
        const path = makeWirePath(from, to, offset);
        const labelX = (from.x + to.x) / 2 + offset.x * 1.8;
        const labelY = (from.y + to.y) / 2 + offset.y * 1.8 - 8;

        return (
          <g key={connection.from + "-" + connection.to + "-" + connection.color + "-" + index}>
            <path className={"candidate-wire " + connection.color} d={path} />
            {connection.label && (
              <text className="wire-label" x={labelX} y={labelY} textAnchor="middle">
                {connection.label}
              </text>
            )}
          </g>
        );
      })}

      {diagram.devices.map((device) => {
        const box = boxesByDeviceId.get(device.id);
        if (box) {
          const answered = box.parts.every((part) => Boolean(answers[part.id]));
          const correct = box.parts.every((part) => answers[part.id] === part.answer);
          const status = getStatus(box.id === selectedBoxId, answered, correct, submitted);
          return (
            <BoxNode
              box={box}
              interaction={{
                label: box.label + "を選択",
                status,
                onSelect: () => onSelectBox?.(box.id),
              }}
              key={box.id}
            />
          );
        }

        const part = partsByDeviceId.get(device.id);
        const interaction = part
          ? {
              label: part.title + "を選択",
              status: getStatus(
                part.id === selectedDirectPartId,
                Boolean(answers[part.id]),
                answers[part.id] === part.answer,
                submitted,
              ),
              onSelect: () => onSelectDirectPart?.(part.id),
            }
          : undefined;

        return <DeviceNode device={device} interaction={interaction} key={device.id} />;
      })}
    </svg>
  );
}

function getStatus(selected: boolean, answered: boolean, correct: boolean, submitted: boolean): SelectionStatus {
  if (submitted && answered) return correct ? "correct" : "wrong";
  if (selected) return "selected";
  if (answered) return "answered";
  return "idle";
}

function SelectableGroup({
  children,
  interaction,
  x,
  y,
  width,
  height,
}: {
  children: ReactNode;
  interaction?: Interaction;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  function handleKeyDown(event: KeyboardEvent<SVGGElement>) {
    if (!interaction || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    interaction.onSelect();
  }

  const className = interaction
    ? "candidate-node candidate-selectable " + interaction.status
    : "candidate-node";

  return (
    <g
      aria-label={interaction?.label}
      className={className}
      onClick={interaction?.onSelect}
      onKeyDown={handleKeyDown}
      role={interaction ? "button" : undefined}
      tabIndex={interaction ? 0 : undefined}
    >
      {interaction && (
        <rect
          className="candidate-hit-area"
          height={height}
          width={width}
          x={x - width / 2}
          y={y - height / 2}
          rx="12"
        />
      )}
      {children}
      {interaction && interaction.status !== "idle" && (
        <circle className="candidate-status-dot" cx={x + width / 2 - 10} cy={y - height / 2 + 10} r="7" />
      )}
    </g>
  );
}

function BoxNode({ box, interaction }: { box: InspectionBox; interaction: Interaction }) {
  return (
    <SelectableGroup height={76} interaction={interaction} width={112} x={box.x} y={box.y}>
      <rect className={"candidate-box candidate-device " + box.boxType} x={box.x - 45} y={box.y - 28} width="90" height="56" rx="8" />
      <text className="candidate-label small-label" x={box.x} y={box.y + 5} textAnchor="middle">
        {box.boxType === "joint" ? "JB" : "OB"}
      </text>
    </SelectableGroup>
  );
}

function DeviceNode({ device, interaction }: { device: CandidateDevice; interaction?: Interaction }) {
  if (device.type === "power") {
    return (
      <SelectableGroup height={80} interaction={interaction} width={100} x={device.x} y={device.y}>
        <rect className="candidate-device power" x={device.x - 42} y={device.y - 34} width="84" height="68" rx="8" />
        <text className="candidate-label" x={device.x} y={device.y + 5} textAnchor="middle">{device.label}</text>
      </SelectableGroup>
    );
  }

  if (device.type === "connector") {
    return (
      <SelectableGroup height={64} interaction={interaction} width={72} x={device.x} y={device.y}>
        <circle className="candidate-connector candidate-device" cx={device.x} cy={device.y} r="18" />
        <text className="candidate-label small-label" x={device.x} y={device.y + 38} textAnchor="middle">{device.label}</text>
      </SelectableGroup>
    );
  }

  if (device.type === "lamp" || device.type === "pilot") {
    return (
      <SelectableGroup height={94} interaction={interaction} width={94} x={device.x} y={device.y}>
        <circle className={"candidate-device " + device.type} cx={device.x} cy={device.y} r="34" />
        <line className="device-mark" x1={device.x - 18} y1={device.y - 18} x2={device.x + 18} y2={device.y + 18} />
        <line className="device-mark" x1={device.x + 18} y1={device.y - 18} x2={device.x - 18} y2={device.y + 18} />
        <text className="candidate-label small-label" x={device.x} y={device.y + 54} textAnchor="middle">{device.label}</text>
      </SelectableGroup>
    );
  }

  if (device.type === "receptacle" || device.type === "grounded_receptacle") {
    return (
      <SelectableGroup height={102} interaction={interaction} width={104} x={device.x} y={device.y}>
        <rect className="candidate-device receptacle" x={device.x - 42} y={device.y - 40} width="84" height="80" rx="12" />
        <line className="device-mark" x1={device.x - 14} y1={device.y - 16} x2={device.x - 14} y2={device.y + 16} />
        <line className="device-mark" x1={device.x + 14} y1={device.y - 16} x2={device.x + 14} y2={device.y + 16} />
        {device.type === "grounded_receptacle" && <circle className="ground-hole" cx={device.x} cy={device.y + 22} r="5" />}
        <text className="candidate-label small-label" x={device.x} y={device.y + 60} textAnchor="middle">{device.label}</text>
      </SelectableGroup>
    );
  }

  return (
    <SelectableGroup height={84} interaction={interaction} width={108} x={device.x} y={device.y}>
      <rect className={"candidate-device " + device.type} x={device.x - 44} y={device.y - 32} width="88" height="64" rx="8" />
      <text className="candidate-label" x={device.x} y={device.y + 5} textAnchor="middle">{device.label}</text>
    </SelectableGroup>
  );
}

function makeWirePath(from: CandidateDevice, to: CandidateDevice, offset: { x: number; y: number }) {
  const startX = from.x + offset.x;
  const startY = from.y + offset.y;
  const endX = to.x + offset.x;
  const endY = to.y + offset.y;
  const controlX = (startX + endX) / 2;
  const controlY = (startY + endY) / 2 - Math.min(44, Math.abs(endX - startX) * 0.12);
  return "M " + startX + " " + startY + " Q " + controlX + " " + controlY + " " + endX + " " + endY;
}

function getParallelOffset(index: number, from: CandidateDevice, to: CandidateDevice) {
  const pairOffset = (index % 3) - 1;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: (-dy / length) * pairOffset * 8,
    y: (dx / length) * pairOffset * 8,
  };
}
