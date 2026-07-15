export function GroundedReceptacleDiagram({ title = "接地極付コンセント" }: { title?: string }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <rect className="device" x="355" y="82" width="140" height="220" rx="28" />
      <circle className="terminal side" cx="390" cy="142" r="18" />
      <circle className="terminal center" cx="460" cy="142" r="18" />
      <circle className="terminal ground" cx="425" cy="250" r="20" />
      <text className="label" x="425" y="62" textAnchor="middle">
        {title}
      </text>
      <path className="wire black" d="M 80 128 C 180 128, 230 142, 442 142" />
      <path className="wire white" d="M 80 190 C 178 190, 238 142, 372 142" />
      <path className="wire green broken" d="M 80 260 C 180 260, 250 250, 338 250" />
      <line className="missing" x1="356" y1="250" x2="396" y2="250" />
      <text className="defect-label" x="360" y="340" textAnchor="middle">
        緑の接地線が接地端子まで接続されていません
      </text>
    </svg>
  );
}
