import type { CableEntrySide } from "../../../data/boxInspectionGame";
import type { DefectType } from "../../../data/problems";
import type { InspectionViewpoint } from "../../../data/physicalInspection";

export function CeilingConnectorDiagram({ cableEntrySide = "bottom", defectType = "ceiling_connector_polarity", viewpoint = "front" }: {
  cableEntrySide?: CableEntrySide;
  defectType?: DefectType;
  viewpoint?: InspectionViewpoint;
}) {
  const reverse = defectType === "ceiling_connector_polarity";
  const side = viewpoint === "left" || viewpoint === "right";
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="丸形・角形引掛シーリングローゼットの端子確認図" data-entry-side={cableEntrySide}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="52" textAnchor="middle">引掛シーリングローゼット</text>
      <text className="small" x="360" y="78" textAnchor="middle">同じ接続状態の形状比較・電線入口を下にそろえて表示</text>
      {(["square", "round"] as const).map((shape, index) => (
        <g transform={`translate(${index === 0 ? 205 : 515} 199)`} key={shape} data-ceiling-shape={shape}>
          {side ? <rect className="fitting-shell" x="-108" y="-38" width="216" height="76" rx={shape === "round" ? 30 : 8} />
            : shape === "round" ? <circle className="fitting-shell" r="100" />
            : <rect className="fitting-shell" x="-119" y="-66" width="238" height="132" rx="14" />}
          <g opacity={side ? 0.65 : 1}>
            <path className="fitting-contact" d="M -88 -12 H -55 V 19 H -30 M 88 -12 H 55 V 19 H 30" />
            <rect className="fitting-terminal-body" x="-51" y="-38" width="102" height="82" rx="10" />
            {[-1, 1].map((sign) => <g key={sign}>
              <circle className="fitting-screw" cx={sign * 81} cy={shape === "round" ? -49 : 0} r="10" />
              <path className="fitting-slot" d={`M ${sign * 81 - 4} ${shape === "round" ? -49 : 0} h 8`} />
            </g>)}
            <text className="fitting-terminal-label" x="-24" y="-16" textAnchor="middle">W</text>
            <text className="fitting-terminal-label" x="25" y="-16" textAnchor="middle">L</text>
            {[-24, 24].map((x, wireIndex) => {
              const color = (wireIndex === 0) !== reverse ? "white" : "black";
              return <g key={x} data-ceiling-terminal={wireIndex === 0 ? "W" : "L"} data-wire-color={color}>
                <ellipse className="fitting-hole" cx={x} cy="25" rx="11" ry="13" />
                <path className="fitting-wire-outline" d={`M ${x} 25 C ${x} 60, ${x / 2} 64, ${x / 2} 113`} />
                <path className={`fitting-wire ${color}`} d={`M ${x} 25 C ${x} 60, ${x / 2} 64, ${x / 2} 113`} />
              </g>;
            })}
            <rect className="fitting-release" x="-10" y="-3" width="20" height="9" rx="2" />
          </g>
          <rect className="material-sheath" x="-23" y={shape === "round" && !side ? 80 : 45} width="46" height={shape === "round" && !side ? 36 : 71} rx="5" />
          <text className="small" x="0" y="139" textAnchor="middle">{shape === "round" ? "丸形" : "角形"}{side ? "・端子部の透視断面" : "・台座内の端子部"}</text>
        </g>
      ))}
    </svg>
  );
}
