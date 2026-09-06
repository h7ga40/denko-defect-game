import type { DefectType } from "./problems";

export type PhysicalTargetKind =
  | "component"
  | "terminal"
  | "fastener"
  | "conductor"
  | "cable"
  | "cover"
  | "connector"
  | "conduit";

export type TighteningState = "secure" | "loose" | "unfastened" | "over_tightened";
export type RetentionState = "secure" | "moves" | "releases_on_pull";
export type InsertionState = "correct" | "shallow" | "overinserted" | "not_inserted";
export type CrimpState = "correct" | "not_crimped" | "partial_mark" | "multiple_marks";
export type AssemblyState = "correct" | "misaligned" | "missing" | "cannot_close";
export type IntegrityState = "intact" | "damaged";
export type ConnectionState = "correct" | "wrong_target" | "unconnected";

export type DamageType = "crack" | "chip" | "deformation" | "cut" | "abrasion" | "burn";
export type DamageLocation = "body" | "terminal" | "cover" | "insulation" | "conductor" | "sheath";

export type PhysicalDamage = {
  id: string;
  type: DamageType;
  location: DamageLocation;
  visibleFrom: InspectionViewpoint[];
  lengthMm?: number;
  depthMm?: number;
};

export type PhysicalMeasurements = {
  lengthMm?: number | null;
  insertionDepthMm?: number | null;
  exposedConductorLengthMm?: number | null;
  conductorProjectionMm?: number | null;
  sheathStripLengthMm?: number | null;
};

export type PhysicalTargetState = {
  id: string;
  kind: PhysicalTargetKind;
  parentId?: string;
  label?: string;
  materialId?: string;
  tightening?: TighteningState;
  retention?: RetentionState;
  insertion?: InsertionState;
  crimp?: CrimpState;
  assembly?: AssemblyState;
  integrity?: IntegrityState;
  connection?: ConnectionState;
  cableRouting?: "through_entry" | "over_base";
  sheathPosition?: "inside_base" | "outside_base" | "above_base";
  measurements?: PhysicalMeasurements;
  damage?: PhysicalDamage[];
};

export type PhysicalStateSnapshot = {
  targets: Record<string, PhysicalTargetState>;
};

export type InspectionViewpoint = "front" | "back" | "left" | "right" | "top" | "bottom" | "free";
export type Vector3 = readonly [x: number, y: number, z: number];

type InspectionActionBase = {
  id: string;
  label: string;
  targetId: string;
};

export type InspectionAction =
  | (InspectionActionBase & {
      kind: "view";
      viewpoints: InspectionViewpoint[];
    })
  | (InspectionActionBase & {
      kind: "pull";
      direction: Vector3;
      force: "inspection_pull";
    })
  | (InspectionActionBase & {
      kind: "wiggle";
      direction: Vector3;
    })
  | (InspectionActionBase & {
      kind: "remove_cover";
      revealsTargetIds: string[];
    });

export type InspectionObservationResult =
  | "visible"
  | "not_visible"
  | "retained"
  | "released"
  | "stable"
  | "movement_detected"
  | "cover_removed";

export type InspectionObservation = {
  actionId: string;
  targetId: string;
  result: InspectionObservationResult;
  revealedTargetIds: string[];
};

export type PhysicalInspectionSession = {
  selectedActionId: string | null;
  viewpoint: InspectionViewpoint;
  observations: InspectionObservation[];
};

export type PhysicalInspectionModel = {
  schemaVersion: 1;
  expected: PhysicalStateSnapshot;
  installed: PhysicalStateSnapshot;
  actions: InspectionAction[];
};

export type DevicePhysicalDefinition = {
  connectionMethod: "screw" | "push_in" | "terminal_block" | "none";
  terminals: ReadonlyArray<{ id: string; label: string }>;
  hasCover?: boolean;
  hasCableEntry?: boolean;
  sheathEntersBase?: boolean;
};

export function createPhysicalInspectionForDefect(
  targetId: string,
  defectType: DefectType,
  kind: PhysicalTargetKind = "component",
): PhysicalInspectionModel {
  const expectedTarget = addDefectCapabilities(createNormalPhysicalTarget(targetId, kind), defectType);
  const installedTarget = applyDefectState(expectedTarget, defectType);
  return createPhysicalInspectionModel(expectedTarget, installedTarget);
}

