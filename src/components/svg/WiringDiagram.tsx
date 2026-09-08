import type { DeviceVariant } from "../../data/candidateDiagrams";
import type { CableEntrySide } from "../../data/boxInspectionGame";
import type { DefectType } from "../../data/problems";
import { BreakerDiagram } from "./diagrams/BreakerDiagram";
import { CeilingConnectorDiagram } from "./diagrams/CeilingConnectorDiagram";
import { ExposedReceptacleDiagram } from "./diagrams/ExposedReceptacleDiagram";
import { GroundedReceptacleDiagram } from "./diagrams/GroundedReceptacleDiagram";
import { LampReceptacleDiagram } from "./diagrams/LampReceptacleDiagram";
import { MountingFrameDiagram } from "./diagrams/MountingFrameDiagram";
import { OutletBoxDiagram } from "./diagrams/OutletBoxDiagram";
import { OutletBoxAccessoryDiagram } from "./diagrams/OutletBoxAccessoryDiagram";
import { MetalConduitDiagram } from "./diagrams/MetalConduitDiagram";
import { PfConduitDiagram } from "./diagrams/PfConduitDiagram";
import { PushConnectorDiagram } from "./diagrams/PushConnectorDiagram";
import { RingSleeveDiagram } from "./diagrams/RingSleeveDiagram";
import { TerminalBlockDiagram } from "./diagrams/TerminalBlockDiagram";
import { EmbeddedDeviceDiagram, isEmbeddedInspectionVariant } from "./diagrams/EmbeddedDeviceDiagram";
import { isMaterialDefect } from "../../data/materialDefects";
import { MaterialDefectDiagram } from "./MaterialDefectDiagram";

type WiringDiagramProps = {
  defectType: DefectType;
  cableEntrySide?: CableEntrySide;
  deviceName?: string;
  deviceVariant?: DeviceVariant;
};

export function WiringDiagram({ defectType, cableEntrySide = "left", deviceName, deviceVariant }: WiringDiagramProps) {
  if (isMaterialDefect(defectType)) {
    return defectType.startsWith("ring_sleeve_") ? <RingSleeveDiagram defectType={defectType} /> : <MaterialDefectDiagram defectType={defectType} />;
  }
  if (deviceVariant === "ceiling_connector") {
    return <CeilingConnectorDiagram cableEntrySide={cableEntrySide} defectType={defectType} />;
  }
  if (isEmbeddedInspectionVariant(deviceVariant) && ["none", "receptacle_polarity", "switch_wrong_terminal", "pilot_lamp_wrong_terminal", "push_in_retention_failure"].includes(defectType)) {
    return <EmbeddedDeviceDiagram variant={deviceVariant} title={deviceName} defectType={defectType} cableEntrySide={cableEntrySide} />;
  }
  if (deviceVariant === "exposed_receptacle" && (defectType === "receptacle_polarity" || defectType === "terminal_screw_loose")) {
    return <ExposedReceptacleDiagram cableEntrySide={cableEntrySide} defectType={defectType} />;
  }
  switch (defectType) {
    case "none":
      return deviceVariant === "exposed_receptacle"
        ? <ExposedReceptacleDiagram cableEntrySide={cableEntrySide} defectType="none" />
        : <LampReceptacleDiagram cableEntrySide={cableEntrySide} defectType="none" />;
    case "reverse_loop":
    case "reverse_polarity":
    case "lamp_cover_cannot_close":
    case "lamp_cable_entry_bypass":
      return <LampReceptacleDiagram cableEntrySide={cableEntrySide} defectType={defectType} />;
    case "terminal_screw_loose":
      return deviceVariant === "terminal_block"
        ? <TerminalBlockDiagram defect={false} title={deviceName} variant={deviceVariant} />
        : <LampReceptacleDiagram cableEntrySide={cableEntrySide} defectType={defectType} />;
    case "push_in_retention_failure":
      return <EmbeddedDeviceDiagram variant={deviceVariant} title={deviceName} defectType={defectType} cableEntrySide={cableEntrySide} />;
    case "missing_ground":
      return <GroundedReceptacleDiagram cableEntrySide={cableEntrySide} title={deviceName} variant={deviceVariant} />;
    case "sheath_too_short":
      return <OutletBoxDiagram />;
    case "ring_sleeve_wrong_mark":
    case "ring_sleeve_wrong_size":
    case "ring_sleeve_insufficient_insert":
    case "ring_sleeve_insulation_bite":
      return <RingSleeveDiagram defectType={defectType} />;
    case "exposed_receptacle_sheath":
    case "exposed_receptacle_entry_bypass":
      return <ExposedReceptacleDiagram cableEntrySide={cableEntrySide} defectType={defectType} />;
    case "breaker_line_load_reverse":
      return <BreakerDiagram title={deviceName} variant={deviceVariant} />;
    case "push_connector_insufficient_insert":
    case "push_connector_wrong_wire_count":
      return <PushConnectorDiagram defectType={defectType} />;
    case "terminal_block_wrong_terminal":
      return <TerminalBlockDiagram title={deviceName} variant={deviceVariant} />;
    case "ceiling_connector_polarity":
      return <CeilingConnectorDiagram cableEntrySide={cableEntrySide} />;
    case "mounting_frame_loose":
    case "mounting_frame_wrong_position":
      return <MountingFrameDiagram defectType={defectType} />;
    case "pilot_lamp_wrong_terminal":
      return <EmbeddedDeviceDiagram cableEntrySide={cableEntrySide} title={deviceName} variant="pilot_lamp" defectType={defectType} />;
    case "switch_wrong_terminal":
      return <EmbeddedDeviceDiagram cableEntrySide={cableEntrySide} title={deviceName} variant={deviceVariant ?? "three_way_switch"} defectType={defectType} />;
    case "receptacle_polarity":
      return <EmbeddedDeviceDiagram cableEntrySide={cableEntrySide} title={deviceName} variant={deviceVariant ?? "embedded_receptacle"} defectType={defectType} />;
    case "outlet_box_wrong_hole":
    case "rubber_bushing_missing":
    case "rubber_bushing_wrong_size":
      return <OutletBoxAccessoryDiagram defectType={defectType} />;
    case "metal_conduit_insufficient_insert":
    case "metal_conduit_missing_insulation_bushing":
    case "metal_conduit_missing_locknut":
      return <MetalConduitDiagram defectType={defectType} />;
    case "pf_conduit_insufficient_insert":
    case "pf_conduit_missing_locknut":
      return <PfConduitDiagram defectType={defectType} />;
    case "box_wrong_connection":
    case "box_conductor_unconnected":
      return <LampReceptacleDiagram cableEntrySide={cableEntrySide} defectType="none" />;
    default:
      return <LampReceptacleDiagram cableEntrySide={cableEntrySide} defectType="none" />;
  }
}
