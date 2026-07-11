export function ReceptacleDiagram() {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="コンセントの欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        コンセント
      </text>
      <rect className="device" x="390" y="115" width="130" height="160" rx="18" />
      <line className="device-mark" x1="430" y1="160" x2="430" y2="220" />
      <line className="device-mark" x1="480" y1="160" x2="480" y2="220" />
      <path className="wire black" d="M 105 150 C 220 150, 290 195, 480 195" />
      <path className="wire white" d="M 105 235 C 220 235, 290 195, 430 195" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">
        接地側と非接地側が逆です
      </text>
    </svg>
  );
}
