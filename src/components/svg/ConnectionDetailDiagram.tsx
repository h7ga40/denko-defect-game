import type { BoxConductorEndpoint } from "../../data/boxWiringSpecifications";
import type { BoxInspectionPart, WireColor } from "../../data/boxInspectionGame";
import { RingAssemblyDiagram } from "./RingAssemblyDiagram";

const colorLabels: Record<WireColor, string> = {
  black: "黒",
  white: "白",
  red: "赤",
  green: "緑",
  blue: "青",
};

export function ConnectionDetailDiagram({ part }: { part: BoxInspectionPart }) {
  if (part.connection.method === "ring_sleeve") return <RingAssemblyDiagram connection={part.connection} defectType={part.defectType} />;
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
  const ring = part.connection.method === "ring_sleeve";
  const insufficient = part.defectType === "ring_sleeve_insufficient_insert" && index === 0;
  const insulationBite = part.defectType === "ring_sleeve_insulation_bite" && index === 0;
  const pushInsufficient = part.defectType === "push_connector_insufficient_insert" && index === 0;
  const pushExposed = part.defectType === "push_connector_exposed_conductor" && index === 0;
  const pushOverinserted = part.defectType === "push_connector_insulation_overinserted" && index === 0;
  const ringOverhang = part.defectType === "ring_sleeve_conductor_overhang" && index === 0;
  const disconnected = loose || insufficient || pushInsufficient;
  const targetX = disconnected ? 285 : pushOverinserted ? 390 : 350;
  const copperStart = ring
    ? insulationBite ? 350 : 300
    : pushExposed ? 292 : pushOverinserted ? 370 : 338;
  const className = foreign || loose ? "wire alert" : `wire ${conductor.color}`;

  return (
    <g>
      <text className="small" x="88" y={y + 4} textAnchor="start">
        {conductor.remoteLabel} {colorLabels[conductor.color]} {conductor.conductorDiameterMm.toFixed(1)}mm
      </text>
      <path className={pushOverinserted ? `${className} alert` : className} d={`M 210 ${y} L ${Math.min(copperStart, targetX)} ${y}`} />
      {!disconnected && !insulationBite && !pushOverinserted && <path className={pushExposed ? "radial-copper alert-stroke" : "radial-copper"} d={`M ${copperStart} ${y} L ${targetX} ${y}`} />}
      {insulationBite && <path className={`${className} alert`} d={`M ${copperStart} ${y} L ${targetX} ${y}`} />}
      {disconnected && <line className="missing" x1={targetX + 4} y1={y} x2="342" y2={y} />}
      {ringOverhang && <path className="radial-copper alert-stroke" d={`M 420 ${y} L 485 ${y}`} />}
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
  const uncrimped = part.defectType === "ring_sleeve_uncrimped";
  const partialMark = part.defectType === "ring_sleeve_partial_mark";
  const doubleMark = part.defectType === "ring_sleeve_double_mark";
  return (
    <g>
      <rect className={part.defectType === "ring_sleeve_wrong_size" || uncrimped ? "sleeve alert-fill" : "sleeve"} x={350} y="112" width={width} height="156" rx={uncrimped ? "10" : "24"} />
      {!uncrimped && (
        <>
          <rect className={part.defectType === "ring_sleeve_wrong_mark" || partialMark || doubleMark ? "sleeve-mark alert-fill" : "sleeve-mark"} x={partialMark ? 342 : 370} y="170" width="40" height="40" rx="8" />
          <text className="sleeve-text" x={partialMark ? 362 : 390} y="197" textAnchor="middle">{displayedMark}</text>
          {doubleMark && (
            <>
              <rect className="sleeve-mark alert-fill" x="370" y="218" width="40" height="32" rx="8" />
              <text className="sleeve-text" x="390" y="241" textAnchor="middle">{displayedMark}</text>
            </>
          )}
        </>
      )}
      <text className="small" x="500" y="175">使用: {sleeveLabel(displayed)}</text>
      <text className="small" x="500" y="202">適合: {sleeveLabel(expected)}・刻印{expectedMark}</text>
      {uncrimped && <text className="defect-label" x="500" y="232">圧着跡なし</text>}
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
