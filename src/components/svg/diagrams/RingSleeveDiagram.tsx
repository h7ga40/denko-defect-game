export function RingSleeveDiagram({
  defectType,
}: {
  defectType:
    | "ring_sleeve_wrong_mark"
    | "ring_sleeve_wrong_size"
    | "ring_sleeve_insufficient_insert"
    | "ring_sleeve_insulation_bite";
}) {
  const wrongMark = defectType === "ring_sleeve_wrong_mark";
  const wrongSize = defectType === "ring_sleeve_wrong_size";
  const shortInsert = defectType === "ring_sleeve_insufficient_insert";
  const insulationBite = defectType === "ring_sleeve_insulation_bite";
  const mark = wrongMark ? "小" : wrongSize ? "○" : "○";
  const sleeveLabel = wrongSize ? "小スリーブ" : "適合スリーブ";

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="リングスリーブ圧着図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        リングスリーブ圧着
      </text>

      <text className="small" x="360" y="92" textAnchor="middle">
        {wrongSize ? "2.0mm 1本 + 1.6mm 2本の接続例" : "1.6mm 3本の接続例"}
      </text>

      <path className="wire black" d="M 84 124 C 178 124, 240 152, 330 170" />
      <path className="wire white" d="M 84 242 C 180 242, 244 222, 330 204" />
      <path
        className={insulationBite ? "wire red alert" : "wire red"}
        d="M 84 156 C 172 156, 235 168, 330 182"
      />
      <path
        className={shortInsert ? "wire green broken" : "wire green"}
        d={shortInsert ? "M 84 188 C 160 188, 216 190, 282 190" : "M 84 188 C 180 188, 246 190, 330 190"}
      />

      {insulationBite && <rect className="cable-sheath alert-fill" x="252" y="166" width="92" height="28" rx="14" />}

      <rect className={wrongSize ? "sleeve alert-fill" : "sleeve"} x="312" y="142" width={wrongSize ? "86" : "110"} height="96" rx="28" />
      <text className="small" x={wrongSize ? "355" : "367"} y="132" textAnchor="middle">
        {sleeveLabel}
      </text>
      <rect className={wrongMark ? "sleeve-mark alert-fill" : "sleeve-mark"} x="346" y="170" width="42" height="40" rx="8" />
      <text className="sleeve-text" x="367" y="197" textAnchor="middle">
        {mark}
      </text>

      <path className="wire black" d="M 404 170 C 470 170, 534 142, 628 136" />
      <path className="wire red" d="M 404 182 C 470 182, 540 166, 628 164" />
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
      {wrongSize && (
        <text className="defect-label" x="360" y="340" textAnchor="middle">
          電線の太さと本数に対してリングスリーブのサイズが合っていない状態
        </text>
      )}
      {insulationBite && (
        <text className="defect-label" x="360" y="340" textAnchor="middle">
          絶縁被覆をリングスリーブでかみ込んで圧着している状態
        </text>
      )}
    </svg>
  );
}
