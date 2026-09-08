import type { MaterialDefectType } from "../../data/materialDefects";
import type { CableRunSpecification } from "../../data/cableSpecifications";
import type { InspectionViewpoint } from "../../data/physicalInspection";
import { ScrewLoopTerminal } from "./ScrewLoopTerminal";

export function MaterialDefectDiagram({ defectType, viewpoint = "front", cable }: { defectType: MaterialDefectType; viewpoint?: InspectionViewpoint; cable?: CableRunSpecification }) {
  const loop = defectType.startsWith("loop_");
  const split = defectType === "cable_split_sheath";
  const colors = cable?.coreColors ?? ["black", "white"];
  return <svg viewBox="0 0 720 390" role="img" aria-label={loop ? "輪づくりの端子拡大図" : "電線加工の拡大図"} data-material-defect={defectType}>
    <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
    <text className="label" x="360" y="52" textAnchor="middle">{loop ? "輪づくり・端子部拡大" : "電線加工・加工端拡大"}</text>
    {loop ? <>
      <g transform="translate(360 190) scale(1.8)">
        <path className="fitting-wire-outline" d="M 0 90 V 52" />
        <path className="fitting-wire black" d="M 0 90 V 52" />
        <ScrewLoopTerminal defect={defectType} />
      </g>
      {defectType === "loop_excess_tail" && <text className="small" x="520" y="275">先端の突出 8mm</text>}
    </> : <g data-core-count={colors.length}>
      {colors.map((color, i) => {
        const x = 360 + (i - (colors.length - 1) / 2) * 37;
        return <g key={i} data-preparation-core={i}>
          <path className="fitting-wire-outline" d={`M ${x} 290 V 166`} />
          <path className={`fitting-wire ${color}`} d={`M ${x} 290 V 166`} />
          <path className="material-copper" d={`M ${x} 166 V 108`} />
          {!split && i === 0 && <path className="material-cut-edge" data-conductor-notch="true" d={`M ${x - 4} 127 L ${x + 1} 132 L ${x - 4} 138 Z`} />}
        </g>;
      })}
      {cable?.hasSheath !== false && <rect className="material-sheath" x={330 - Math.max(0, colors.length - 2) * 18} y="265" width={60 + Math.max(0, colors.length - 2) * 36} height="63" rx="5" />}
      {split && <g data-split-sheath-mm="30">
        <path className="material-sheath" d="M 333 275 L 302 209 L 317 202 L 348 270 Z M 372 270 L 397 207 L 412 214 L 389 278 Z" />
        <path className="fitting-slot" d="M 310 207 L 339 270 M 405 210 L 381 270" />
        <text className="small" x="470" y="238">縦割り残り 30mm</text>
      </g>}
      {!split && <g>
        <path className="fitting-slot" strokeDasharray="4 4" d={`M ${360 - (colors.length - 1) * 18.5} 132 L 494 147`} />
        <rect className="panel" x="494" y="100" width="114" height="139" rx="6" />
        <path className="material-copper" style={{strokeWidth: 24}} d="M 550 119 V 218" />
        <path className="material-cut-edge" d="M 536 155 L 552 170 L 536 188 Z" />
        <text className="small" x="550" y="261" textAnchor="middle">導体の傷（拡大）</text>
      </g>}
    </g>}
    <text className="material-note" x="360" y="358" textAnchor="middle">{viewpoint === "front" ? "観察用の拡大模式図" : "傷・重なりの位置を透視した展開図"}</text>
  </svg>;
}
