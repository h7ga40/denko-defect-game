export function TerminalBlockDiagram({ title = "端子台" }: { title?: string }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        {title}
      </text>
      <rect className="device" x="250" y="110" width="220" height="150" rx="10" />
      {[0, 1, 2, 3].map((index) => (
        <g key={index}>
          <rect className="terminal" x={275 + index * 45} y="150" width="34" height="58" rx="5" />
          <text className="small" x={292 + index * 45} y="135" textAnchor="middle">
            {index + 1}
          </text>
        </g>
      ))}
      <path className="wire black" d="M 95 165 C 170 165, 215 178, 292 178" />
      <path className="wire alert" d="M 95 220 C 185 240, 255 178, 382 178" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">
        指定端子ではなく隣の端子へ接続
      </text>
    </svg>
  );
}
