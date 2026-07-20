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
import { DeviceDetailShape } from "./DeviceDetailShape";

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
    case "lamp_cover_cannot_close":
      return <LampReceptacleDiagram cableEntrySide={cableEntrySide} defectType={defectType} />;
    case "terminal_screw_loose":
      return deviceVariant === "terminal_block"
        ? <TerminalBlockDiagram defect={false} title={deviceName} variant={deviceVariant} />
        : <LampReceptacleDiagram cableEntrySide={cableEntrySide} defectType={defectType} />;
    case "push_in_retention_failure":
      return <DeviceOverviewDiagram title={deviceName ?? "埋込連用タンブラスイッチ（片切）"} variant={deviceVariant ?? "single_pole_switch"} />;
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

function DeviceOverviewDiagram({ title, variant }: { title: string; variant: DeviceVariant }) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={`${title}の正面確認図`}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">{title}</text>
      <DeviceDetailShape variant={variant} x={360} y={205} />
      <text className="small" x="360" y="342" textAnchor="middle">表示方向や検査操作を変えて確認</text>
    </svg>
  );
}
