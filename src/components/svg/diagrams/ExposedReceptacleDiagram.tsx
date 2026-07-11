export function ExposedReceptacleDiagram() {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="露出コンセントの欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        露出コンセント
      </text>
      <rect className="device" x="410" y="118" width="130" height="150" rx="16" />
      <line className="device-mark" x1="450" y1="158" x2="450" y2="215" />
      <line className="device-mark" x1="500" y1="158" x2="500" y2="215" />
      <rect className="cable-sheath alert-fill" x="96" y="176" width="82" height="38" rx="18" />
      <path className="wire black" d="M 176 186 C 250 160, 330 150, 425 170" />
      <path className="wire white" d="M 176 206 C 250 236, 330 242, 425 215" />
      <line className="missing" x1="178" y1="176" x2="278" y2="142" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">
        外装が器具内まで入っていません
      </text>
    </svg>
  );
}
