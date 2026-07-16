import type {
  CableEndPreparation,
  CableRunSpecification,
} from "../../data/cableSpecifications";
import type { WireColor } from "../../data/boxInspectionGame";

type StrippedCableEndProps = {
  cable?: CableRunSpecification;
  preparation?: CableEndPreparation;
  coreIndex: number;
  color: WireColor;
  x1: number;
  x2: number;
  y: number;
  insulationStripLengthMm?: number;
};

const defaultSheathStripLengthMm = 30;
const defaultInsulationStripLengthMm = 12;

export function StrippedCableEnd({
  cable,
  preparation,
  coreIndex,
  color,
  x1,
  x2,
  y,
  insulationStripLengthMm,
}: StrippedCableEndProps) {
  const hasSheath = cable?.hasSheath ?? true;
  const sheathStripLength = preparation?.sheathStripLengthMm ?? defaultSheathStripLengthMm;
  const storedInsulationStripLength = preparation?.insulationStripLengthsMm[coreIndex]
    ?? preparation?.insulationStripLengthsMm[0]
    ?? defaultInsulationStripLengthMm;
  const displayedInsulationStripLength = insulationStripLengthMm ?? storedInsulationStripLength;
  const drawableLength = Math.max(0, x2 - x1);
  const bareLength = clamp(displayedInsulationStripLength * 1.25, 0, Math.min(24, drawableLength));
  const exposedCoreLength = hasSheath
    ? clamp(sheathStripLength * 0.65, bareLength + 6, Math.min(56, drawableLength))
    : drawableLength;
  const sheathEndX = hasSheath ? x2 - exposedCoreLength : x1;
  const copperStartX = x2 - bareLength;

  return (
    <g aria-label={`シース剥ぎ${sheathStripLength}mm、絶縁被覆剥ぎ${displayedInsulationStripLength}mm`}>
      {hasSheath && (
        <path className="cable-sheath" d={`M ${x1} ${y} L ${sheathEndX} ${y}`} />
      )}
      <path
        className={`cable-insulation ${color}`}
        d={`M ${sheathEndX} ${y} L ${copperStartX} ${y}`}
      />
      <path className="cable-conductor" d={`M ${copperStartX} ${y} L ${x2} ${y}`} />
    </g>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
