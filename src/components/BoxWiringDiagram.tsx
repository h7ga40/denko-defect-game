import type { KeyboardEvent } from "react";
import type { BoxInspectionPart, InspectionBox, WireColor } from "../data/boxInspectionGame";
import type { BoxConductorEndpoint } from "../data/boxWiringSpecifications";
import type { CandidateOutletBoxOpening, OutletBoxHoleSize, OutletBoxSide } from "../data/candidateDiagrams";

type BoxWiringDiagramProps = {
  box: InspectionBox;
  selectedPartId: string;
  answers: Record<string, string>;
  submitted: boolean;
  onSelectPart: (partId: string) => void;
};

type Point = { x: number; y: number };
type CableLayout = { entry: Point; bend: Point; angle: number };

const center = { x: 360, y: 280 };
const outletBoxBounds = { x: 170, y: 90, size: 380 };

export function BoxWiringDiagram({ box, selectedPartId, answers, submitted, onSelectPart }: BoxWiringDiagramProps) {
  const connectionParts = box.parts.filter(isConnectionPart);
  const infrastructureParts = box.parts.filter((part) => !isConnectionPart(part));
  const outletBoxPart = infrastructureParts.find((part) => part.connection.method === "outlet_box");
  const auxiliaryParts = infrastructureParts.filter((part) => part.connection.method !== "outlet_box");
  const connectionNodes = layoutConnectionNodes(connectionParts.length);
  const nodeByConnectionId = new Map(
    connectionParts.map((part, index) => [part.connection.id, connectionNodes[index]]),
  );
  const partByConnectionId = new Map(connectionParts.map((part) => [part.connection.id, part]));

  return (
    <svg viewBox="0 0 720 500" role="img" aria-label={box.label + "内の放射状配線図"}>
      <rect className="panel" x="18" y="18" width="684" height="464" rx="18" />
      <text className="label" x="360" y="50" textAnchor="middle">{box.label}内 配線図</text>
      <text className="small" x="360" y="72" textAnchor="middle">
        ケーブル{box.cableCount}本・結線{connectionParts.length}か所
      </text>
      {outletBoxPart
        ? <OutletBoxShell
            answer={answers[outletBoxPart.id]}
            onSelectPart={onSelectPart}
            openings={box.outletBoxOpenings}
            part={outletBoxPart}
            selected={selectedPartId === outletBoxPart.id}
            submitted={submitted}
          />
        : <rect className="box radial-box" x={outletBoxBounds.x} y={outletBoxBounds.y} width={outletBoxBounds.size} height={outletBoxBounds.size} rx="18" />}

      {box.wiring.cables.map((cable, index) => (
        <RadialCable
          box={box}
          cableId={cable.id}
          cableIndex={index}
          cableLayout={layoutCable(box, cable.id, index, outletBoxPart?.defectType)}
          key={cable.id}
          nodeByConnectionId={nodeByConnectionId}
          partByConnectionId={partByConnectionId}
        />
      ))}

      {connectionParts.map((part, index) => (
        <ConnectionNode
          answer={answers[part.id]}
          index={index}
          key={part.id}
          onSelectPart={onSelectPart}
          part={part}
          position={connectionNodes[index]}
          selected={selectedPartId === part.id}
          submitted={submitted}
        />
      ))}

      {auxiliaryParts.map((part, index) => (
        <InfrastructureNode
          answer={answers[part.id]}
          count={auxiliaryParts.length}
          index={index}
          key={part.id}
          onSelectPart={onSelectPart}
          part={part}
          selected={selectedPartId === part.id}
          submitted={submitted}
        />
      ))}
    </svg>
  );
}

