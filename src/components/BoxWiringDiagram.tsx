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
        ケーブル{box.cableCount}本・点検部{box.parts.length}か所
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
            hitHeight={Math.min(60, availableHeight / rowCount - 4)}
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
  hitHeight,
  selected,
  answer,
  submitted,
  onSelectPart,
}: {
  part: BoxInspectionPart;
  x: number;
  y: number;
  hitHeight: number;
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
  const isPush = part.connection.method === "push_connector";

  return (
    <g
      aria-label={part.title + "を選択"}
      className={className}
      onClick={() => onSelectPart(part.id)}
      role="button"
      tabIndex={0}
    >
      <rect className="box-connection-hit" x={x - 112} y={y - hitHeight / 2} width="224" height={hitHeight} rx="10" />
      {isRing || isPush ? (
        <>
          <WireBundle part={part} x={x} y={y - 4} />
          {isRing ? <RingSleeve part={part} x={x} y={y - 4} /> : <PushConnector part={part} x={x} y={y - 4} />}
        </>
      ) : (
        <InfrastructurePart part={part} x={x} y={y - 5} />
      )}
      <text className="small connection-spec-label" x={x} y={y + 21} textAnchor="middle">
        {connectionLabel(part)}
      </text>
    </g>
  );
}

function InfrastructurePart({ part, x, y }: { part: BoxInspectionPart; x: number; y: number }) {
  if (part.connection.method === "outlet_box") {
    const missing = part.defectType === "rubber_bushing_missing";
    const wrongSize = part.defectType === "rubber_bushing_wrong_size";
    const wrongHole = part.defectType === "outlet_box_wrong_hole";
    const cableX = wrongHole ? x + 38 : x - 38;
    return (
      <>
        <rect className="infra-box" x={x - 64} y={y - 16} width="128" height="32" rx="6" />
        <circle className={wrongSize ? "infra-hole alert-stroke" : "infra-hole"} cx={x - 38} cy={y} r="10" />
        {!missing && <circle className={wrongSize ? "infra-bushing alert-stroke" : "infra-bushing"} cx={x - 38} cy={y} r={wrongSize ? "5" : "8"} />}
        <circle className="infra-hole" cx={x + 38} cy={y} r="10" />
        <line className={wrongHole ? "infra-cable alert-stroke" : "infra-cable"} x1={cableX} y1={y - 22} x2={cableX} y2={y + 13} />
      </>
    );
  }

  const isMetal = part.connection.method === "metal_conduit";
  const shortInsert = part.defectType === (isMetal ? "metal_conduit_insufficient_insert" : "pf_conduit_insufficient_insert");
  const missingLocknut = part.defectType === (isMetal ? "metal_conduit_missing_locknut" : "pf_conduit_missing_locknut");
  const missingInsulation = part.defectType === "metal_conduit_missing_insulation_bushing";
  const conduitEnd = shortInsert ? x - 12 : x + 17;

  return (
    <>
      <line className={isMetal ? "infra-metal-conduit" : "infra-pf-conduit"} x1={x - 82} y1={y} x2={conduitEnd} y2={y} />
      {!isMetal && [-66, -50, -34, -18].map((offset) => (
        <line className="infra-pf-rib" key={offset} x1={x + offset} y1={y - 8} x2={x + offset} y2={y + 8} />
      ))}
      <rect className="infra-conduit-connector" x={x + 18} y={y - 14} width="42" height="28" rx="5" />
      {!missingLocknut && <rect className="infra-locknut" x={x + 48} y={y - 16} width="7" height="32" rx="2" />}
      {isMetal && !missingInsulation && <circle className="infra-insulation-bushing" cx={x + 64} cy={y} r="10" />}
      {shortInsert && <line className="missing" x1={x - 8} y1={y - 12} x2={x + 16} y2={y - 12} />}
    </>
  );
}

function connectionLabel(part: BoxInspectionPart) {
  if (part.connection.method === "ring_sleeve") {
    return part.connection.wireCount + "芯 " + sleeveLabel(part) + " / " + displayMark(part);
  }
  if (part.connection.method === "push_connector") {
    return part.connection.wireCount + "芯 " + displayPortCount(part) + "本用";
  }
  if (part.connection.method === "metal_conduit") return "金属管 E19";
  if (part.connection.method === "pf_conduit") return "PF管 PF16";
  return "ボックス・ブッシング";
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
