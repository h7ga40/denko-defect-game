import type { DefectType } from "../../../data/problems";
import { quizConnectionVisual } from "../../../data/connectionVisuals";
import { PushConnectorAssemblyDiagram } from "../PushConnectorAssemblyDiagram";

export function PushConnectorDiagram({ defectType }: { defectType: DefectType }) {
  return <PushConnectorAssemblyDiagram connection={quizConnectionVisual(defectType, "push_connector")} defectType={defectType} />;
}
