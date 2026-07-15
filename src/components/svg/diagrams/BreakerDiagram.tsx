import type { DeviceVariant } from "../../../data/candidateDiagrams";
import { DeviceDetailShape } from "../DeviceDetailShape";

export function BreakerDiagram({ title = "配線用遮断器", variant }: { title?: string; variant?: DeviceVariant }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="55" textAnchor="middle">{title}</text>
      <path className="wire alert" d="M 86 126 C 190 126, 238 250, 338 250" />
      <path className="wire alert" d="M 86 258 C 190 258, 238 130, 392 130" />
      <text className="small" x="92" y="110">電源側電線</text>
      <text className="small" x="92" y="285">負荷側電線</text>
      <DeviceDetailShape variant={variant === "earth_leakage_breaker" ? variant : "circuit_breaker"} x={365} y={190} />
      <text className="defect-label" x="360" y="350" textAnchor="middle">
        電源側と負荷側が逆です
      </text>
    </svg>
  );
}
