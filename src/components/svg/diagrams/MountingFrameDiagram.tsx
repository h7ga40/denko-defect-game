export function MountingFrameDiagram() {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="連用取付枠の欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        連用取付枠
      </text>
      <rect className="device" x="250" y="96" width="220" height="190" rx="8" />
      <rect className="device" x="310" y="135" width="100" height="112" rx="10" />
      <circle className="terminal center" cx="290" cy="126" r="12" />
      <circle className="warning" cx="430" cy="254" r="22" />
      <line className="missing" x1="416" y1="238" x2="446" y2="270" />
      <line className="missing" x1="446" y1="238" x2="416" y2="270" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">
        片側の固定爪が掛かっていません
      </text>
    </svg>
  );
}
