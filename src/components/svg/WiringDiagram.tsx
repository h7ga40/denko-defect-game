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

  const blackTarget = defectType === "reverse_polarity" ? "side" : "center";
  const whiteTarget = defectType === "reverse_polarity" ? "center" : "side";
  const reverseLoop = defectType === "reverse_loop";

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="ランプレセプタクル配線図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <circle className="fixture" cx="360" cy="190" r="84" />
      <circle className="terminal center" cx="360" cy="190" r="22" />
      <circle className="terminal side" cx="500" cy="190" r="22" />
      <text className="label" x="360" y="103" textAnchor="middle">
        ランプレセプタクル
      </text>
      <text className="small" x="360" y="246" textAnchor="middle">
        中心接点
      </text>
      <text className="small" x="500" y="246" textAnchor="middle">
        ねじ受け側
      </text>

      <Wire
        colorName="black"
        label="黒"
        y={145}
        target={blackTarget}
        reverseLoop={reverseLoop && blackTarget === "center"}
      />
      <Wire
        colorName="white"
        label="白"
        y={235}
        target={whiteTarget}
        reverseLoop={reverseLoop && whiteTarget === "side"}
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
  target: "center" | "side";
  reverseLoop: boolean;
}) {
  const targetX = target === "center" ? 360 : 500;
  const targetY = target === "center" ? 190 : 190;
  const loopPath = reverseLoop
    ? `M ${targetX - 8} ${targetY - 26} C ${targetX - 44} ${targetY - 12}, ${targetX - 44} ${targetY + 28}, ${targetX - 8} ${targetY + 26}`
    : `M ${targetX + 8} ${targetY - 26} C ${targetX + 44} ${targetY - 12}, ${targetX + 44} ${targetY + 28}, ${targetX + 8} ${targetY + 26}`;

  return (
    <g>
      <path className={`wire ${colorName}`} d={`M 95 ${y} C 190 ${y}, 220 ${targetY}, ${targetX - 36} ${targetY}`} />
      <path className={`wire loop ${reverseLoop ? "alert" : colorName}`} d={loopPath} />
      <rect className={`tag ${colorName}`} x="56" y={y - 21} width="54" height="42" rx="9" />
      <text className="tag-text" x="83" y={y + 7} textAnchor="middle">
        {label}
      </text>
      {reverseLoop && <circle className="warning" cx={targetX - 38} cy={targetY} r="18" />}
    </g>
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
