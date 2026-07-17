import type { CableEntrySide } from "../../data/boxInspectionGame";

type DirectionalWireProps = {
  side: CableEntrySide;
  targetX: number;
  targetY: number;
  lane?: number;
  className: string;
};

export function DirectionalWire({ side, targetX, targetY, lane = 0, className }: DirectionalWireProps) {
  return <path className={className} d={createDirectionalPath(side, targetX, targetY, lane)} />;
}

export function DirectionalSheath({ side, className = "cable-sheath" }: { side: CableEntrySide; className?: string }) {
  if (side === "left" || side === "right") {
    return <rect className={className} x={side === "left" ? 54 : 578} y="170" width="88" height="40" rx="20" />;
  }
  return <rect className={className} x="340" y={side === "top" ? 50 : 280} width="40" height="72" rx="20" />;
}

function createDirectionalPath(side: CableEntrySide, targetX: number, targetY: number, lane: number) {
  if (side === "left") {
    return `M 82 ${190 + lane} C 190 ${190 + lane}, ${targetX - 105} ${targetY}, ${targetX} ${targetY}`;
  }
  if (side === "right") {
    return `M 638 ${190 + lane} C 530 ${190 + lane}, ${targetX + 105} ${targetY}, ${targetX} ${targetY}`;
  }
  if (side === "top") {
    return `M ${360 + lane} 72 C ${360 + lane} 125, ${targetX} ${targetY - 95}, ${targetX} ${targetY}`;
  }
  return `M ${360 + lane} 308 C ${360 + lane} 265, ${targetX} ${targetY + 95}, ${targetX} ${targetY}`;
}
