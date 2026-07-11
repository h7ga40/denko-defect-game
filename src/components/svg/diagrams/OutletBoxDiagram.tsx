export function OutletBoxDiagram() {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="アウトレットボックス配線図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <rect className="box" x="250" y="82" width="230" height="220" rx="22" />
      <rect className="cable-sheath alert-fill" x="132" y="176" width="88" height="36" rx="18" />
      <path className="wire black" d="M 215 185 C 260 155, 310 138, 430 150" />
      <path className="wire white" d="M 215 203 C 270 228, 315 245, 426 232" />
      <circle className="connector" cx="444" cy="150" r="21" />
      <circle className="connector" cx="444" cy="232" r="21" />
      <line className="missing" x1="220" y1="176" x2="256" y2="176" />
      <line className="missing" x1="220" y1="212" x2="256" y2="212" />
      <text className="label" x="365" y="62" textAnchor="middle">
        アウトレットボックス
      </text>
      <text className="defect-label" x="360" y="340" textAnchor="middle">
        外装がボックス内に十分入っていない状態
      </text>
    </svg>
  );
}
