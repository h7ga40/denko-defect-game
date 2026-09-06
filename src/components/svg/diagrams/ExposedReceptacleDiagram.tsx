import type { CableEntrySide } from "../../../data/boxInspectionGame";
import type { InspectionViewpoint } from "../../../data/physicalInspection";

type ExposedDefect = "none" | "exposed_receptacle_sheath" | "exposed_receptacle_entry_bypass" | "receptacle_polarity" | "terminal_screw_loose";
const rotation: Record<CableEntrySide, number> = { bottom: 0, left: 90, top: 180, right: 270 };

export function ExposedReceptacleDiagram({ cableEntrySide = "left", defectType = "exposed_receptacle_sheath", viewpoint = "front" }: {
  cableEntrySide?: CableEntrySide;
  defectType?: ExposedDefect;
  viewpoint?: InspectionViewpoint;
}) {
  const bypass = defectType === "exposed_receptacle_entry_bypass";
  const shortSheath = defectType === "exposed_receptacle_sheath";
  const side = viewpoint === "left" || viewpoint === "right";
  const back = viewpoint === "back";
  const sheathEnd = shortSheath ? 135 : bypass ? 112 : 85;
  const loose = defectType === "terminal_screw_loose";
  const colors = defectType === "receptacle_polarity" ? ["black", "white"] : ["white", "black"];
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="露出形コンセントの施工確認図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="50" textAnchor="middle">露出形コンセント</text>
      <g data-exposed-routing={bypass ? "over_base" : "through_entry"} data-sheath-position={bypass ? "above_base" : shortSheath ? "outside_base" : "inside_base"}>
        {side ? (
          <>
            <g transform={viewpoint === "right" ? "translate(720 0) scale(-1 1)" : undefined}>
              <path className="exposed-base" d="M 250 245 H 405 V 272 H 250 Z M 455 245 H 490 V 272 H 455 Z" />
              <path className="lamp-cable-sheath" d={bypass ? "M 610 215 H 490" : shortSheath ? "M 610 300 H 520" : "M 610 300 H 440 Q 430 300 430 290 V 237"} />
              <path className="lamp-insulation black" d={bypass ? "M 490 215 H 430 Q 420 215 410 220 H 340" : shortSheath ? "M 520 300 H 440 Q 430 300 430 290 V 230 Q 430 220 420 220 H 340" : "M 430 237 V 230 Q 430 220 420 220 H 340"} />
              <rect className="lamp-terminal-plate" x="305" y="233" width="48" height="12" rx="2" />
              <path className="lamp-loop-copper" d="M 340 220 H 315 V 230 H 337" />
              <g transform={loose ? "translate(0 -13)" : undefined}>
                <rect className="lamp-screw-shank" x="322" y="212" width="12" height="26" />
                <rect className="lamp-screw-head" x="313" y="208" width="30" height="11" rx="3" />
              </g>
            </g>
            <text className="lamp-view-note" x="360" y="341" textAnchor="middle">台座断面（黒線1本を表示）</text>
          </>
        ) : (
          <g transform={`translate(360 205) rotate(${rotation[cableEntrySide] * (back ? -1 : 1)})`}>
            <path className="lamp-cable-sheath" d={`M 0 150 V ${sheathEnd}`} />
            {colors.map((color, i) => <path key={color} className={`lamp-insulation ${color}`} d={`M ${i ? 10 : -10} ${sheathEnd} V 82`} />)}
            <rect className="exposed-base" x="-94" y="-104" width="188" height="208" rx="12" />
            <rect className="exposed-entry" x="-25" y="65" width="50" height="31" rx="5" />
            {[-76, 76].map(x => <circle key={x} className="exposed-entry" cx={x} cy="-10" r="7" />)}
            {back ? (!bypass && <>
              <path className="lamp-cable-sheath" d={`M 0 150 V ${sheathEnd}`} />
              {[...colors].reverse().map((color, i) => <path key={color} className={`lamp-insulation ${color}`} d={`M ${i ? 10 : -10} ${sheathEnd} V 82`} />)}
            </>) : <>
              <rect className="exposed-divider" x="-10" y="-87" width="20" height="116" rx="5" />
              <circle className="exposed-entry" cy="-43" r="8" />
              {!bypass && !shortSheath && <path className="lamp-cable-sheath" d="M 0 93 V 78" />}
              {colors.map((color, index) => {
                const x = index ? 55 : -55;
                const wireStart = bypass ? 112 : 82;
                return <g key={color} data-exposed-terminal={index ? "line" : "neutral"} data-wire-color={color}>
                  <rect className="lamp-terminal-plate" x={x - 22} y="-75" width="44" height="105" rx="4" />
                  <path className="exposed-contact" d={`M ${x + (index ? -16 : 16)} -53 V -14`} />
                  <circle className="exposed-screw" cx={x} cy="-60" r="17" />
                  <path className="lamp-screw-slot" d={`M ${x - 9} -60 H ${x + 9}`} />
                  <path className={`lamp-insulation ${color}`} d={`M ${index ? 10 : -10} ${wireStart} C ${x} ${bypass ? 120 : 82}, ${x} 60, ${x} 46`} />
                  <g transform={`translate(${x} 12) scale(.65)`}>
                    <circle className="lamp-screw-shank" r="15" />
                    <path className="lamp-loop-outline" d="M 0 52 C 0 38 -9 33 -17 22.25 A 28 28 0 1 1 6 27.35" />
                    <path className="lamp-loop-copper" d="M 0 52 C 0 38 -9 33 -17 22.25 A 28 28 0 1 1 6 27.35" />
                    <g transform={loose && index === 1 ? "translate(0 -12)" : undefined}>
                      <circle className="lamp-screw-head" r="35" />
                      <path className="lamp-screw-slot" d="M -17 0 H 17 M 0 -13 V 13" />
                    </g>
                  </g>
                </g>;
              })}
              <text className="exposed-polarity" x="-55" y="-83" textAnchor="middle">W</text>
            </>}
          </g>
        )}
      </g>
      {!side && <text className="lamp-view-note" x="43" y="366">{back ? "台座裏側" : "カバー取り外し・ねじ頭透過"}</text>}
    </svg>
  );
}
