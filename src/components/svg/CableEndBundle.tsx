import type { CableEndPreparation, CableRunSpecification } from "../../data/cableSpecifications";

export function CableEndBundle({ cable, preparation, correct, y, damaged = false }: {
  cable: CableRunSpecification;
  preparation: CableEndPreparation;
  correct: CableEndPreparation;
  y: number;
  damaged?: boolean;
}) {
  const scale = Math.min(1.5, 205 / Math.max(1, preparation.sheathStripLengthMm ?? 0, correct.sheathStripLengthMm ?? 0));
  const sheathEnd = cable.hasSheath ? 520 - (preparation.sheathStripLengthMm ?? 0) * scale : 190;
  const height = cable.coreCount * 12 + 10;
  return <g data-cable-bundle data-core-count={cable.coreCount}>
    {cable.coreColors.map((color, index) => {
      const wireY = y + (index - (cable.coreCount - 1) / 2) * 16;
      const copperX = 520 - (preparation.insulationStripLengthsMm[index] ?? preparation.insulationStripLengthsMm[0] ?? 0) * scale;
      const wound = sheathEnd + (copperX - sheathEnd) * .55;
      return <g key={index} data-cable-core={index}>
        <path className={`cable-insulation ${color}`} d={`M 190 ${wireY} H ${copperX}`} />
        <path className="cable-conductor" d={`M ${copperX} ${wireY} H 520`} />
        {damaged && index === 0 && <g data-insulation-wound>
          <path className="material-cut-edge" d={`M ${wound - 12} ${wireY - 5} L ${wound + 9} ${wireY - 5} L ${wound + 13} ${wireY + 4} L ${wound - 10} ${wireY + 5} Z`} />
          <path className="material-copper" d={`M ${wound - 9} ${wireY} H ${wound + 10}`} />
        </g>}
      </g>;
    })}
    {cable.hasSheath && <g data-common-sheath>
      <rect className="material-sheath" x="190" y={y - height / 2} width={Math.max(0, sheathEnd - 190)} height={height} rx="4" />
      <path className="material-sheath-end" d={`M ${sheathEnd} ${y - height / 2} V ${y + height / 2}`} />
    </g>}
  </g>;
}
