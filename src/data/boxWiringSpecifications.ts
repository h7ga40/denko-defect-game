import type {
  CandidateBoxConnectionGroup,
  CandidateConnection,
  CandidateDevice,
  CandidateDiagram,
} from "./candidateDiagrams";
import {
  resolveCableRunSpecification,
  type CableCoreColor,
  type CableEndPreparation,
  type CableRunSpecification,
} from "./cableSpecifications";

export type BoxConnectionMethod = "ring_sleeve" | "push_connector";
export type ConductorRole = "line" | "neutral" | "traveler" | "ground" | "unassigned";
export type BoxWiringSource = "specified" | "inferred";

export type BoxConductorEndpoint = {
  id: string;
  cableId: string;
  cableEnd: "from" | "to";
  endpointId: string;
  remoteEndpointId: string;
  remoteLabel: string;
  coreIndex: number;
  color: CableCoreColor;
  conductorDiameterMm: 1.6 | 2.0;
  role: ConductorRole;
  correctConnectionId: string | null;
};

export type BoxConnectionGroup = {
  id: string;
  method: BoxConnectionMethod;
  conductorIds: string[];
};

export type BoxWiringSpecification = {
  boxDeviceId: string;
  source: BoxWiringSource;
  cables: CableRunSpecification[];
  cableEnds: Record<string, CableEndPreparation>;
  conductors: BoxConductorEndpoint[];
  groups: BoxConnectionGroup[];
};

export type BoxWiringInstallation = {
  actualConnectionIds: Record<string, string | null>;
};

type IncidentCable = {
  cable: CableRunSpecification;
  cableEnd: "from" | "to";
  preparation: CableEndPreparation;
  remoteEndpointId: string;
  remoteLabel: string;
};

export function resolveBoxWiringSpecification(
  candidate: CandidateDiagram,
  device: CandidateDevice,
  boxIndex: number,
): BoxWiringSpecification {
  const incidentCables = getIncidentCables(candidate, device);
  const conductors = incidentCables.flatMap(createConductorEndpoints);
  const specified = candidate.boxWirings?.find((wiring) => wiring.deviceId === device.id);
  const groups = specified
    ? resolveSpecifiedGroups(specified.groups, conductors)
    : inferConnectionGroups(candidate.no, boxIndex, conductors);
  const correctConnectionByConductor = new Map(
    groups.flatMap((group) => group.conductorIds.map((conductorId) => [conductorId, group.id] as const)),
  );
  const wiring: BoxWiringSpecification = {
    boxDeviceId: device.id,
    source: specified ? "specified" : "inferred",
    cables: incidentCables.map(({ cable }) => cable),
    cableEnds: Object.fromEntries(incidentCables.map(({ cable, preparation }) => [cable.id, preparation])),
    conductors: conductors.map((conductor) => ({
      ...conductor,
      correctConnectionId: correctConnectionByConductor.get(conductor.id) ?? null,
    })),
    groups,
  };
  const errors = validateBoxWiringSpecification(wiring);
  if (errors.length > 0) {
    throw new Error(`候補問題No.${candidate.no} ${device.id}のボックス結線が不正です: ${errors.join(" ")}`);
  }
  return wiring;
}

export function validateBoxWiringSpecification(wiring: BoxWiringSpecification) {
  const errors: string[] = [];
  const conductorIds = new Set(wiring.conductors.map((conductor) => conductor.id));
  const cableIds = new Set(wiring.cables.map((cable) => cable.id));
  const assigned = new Set<string>();
  const groupIds = new Set<string>();

  if (cableIds.size !== wiring.cables.length) {
    errors.push("ボックス内のケーブルIDが重複しています。");
  }
  if (conductorIds.size !== wiring.conductors.length) {
    errors.push("ボックス内の心線IDが重複しています。");
  }

  for (const group of wiring.groups) {
    if (groupIds.has(group.id)) {
      errors.push(`結線ID ${group.id}が重複しています。`);
    }
    groupIds.add(group.id);
    if (group.conductorIds.length < 2 || group.conductorIds.length > 4) {
      errors.push(`${group.id}の接続心線数は2～4本である必要があります。`);
    }
    for (const conductorId of group.conductorIds) {
      if (!conductorIds.has(conductorId)) {
        errors.push(`${group.id}が存在しない心線${conductorId}を参照しています。`);
      }
      if (assigned.has(conductorId)) {
        errors.push(`心線${conductorId}が複数の結線へ割り当てられています。`);
      }
      assigned.add(conductorId);
    }
  }

  for (const conductor of wiring.conductors) {
    const assignedConnectionId = wiring.groups.find((group) => group.conductorIds.includes(conductor.id))?.id ?? null;
    if (assignedConnectionId === null) {
      errors.push(`心線${conductor.id}が結線へ割り当てられていません。`);
    }
    if (assignedConnectionId !== conductor.correctConnectionId) {
      errors.push(`心線${conductor.id}の正しい結線IDが割当てと一致していません。`);
    }
  }

  return errors;
}

export function createCorrectBoxWiringInstallation(
  wiring: BoxWiringSpecification,
): BoxWiringInstallation {
  return {
    actualConnectionIds: Object.fromEntries(
      wiring.conductors.map((conductor) => [conductor.id, conductor.correctConnectionId]),
    ),
  };
}

export function disconnectConductor(
  installation: BoxWiringInstallation,
  conductorId: string,
): BoxWiringInstallation {
  if (!(conductorId in installation.actualConnectionIds)) {
    throw new Error(`施工結果に存在しない心線${conductorId}を未接続にできません。`);
  }
  return {
    actualConnectionIds: {
      ...installation.actualConnectionIds,
      [conductorId]: null,
    },
  };
}

