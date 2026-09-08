import type { DefectType } from "../../../data/problems";
import { quizConnectionVisual } from "../../../data/connectionVisuals";
import { RingAssemblyDiagram } from "../RingAssemblyDiagram";

export function RingSleeveDiagram({ defectType }: { defectType: DefectType }) {
  return <RingAssemblyDiagram connection={quizConnectionVisual(defectType, "ring_sleeve")} defectType={defectType} />;
}
