import type { CableEntrySide } from "../../../data/boxInspectionGame";
import { DeviceDetailShape } from "../DeviceDetailShape";
import { DirectionalSheath, DirectionalWire } from "../DirectionalCable";

export function ExposedReceptacleDiagram({ cableEntrySide }: { cableEntrySide: CableEntrySide }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="露出形コンセントの欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">露出形コンセント</text>
      <DirectionalSheath className="cable-sheath alert-fill" side={cableEntrySide} />
      <DirectionalWire className="wire black" lane={-18} side={cableEntrySide} targetX={458} targetY={175} />
      <DirectionalWire className="wire white" lane={18} side={cableEntrySide} targetX={492} targetY={198} />
      <DeviceDetailShape variant="exposed_receptacle" x={475} y={195} />
      <text className="defect-label" x="360" y={cableEntrySide === "bottom" ? 94 : 340} textAnchor="middle">
        外装が器具内まで入っていません
      </text>
    </svg>
  );
}
