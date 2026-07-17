import type { DeviceVariant } from "../../../data/candidateDiagrams";
import type { CableEntrySide } from "../../../data/boxInspectionGame";
import { DirectionalWire } from "../DirectionalCable";
import { DeviceDetailShape } from "../DeviceDetailShape";

export function SwitchDiagram({ cableEntrySide, title = "埋込連用タンブラスイッチ（片切）", variant }: { cableEntrySide: CableEntrySide; title?: string; variant?: DeviceVariant }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="55" textAnchor="middle">{title}</text>
      <DirectionalWire className="wire alert" lane={-35} side={cableEntrySide} targetX={437} targetY={162} />
      <DirectionalWire className="wire red" lane={35} side={cableEntrySide} targetX={333} targetY={162} />
      <DeviceDetailShape variant={variant === "three_way_switch" || variant === "four_way_switch" ? variant : "single_pole_switch"} x={385} y={190} />
      <text className="defect-label" x="360" y={cableEntrySide === "bottom" ? 86 : 350} textAnchor="middle">
        黒線が指定端子に入っていません
      </text>
    </svg>
  );
}
