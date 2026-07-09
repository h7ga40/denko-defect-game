import type { DefectType } from "../../data/problems";

type WiringDiagramProps = {
  defectType: DefectType;
};

export function WiringDiagram({ defectType }: WiringDiagramProps) {
  if (defectType === "missing_ground") {
    return <GroundedReceptacleDiagram />;
  }

  if (defectType === "sheath_too_short") {
    return <OutletBoxDiagram />;
  }
  if (
    defectType === "ring_sleeve_wrong_mark" ||
    defectType === "ring_sleeve_insufficient_insert"
  ) {
    return <RingSleeveDiagram defectType={defectType} />;
  }

  return <LampReceptacleDiagram defectType={defectType} />;
}

function LampReceptacleDiagram({
  defectType,
}: {
  defectType: "none" | "reverse_loop" | "reverse_polarity";
}) {
  const blackTarget = defectType === "reverse_polarity" ? "shell" : "center";
  const whiteTarget = defectType === "reverse_polarity" ? "center" : "shell";
  const reverseLoop = defectType === "reverse_loop";

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="ランプレセプタクル配線図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <rect className="cable-sheath" x="72" y="170" width="88" height="40" rx="20" />
      <circle className="fixture" cx="424" cy="190" r="92" />
      <circle className="fixture-inner" cx="424" cy="190" r="58" />
      <circle className="terminal center" cx="424" cy="190" r="21" />
      <circle className="terminal side" cx="508" cy="190" r="21" />
      <text className="label" x="360" y="103" textAnchor="middle">
        ランプレセプタクル
      </text>
      <text className="small" x="424" y="266" textAnchor="middle">
        中心接点
      </text>
      <text className="small" x="508" y="266" textAnchor="middle">
        ねじ受け側
      </text>

      <Wire
        colorName="black"
        label="黒"
        y={154}
        target={blackTarget}
        reverseLoop={reverseLoop && blackTarget === "center"}
      />
      <Wire
        colorName="white"
        label="白"
        y={226}
        target={whiteTarget}
        reverseLoop={reverseLoop && whiteTarget === "shell"}
      />

      {defectType !== "none" && (
        <text className="defect-label" x="360" y="340" textAnchor="middle">
          欠陥候補を図から判定
        </text>
      )}
    </svg>
  );
}
function Wire({
  colorName,
  label,
  y,
  target,
  reverseLoop,
}: {
  colorName: "black" | "white";
  label: string;
  y: number;
  target: "center" | "shell";
  reverseLoop: boolean;
}) {
  const targetX = target === "center" ? 424 : 508;
  const targetY = 190;
  const approachX = reverseLoop ? targetX + 44 : targetX - 44;
  const loopPath = reverseLoop
    ? `M ${targetX + 12} ${targetY - 27} C ${targetX + 45} ${targetY - 10}, ${targetX + 45} ${targetY + 27}, ${targetX + 12} ${targetY + 27}`
    : `M ${targetX - 12} ${targetY - 27} C ${targetX - 45} ${targetY - 10}, ${targetX - 45} ${targetY + 27}, ${targetX - 12} ${targetY + 27}`;

  return (
    <g>
      <path className={`wire ${colorName}`} d={`M 120 ${y} C 214 ${y}, 286 ${targetY}, ${approachX} ${targetY}`} />
      <path className={`wire loop ${reverseLoop ? "alert" : colorName}`} d={loopPath} />
      <rect className={`tag ${colorName}`} x="50" y={y - 21} width="54" height="42" rx="9" />
      <text className="tag-text" x="77" y={y + 7} textAnchor="middle">
        {label}
      </text>
      {reverseLoop && <circle className="warning" cx={targetX + 38} cy={targetY} r="18" />}
    </g>
  );
}
function RingSleeveDiagram({
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
function GroundedReceptacleDiagram() {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="接地極付コンセント配線図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <rect className="device" x="355" y="82" width="140" height="220" rx="28" />
      <circle className="terminal side" cx="390" cy="142" r="18" />
      <circle className="terminal center" cx="460" cy="142" r="18" />
      <circle className="terminal ground" cx="425" cy="250" r="20" />
      <text className="label" x="425" y="62" textAnchor="middle">
        接地極付コンセント
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

function OutletBoxDiagram() {
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
