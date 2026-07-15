export function BreakerDiagram({ title = "配線用遮断器" }: { title?: string }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        {title}
      </text>
      <rect className="device" x="298" y="105" width="135" height="170" rx="12" />
      <text className="small" x="365" y="135" textAnchor="middle">
        上: 電源側
      </text>
      <text className="small" x="365" y="255" textAnchor="middle">
        下: 負荷側
      </text>
      <circle className="terminal center" cx="335" cy="155" r="14" />
      <circle className="terminal center" cx="395" cy="155" r="14" />
      <circle className="terminal side" cx="335" cy="225" r="14" />
      <circle className="terminal side" cx="395" cy="225" r="14" />
      <path className="wire alert" d="M 110 150 C 190 260, 250 225, 335 225" />
      <path className="wire alert" d="M 110 230 C 200 105, 270 155, 395 155" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">
        電源側と負荷側が逆です
      </text>
    </svg>
  );
}
