import type { DeviceVariant } from "../../../data/candidateDiagrams";
import type { CableEntrySide } from "../../../data/boxInspectionGame";
import { EmbeddedDeviceDiagram } from "./EmbeddedDeviceDiagram";

export function PilotLampDiagram({ cableEntrySide, title, variant = "pilot_lamp" }: { cableEntrySide: CableEntrySide; title?: string; variant?: DeviceVariant }) {
  return <EmbeddedDeviceDiagram cableEntrySide={cableEntrySide} title={title} variant={variant} defectType="pilot_lamp_wrong_terminal" />;
}
