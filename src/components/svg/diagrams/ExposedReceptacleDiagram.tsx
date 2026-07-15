import { DeviceDetailShape } from "../DeviceDetailShape";

export function ExposedReceptacleDiagram() {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="露出形コンセントの欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">露出形コンセント</text>
      <rect className="cable-sheath alert-fill" x="82" y="176" width="96" height="38" rx="18" />
      <path className="wire black" d="M 176 186 C 260 155, 365 165, 458 175" />
      <path className="wire white" d="M 176 206 C 260 238, 390 225, 492 198" />
      <line className="missing" x1="178" y1="176" x2="282" y2="142" />
      <DeviceDetailShape variant="exposed_receptacle" x={475} y={195} />
      <text className="defect-label" x="360" y="340" textAnchor="middle">
        外装が器具内まで入っていません
      </text>
    </svg>
  );
}
