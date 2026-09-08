import type { CableInspectionPart } from "../../data/boxInspectionGame";
import { CableEndBundle } from "./CableEndBundle";
import type { InspectionViewpoint } from "../../data/physicalInspection";
export type CableDiagramPart = Pick<CableInspectionPart, "title" | "defectType" | "installedCable" | "correctCable" | "fromLabel" | "toLabel">;

export function CableInspectionDiagram({ part, viewpoint = "front" }: { part: CableDiagramPart; viewpoint?: InspectionViewpoint }) {
  const cable = part.installedCable;
  const correctLength = part.correctCable.diagramLengthMm;
  const installedLength = cable.diagramLengthMm;
  const lengthRatio = correctLength && installedLength ? Math.min(1, installedLength / correctLength) : 1;
  const cableEndX = 110 + 500 * lengthRatio;

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={`${part.title}の施工状態`}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="50" textAnchor="middle">{part.title}</text>
      <text className={part.defectType === "cable_wrong_type" ? "defect-label" : "small"} x="360" y="76" textAnchor="middle">
        使用: {formatCable(cable)} / 指定: {formatCable(part.correctCable)}
      </text>

      <line className="cable-sheath" x1="110" y1="112" x2={cableEndX} y2="112" />
      {part.defectType === "cable_sheath_damage" && (
        <g data-sheath-wound>
          <path className="material-cut-edge" d="M 330 106 L 363 103 L 380 111 L 361 120 L 333 118 Z" />
          <path className="cable-insulation black" d="M 339 112 H 367" />
        </g>
      )}
      <line className="missing" x1={cableEndX} y1="96" x2="610" y2="96" />
      <text className={part.defectType === "cable_too_short" ? "defect-label" : "small"} x="360" y="137" textAnchor="middle">
        施工寸法 {installedLength ?? "未設定"}mm / 指定寸法 {correctLength ?? "未設定"}mm
      </text>

      <CableEnd cablePart={part} end="from" label={part.fromLabel} y={195} />
      <CableEnd cablePart={part} end="to" label={part.toLabel} y={292} />
      <text className="material-note" x="360" y="362" textAnchor="middle">{viewpoint === "front" ? "加工端の拡大図" : "加工端の展開図（傷の位置を透視）"}</text>
    </svg>
  );
}

function CableEnd({ cablePart, end, label, y }: { cablePart: CableDiagramPart; end: "from" | "to"; label: string; y: number }) {
  const cable = cablePart.installedCable;
  const installed = end === "from" ? cable.fromEnd : cable.toEnd;
  const correct = end === "from" ? cablePart.correctCable.fromEnd : cablePart.correctCable.toEnd;
  const differs = installed.sheathStripLengthMm !== correct.sheathStripLengthMm;
  return (
    <g>
      <text className="small" x="80" y={y - 24}>{label}側</text>
      <CableEndBundle cable={cable} preparation={installed} correct={correct} y={y} damaged={cablePart.defectType === "cable_insulation_damage" && end === "to"} />
      <text className={differs ? "defect-label" : "small"} x="545" y={y + 4}>
        外装剥ぎ {installed.sheathStripLengthMm ?? 0}mm
      </text>
      {differs && <text className="small" x="545" y={y + 23}>基準 {correct.sheathStripLengthMm ?? 0}mm</text>}
    </g>
  );
}

function formatCable(cable: CableInspectionPart["installedCable"]) {
  return `${cable.cableType} ${cable.conductorDiameterMm.toFixed(1)}mm ${cable.coreCount}心`;
}
