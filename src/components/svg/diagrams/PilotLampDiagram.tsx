import type { CableEntrySide } from "../../../data/boxInspectionGame";
import { DirectionalWire } from "../DirectionalCable";
import { DeviceDetailShape } from "../DeviceDetailShape";

export function PilotLampDiagram({ cableEntrySide, title = "埋込連用パイロットランプ" }: { cableEntrySide: CableEntrySide; title?: string }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="55" textAnchor="middle">{title}</text>
      <DirectionalWire className="wire alert" lane={-34} side={cableEntrySide} targetX={308} targetY={168} />
      <DirectionalWire className="wire white" lane={34} side={cableEntrySide} targetX={412} targetY={168} />
      <DeviceDetailShape variant="pilot_lamp" x={360} y={195} />
      <circle className="warning" cx="305" cy="166" r="18" />
      <text className="defect-label" x="360" y={cableEntrySide === "bottom" ? 88 : 350} textAnchor="middle">
        一方の心線が指定端子に入っていません
      </text>
    </svg>
  );
}
