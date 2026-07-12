import type { BoxInspectionPart, InspectionBox, WireColor } from "../data/boxInspectionGame";

type BoxWiringDiagramProps = {
  box: InspectionBox;
  selectedPartId: string;
  answers: Record<string, string>;
  submitted: boolean;
  onSelectPart: (partId: string) => void;
};

export function BoxWiringDiagram({ box, selectedPartId, answers, submitted, onSelectPart }: BoxWiringDiagramProps) {
  const rowCount = Math.ceil(box.parts.length / 2);

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={box.label + "内の配線図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="52" textAnchor="middle">{box.label}内 配線図</text>
      <text className="small" x="360" y="75" textAnchor="middle">
        ケーブル{box.cableCount}本・接続部{box.parts.length}か所
      </text>
      <rect className="box" x="72" y="88" width="576" height="258" rx="22" />
      {box.parts.map((part, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const x = column === 0 ? 228 : 492;
        const availableHeight = 210;
        const y = 123 + (row + 0.5) * (availableHeight / rowCount);
        return (
          <ConnectionPart
            answer={answers[part.id]}
            key={part.id}
            onSelectPart={onSelectPart}
            part={part}
            selected={selectedPartId === part.id}
            submitted={submitted}
            x={x}
            y={y}
          />
        );
      })}
    </svg>
  );
}

function ConnectionPart({
  part,
  x,
  y,
  selected,
  answer,
  submitted,
  onSelectPart,
}: {
  part: BoxInspectionPart;
  x: number;
  y: number;
  selected: boolean;
  answer?: string;
  submitted: boolean;
  onSelectPart: (partId: string) => void;
}) {
  const answered = Boolean(answer);
  const correct = submitted && answer === part.answer;
  const wrong = submitted && answered && answer !== part.answer;
  const className = [
    "box-connection",
    selected ? "selected" : "",
    answered ? "answered" : "",
    correct ? "correct" : "",
    wrong ? "wrong" : "",
  ].filter(Boolean).join(" ");
  const isRing = part.connection.method === "ring_sleeve";

  return (
    <g
      aria-label={part.title + "を選択"}
      className={className}
      onClick={() => onSelectPart(part.id)}
      role="button"
      tabIndex={0}
    >
      <rect className="box-connection-hit" x={x - 112} y={y - 30} width="224" height="60" rx="10" />
      <WireBundle part={part} x={x} y={y} />
      {isRing ? <RingSleeve part={part} x={x} y={y} /> : <PushConnector part={part} x={x} y={y} />}
      <text className="small connection-spec-label" x={x} y={y + 24} textAnchor="middle">
        {isRing
          ? part.connection.wireCount + "芯 " + sleeveLabel(part) + " / " + displayMark(part)
          : part.connection.wireCount + "芯 " + displayPortCount(part) + "本用"}
      </text>
    </g>
  );
}

function WireBundle({ part, x, y }: { part: BoxInspectionPart; x: number; y: number }) {
  const count = part.connection.wireCount;
  return (
    <>
      {part.connection.wireColors.map((color, index) => {
        const offset = (index - (count - 1) / 2) * 7;
        const shortInsert = part.defectType === "push_connector_insufficient_insert" && index === count - 1;
        const endX = shortInsert ? x - 52 : x - 28;
        return (
          <g key={color + "-" + index}>
            <path className={"wire " + wireClass(color)} d={"M " + (x - 94) + " " + (y + offset) + " L " + endX + " " + (y + offset)} />
            <text className="wire-size-label" x={x - 88} y={y + offset - 2}>
              {part.connection.wireSizes[index].toFixed(1)}
            </text>
          </g>
        );
      })}
    </>
  );
}

function RingSleeve({ part, x, y }: { part: BoxInspectionPart; x: number; y: number }) {
  const wrongSize = part.defectType === "ring_sleeve_wrong_size";
  const width = wrongSize ? 48 : part.connection.sleeveSize === "medium" ? 66 : 56;
  return (
    <>
      <rect className={wrongSize ? "sleeve alert-fill" : "sleeve"} x={x - width / 2} y={y - 18} width={width} height="36" rx="12" />
      <rect className="sleeve-mark" x={x - 11} y={y - 11} width="22" height="22" rx="4" />
      <text className="sleeve-text" x={x} y={y + 6} textAnchor="middle">{displayMark(part)}</text>
    </>
  );
}

function PushConnector({ part, x, y }: { part: BoxInspectionPart; x: number; y: number }) {
  const ports = displayPortCount(part);
  const spacing = 16;
  const width = Math.max(56, ports * spacing + 18);
  return (
    <>
      <rect className={part.defectType === "push_connector_wrong_wire_count" ? "device alert-fill" : "device"} x={x - width / 2} y={y - 18} width={width} height="36" rx="9" />
      {Array.from({ length: ports }, (_, index) => {
        const portX = x - ((ports - 1) * spacing) / 2 + index * spacing;
        return <circle className="connector" cx={portX} cy={y} key={index} r="6" />;
      })}
    </>
  );
}

function sleeveLabel(part: BoxInspectionPart) {
  return part.connection.sleeveSize === "medium" ? "中スリーブ" : "小スリーブ";
}

function displayMark(part: BoxInspectionPart) {
  if (part.defectType !== "ring_sleeve_wrong_mark") {
    return part.connection.mark;
  }
  return part.connection.mark === "○" ? "小" : part.connection.mark === "小" ? "中" : "小";
}

function displayPortCount(part: BoxInspectionPart) {
  const portCount = part.connection.portCount ?? part.connection.wireCount;
  return part.defectType === "push_connector_wrong_wire_count" ? Math.max(2, portCount - 1) : portCount;
}

function wireClass(color: WireColor) {
  return color;
}
