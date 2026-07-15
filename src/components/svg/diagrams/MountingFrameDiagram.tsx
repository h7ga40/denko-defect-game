import { DeviceDetailShape } from "../DeviceDetailShape";

export function MountingFrameDiagram() {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="連用取付枠の欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="55" textAnchor="middle">連用取付枠</text>
      <DeviceDetailShape variant="mounting_frame" x={360} y={190} />
      <circle className="warning" cx="430" cy="235" r="22" />
      <line className="missing" x1="416" y1="221" x2="444" y2="249" />
      <line className="missing" x1="444" y1="221" x2="416" y2="249" />
      <text className="defect-label" x="360" y="350" textAnchor="middle">
        片側の固定爪が掛かっていません
      </text>
    </svg>
  );
}
