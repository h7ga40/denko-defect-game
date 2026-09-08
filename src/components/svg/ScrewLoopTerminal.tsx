export function ScrewLoopTerminal({ reverse = false, loose = false, plate = true }: { reverse?: boolean; loose?: boolean; plate?: boolean }) {
  // Mirror the copper only: tightening direction must not depend on cable entry.
  const loopPath = "M 0 52 C 0 38 -9 33 -17 22.25 A 28 28 0 1 1 6 27.35";
  return <g data-loop-direction={reverse ? "counterclockwise" : "clockwise"}>
    {plate && <rect className="lamp-terminal-plate" x="-38" y="-36" width="76" height="74" rx="9" />}
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
  </g>;
}
