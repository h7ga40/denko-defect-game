import type { DeviceVariant } from "../../data/candidateDiagrams";
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
import { ReceptacleDiagram } from "./diagrams/ReceptacleDiagram";
import { RingSleeveDiagram } from "./diagrams/RingSleeveDiagram";
import { SwitchDiagram } from "./diagrams/SwitchDiagram";
import { TerminalBlockDiagram } from "./diagrams/TerminalBlockDiagram";

type WiringDiagramProps = {
  defectType: DefectType;
  deviceName?: string;
  deviceVariant?: DeviceVariant;
};

export function WiringDiagram({ defectType, deviceName, deviceVariant }: WiringDiagramProps) {
  switch (defectType) {
    case "missing_ground":
      return <GroundedReceptacleDiagram title={deviceName} variant={deviceVariant} />;
    case "sheath_too_short":
      return <OutletBoxDiagram />;
    case "ring_sleeve_wrong_mark":
    case "ring_sleeve_wrong_size":
    case "ring_sleeve_insufficient_insert":
    case "ring_sleeve_insulation_bite":
      return <RingSleeveDiagram defectType={defectType} />;
    case "exposed_receptacle_sheath":
      return <ExposedReceptacleDiagram />;
    case "breaker_line_load_reverse":
      return <BreakerDiagram title={deviceName} variant={deviceVariant} />;
    case "push_connector_insufficient_insert":
    case "push_connector_wrong_wire_count":
      return <PushConnectorDiagram defectType={defectType} />;
    case "terminal_block_wrong_terminal":
      return <TerminalBlockDiagram title={deviceName} variant={deviceVariant} />;
    case "ceiling_connector_polarity":
      return <CeilingConnectorDiagram />;
    case "mounting_frame_loose":
      return <MountingFrameDiagram />;
    case "switch_wrong_terminal":
      return <SwitchDiagram title={deviceName} variant={deviceVariant} />;
    case "receptacle_polarity":
      return <ReceptacleDiagram title={deviceName} variant={deviceVariant} />;
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
      return <LampReceptacleDiagram defectType="none" />;
    default:
      return <LampReceptacleDiagram defectType={defectType} />;
  }
}
