import type { BoxConductorEndpoint } from "../../data/boxWiringSpecifications";
import type { BoxInspectionPart, WireColor } from "../../data/boxInspectionGame";

const colorLabels: Record<WireColor, string> = {
  black: "黒",
  white: "白",
  red: "赤",
  green: "緑",
  blue: "青",
};

export function ConnectionDetailDiagram({ part }: { part: BoxInspectionPart }) {
  const connection = part.connection;
  const conductors = [...connection.conductors, ...connection.looseConductors];
  const rowGap = Math.min(42, 220 / Math.max(1, conductors.length - 1));
  const startY = 190 - ((conductors.length - 1) * rowGap) / 2;
  const ring = connection.method === "ring_sleeve";

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={`${part.title}の施工状態`}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="52" textAnchor="middle">{ring ? "リングスリーブ" : "差込形コネクタ"}</text>
      <text className="small" x="360" y="78" textAnchor="middle">{connectionSummary(part)}</text>
      {conductors.map((conductor, index) => (
        <ConnectionConductor
          conductor={conductor}
          index={index}
          key={conductor.id}
          loose={connection.looseConductors.some((item) => item.id === conductor.id)}
          part={part}
          y={startY + index * rowGap}
        />
      ))}
      {ring ? <SleeveBody part={part} /> : <ConnectorBody part={part} />}
    </svg>
  );
}

function ConnectionConductor({
  conductor,
  index,
  loose,
  part,
  y,
}: {
  conductor: BoxConductorEndpoint;
  index: number;
  loose: boolean;
  part: BoxInspectionPart;
  y: number;
}) {
  const foreign = !part.connection.correctConductorIds.includes(conductor.id);
  const insufficient = part.defectType === "ring_sleeve_insufficient_insert" && index === 0;
  const insulationBite = part.defectType === "ring_sleeve_insulation_bite" && index === 0;
  const pushInsufficient = part.defectType === "push_connector_insufficient_insert" && index === 0;
  const disconnected = loose || insufficient || pushInsufficient;
  const targetX = disconnected ? 285 : 350;
  const copperStart = insulationBite ? 350 : 300;
  const className = foreign || loose ? "wire alert" : `wire ${conductor.color}`;

  return (
    <g>
      <text className="small" x="88" y={y + 4} textAnchor="start">
        {conductor.remoteLabel} {colorLabels[conductor.color]} {conductor.conductorDiameterMm.toFixed(1)}mm
      </text>
      <path className={className} d={`M 210 ${y} L ${Math.min(copperStart, targetX)} ${y}`} />
      {!disconnected && !insulationBite && <path className="radial-copper" d={`M ${copperStart} ${y} L ${targetX} ${y}`} />}
      {insulationBite && <path className={`${className} alert`} d={`M ${copperStart} ${y} L ${targetX} ${y}`} />}
      {disconnected && <line className="missing" x1={targetX + 4} y1={y} x2="342" y2={y} />}
    </g>
  );
}

function SleeveBody({ part }: { part: BoxInspectionPart }) {
  const expected = part.connection.sleeveSize ?? "small";
  const displayed = part.defectType === "ring_sleeve_wrong_size"
    ? expected === "small" ? "medium" : "small"
    : expected;
  const width = displayed === "large" ? 100 : displayed === "medium" ? 86 : 72;
  const expectedMark = part.connection.mark ?? "○";
  const displayedMark = part.defectType === "ring_sleeve_wrong_mark" ? wrongMark(expectedMark) : expectedMark;
  return (
    <g>
      <rect className={part.defectType === "ring_sleeve_wrong_size" ? "sleeve alert-fill" : "sleeve"} x={350} y="112" width={width} height="156" rx="24" />
      <rect className={part.defectType === "ring_sleeve_wrong_mark" ? "sleeve-mark alert-fill" : "sleeve-mark"} x={370} y="170" width="40" height="40" rx="8" />
      <text className="sleeve-text" x="390" y="197" textAnchor="middle">{displayedMark}</text>
      <text className="small" x="500" y="175">使用: {sleeveLabel(displayed)}</text>
      <text className="small" x="500" y="202">適合: {sleeveLabel(expected)}・刻印{expectedMark}</text>
    </g>
  );
}

function ConnectorBody({ part }: { part: BoxInspectionPart }) {
  const expected = part.connection.portCount ?? part.connection.wireCount;
  const displayed = part.defectType === "push_connector_wrong_wire_count" ? Math.max(2, expected - 1) : expected;
  const spacing = 28;
  const width = Math.max(74, displayed * spacing + 24);
  return (
    <g>
      <rect className={part.defectType === "push_connector_wrong_wire_count" ? "device alert-fill" : "device"} x="350" y="122" width={width} height="136" rx="18" />
      {Array.from({ length: displayed }, (_, index) => (
        <circle className="connector" cx={374 + index * spacing} cy="190" key={index} r="9" />
      ))}
      <text className="small" x="520" y="178">使用: {displayed}本用</text>
      <text className="small" x="520" y="205">必要心線: {part.connection.wireCount}本</text>
    </g>
  );
}

function connectionSummary(part: BoxInspectionPart) {
  const connection = part.connection;
  return `${connection.wireCount}芯 / ${connection.wireSizes.map((size) => `${size.toFixed(1)}mm`).join("・")}`;
}

function wrongMark(mark: string) {
  if (mark === "○") return "小";
  if (mark === "小") return "中";
  if (mark === "中") return "小";
  return "中";
}

function sleeveLabel(size: "small" | "medium" | "large") {
  return size === "small" ? "小" : size === "medium" ? "中" : "大";
}
