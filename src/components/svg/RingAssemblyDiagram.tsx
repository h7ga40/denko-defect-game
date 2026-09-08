import { visualConductors, wirePaint, wireSummary, type ConnectionVisualSpec } from "../../data/connectionVisuals";
import type { DefectType } from "../../data/problems";
import type { InspectionViewpoint } from "../../data/physicalInspection";

export function RingAssemblyDiagram({ connection, defectType, viewpoint = "front" }: { connection: ConnectionVisualSpec; defectType: DefectType; viewpoint?: InspectionViewpoint }) {
  const wires = visualConductors(connection);
  const expectedSize = connection.sleeveSize ?? "small";
  const size = defectType === "ring_sleeve_wrong_size" ? expectedSize === "small" ? "medium" : "small" : expectedSize;
  const width = { small: 70, medium: 88, large: 110 }[size];
  const expectedMark = connection.mark ?? "小";
  const mark = defectType === "ring_sleeve_wrong_mark" ? expectedMark === "○" ? "小" : "○"
    : defectType === "ring_sleeve_wrong_size" ? size === "small" ? "小" : "中" : expectedMark;
  const uncrimped = defectType === "ring_sleeve_uncrimped";
  const partial = defectType === "ring_sleeve_partial_mark";
  const double = defectType === "ring_sleeve_double_mark";
  const side = viewpoint === "left" || viewpoint === "right";
  const gap = Math.min(15, (width - 18) / Math.max(1, wires.length - 1));
  const legendGap = Math.min(27, 210 / Math.max(1, wires.length - 1));
  return <svg viewBox="0 0 720 390" role="img" aria-label="リングスリーブの施工確認図">
    <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
    <text className="label" x="360" y="52" textAnchor="middle">リングスリーブ</text>
    <text className="small" x="360" y="78" textAnchor="middle">{wireSummary(connection)}</text>
    <g className="orthographic-object" data-ring-size={size} data-ring-mark={uncrimped ? "" : mark}>
      {wires.map((wire, index) => {
        const x = wire.loose ? 450 - width / 2 - 26 : 450 + (index - (wires.length - 1) / 2) * gap;
        const insulationEnd = defectType === "ring_sleeve_insulation_bite" && index === 0 ? 217 : 264;
        const tip = wire.loose ? 274 : defectType === "ring_sleeve_insufficient_insert" && index === 0 ? 209 : defectType === "ring_sleeve_conductor_overhang" && index === 0 ? 102 : 134;
        const label = `${index + 1}. ${wire.label || "電線"} ${wire.diameter.toFixed(1)}mm`;
        return <g key={index} data-ring-wire={index} data-copper-tip={tip} data-insulation-end={insulationEnd}>
          <title>{label}</title>
          <text className="material-wire-label" x="58" y={117 + index * legendGap}>{label.length > 23 ? label.slice(0, 22) + "…" : label}</text>
          <path className="material-wire" stroke={wirePaint[wire.color]} strokeWidth={wire.diameter === 2 ? 13 : 11} d={`M ${x} 321 V ${Math.max(insulationEnd, tip)}`} />
          <path className="material-copper" style={{ strokeWidth: wire.diameter === 2 ? 8 : 6 }} d={`M ${x} ${Math.max(insulationEnd, tip)} V ${tip}`} />
          <text className="material-note" x={x} y="340" textAnchor="middle">{index + 1}</text>
        </g>;
      })}
      <rect className="material-ring-body" x={450 - width / 2} y="140" width={width} height="110" rx={uncrimped ? 7 : 16} fillOpacity={side ? .25 : .72} />
      <path className="material-ring-rim" d={`M ${450 - width / 2} 146 Q 450 155 ${450 + width / 2} 146 M ${450 - width / 2} 245 Q 450 253 ${450 + width / 2} 245`} />
      {!uncrimped && <g data-crimp-count={double ? 2 : 1}>
        <path className="material-crimp" d={partial ? `M ${450 - width / 2} 180 H 449 V 213 H ${450 - width / 2}` : "M 429 179 Q 450 185 471 179 V 212 Q 450 206 429 212 Z"} />
        {viewpoint !== "back" && <text className="material-mark" x={partial ? 435 : 450} y="202" textAnchor="middle">{mark}</text>}
        {double && <><path className="material-crimp" d="M 429 218 H 471 V 239 H 429 Z" /><text className="material-mark" x="450" y="237" textAnchor="middle">{mark}</text></>}
      </g>}
      <text className="small" x="540" y="184">使用スリーブ：{size === "small" ? "小" : size === "medium" ? "中" : "大"}</text>
    </g>
    <text className="material-note" x="360" y="362" textAnchor="middle">{side ? "側面断面（心線の並びを展開）" : "金属筒を透過表示・電線は下側から挿入"}</text>
  </svg>;
}