export function createDevicePhysicalInspection(
  rootId: string,
  defectType: DefectType,
  definition: DevicePhysicalDefinition,
): PhysicalInspectionModel {
  const root = { ...createNormalPhysicalTarget(rootId, "component"), label: "器具本体" };
  const expectedTargets: Record<string, PhysicalTargetState> = { [rootId]: root };

  for (const terminal of definition.terminals) {
    const id = rootId + ":terminal-" + terminal.id;
    const target = {
      ...createNormalPhysicalTarget(id, "terminal"),
      parentId: rootId,
      label: terminal.label + "端子",
    };
    if (definition.connectionMethod === "push_in") delete target.tightening;
    expectedTargets[id] = target;
  }

  if (definition.hasCover) {
    const coverId = rootId + ":cover";
    expectedTargets[coverId] = {
      ...createNormalPhysicalTarget(coverId, "cover"),
      parentId: rootId,
      label: "カバー",
    };
  }

  if (definition.hasCableEntry) {
    const entryId = rootId + ":cable-entry";
    expectedTargets[entryId] = {
      ...createNormalPhysicalTarget(entryId, "cable"),
      parentId: rootId,
      label: "引込み電線",
      cableRouting: "through_entry",
      ...(definition.sheathEntersBase ? { sheathPosition: "inside_base" as const } : {}),
    };
  }

  const affectedId = selectDeviceDefectTarget(rootId, defectType, definition);
  expectedTargets[affectedId] = addDefectCapabilities(expectedTargets[affectedId], defectType);
  const installedTargets = Object.fromEntries(
    Object.entries(expectedTargets).map(([id, target]) => [id, cloneTarget(target)]),
  );
  installedTargets[affectedId] = applyDefectState(installedTargets[affectedId], defectType);

  return createPhysicalInspectionModelFromTargets(
    expectedTargets,
    installedTargets,
    [createViewAction(rootId), ...createStateActions(installedTargets[affectedId])],
  );
}

export function createPhysicalInspectionModel(
  expectedTarget: PhysicalTargetState,
  installedTarget: PhysicalTargetState,
  additionalActions: InspectionAction[] = [],
): PhysicalInspectionModel {
  const actions = [
    createViewAction(expectedTarget.id),
    ...createStateActions(installedTarget),
    ...additionalActions,
  ];
  return createPhysicalInspectionModelFromTargets(
    { [expectedTarget.id]: expectedTarget },
    { [installedTarget.id]: installedTarget },
    actions,
  );
}

export function toExpectedPhysicalInspection(model: PhysicalInspectionModel): PhysicalInspectionModel {
  return {
    ...model,
    installed: {
      targets: Object.fromEntries(
        Object.entries(model.expected.targets).map(([id, target]) => [id, cloneTarget(target)]),
      ),
    },
  };
}

export function createPhysicalInspectionSession(): PhysicalInspectionSession {
  return { selectedActionId: null, viewpoint: "front", observations: [] };
}

export function resolveInspectionAction(
  model: PhysicalInspectionModel,
  action: InspectionAction,
  viewpoint: InspectionViewpoint,
): InspectionObservation {
  const target = model.installed.targets[action.targetId];
  if (!target) throw new Error(`検査対象${action.targetId}がありません。`);

  let result: InspectionObservationResult;
  if (action.kind === "view") {
    const visibleDamage = target.damage?.some((damage) => damage.visibleFrom.includes(viewpoint)) ?? false;
    result = target.damage?.length && !visibleDamage ? "not_visible" : "visible";
  } else if (action.kind === "pull") {
    result = target.retention === "releases_on_pull" ? "released" : "retained";
  } else if (action.kind === "wiggle") {
    result = target.retention === "moves" || target.tightening === "loose" || target.tightening === "unfastened"
      ? "movement_detected"
      : "stable";
  } else {
    result = "cover_removed";
  }

  return {
    actionId: action.id,
    targetId: action.targetId,
    result,
    revealedTargetIds: action.kind === "remove_cover" ? [...action.revealsTargetIds] : [],
  };
}

