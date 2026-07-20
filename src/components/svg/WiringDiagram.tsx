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
import { PilotLampDiagram } from "./diagrams/PilotLampDiagram";
import { PushConnectorDiagram } from "./diagrams/PushConnectorDiagram";
import { ReceptacleDiagram } from "./diagrams/ReceptacleDiagram";
import { RingSleeveDiagram } from "./diagrams/RingSleeveDiagram";
import { SwitchDiagram } from "./diagrams/SwitchDiagram";
import { TerminalBlockDiagram } from "./diagrams/TerminalBlockDiagram";

type WiringDiagramProps = {
  defectType: DefectType;
  cableEntrySide?: CableEntrySide;
  deviceName?: string;
  deviceVariant?: DeviceVariant;
};

export function WiringDiagram({ defectType, cableEntrySide = "left", deviceName, deviceVariant }: WiringDiagramProps) {
  switch (defectType) {
    case "none":
    case "reverse_loop":
    case "reverse_polarity":
    case "terminal_screw_loose":
    case "lamp_cover_cannot_close":
      return <LampReceptacleDiagram cableEntrySide={cableEntrySide} defectType={defectType} />;
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
      return <ExposedReceptacleDiagram cableEntrySide={cableEntrySide} />;
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
      return <PilotLampDiagram cableEntrySide={cableEntrySide} title={deviceName} />;
    case "switch_wrong_terminal":
      return <SwitchDiagram cableEntrySide={cableEntrySide} title={deviceName} variant={deviceVariant} />;
    case "receptacle_polarity":
      return <ReceptacleDiagram cableEntrySide={cableEntrySide} title={deviceName} variant={deviceVariant} />;
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