function OutletBoxShell({
  part,
  openings,
  selected,
  answer,
  submitted,
  onSelectPart,
}: {
  part: BoxInspectionPart;
  openings: CandidateOutletBoxOpening[];
  selected: boolean;
  answer?: string;
  submitted: boolean;
  onSelectPart: (partId: string) => void;
}) {
  const className = connectionStateClass(part, selected, answer, submitted);
  const select = () => onSelectPart(part.id);
  const rubberOpenings = openings.filter((opening) => opening.fitting === "rubber_bushing");
  const affectedOpening = rubberOpenings[0];

  return (
    <g
      aria-label="アウトレットボックス全体を選択"
      className={className}
      onClick={select}
      onKeyDown={(event) => selectWithKeyboard(event, select)}
      role="button"
      tabIndex={0}
    >
      <rect
        className="outlet-box-shell-hit"
        x={outletBoxBounds.x}
        y={outletBoxBounds.y}
        width={outletBoxBounds.size}
        height={outletBoxBounds.size}
        rx="10"
      />
      {allOutletHolePositions().map(({ side, size }) => {
        const opening = openings.find((item) => item.side === side && item.size === size);
        const point = outletOpeningPoint({ side, size });
        const missing = part.defectType === "rubber_bushing_missing" && opening === affectedOpening;
        const wrongSize = part.defectType === "rubber_bushing_wrong_size" && opening === affectedOpening;
        return (
          <g key={`${side}-${size}`}>
            <circle className={opening ? "outlet-knockout open" : "outlet-knockout"} cx={point.x} cy={point.y} r={size === 19 ? 12 : 17} />
            {opening?.fitting === "rubber_bushing" && !missing && (
              <circle
                className={wrongSize ? "outlet-bushing alert-stroke" : "outlet-bushing"}
                cx={point.x}
                cy={point.y}
                r={wrongSize ? (size === 19 ? 15 : 10) : (size === 19 ? 9 : 13)}
              />
            )}
            {opening?.fitting !== undefined && opening.fitting !== "rubber_bushing" && (
              <rect className="outlet-conduit-fitting" x={point.x - 14} y={point.y - 14} width="28" height="28" rx="5" />
            )}
            <text className="outlet-hole-size" x={point.x} y={point.y + 3} textAnchor="middle">{size}</text>
          </g>
        );
      })}
    </g>
  );
}

function RadialCable({
  box,
  cableId,
  cableIndex,
  cableLayout,
  nodeByConnectionId,
  partByConnectionId,
}: {
  box: InspectionBox;
  cableId: string;
  cableIndex: number;
  cableLayout: CableLayout;
  nodeByConnectionId: Map<string, Point>;
  partByConnectionId: Map<string, BoxInspectionPart>;
}) {
  const cable = box.wiring.cables[cableIndex];
  const conductors = box.wiring.conductors.filter((conductor) => conductor.cableId === cableId);
  const perpendicular = { x: -Math.sin(cableLayout.angle), y: Math.cos(cableLayout.angle) };
  const label = conductors[0]?.remoteLabel ?? cableId;
  const labelPoint = {
    x: cableLayout.entry.x + Math.cos(cableLayout.angle) * 15,
    y: cableLayout.entry.y + Math.sin(cableLayout.angle) * 15,
  };
  const textAnchor = Math.cos(cableLayout.angle) > 0.3 ? "start" : Math.cos(cableLayout.angle) < -0.3 ? "end" : "middle";

  return (
    <g className="radial-cable">

      <path
        className="radial-cable-sheath"
        d={`M ${cableLayout.entry.x} ${cableLayout.entry.y} L ${cableLayout.bend.x} ${cableLayout.bend.y}`}
      />
      <circle className="radial-sheath-end" cx={cableLayout.bend.x} cy={cableLayout.bend.y} r="6" />
      <text className="radial-cable-label" x={labelPoint.x} y={labelPoint.y} textAnchor={textAnchor}>
        <tspan x={labelPoint.x}>{shortSourceLabel(label)}</tspan>
        <tspan className="radial-cable-spec" dy="11" x={labelPoint.x}>{cable.cableType} {cable.coreCount}心</tspan>
      </text>
      {conductors.map((conductor, index) => {
        const offset = (index - (conductors.length - 1) / 2) * 7;
        const start = {
          x: cableLayout.bend.x + perpendicular.x * offset,
          y: cableLayout.bend.y + perpendicular.y * offset,
        };
        const actualConnectionId = box.installation.actualConnectionIds[conductor.id];
        const node = actualConnectionId ? nodeByConnectionId.get(actualConnectionId) : undefined;
        const part = actualConnectionId ? partByConnectionId.get(actualConnectionId) : undefined;
        const target = node && part
          ? connectionPort(node, part, conductor, start)
          : looseWireTarget(start, cableLayout.angle, offset);
        return (
          <ConductorPath
            color={conductor.color}
            key={conductor.id}
            loose={!actualConnectionId}
            start={start}
            target={target}
          />
        );
      })}
    </g>
  );
}

