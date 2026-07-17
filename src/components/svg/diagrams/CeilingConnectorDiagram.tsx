import type { CableEntrySide } from "../../../data/boxInspectionGame";
import { DeviceDetailShape } from "../DeviceDetailShape";
import { DirectionalWire } from "../DirectionalCable";

export function CeilingConnectorDiagram({ cableEntrySide }: { cableEntrySide: CableEntrySide }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="引掛シーリングローゼットの欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">引掛シーリングローゼット</text>
      <DirectionalWire className="wire black" lane={-38} side={cableEntrySide} targetX={470} targetY={190} />
      <DirectionalWire className="wire white" lane={38} side={cableEntrySide} targetX={370} targetY={190} />
      <DeviceDetailShape variant="ceiling_connector" x={420} y={190} />
      <text className="defect-label" x="360" y={cableEntrySide === "bottom" ? 94 : 330} textAnchor="middle">
        白線と黒線の接続先が逆です
      </text>
    </svg>
  );
}
