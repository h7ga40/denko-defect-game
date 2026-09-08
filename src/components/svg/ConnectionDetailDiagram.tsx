import type { BoxInspectionPart } from "../../data/boxInspectionGame";
import { RingAssemblyDiagram } from "./RingAssemblyDiagram";
import { PushConnectorAssemblyDiagram } from "./PushConnectorAssemblyDiagram";

export function ConnectionDetailDiagram({ part }: { part: BoxInspectionPart }) {
  return part.connection.method === "ring_sleeve"
    ? <RingAssemblyDiagram connection={part.connection} defectType={part.defectType} />
    : <PushConnectorAssemblyDiagram connection={part.connection} defectType={part.defectType} />;
}
