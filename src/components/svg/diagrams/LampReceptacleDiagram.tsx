export function LampReceptacleDiagram({
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
  const approachX = reverseLoop ? targetX + 34 : targetX - 34;
  const loopPath = reverseLoop
    ? "M " + approachX + " " + targetY
      + " C " + (targetX + 34) + " " + (targetY - 24) + ", " + (targetX + 16) + " " + (targetY - 34) + ", " + targetX + " " + (targetY - 34)
      + " C " + (targetX - 26) + " " + (targetY - 34) + ", " + (targetX - 26) + " " + (targetY + 34) + ", " + targetX + " " + (targetY + 34)
      + " C " + (targetX + 15) + " " + (targetY + 34) + ", " + (targetX + 34) + " " + (targetY + 24) + ", " + approachX + " " + targetY
    : "M " + approachX + " " + targetY
      + " C " + (targetX - 34) + " " + (targetY - 24) + ", " + (targetX - 16) + " " + (targetY - 34) + ", " + targetX + " " + (targetY - 34)
      + " C " + (targetX + 26) + " " + (targetY - 34) + ", " + (targetX + 26) + " " + (targetY + 34) + ", " + targetX + " " + (targetY + 34)
      + " C " + (targetX - 15) + " " + (targetY + 34) + ", " + (targetX - 34) + " " + (targetY + 24) + ", " + approachX + " " + targetY;

  return (
    <g>
      <path className={"wire " + colorName} d={"M 120 " + y + " C 214 " + y + ", 286 " + targetY + ", " + approachX + " " + targetY} />
      <path className={"wire loop " + (reverseLoop ? "alert" : colorName)} d={loopPath} />
      <rect className={"tag " + colorName} x="50" y={y - 21} width="54" height="42" rx="9" />
      <text className="tag-text" x="77" y={y + 7} textAnchor="middle">
        {label}
      </text>
      {reverseLoop && <circle className="warning" cx={targetX + 42} cy={targetY} r="18" />}
    </g>
  );
}