function ConductorPath({ color, loose, start, target }: { color: WireColor; loose: boolean; start: Point; target: Point }) {
  const nearTarget = pointBefore(target, start, loose ? 7 : 10);
  const inward = unitVector(start, center);
  const elbow = { x: start.x + inward.x * 24, y: start.y + inward.y * 24 };
  const control = { x: (elbow.x + target.x + center.x) / 3, y: (elbow.y + target.y + center.y) / 3 };
  return (
    <g className={loose ? "radial-wire loose" : "radial-wire"}>
      <path
        className={`radial-insulation ${wireClass(color)}`}
        d={`M ${start.x} ${start.y} L ${elbow.x} ${elbow.y} Q ${control.x} ${control.y} ${nearTarget.x} ${nearTarget.y}`}
      />
      <path className="radial-copper" d={`M ${nearTarget.x} ${nearTarget.y} L ${target.x} ${target.y}`} />
    </g>
  );
}

function ConnectionNode({
  part,
  index,
  position,
  selected,
  answer,
  submitted,
  onSelectPart,
}: {
  part: BoxInspectionPart;
  index: number;
  position: Point;
  selected: boolean;
  answer?: string;
  submitted: boolean;
  onSelectPart: (partId: string) => void;
}) {
  const className = connectionStateClass(part, selected, answer, submitted);
  const select = () => onSelectPart(part.id);
  return (
    <g
      aria-label={part.title + "を選択"}
      className={className}
      onClick={select}
      onKeyDown={(event) => selectWithKeyboard(event, select)}
      role="button"
      tabIndex={0}
    >
      <circle className="radial-connection-hit" cx={position.x} cy={position.y} r="36" />
      <text className="radial-joint-id" x={position.x} y={position.y - 27} textAnchor="middle">J{index + 1}</text>
      {part.connection.method === "ring_sleeve"
        ? <RingSleeve part={part} x={position.x} y={position.y} />
        : <PushConnector part={part} x={position.x} y={position.y} />}
      <text className="radial-joint-label" x={position.x} y={position.y + 31} textAnchor="middle">
        {shortConnectionLabel(part)}
      </text>
    </g>
  );
}

