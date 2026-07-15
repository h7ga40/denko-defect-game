import type { DeviceVariant } from "../../../data/candidateDiagrams";
import { DeviceDetailShape } from "../DeviceDetailShape";

export function GroundedReceptacleDiagram({ title = "接地極付コンセント", variant }: { title?: string; variant?: DeviceVariant }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="425" y="55" textAnchor="middle">{title}</text>
      <path className="wire black" d="M 76 130 C 185 130, 260 163, 442 163" />
      <path className="wire white" d="M 76 195 C 185 195, 270 163, 408 163" />
      <path className="wire green broken" d="M 76 266 C 185 266, 258 224, 340 224" />
      <line className="missing" x1="348" y1="224" x2="401" y2="216" />
      <DeviceDetailShape variant={variant === "grounded_20a_receptacle" || variant === "eet_receptacle" ? variant : "grounded_receptacle"} x={425} y={190} />
      <text className="defect-label" x="360" y="350" textAnchor="middle">
        緑の接地線が接地端子まで接続されていません
      </text>
    </svg>
  );
}
