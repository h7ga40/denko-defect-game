import { DeviceDetailShape } from "../DeviceDetailShape";

export function CeilingConnectorDiagram() {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="引掛シーリングローゼットの欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">引掛シーリングローゼット</text>
      <path className="wire black" d="M 92 145 C 210 145, 275 190, 470 190" />
      <path className="wire white" d="M 92 235 C 210 235, 285 190, 370 190" />
      <DeviceDetailShape variant="ceiling_connector" x={420} y={190} />
      <text className="defect-label" x="360" y="330" textAnchor="middle">
        白線と黒線の接続先が逆です
      </text>
    </svg>
  );
}