function InfrastructureNode({
  part,
  index,
  count,
  selected,
  answer,
  submitted,
  onSelectPart,
}: {
  part: BoxInspectionPart;
  index: number;
  count: number;
  selected: boolean;
  answer?: string;
  submitted: boolean;
  onSelectPart: (partId: string) => void;
}) {
  const x = count === 1 ? 360 : 285 + index * 150;
  const y = 440;
  const className = connectionStateClass(part, selected, answer, submitted);
  const select = () => onSelectPart(part.id);
  return (
    <g
      aria-label={part.title + "を選択"}
      className={className}
      onClick={select}
      onKeyDown={(event) => selectWithKeyboard(event, select)}
      role="button"
      tabIndex={0}
    >
      <rect className="radial-infrastructure-hit" x={x - 64} y={y - 18} width="128" height="36" rx="9" />
      <g transform={`translate(${x} ${y}) scale(0.58) translate(${-x} ${-y})`}>
        <InfrastructurePart part={part} x={x} y={y} />
      </g>
      <text className="radial-infrastructure-label" x={x} y={y + 18} textAnchor="middle">{infrastructureLabel(part)}</text>
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

function RingSleeve({ part, x, y }: { part: BoxInspectionPart; x: number; y: number }) {
  const wrongSize = part.defectType === "ring_sleeve_wrong_size";
  const width = wrongSize ? 38 : part.connection.sleeveSize === "medium" ? 46 : 40;
  return (
    <>
      <rect className={wrongSize ? "sleeve alert-fill" : "sleeve"} x={x - width / 2} y={y - 13} width={width} height="26" rx="9" />
      <rect className="sleeve-mark" x={x - 8} y={y - 8} width="16" height="16" rx="3" />
      <text className="radial-sleeve-text" x={x} y={y + 4} textAnchor="middle">{displayMark(part)}</text>
    </>
  );
}

function PushConnector({ part, x, y }: { part: BoxInspectionPart; x: number; y: number }) {
  const ports = displayPortCount(part);
  const spacing = 11;
  const width = Math.max(42, ports * spacing + 12);
  return (
    <>
      <rect className={part.defectType === "push_connector_wrong_wire_count" ? "device alert-fill" : "device"} x={x - width / 2} y={y - 13} width={width} height="26" rx="7" />
      {Array.from({ length: ports }, (_, index) => {
        const portX = x - ((ports - 1) * spacing) / 2 + index * spacing;
        return <circle className="connector" cx={portX} cy={y} key={index} r="4" />;
      })}
    </>
  );
}

function layoutCable(box: InspectionBox, cableId: string, index: number, defectType?: string): CableLayout {
  const conductor = box.wiring.conductors.find((item) => item.cableId === cableId);
  let opening = box.outletBoxOpenings.find((item) => item.remoteDeviceId === conductor?.remoteEndpointId);
  if (defectType === "outlet_box_wrong_hole" && index === 0) {
    opening = allOutletHolePositions()
      .filter((position) => !box.outletBoxOpenings.some((item) => item.side === position.side && item.size === position.size))
      .map((position) => ({ ...position, remoteDeviceId: "defect", fitting: "rubber_bushing" as const }))[0] ?? opening;
  }

  if (opening) {
    const base = outletOpeningPoint(opening);
    const cableIdsAtOpening = box.wiring.cables
      .filter((cable) => box.wiring.conductors.some((item) => item.cableId === cable.id && item.remoteEndpointId === conductor?.remoteEndpointId))
      .map((cable) => cable.id);
    const cableIndex = cableIdsAtOpening.indexOf(cableId);
    const laneOffset = (cableIndex - (cableIdsAtOpening.length - 1) / 2) * 8;
    const tangent = opening.side === "top" || opening.side === "bottom" ? { x: 1, y: 0 } : { x: 0, y: 1 };
    const entry = { x: base.x + tangent.x * laneOffset, y: base.y + tangent.y * laneOffset };
    const inward = unitVector(entry, center);
    const angle = Math.atan2(entry.y - center.y, entry.x - center.x);
    return {
      angle,
      entry,
      bend: { x: entry.x + inward.x * 94 + tangent.x * laneOffset * 0.35, y: entry.y + inward.y * 94 + tangent.y * laneOffset * 0.35 },
    };
  }

  const count = box.wiring.cables.length;
  const angle = count === 1 ? -Math.PI / 2 : -Math.PI / 2 + (Math.PI * 2 * index) / count;
  return {
    angle,
    entry: { x: center.x + Math.cos(angle) * 190, y: center.y + Math.sin(angle) * 190 },
    bend: { x: center.x + Math.cos(angle) * 125, y: center.y + Math.sin(angle) * 125 },
  };
}

function outletOpeningPoint(opening: Pick<CandidateOutletBoxOpening, "side" | "size">): Point {
  const offset = opening.size === 19 ? -55 : 55;
  const { x, y, size } = outletBoxBounds;
  if (opening.side === "top") return { x: center.x + offset, y };
  if (opening.side === "right") return { x: x + size, y: center.y + offset };
  if (opening.side === "bottom") return { x: center.x - offset, y: y + size };
  return { x, y: center.y - offset };
}

function allOutletHolePositions(): Array<{ side: OutletBoxSide; size: OutletBoxHoleSize }> {
  return (["top", "right", "bottom", "left"] as const).flatMap((side) => [
    { side, size: 19 as const },
    { side, size: 25 as const },
  ]);
}

function layoutConnectionNodes(count: number): Point[] {
  if (count === 1) return [{ ...center }];
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + Math.PI / count + (Math.PI * 2 * index) / count;
    return { x: center.x + Math.cos(angle) * 90, y: center.y + Math.sin(angle) * 58 };
  });
}