export function swapConductorConnections(
  installation: BoxWiringInstallation,
  firstConductorId: string,
  secondConductorId: string,
): BoxWiringInstallation {
  const firstConnectionId = installation.actualConnectionIds[firstConductorId];
  const secondConnectionId = installation.actualConnectionIds[secondConductorId];
  if (firstConnectionId === undefined || secondConnectionId === undefined) {
    throw new Error("施工結果に存在しない心線の接続先は交換できません。");
  }
  if (firstConnectionId === null || secondConnectionId === null || firstConnectionId === secondConnectionId) {
    throw new Error("接続先の異なる接続済み心線を指定してください。");
  }
  return {
    actualConnectionIds: {
      ...installation.actualConnectionIds,
      [firstConductorId]: secondConnectionId,
      [secondConductorId]: firstConnectionId,
    },
  };
}

export function validateBoxWiringInstallation(
  wiring: BoxWiringSpecification,
  installation: BoxWiringInstallation,
) {
  const errors: string[] = [];
  const conductorIds = new Set(wiring.conductors.map((conductor) => conductor.id));
  const groupIds = new Set(wiring.groups.map((group) => group.id));

  for (const conductor of wiring.conductors) {
    if (!(conductor.id in installation.actualConnectionIds)) {
      errors.push(`心線${conductor.id}の施工結果がありません。`);
      continue;
    }
    const actualConnectionId = installation.actualConnectionIds[conductor.id];
    if (actualConnectionId !== null && !groupIds.has(actualConnectionId)) {
      errors.push(`心線${conductor.id}が存在しない結線${actualConnectionId}へ接続されています。`);
    }
  }
  for (const conductorId of Object.keys(installation.actualConnectionIds)) {
    if (!conductorIds.has(conductorId)) {
      errors.push(`施工結果が存在しない心線${conductorId}を参照しています。`);
    }
  }
  return errors;
}

function getIncidentCables(candidate: CandidateDiagram, device: CandidateDevice): IncidentCable[] {
  return candidate.connections.flatMap((connection, index) => {
    if (connection.from !== device.id && connection.to !== device.id) return [];
    const cable = resolveCableRunSpecification(candidate, connection, index);
    const cableEnd = connection.from === device.id ? "from" : "to";
    const remoteEndpointId = cableEnd === "from" ? connection.to : connection.from;
    const remoteLabel = candidate.devices.find((item) => item.id === remoteEndpointId)?.label ?? remoteEndpointId;
    return [{
      cable,
      cableEnd,
      preparation: cableEnd === "from" ? cable.fromEnd : cable.toEnd,
      remoteEndpointId,
      remoteLabel,
    }];
  });
}

function createConductorEndpoints(incident: IncidentCable): BoxConductorEndpoint[] {
  return incident.cable.coreColors.map((color, coreIndex) => ({
    id: `${incident.cable.id}-core-${coreIndex + 1}`,
    cableId: incident.cable.id,
    cableEnd: incident.cableEnd,
    endpointId: incident.preparation.endpointId,
    remoteEndpointId: incident.remoteEndpointId,
    remoteLabel: incident.remoteLabel,
    coreIndex,
    color,
    conductorDiameterMm: incident.cable.conductorDiameterMm,
    role: inferConductorRole(color),
    correctConnectionId: null,
  }));
}

function resolveSpecifiedGroups(
  specifiedGroups: CandidateBoxConnectionGroup[],
  conductors: BoxConductorEndpoint[],
): BoxConnectionGroup[] {
  const conductorIdByReference = new Map(
    conductors.map((conductor) => [`${conductor.cableId}:${conductor.coreIndex}`, conductor.id]),
  );

  return specifiedGroups.map((group) => ({
    id: group.id,
    method: group.method,
    conductorIds: group.conductors.flatMap((reference) => {
      const conductorId = conductorIdByReference.get(`${reference.cableId}:${reference.coreIndex}`);
      return [conductorId ?? `missing:${reference.cableId}:core-${reference.coreIndex + 1}`];
    }),
  }));
}

function inferConnectionGroups(
  candidateNo: number,
  boxIndex: number,
  conductors: BoxConductorEndpoint[],
): BoxConnectionGroup[] {
  const byCoreIndex = new Map<number, BoxConductorEndpoint[]>();
  for (const conductor of conductors) {
    const group = byCoreIndex.get(conductor.coreIndex) ?? [];
    group.push(conductor);
    byCoreIndex.set(conductor.coreIndex, group);
  }
  const conductorSets = [...byCoreIndex.values()].flatMap(splitIntoConnectableGroups);

  return conductorSets.map((group, index) => ({
    id: `connection-${index + 1}`,
    method: (candidateNo + boxIndex + index) % 2 === 0 ? "ring_sleeve" : "push_connector",
    conductorIds: group.map((conductor) => conductor.id),
  }));
}

function splitIntoConnectableGroups(conductors: BoxConductorEndpoint[]) {
  if (conductors.length < 2) return [];
  const groupCount = Math.ceil(conductors.length / 4);
  const baseSize = Math.floor(conductors.length / groupCount);
  const remainder = conductors.length % groupCount;
  const groups: BoxConductorEndpoint[][] = [];
  let start = 0;

  for (let index = 0; index < groupCount; index += 1) {
    const size = baseSize + (index < remainder ? 1 : 0);
    groups.push(conductors.slice(start, start + size));
    start += size;
  }
  return groups;
}

function inferConductorRole(color: CableCoreColor): ConductorRole {
  if (color === "green") return "ground";
  return "unassigned";
}
