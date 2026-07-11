export function RingSleeveDiagram({
  defectType,
}: {
  defectType: "ring_sleeve_wrong_mark" | "ring_sleeve_insufficient_insert";
}) {
  const wrongMark = defectType === "ring_sleeve_wrong_mark";
  const shortInsert = defectType === "ring_sleeve_insufficient_insert";

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="リングスリーブ圧着図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        リングスリーブ圧着
      </text>

      <path className="wire black" d="M 84 132 C 180 132, 240 154, 330 172" />
      <path className="wire white" d="M 84 242 C 180 242, 244 222, 330 204" />
      <path
        className={shortInsert ? "wire green broken" : "wire green"}
        d={shortInsert ? "M 84 188 C 160 188, 216 190, 282 190" : "M 84 188 C 180 188, 246 190, 330 190"}
      />

      <rect className="sleeve" x="312" y="142" width="110" height="96" rx="28" />
      <rect className={wrongMark ? "sleeve-mark alert-fill" : "sleeve-mark"} x="346" y="170" width="42" height="40" rx="8" />
      <text className="sleeve-text" x="367" y="197" textAnchor="middle">
        {wrongMark ? "小" : "○"}
      </text>

      <path className="wire black" d="M 404 172 C 470 172, 534 142, 628 136" />
      <path className="wire white" d="M 404 204 C 470 204, 536 238, 628 246" />
      <path className="wire green" d="M 404 190 C 486 190, 548 190, 628 190" />

      {wrongMark && (
        <text className="defect-label" x="360" y="340" textAnchor="middle">
          電線条件に対して刻印が合っていない状態
        </text>
      )}
      {shortInsert && (
        <text className="defect-label" x="360" y="340" textAnchor="middle">
          緑線の心線が圧着部まで十分に入っていない状態
        </text>
      )}
    </svg>
  );
}