export function validatePhysicalInspectionModel(model: PhysicalInspectionModel) {
  const errors: string[] = [];
  if (model.schemaVersion !== 1) errors.push("未対応のスキーマバージョンです。");
  const expectedIds = new Set(Object.keys(model.expected.targets));
  const installedIds = new Set(Object.keys(model.installed.targets));
  for (const id of expectedIds) {
    if (!installedIds.has(id)) errors.push(`施工状態に対象${id}がありません。`);
    const parentId = model.expected.targets[id].parentId;
    if (parentId && (!expectedIds.has(parentId) || parentId === id)) {
      errors.push(`正常状態の対象${id}の親IDが不正です。`);
    }
  }
  const actionIds = new Set<string>();
  for (const action of model.actions) {
    if (actionIds.has(action.id)) errors.push(`検査操作ID ${action.id}が重複しています。`);
    actionIds.add(action.id);
    if (!installedIds.has(action.targetId)) errors.push(`検査操作${action.id}の対象${action.targetId}がありません。`);
    if (action.kind === "remove_cover") {
      for (const targetId of action.revealsTargetIds) {
        if (!installedIds.has(targetId)) errors.push(`取り外し操作${action.id}の表示対象${targetId}がありません。`);
      }
    }
  }
  return errors;
}

export function createNormalPhysicalTarget(id: string, kind: PhysicalTargetKind): PhysicalTargetState {
  const target: PhysicalTargetState = {
    id,
    kind,
    assembly: "correct",
    integrity: "intact",
    connection: "correct",
    measurements: {},
    damage: [],
  };
  if (kind === "component" || kind === "terminal" || kind === "fastener") {
    target.tightening = "secure";
    target.retention = "secure";
  }
  if (kind === "terminal" || kind === "conductor" || kind === "connector" || kind === "conduit") {
    target.insertion = "correct";
    target.retention = "secure";
  }
  if (kind === "cable") target.retention = "secure";
  return target;
}

function addDefectCapabilities(target: PhysicalTargetState, defectType: DefectType): PhysicalTargetState {
  if (defectType.startsWith("ring_sleeve_")) return { ...target, crimp: "correct", insertion: "correct", retention: "secure" };
  if (defectType.startsWith("push_connector_")) return { ...target, insertion: "correct", retention: "secure" };
  return target;
}

function applyDefectState(target: PhysicalTargetState, defectType: DefectType): PhysicalTargetState {
  switch (defectType) {
    case "ring_sleeve_insufficient_insert":
    case "push_connector_insufficient_insert":
    case "metal_conduit_insufficient_insert":
    case "pf_conduit_insufficient_insert":
      return { ...target, insertion: "shallow" };
    case "push_connector_insulation_overinserted":
      return { ...target, insertion: "overinserted" };
    case "ring_sleeve_uncrimped":
      return { ...target, crimp: "not_crimped", retention: "releases_on_pull" };
    case "ring_sleeve_partial_mark":
      return { ...target, crimp: "partial_mark" };
    case "ring_sleeve_double_mark":
      return { ...target, crimp: "multiple_marks" };
    case "ring_sleeve_conductor_overhang":
    case "push_connector_exposed_conductor":
      return { ...target, measurements: { ...target.measurements, conductorProjectionMm: 5 } };
    case "terminal_screw_loose":
      return { ...target, tightening: "loose", retention: "releases_on_pull" };
    case "push_in_retention_failure":
      return { ...target, retention: "releases_on_pull" };
    case "lamp_cover_cannot_close":
      return { ...target, assembly: "cannot_close" };
    case "lamp_cable_entry_bypass":
      return { ...target, cableRouting: "over_base" };
    case "exposed_receptacle_entry_bypass":
      return { ...target, cableRouting: "over_base", sheathPosition: "above_base" };
    case "exposed_receptacle_sheath":
      return { ...target, sheathPosition: "outside_base" };
    case "cable_sheath_damage":
      return {
        ...target,
        integrity: "damaged",
        damage: [{ id: target.id + ":sheath-cut", type: "cut", location: "sheath", visibleFrom: ["front", "back", "left", "right"] }],
      };
    case "cable_insulation_damage":
      return {
        ...target,
        integrity: "damaged",
        damage: [{ id: target.id + ":insulation-cut", type: "cut", location: "insulation", visibleFrom: ["front", "back"] }],
      };
    case "ring_sleeve_insulation_bite":
      return {
        ...target,
        integrity: "damaged",
        damage: [{ id: target.id + ":insulation-bite", type: "deformation", location: "insulation", visibleFrom: ["front", "back"] }],
      };
    case "mounting_frame_loose":
      return { ...target, tightening: "loose", retention: "moves" };
    case "box_wrong_connection":
    case "receptacle_polarity":
    case "terminal_block_wrong_terminal":
    case "pilot_lamp_wrong_terminal":
    case "switch_wrong_terminal":
      return { ...target, connection: "wrong_target" };
    case "box_conductor_unconnected":
    case "missing_ground":
      return { ...target, connection: "unconnected" };
    case "rubber_bushing_missing":
    case "metal_conduit_missing_insulation_bushing":
    case "metal_conduit_missing_locknut":
    case "pf_conduit_missing_locknut":
      return { ...target, assembly: "missing" };
    case "mounting_frame_wrong_position":
    case "outlet_box_wrong_hole":
      return { ...target, assembly: "misaligned" };
    default:
      return target;
  }
}

