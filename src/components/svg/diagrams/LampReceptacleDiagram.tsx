import type { CableEntrySide } from "../../../data/boxInspectionGame";

type LampDefect = "none" | "reverse_loop" | "reverse_polarity" | "terminal_screw_loose" | "lamp_cover_cannot_close" | "lamp_cable_entry_bypass";
const entryRotation: Record<CableEntrySide, number> = { bottom: 0, left: 90, top: 180, right: 270 };

export function LampReceptacleDiagram({
  cableEntrySide = "left",
  defectType,
}: {
  cableEntrySide?: CableEntrySide;
  defectType: LampDefect;
}) {
  const angle = entryRotation[cableEntrySide];
  const radians = angle * Math.PI / 180;
  const project = (x: number, y: number) => ({
    x: 360 + x * Math.cos(radians) - y * Math.sin(radians),
    y: 205 + x * Math.sin(radians) + y * Math.cos(radians),
  });
  const sheathStart = project(0, 157);
  const sheathEnd = project(0, 103);
  const coverCannotClose = defectType === "lamp_cover_cannot_close";
  const bypassEntry = defectType === "lamp_cable_entry_bypass";

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="ランプレセプタクルの輪づくり確認図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="47" textAnchor="middle">ランプレセプタクル</text>
      <g className="lamp-terminal-assembly" data-cable-routing={bypassEntry ? "over_base" : "through_entry"}>
        <path className="lamp-cable-sheath" d={`M ${sheathStart.x} ${sheathStart.y} L ${sheathEnd.x} ${sheathEnd.y}`} />
        <circle className="lamp-base" cx="360" cy="205" r="110" />
        <circle className="lamp-base-rim" cx="360" cy="205" r="99" />
        <g transform={`translate(360 205) rotate(${angle})`}>
          <rect className="lamp-center-recess" x="-17" y="-62" width="34" height="94" rx="14" />
          <circle className="lamp-mounting-hole" cx="0" cy="-83" r="7" />
          <circle className="lamp-mounting-hole" cx="68" cy="65" r="7" />
          <rect className="lamp-entry-hole" x="-23" y="65" width="46" height="29" rx="5" />
        </g>
        {(["center", "shell"] as const).map((terminal, index) => {
          const offset = index === 0 ? -56 : 56;
          const color = (terminal === "center") !== (defectType === "reverse_polarity") ? "black" : "white";
          const position = project(offset, 0);
          const start = project(color === "black" ? -10 : 10, bypassEntry ? 111 : 82);
          const bend = project(offset, bypassEntry ? 123 : 82);
          const end = project(offset, 52);
          const reverse = defectType === "reverse_loop" && terminal === "center";
          return (
            <g key={terminal} data-lamp-terminal={terminal} data-wire-color={color}>
              <path className={`lamp-insulation ${color}`} d={`M ${start.x} ${start.y} C ${start.x} ${start.y}, ${bend.x} ${bend.y}, ${end.x} ${end.y}`} />
              <g transform={`translate(${position.x} ${position.y}) rotate(${angle})`}>
                <LoopTerminal reverse={reverse} loose={defectType === "terminal_screw_loose" && terminal === "center"} />
              </g>
              <text className="lamp-terminal-name" x={position.x} y={position.y - 44} textAnchor="middle">
                {terminal === "center" ? "中心接点側" : "受金側"}
              </text>
            </g>
          );
        })}
        {coverCannotClose && (
          <g className="lamp-open-cover">
            <path className="lamp-base" d="M 502 100 C 577 120, 608 181, 588 252 C 552 231, 526 205, 520 170 Z" />
            <path className="lamp-insulation black" d="M 450 237 C 486 264, 539 273, 582 240" />
          </g>
        )}
      </g>
      <text className="lamp-view-note" x="43" y="345">ねじ頭を透過表示</text>
    </svg>
  );
}

function LoopTerminal({ reverse, loose }: { reverse: boolean; loose: boolean }) {
  // From the insulated lead, the open end runs clockwise around the screw.
  // Mirror only the copper geometry for the reverse-loop defect.
  const loopPath = "M 0 52 C 0 38 -9 33 -17 22.25 A 28 28 0 1 1 6 27.35";
  return (
    <g data-loop-direction={reverse ? "counterclockwise" : "clockwise"}>
      <rect className="lamp-terminal-plate" x="-38" y="-36" width="76" height="74" rx="9" />
      <circle className="lamp-screw-shank" r="15" />
      <g transform={reverse ? "scale(-1 1)" : undefined}>
        <path className="lamp-loop-outline" d={loopPath} />
        <path className="lamp-loop-copper" d={loopPath} />
        <path className="lamp-loop-highlight" d={loopPath} />
        <circle className="lamp-copper-tip" cx="6" cy="27.35" r="3" />
      </g>
      <g transform={loose ? "translate(0 -9)" : undefined}>
        <circle className="lamp-screw-head" r="35" />
        <path className="lamp-screw-slot" d="M -17 0 H 17 M 0 -13 V 13" />
      </g>
    </g>
  );
}
