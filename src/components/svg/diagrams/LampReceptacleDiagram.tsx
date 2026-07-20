import type { CableEntrySide } from "../../../data/boxInspectionGame";
import { DirectionalSheath, DirectionalWire } from "../DirectionalCable";

export function LampReceptacleDiagram({
  cableEntrySide = "left",
  defectType,
}: {
  cableEntrySide?: CableEntrySide;
  defectType: "none" | "reverse_loop" | "reverse_polarity" | "terminal_screw_loose" | "lamp_cover_cannot_close";
}) {
  const blackTarget = defectType === "reverse_polarity" ? "shell" : "center";
  const whiteTarget = defectType === "reverse_polarity" ? "center" : "shell";
  const reverseLoop = defectType === "reverse_loop";
  const looseScrew = defectType === "terminal_screw_loose";
  const coverCannotClose = defectType === "lamp_cover_cannot_close";

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="ランプレセプタクル配線図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <DirectionalSheath side={cableEntrySide} />
      <circle className="fixture" cx="424" cy="190" r="92" />
      <circle className="fixture-inner" cx="424" cy="190" r="58" />
      <circle className={looseScrew ? "terminal center alert-fill" : "terminal center"} cx="424" cy={looseScrew ? 181 : 190} r="21" />
      <line className={looseScrew ? "terminal-screw alert-stroke" : "terminal-screw"} x1="410" y1={looseScrew ? 181 : 190} x2="438" y2={looseScrew ? 181 : 190} />
      <circle className="terminal side" cx="508" cy="190" r="21" />
      <line className="terminal-screw" x1="494" y1="190" x2="522" y2="190" />
      {coverCannotClose && (
        <g className="lamp-open-cover">
          <path className="fixture alert-stroke" d="M 520 92 C 604 112, 634 176, 614 248 C 584 234, 560 214, 548 184 C 544 151, 535 118, 520 92 Z" />
          <path className="wire alert" d="M 485 226 C 546 260, 575 257, 607 230" />
          <text className="defect-label" x="590" y="276" textAnchor="middle">電線がカバーに干渉</text>
        </g>
      )}
      <text className="label" x="360" y="55" textAnchor="middle">
        ランプレセプタクル
      </text>
      <text className="small" x="424" y="266" textAnchor="middle">
        中心接点
      </text>
      <text className="small" x="508" y="266" textAnchor="middle">
        ねじ受け側
      </text>

      <Wire
        cableEntrySide={cableEntrySide}
        colorName="black"
        label="黒"
        y={154}
        target={blackTarget}
        reverseLoop={reverseLoop && blackTarget === "center"}
      />
      <Wire
        cableEntrySide={cableEntrySide}
        colorName="white"
        label="白"
        y={226}
        target={whiteTarget}
        reverseLoop={reverseLoop && whiteTarget === "shell"}
      />

      {defectType !== "none" && (
        <text className="defect-label" x="360" y={cableEntrySide === "bottom" ? 84 : 340} textAnchor="middle">
          欠陥候補を図から判定
        </text>
      )}
    </svg>
  );
}

function Wire({
  cableEntrySide,
  colorName,
  label,
  y,
  target,
  reverseLoop,
}: {
  cableEntrySide: CableEntrySide;
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
      <DirectionalWire className={"wire " + colorName} lane={y - 190} side={cableEntrySide} targetX={approachX} targetY={targetY} />
      <path className={"wire loop " + (reverseLoop ? "alert" : colorName)} d={loopPath} />
      {cableEntrySide === "left" && (
        <>
          <rect className={"tag " + colorName} x="50" y={y - 21} width="54" height="42" rx="9" />
          <text className="tag-text" x="77" y={y + 7} textAnchor="middle">{label}</text>
        </>
      )}
      {reverseLoop && <circle className="warning" cx={targetX + 42} cy={targetY} r="18" />}
    </g>
  );
}