function selectDeviceDefectTarget(
  rootId: string,
  defectType: DefectType,
  definition: DevicePhysicalDefinition,
) {
  if (defectType === "lamp_cover_cannot_close" && definition.hasCover) return rootId + ":cover";
  if (defectType === "lamp_cable_entry_bypass" && definition.hasCableEntry) return rootId + ":cable-entry";
  if (["exposed_receptacle_entry_bypass", "exposed_receptacle_sheath"].includes(defectType) && definition.hasCableEntry) return rootId + ":cable-entry";
  const terminalDefects: DefectType[] = [
    "terminal_screw_loose",
    "push_in_retention_failure",
    "terminal_block_wrong_terminal",
    "pilot_lamp_wrong_terminal",
    "switch_wrong_terminal",
    "ceiling_connector_polarity",
    "receptacle_polarity",
    "reverse_polarity",
    "missing_ground",
    "breaker_line_load_reverse",
  ];
  if (terminalDefects.includes(defectType) && definition.terminals.length > 0) {
    const groundIndex = defectType === "missing_ground"
      ? definition.terminals.findIndex((terminal) => /ground|earth/i.test(terminal.id))
      : -1;
    const index = groundIndex >= 0
      ? groundIndex
      : ["terminal_block_wrong_terminal", "pilot_lamp_wrong_terminal", "switch_wrong_terminal"].includes(defectType)
        ? definition.terminals.length - 1
        : 0;
    return rootId + ":terminal-" + definition.terminals[index].id;
  }
  return rootId;
}

function createPhysicalInspectionModelFromTargets(
  expectedTargets: Record<string, PhysicalTargetState>,
  installedTargets: Record<string, PhysicalTargetState>,
  actions: InspectionAction[],
) {
  const model: PhysicalInspectionModel = {
    schemaVersion: 1,
    expected: { targets: expectedTargets },
    installed: { targets: installedTargets },
    actions,
  };
  const errors = validatePhysicalInspectionModel(model);
  if (errors.length > 0) throw new Error(`物理点検データが不正です: ${errors.join(" ")}`);
  return model;
}

function createViewAction(targetId: string): InspectionAction {
  return {
    id: `${targetId}:view`,
    kind: "view",
    label: "角度を変えて確認",
    targetId,
    viewpoints: ["front", "back", "left", "right", "top", "bottom", "free"],
  };
}

function createStateActions(target: PhysicalTargetState): InspectionAction[] {
  const actions: InspectionAction[] = [];
  const targetLabel = target.label;
  if (target.retention !== undefined) {
    actions.push({
      id: `${target.id}:pull`,
      kind: "pull",
      label: targetLabel ? targetLabel + "を軽く引いて確認" : "電線・器具を軽く引いて確認",
      targetId: target.id,
      direction: [0, 0, 1],
      force: "inspection_pull",
    });
  }
  if (target.tightening !== undefined) {
    actions.push({
      id: `${target.id}:wiggle`,
      kind: "wiggle",
      label: targetLabel ? targetLabel + "の固定状態を確認" : "固定部のがたつきを確認",
      targetId: target.id,
      direction: [1, 0, 0],
    });
  }
  return actions;
}

function cloneTarget(target: PhysicalTargetState): PhysicalTargetState {
  return {
    ...target,
    measurements: target.measurements ? { ...target.measurements } : undefined,
    damage: target.damage?.map((damage) => ({ ...damage, visibleFrom: [...damage.visibleFrom] })),
  };
}
