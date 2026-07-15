export function SwitchDiagram({ title = "単極スイッチ" }: { title?: string }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        {title}
      </text>
      <rect className="device" x="325" y="110" width="120" height="165" rx="14" />
      <text className="small" x="385" y="143" textAnchor="middle">
        共通
      </text>
      <circle className="terminal center" cx="355" cy="170" r="15" />
      <circle className="terminal side" cx="415" cy="170" r="15" />
      <circle className="terminal side" cx="385" cy="230" r="15" />
      <path className="wire alert" d="M 95 180 C 190 180, 250 170, 415 170" />
      <path className="wire red" d="M 95 240 C 205 250, 285 230, 385 230" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">
        黒線が指定端子に入っていません
      </text>
    </svg>
  );
}
