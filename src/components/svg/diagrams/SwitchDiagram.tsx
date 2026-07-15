import type { DeviceVariant } from "../../../data/candidateDiagrams";
import { DeviceDetailShape } from "../DeviceDetailShape";

export function SwitchDiagram({ title = "単極スイッチ", variant }: { title?: string; variant?: DeviceVariant }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="55" textAnchor="middle">{title}</text>
      <path className="wire alert" d="M 82 155 C 195 155, 260 168, 437 168" />
      <path className="wire red" d="M 82 235 C 195 235, 260 168, 333 168" />
      <DeviceDetailShape variant={variant === "three_way_switch" || variant === "four_way_switch" ? variant : "single_pole_switch"} x={385} y={190} />
      <text className="defect-label" x="360" y="350" textAnchor="middle">
        黒線が指定端子に入っていません
      </text>
    </svg>
  );
}
