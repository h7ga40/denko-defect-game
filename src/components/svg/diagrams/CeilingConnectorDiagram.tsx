export function CeilingConnectorDiagram() {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="引掛けシーリングの欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        引掛けシーリング
      </text>
      <circle className="fixture" cx="420" cy="190" r="78" />
      <rect className="device" x="372" y="150" width="96" height="80" rx="16" />
      <circle className="terminal center" cx="395" cy="190" r="16" />
      <circle className="terminal side" cx="445" cy="190" r="16" />
      <path className="wire black" d="M 105 150 C 210 150, 260 190, 445 190" />
      <path className="wire white" d="M 105 230 C 220 230, 285 190, 395 190" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">
        白線と黒線の接続先が逆です
      </text>
    </svg>
  );
}
