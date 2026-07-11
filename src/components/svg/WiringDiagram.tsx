import type { DefectType } from "../../data/problems";
import { BreakerDiagram } from "./diagrams/BreakerDiagram";
import { CeilingConnectorDiagram } from "./diagrams/CeilingConnectorDiagram";
import { ExposedReceptacleDiagram } from "./diagrams/ExposedReceptacleDiagram";
import { GroundedReceptacleDiagram } from "./diagrams/GroundedReceptacleDiagram";
import { LampReceptacleDiagram } from "./diagrams/LampReceptacleDiagram";
import { MountingFrameDiagram } from "./diagrams/MountingFrameDiagram";
import { OutletBoxDiagram } from "./diagrams/OutletBoxDiagram";
import { PushConnectorDiagram } from "./diagrams/PushConnectorDiagram";
import { ReceptacleDiagram } from "./diagrams/ReceptacleDiagram";
import { RingSleeveDiagram } from "./diagrams/RingSleeveDiagram";
import { SwitchDiagram } from "./diagrams/SwitchDiagram";
import { TerminalBlockDiagram } from "./diagrams/TerminalBlockDiagram";

type WiringDiagramProps = {
  defectType: DefectType;
};

export function WiringDiagram({ defectType }: WiringDiagramProps) {
  switch (defectType) {
    case "missing_ground":
      return <GroundedReceptacleDiagram />;
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
      return <BreakerDiagram />;
    case "push_connector_insufficient_insert":
    case "push_connector_wrong_wire_count":
      return <PushConnectorDiagram defectType={defectType} />;
    case "terminal_block_wrong_terminal":
      return <TerminalBlockDiagram />;
    case "ceiling_connector_polarity":
      return <CeilingConnectorDiagram />;
    case "mounting_frame_loose":
      return <MountingFrameDiagram />;
    case "switch_wrong_terminal":
      return <SwitchDiagram />;
    case "receptacle_polarity":
      return <ReceptacleDiagram />;
    default:
      return <LampReceptacleDiagram defectType={defectType} />;
  }
}
