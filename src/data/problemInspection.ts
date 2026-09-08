import type { PhysicalInspectionDisplayPart } from "../components/PhysicalInspectionView";
import type { DeviceVariant } from "./candidateDiagrams";
import type { ConnectionMethod, WireColor } from "./boxInspectionGame";
import { getDeviceSpecification } from "./deviceSpecifications";
import { createDevicePhysicalInspection, createPhysicalInspectionForDefect, type PhysicalTargetKind } from "./physicalInspection";
import type { Problem } from "./problems";
import { quizConnectionVisual } from "./connectionVisuals";
import { isMaterialDefect } from "./materialDefects";

type InspectionSubject =
  | { kind: "device"; variant: DeviceVariant }
  | { kind: "connection"; method: ConnectionMethod; wireColors?: WireColor[]; targetKind?: PhysicalTargetKind }
  | { kind: "component"; targetKind?: PhysicalTargetKind };

const subjectByProblemId: Record<string, InspectionSubject> = {
  "lamp-normal": { kind: "device", variant: "lamp_receptacle" },
  "lamp-loop-reverse": { kind: "device", variant: "lamp_receptacle" },
  "lamp-polarity": { kind: "device", variant: "lamp_receptacle" },
  "lamp-terminal-screw-loose": { kind: "device", variant: "lamp_receptacle" },
  "lamp-cover-cannot-close": { kind: "device", variant: "lamp_receptacle" },
  "lamp-cable-entry-bypass": { kind: "device", variant: "lamp_receptacle" },
  "receptacle-ground": { kind: "device", variant: "grounded_receptacle" },
  "box-sheath": { kind: "connection", method: "outlet_box" },
  "ring-sleeve-wrong-mark": { kind: "connection", method: "ring_sleeve", wireColors: ["black", "white", "red"] },
  "ring-sleeve-insert": { kind: "connection", method: "ring_sleeve", wireColors: ["black", "white", "red"] },
  "ring-sleeve-wrong-size": { kind: "connection", method: "ring_sleeve", wireColors: ["black", "white", "red"] },
  "ring-sleeve-insulation-bite": { kind: "connection", method: "ring_sleeve", wireColors: ["black", "white", "red"] },
  "exposed-receptacle-sheath": { kind: "device", variant: "exposed_receptacle" },
  "exposed-receptacle-entry-bypass": { kind: "device", variant: "exposed_receptacle" },
  "breaker-line-load-reverse": { kind: "device", variant: "circuit_breaker" },
  "push-connector-insert": { kind: "connection", method: "push_connector", wireColors: ["black", "white", "red"] },
  "push-connector-wire-count": { kind: "connection", method: "push_connector", wireColors: ["black", "white", "red"] },
  "terminal-block-wrong-terminal": { kind: "device", variant: "terminal_block" },
  "terminal-screw-loose": { kind: "device", variant: "terminal_block" },
  "ceiling-connector-polarity": { kind: "device", variant: "ceiling_connector" },
  "mounting-frame-loose": { kind: "component" },
  "mounting-frame-wrong-position": { kind: "component" },
  "pilot-lamp-wrong-terminal": { kind: "device", variant: "pilot_lamp" },
  "switch-wrong-terminal": { kind: "device", variant: "three_way_switch" },
  "push-in-retention-failure": { kind: "device", variant: "single_pole_switch" },
  "receptacle-polarity": { kind: "device", variant: "embedded_receptacle" },
  "outlet-box-wrong-hole": { kind: "connection", method: "outlet_box" },
  "rubber-bushing-missing": { kind: "connection", method: "outlet_box" },
  "rubber-bushing-wrong-size": { kind: "connection", method: "outlet_box" },
  "metal-conduit-insert": { kind: "connection", method: "metal_conduit", targetKind: "conduit" },
  "metal-conduit-insulation-bushing": { kind: "connection", method: "metal_conduit", targetKind: "conduit" },
  "metal-conduit-locknut": { kind: "connection", method: "metal_conduit", targetKind: "conduit" },
  "pf-conduit-insert": { kind: "connection", method: "pf_conduit", targetKind: "conduit" },
  "pf-conduit-locknut": { kind: "connection", method: "pf_conduit", targetKind: "conduit" },
};

export function createProblemInspectionPart(problem: Problem): PhysicalInspectionDisplayPart {
  const subject: InspectionSubject = subjectByProblemId[problem.id] ?? (isMaterialDefect(problem.defectType) && problem.defectType.startsWith("ring_sleeve_")
    ? { kind: "connection", method: "ring_sleeve" } : { kind: "component" });
  const targetId = `quiz:${problem.id}`;

  if (subject.kind === "device") {
    const specification = getDeviceSpecification(subject.variant);
    return {
      title: problem.title,
      defectType: problem.defectType,
      deviceVariant: subject.variant,
      physicalInspection: createDevicePhysicalInspection(targetId, problem.defectType, {
        connectionMethod: specification?.connectionMethod ?? "none",
        terminals: specification?.terminals.map(({ id, label }) => ({ id, label })) ?? [],
        hasCover: subject.variant === "lamp_receptacle",
        hasCableEntry: subject.variant === "lamp_receptacle" || subject.variant === "exposed_receptacle",
        sheathEntersBase: subject.variant === "exposed_receptacle",
      }),
    };
  }

  if (subject.kind === "connection") {
    const connector = subject.method.includes("connector") || subject.method === "ring_sleeve";
    return {
      title: problem.title,
      defectType: problem.defectType,
      connection: subject.method === "ring_sleeve" || subject.method === "push_connector" ? quizConnectionVisual(problem.defectType, subject.method) : { method: subject.method, wireColors: subject.wireColors ?? ["black", "white"] },
      physicalInspection: createPhysicalInspectionForDefect(
        targetId,
        problem.defectType,
        subject.targetKind ?? (connector ? "connector" : "component"),
      ),
    };
  }

  return {
    title: problem.title,
    defectType: problem.defectType,
    physicalInspection: createPhysicalInspectionForDefect(targetId, problem.defectType, subject.targetKind ?? "component"),
  };
}
