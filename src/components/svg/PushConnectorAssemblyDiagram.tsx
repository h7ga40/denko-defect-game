import { visualConductors, wirePaint, wireSummary, type ConnectionVisualSpec } from "../../data/connectionVisuals";
import type { DefectType } from "../../data/problems";
import type { InspectionViewpoint } from "../../data/physicalInspection";

export function PushConnectorAssemblyDiagram({ connection, defectType, viewpoint = "front" }: { connection: ConnectionVisualSpec; defectType: DefectType; viewpoint?: InspectionViewpoint }) {
  const wires = visualConductors(connection);
  const ports = defectType === "push_connector_wrong_wire_count" ? Math.max(2, wires.length - 1) : connection.portCount ?? wires.length;
  const rows = Math.max(ports, wires.length);
  const gap = Math.min(32, 180 / Math.max(1, rows - 1));
  const startY = 202 - (rows - 1) * gap / 2;
  return <svg viewBox="0 0 720 390" role="img" aria-label="差込形コネクタの施工確認図">
    <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
    <text className="label" x="360" y="52" textAnchor="middle">差込形コネクタ</text>
    <text className="small" x="360" y="78" textAnchor="middle">{wireSummary(connection)} / 使用：{ports}本用</text>
    <g className="orthographic-object" data-push-ports={ports}>
      <rect className="material-push-body" x="350" y={startY - 18} width="193" height={(ports - 1) * gap + 36} rx="8" />
      <path className="material-push-bus" d={`M 485 ${startY - 10} V ${startY + (ports - 1) * gap + 10}`} />
      {Array.from({ length: ports }, (_, index) => {
        const y = startY + index * gap;
        return <g key={index} data-push-port={index}>
          <rect className="material-push-channel" x="353" y={y - 11} width="180" height="22" rx="5" />
          <rect className="material-push-entry" x="344" y={y - 8} width="15" height="16" rx="4" />
          <path className="material-push-spring" d={`M 464 ${y - 10} L 480 ${y - 2} L 493 ${y - 10}`} />
          <path className="material-push-stop" d={`M 528 ${y - 10} V ${y + 10}`} />
        </g>;
      })}
      {wires.map((wire, index) => {
        const y = startY + index * gap;
        const loose = wire.loose || index >= ports;
        const tip = loose ? 324 : defectType === "push_connector_insufficient_insert" && index === 0 ? 412 : 526;
        const insulationEnd = loose ? 285 : defectType === "push_connector_exposed_conductor" && index === 0 ? 302 : defectType === "push_connector_insulation_overinserted" && index === 0 ? 493 : 351;
        const label = `${index + 1}. ${wire.label || "電線"}`;
        return <g key={index} data-push-wire={index} data-port-index={loose ? "none" : index} data-copper-tip={tip} data-insulation-end={insulationEnd}>
          <title>{`${label} ${wire.diameter.toFixed(1)}mm`}</title>
          <text className="material-wire-label" x="54" y={y + 4}>{label.length > 12 ? label.slice(0, 11) + "…" : label}</text>
          <path className="material-wire" stroke={wirePaint[wire.color]} strokeWidth={wire.diameter === 2 ? 13 : 11} d={`M 226 ${y} H ${insulationEnd}`} />
          <path className="material-copper" style={{ strokeWidth: wire.diameter === 2 ? 8 : 6 }} d={`M ${insulationEnd} ${y} H ${tip}`} />
        </g>;
      })}
    </g>
    <text className="material-note" x="360" y="352" textAnchor="middle">{viewpoint === "front" ? "透明ハウジング内の接触部・先端確認位置を表示" : "接続部断面（各挿入口を展開）"}</text>
  </svg>;
}
