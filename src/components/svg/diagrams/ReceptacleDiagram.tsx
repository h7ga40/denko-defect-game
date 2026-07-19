import type { DeviceVariant } from "../../../data/candidateDiagrams";
import type { CableEntrySide } from "../../../data/boxInspectionGame";
import { DirectionalWire } from "../DirectionalCable";
import { DeviceDetailShape } from "../DeviceDetailShape";

export function ReceptacleDiagram({ cableEntrySide, title = "コンセント", variant }: { cableEntrySide: CableEntrySide; title?: string; variant?: DeviceVariant }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">{title}</text>
      <DirectionalWire className="wire black" lane={-38} side={cableEntrySide} targetX={472} targetY={168} />
      <DirectionalWire className="wire white" lane={38} side={cableEntrySide} targetX={438} targetY={168} />
      <DeviceDetailShape variant={variant === "embedded_receptacle" || variant === "double_receptacle" || variant === "exposed_receptacle" || variant === "grounded_receptacle" || variant === "grounded_20a_receptacle" || variant === "eet_receptacle" ? variant : "receptacle"} x={455} y={195} />
      <text className="defect-label" x="360" y={cableEntrySide === "bottom" ? 94 : 340} textAnchor="middle">
        接地側と非接地側が逆です
      </text>
    </svg>
  );
}