function connectionPort(node: Point, part: BoxInspectionPart, conductor: BoxConductorEndpoint, start: Point) {
  const direction = unitVector(start, node);
  const perpendicular = { x: -direction.y, y: direction.x };
  const index = part.connection.conductors.findIndex((item) => item.id === conductor.id);
  const count = part.connection.conductors.length;
  const portOffset = part.connection.method === "push_connector" ? (index - (count - 1) / 2) * 5 : 0;
  const radius = part.connection.method === "push_connector" ? 14 : 12;
  return {
    x: node.x - direction.x * radius + perpendicular.x * portOffset,
    y: node.y - direction.y * radius + perpendicular.y * portOffset,
  };
}

function looseWireTarget(start: Point, angle: number, offset: number) {
  return {
    x: start.x - Math.cos(angle) * 48 - Math.sin(angle) * offset * 0.15,
    y: start.y - Math.sin(angle) * 48 + Math.cos(angle) * offset * 0.15,
  };
}

function pointBefore(target: Point, start: Point, distance: number) {
  const direction = unitVector(target, start);
  return { x: target.x + direction.x * distance, y: target.y + direction.y * distance };
}

function unitVector(from: Point, to: Point) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
}

function connectionStateClass(part: BoxInspectionPart, selected: boolean, answer: string | undefined, submitted: boolean) {
  const answered = Boolean(answer);
  const correct = submitted && answer === part.answer;
  const wrong = submitted && answered && answer !== part.answer;
  return [
    "box-connection",
    "radial-connection",
    selected ? "selected" : "",
    answered ? "answered" : "",
    correct ? "correct" : "",
    wrong ? "wrong" : "",
  ].filter(Boolean).join(" ");
}

function selectWithKeyboard(event: KeyboardEvent<SVGGElement>, select: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    select();
  }
}

function isConnectionPart(part: BoxInspectionPart) {
  return part.connection.method === "ring_sleeve" || part.connection.method === "push_connector";
}

function shortConnectionLabel(part: BoxInspectionPart) {
  if (part.connection.method === "ring_sleeve") {
    return `${part.connection.wireCount}芯 ${part.connection.sleeveSize === "medium" ? "中" : "小"}/${displayMark(part)}`;
  }
  return `${part.connection.wireCount}芯 ${displayPortCount(part)}本用`;
}

function infrastructureLabel(part: BoxInspectionPart) {
  if (part.connection.method === "metal_conduit") return "金属管 E19";
  if (part.connection.method === "pf_conduit") return "PF管 PF16";
  return "ボックス・ブッシング";
}

function displayMark(part: BoxInspectionPart) {
  if (part.defectType !== "ring_sleeve_wrong_mark") return part.connection.mark;
  return part.connection.mark === "○" ? "小" : part.connection.mark === "小" ? "中" : "小";
}

function displayPortCount(part: BoxInspectionPart) {
  const portCount = part.connection.portCount ?? part.connection.wireCount;
  return part.defectType === "push_connector_wrong_wire_count" ? Math.max(2, portCount - 1) : portCount;
}

function wireClass(color: WireColor) {
  return color;
}

function shortSourceLabel(label: string) {
  return label.length > 7 ? label.slice(0, 7) + "…" : label;
}
