import type { DeviceVariant } from "../../../data/candidateDiagrams";
import type { CableEntrySide } from "../../../data/boxInspectionGame";
import { EmbeddedDeviceDiagram } from "./EmbeddedDeviceDiagram";

export function SwitchDiagram({ cableEntrySide, title, variant = "three_way_switch" }: { cableEntrySide: CableEntrySide; title?: string; variant?: DeviceVariant }) {
  return <EmbeddedDeviceDiagram cableEntrySide={cableEntrySide} title={title} variant={variant} defectType="switch_wrong_terminal" />;
}
