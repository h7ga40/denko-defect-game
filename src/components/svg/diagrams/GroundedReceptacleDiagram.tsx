import type { DeviceVariant } from "../../../data/candidateDiagrams";
import type { CableEntrySide } from "../../../data/boxInspectionGame";
import { DirectionalWire } from "../DirectionalCable";
import { DeviceDetailShape } from "../DeviceDetailShape";

export function GroundedReceptacleDiagram({ cableEntrySide, title = "接地極付コンセント", variant }: { cableEntrySide: CableEntrySide; title?: string; variant?: DeviceVariant }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="425" y="55" textAnchor="middle">{title}</text>
      <DirectionalWire className="wire black" lane={-52} side={cableEntrySide} targetX={442} targetY={163} />
      <DirectionalWire className="wire white" side={cableEntrySide} targetX={408} targetY={163} />
      <DirectionalWire className="wire green broken" lane={52} side={cableEntrySide} targetX={340} targetY={224} />
      <line className="missing" x1="348" y1="224" x2="401" y2="216" />
      <DeviceDetailShape variant={variant === "grounded_20a_receptacle" || variant === "eet_receptacle" ? variant : "grounded_receptacle"} x={425} y={190} />
      <text className="defect-label" x="360" y={cableEntrySide === "bottom" ? 88 : 350} textAnchor="middle">
        緑の接地線が接地端子まで接続されていません
      </text>
    </svg>
  );
}
