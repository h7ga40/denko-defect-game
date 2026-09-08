export function ScrewLoopTerminal({ reverse = false, loose = false, plate = true, defect }: { reverse?: boolean; loose?: boolean; plate?: boolean; defect?: string }) {
  // Mirror the copper only: tightening direction must not depend on cable entry.
  const normalPath = "M 0 52 C 0 38 -9 33 -17 22.25 A 28 28 0 1 1 6 27.35";
  const loopPath = defect === "loop_insufficient_wrap" ? "M 0 52 C 0 38 -9 33 -17 22.25 A 28 28 0 0 1 17 -22.25"
    : defect === "loop_tip_overlap" ? normalPath + " Q -6 34 -20 24 L -2 44"
    : defect === "loop_excess_tail" ? normalPath + " L 48 54"
    : defect === "loop_oversized" ? "M 0 52 C -16 47 -37 34 -43 16 A 46 46 0 1 1 12 44" : normalPath;
  const tip = defect === "loop_insufficient_wrap" ? [17, -22.25] : defect === "loop_tip_overlap" ? [-2, 44] : defect === "loop_excess_tail" ? [48, 54] : defect === "loop_oversized" ? [12, 44] : [6, 27.35];
  return <g data-loop-direction={reverse ? "counterclockwise" : "clockwise"}>
    {plate && <rect className="lamp-terminal-plate" x="-38" y="-36" width="76" height="74" rx="9" />}
    <circle className="lamp-screw-shank" r="15" />
    <g transform={reverse ? "scale(-1 1)" : undefined}>
      <path className="lamp-loop-outline" d={loopPath} />
      <path className="lamp-loop-copper" d={loopPath} />
      <path className="lamp-loop-highlight" d={loopPath} />
      <circle className="lamp-copper-tip" cx={tip[0]} cy={tip[1]} r="3" />
    </g>
    <g transform={loose ? "translate(0 -9)" : undefined}>
      <circle className="lamp-screw-head" r="35" />
      <path className="lamp-screw-slot" d="M -17 0 H 17 M 0 -13 V 13" />
    </g>
  </g>;
}
