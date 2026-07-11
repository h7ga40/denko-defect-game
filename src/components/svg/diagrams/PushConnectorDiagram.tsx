export function PushConnectorDiagram() {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="差し込みコネクタの欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        差し込みコネクタ
      </text>
      <rect className="device" x="300" y="135" width="150" height="105" rx="18" />
      <circle className="connector" cx="340" cy="188" r="15" />
      <circle className="connector" cx="375" cy="188" r="15" />
      <circle className="connector" cx="410" cy="188" r="15" />
      <path className="wire black" d="M 110 150 C 190 150, 230 175, 340 188" />
      <path className="wire white" d="M 110 225 C 190 225, 225 200, 375 188" />
      <path className="wire alert" d="M 110 188 C 165 188, 205 188, 275 188" />
      <line className="missing" x1="282" y1="188" x2="323" y2="188" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">
        心線が確認位置まで届いていません
      </text>
    </svg>
  );
}
