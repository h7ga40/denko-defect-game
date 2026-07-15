import type { DeviceVariant } from "../../../data/candidateDiagrams";
import { DeviceDetailShape } from "../DeviceDetailShape";

export function ReceptacleDiagram({ title = "コンセント", variant }: { title?: string; variant?: DeviceVariant }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">{title}</text>
      <path className="wire black" d="M 92 145 C 230 145, 315 168, 472 168" />
      <path className="wire white" d="M 92 238 C 230 238, 315 192, 438 168" />
      <DeviceDetailShape variant={variant === "exposed_receptacle" || variant === "grounded_receptacle" || variant === "grounded_20a_receptacle" || variant === "eet_receptacle" ? variant : "receptacle"} x={455} y={195} />
      <text className="defect-label" x="360" y="340" textAnchor="middle">
        接地側と非接地側が逆です
      </text>
    </svg>
  );
}
