import {
  candidateDiagrams,
  type CandidateDevice,
  type CandidateDiagram,
  type CandidateMountingFrame,
  type CandidateMountingFrameMember,
  type CandidateOutletBoxOpening,
} from "./candidateDiagrams";
import {
  getCandidateCableRuns,
  type CableEndPreparation,
  type CableRunSpecification,
} from "./cableSpecifications";
import {
  createCorrectBoxWiringInstallation,
  disconnectConductor,
  resolveBoxWiringSpecification,
  swapConductorConnections,
  validateBoxWiringInstallation,
  type BoxConductorEndpoint,
  type BoxConnectionMethod,
  type BoxWiringInstallation,
  type BoxWiringSpecification,
} from "./boxWiringSpecifications";
import { getDeviceSpecification } from "./deviceSpecifications";
import { problems, type DefectType, type Problem } from "./problems";
import { createRandomSource, type RandomSource } from "./random";

export type BoxType = "joint" | "outlet";
export type ConnectionMethod = BoxConnectionMethod | "outlet_box" | "metal_conduit" | "pf_conduit";
export type WireColor = "black" | "white" | "red" | "green" | "blue";
export type CableEntrySide = "left" | "right" | "top" | "bottom";

export type ConnectionSpec = {
  id: string;
  method: ConnectionMethod;
  wireCount: number;
  wireSizes: Array<1.6 | 2.0>;
  wireColors: WireColor[];
  sourceCables: CableRunSpecification[];
  sourceCableEnds: CableEndPreparation[];
  conductors: BoxConductorEndpoint[];
  correctConductors: BoxConductorEndpoint[];
  correctConductorIds: string[];
  looseConductors: BoxConductorEndpoint[];
  looseSourceCables: CableRunSpecification[];
  looseSourceCableEnds: CableEndPreparation[];
  sleeveSize?: "small" | "medium";
  mark?: "○" | "小" | "中";
  portCount?: number;
};

export type BoxInspectionPart = {
  id: string;
  boxId: string;
  title: string;
  location: string;
  defectType: DefectType;
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
  connection: ConnectionSpec;
};

export type InspectionBox = {
  id: string;
  sourceDeviceId: string;
  label: string;
  location: string;
  boxType: BoxType;
  x: number;
  y: number;
  cableCount: number;
  outletBoxOpenings: CandidateOutletBoxOpening[];
  wiring: BoxWiringSpecification;
  installation: BoxWiringInstallation;
  parts: BoxInspectionPart[];
};

export type DirectInspectionPart = Omit<BoxInspectionPart, "connection"> & {
  sourceDeviceId: string;
  deviceType: CandidateDevice["type"];
  deviceVariant?: CandidateDevice["variant"];
  cableEntrySide: CableEntrySide;
  x: number;
  y: number;
  mountingFrame?: CandidateMountingFrame;
  mountingFrameMember?: CandidateMountingFrameMember;
  parentMountingFrameId?: string;
  terminalBlock?: CandidateDevice["terminalBlock"];
  terminalConnections?: Array<{ terminalId: string; color: WireColor }>;
};

export type BoxInspectionRound = {
  id: string;
  title: string;
  candidate: CandidateDiagram;
  boxes: InspectionBox[];
  directParts: DirectInspectionPart[];
  parts: Array<BoxInspectionPart | DirectInspectionPart>;
  defectCount: number;
  seed?: string;
};

export type BoxInspectionRoundOptions = {
  candidateNo?: number;
  seed?: string;
};

type Template = {
  title: string;
  method: ConnectionMethod;
  defectType: DefectType;
  question: string;
  choices: string[];
  defectAnswer: string;
  normalExplanation: string;
  defectExplanation: string;
};

const templates: Template[] = [
  {
    title: "リングスリーブ",
    method: "ring_sleeve",
    defectType: "ring_sleeve_wrong_mark",
    question: "リングスリーブの圧着刻印を判定してください。",
    choices: ["欠陥なし", "リングスリーブの刻印が不適合", "心線の差し込み不足", "絶縁被覆をかみ込んでいる"],
    defectAnswer: "リングスリーブの刻印が不適合",
    normalExplanation: "電線の太さと本数に合う刻印で圧着されています。",
    defectExplanation: "接続する電線の太さと本数に対して刻印が合っていません。",
  },
  {
    title: "リングスリーブ",
    method: "ring_sleeve",
    defectType: "ring_sleeve_wrong_size",
    question: "リングスリーブのサイズを判定してください。",
    choices: ["欠陥なし", "リングスリーブのサイズが不適合", "心線の差し込み不足", "絶縁被覆をかみ込んでいる"],
    defectAnswer: "リングスリーブのサイズが不適合",
    normalExplanation: "電線の太さと本数に合うリングスリーブを使用しています。",
    defectExplanation: "接続する電線の太さと本数に対してリングスリーブのサイズが合っていません。",
  },
  {
    title: "差込形コネクタ",
    method: "push_connector",
    defectType: "push_connector_insufficient_insert",
    question: "差込形コネクタの心線差し込み状態を判定してください。",
    choices: ["欠陥なし", "心線の差し込み不足", "接続本数に合わないコネクタを使用している", "絶縁被覆をかみ込んでいる"],
    defectAnswer: "心線の差し込み不足",
    normalExplanation: "すべての心線が確認位置まで確実に差し込まれています。",
    defectExplanation: "心線の一部が確認位置まで届いていません。",
  },
  {
    title: "差込形コネクタ",
    method: "push_connector",
    defectType: "push_connector_wrong_wire_count",
    question: "差込形コネクタの極数を判定してください。",
    choices: ["欠陥なし", "接続本数に合わないコネクタを使用している", "心線の差し込み不足", "リングスリーブのサイズが不適合"],
    defectAnswer: "接続本数に合わないコネクタを使用している",
    normalExplanation: "接続する心線の本数に合う極数のコネクタを使用しています。",
    defectExplanation: "接続する心線の本数とコネクタの極数が合っていません。",
  },
  {
    title: "リングスリーブ",
    method: "ring_sleeve",
    defectType: "box_wrong_connection",
    question: "接続されている心線の組合せを判定してください。",
    choices: ["欠陥なし", "接続する心線の組合せが違う", "接続すべき心線が未接続", "リングスリーブの刻印が不適合"],
    defectAnswer: "接続する心線の組合せが違う",
    normalExplanation: "施工条件どおりの心線が同じ結線へ接続されています。",
    defectExplanation: "別の結線へ接続すべき心線が入れ替わっています。",
  },
  {
    title: "差込形コネクタ",
    method: "push_connector",
    defectType: "box_wrong_connection",
    question: "接続されている心線の組合せを判定してください。",
    choices: ["欠陥なし", "接続する心線の組合せが違う", "接続すべき心線が未接続", "接続本数に合わないコネクタを使用している"],
    defectAnswer: "接続する心線の組合せが違う",
    normalExplanation: "施工条件どおりの心線が同じ結線へ接続されています。",
    defectExplanation: "別の結線へ接続すべき心線が入れ替わっています。",
  },
  {
    title: "リングスリーブ",
    method: "ring_sleeve",
    defectType: "box_conductor_unconnected",
    question: "接続すべき心線がすべて結線されているか判定してください。",
    choices: ["欠陥なし", "接続すべき心線が未接続", "接続する心線の組合せが違う", "リングスリーブのサイズが不適合"],
    defectAnswer: "接続すべき心線が未接続",
    normalExplanation: "接続すべき心線はすべて結線されています。",
    defectExplanation: "接続すべき心線の1本が結線されずに残っています。",
  },
  {
    title: "差込形コネクタ",
    method: "push_connector",
    defectType: "box_conductor_unconnected",
    question: "接続すべき心線がすべて結線されているか判定してください。",
    choices: ["欠陥なし", "接続すべき心線が未接続", "接続する心線の組合せが違う", "心線の差し込み不足"],
    defectAnswer: "接続すべき心線が未接続",
    normalExplanation: "接続すべき心線はすべて結線されています。",
    defectExplanation: "接続すべき心線の1本が結線されずに残っています。",
  },
  {
    title: "アウトレットボックス",
    method: "outlet_box",
    defectType: "outlet_box_wrong_hole",
    question: "ボックス全体の開口位置とケーブルの侵入方向を判定してください。",
    choices: ["欠陥なし", "ケーブルの侵入位置が指定と違う", "ゴムブッシングが全数使われていない", "穴径とゴムブッシングのサイズが違う"],
    defectAnswer: "ケーブルの侵入位置が指定と違う",
    normalExplanation: "すべてのケーブルが指定された面と穴からボックス内へ入っています。",
    defectExplanation: "ケーブルのうち1系統が、指定とは異なる面または穴からボックス内へ入っています。",
  },
  {
    title: "ゴムブッシング",
    method: "outlet_box",
    defectType: "rubber_bushing_missing",
    question: "支給されたゴムブッシングが全数使われているか判定してください。",
    choices: ["欠陥なし", "ゴムブッシングが全数使われていない", "ケーブルの侵入位置が指定と違う", "穴径とゴムブッシングのサイズが違う"],
    defectAnswer: "ゴムブッシングが全数使われていない",
    normalExplanation: "開口したすべてのケーブル通過穴に、支給されたゴムブッシングが取り付けられています。",
    defectExplanation: "開口した穴の1か所にゴムブッシングがなく、支給品が全数使われていません。",
  },
  {
    title: "ゴムブッシング",
    method: "outlet_box",
    defectType: "rubber_bushing_wrong_size",
    question: "ボックス全体の穴径とゴムブッシングの使用数を判定してください。",
    choices: ["欠陥なし", "穴径とゴムブッシングのサイズが違う", "ゴムブッシングが全数使われていない", "ケーブルの侵入位置が指定と違う"],
    defectAnswer: "穴径とゴムブッシングのサイズが違う",
    normalExplanation: "穴径に合うゴムブッシングが取り付けられています。",
    defectExplanation: "19mm用と25mm用の組合せが穴径に合っていません。",
  },
  {
    title: "ねじなし電線管 E19",
    method: "metal_conduit",
    defectType: "metal_conduit_insufficient_insert",
    question: "電線管とボックスコネクタの接続状態を判定してください。",
    choices: ["欠陥なし", "電線管の挿入が不足している", "絶縁ブッシングがない", "ロックナットがない"],
    defectAnswer: "電線管の挿入が不足している",
    normalExplanation: "電線管はボックスコネクタへ十分に挿入され、固定されています。",
    defectExplanation: "電線管がボックスコネクタへ十分に挿入されていません。",
  },
  {
    title: "絶縁ブッシング E19",
    method: "metal_conduit",
    defectType: "metal_conduit_missing_insulation_bushing",
    question: "金属管端の保護状態を判定してください。",
    choices: ["欠陥なし", "絶縁ブッシングがない", "ロックナットがない", "電線管の挿入が不足している"],
    defectAnswer: "絶縁ブッシングがない",
    normalExplanation: "金属管端に絶縁ブッシングが取り付けられています。",
    defectExplanation: "電線を保護する絶縁ブッシングが金属管端にありません。",
  },
  {
    title: "ねじなし電線管E19用ボックスコネクタ",
    method: "metal_conduit",
    defectType: "metal_conduit_missing_locknut",
    question: "ボックスコネクタの固定状態を判定してください。",
    choices: ["欠陥なし", "ロックナットがない", "絶縁ブッシングがない", "電線管の挿入が不足している"],
    defectAnswer: "ロックナットがない",
    normalExplanation: "ボックスコネクタはロックナットで確実に固定されています。",
    defectExplanation: "ボックス内側に固定用のロックナットがありません。",
  },
  {
    title: "合成樹脂製可とう電線管 PF16",
    method: "pf_conduit",
    defectType: "pf_conduit_insufficient_insert",
    question: "PF管とボックスコネクタの接続状態を判定してください。",
    choices: ["欠陥なし", "PF管の挿入が不足している", "ロックナットがない", "金属管用コネクタを使用している"],
    defectAnswer: "PF管の挿入が不足している",
    normalExplanation: "PF管は専用コネクタへ十分に挿入され、固定されています。",
    defectExplanation: "PF管が専用コネクタへ十分に挿入されていません。",
  },
  {
    title: "合成樹脂製可とう電線管用ボックスコネクタ",
    method: "pf_conduit",
    defectType: "pf_conduit_missing_locknut",
    question: "PF管用ボックスコネクタの固定状態を判定してください。",
    choices: ["欠陥なし", "ロックナットがない", "PF管の挿入が不足している", "絶縁ブッシングがない"],
    defectAnswer: "ロックナットがない",
    normalExplanation: "PF管用ボックスコネクタはロックナットで確実に固定されています。",
    defectExplanation: "ボックス内側に固定用のロックナットがありません。",
  },
];

export function createBoxInspectionRound(options: BoxInspectionRoundOptions = {}): BoxInspectionRound {
  const random = createRandomSource(options.seed);
  const randomCandidate = randomItem(candidateDiagrams, random);
  const candidate = candidateDiagrams.find((item) => item.no === options.candidateNo) ?? randomCandidate;
  const devices = candidate.devices.filter((device) => device.type === "connector" || device.type === "box");
  const sources = devices.length ? devices : candidate.devices.filter((device) => device.type !== "power").slice(0, 1);
  const plannedBoxes = sources.map((device, index) => {
    const wiring = resolveBoxWiringSpecification(candidate, device, index);
    return {
      device,
      index,
      wiring,
      installation: createCorrectBoxWiringInstallation(wiring),
      infrastructureSpecs: createInfrastructureSpecs(candidate, device),
    };
  });
  const framedDeviceIds = new Set(
    (candidate.mountingFrames ?? []).flatMap((frame) => frame.members.flatMap((member) => member.sourceDeviceId ? [member.sourceDeviceId] : [])),
  );
  const directDevices = candidate.devices.filter((device) => isDirectInspectionDevice(device) && !framedDeviceIds.has(device.id));
  const mountingFrames = candidate.mountingFrames ?? [];
  const mountingFrameMembers = mountingFrames.flatMap((frame) => frame.members.map((member) => ({ frame, member })));
  const defectPlans = new Map<string, DefectType | "random">();
  const targetDefectCount = randomInt(2, 3, random);
  const connectionDefectCandidates = createConnectionDefectCandidates(plannedBoxes, random);
  if (connectionDefectCandidates.length === 0) {
    throw new Error("接続ミスを生成できるボックス内結線がありません。");
  }
  const connectionDefect = randomItem(connectionDefectCandidates, random);
  const targetBox = plannedBoxes[connectionDefect.boxIndex];

  if (connectionDefect.defectType === "box_wrong_connection") {
    targetBox.installation = swapConductorConnections(
      targetBox.installation,
      connectionDefect.conductorIds[0],
      connectionDefect.conductorIds[1],
    );
  } else {
    targetBox.installation = disconnectConductor(targetBox.installation, connectionDefect.conductorIds[0]);
  }
  for (const groupId of connectionDefect.groupIds) {
    defectPlans.set(boxPartKey(targetBox.device.id, groupId), connectionDefect.defectType);
  }
  const installationErrors = validateBoxWiringInstallation(targetBox.wiring, targetBox.installation);
  if (installationErrors.length > 0) {
    throw new Error("接続ミス生成後の施工結果が不正です: " + installationErrors.join(" "));
  }

  const boxPartKeys = plannedBoxes.flatMap(({ device, wiring, infrastructureSpecs }) => [
    ...wiring.groups.map((group) => boxPartKey(device.id, group.id)),
    ...infrastructureSpecs.map((spec) => boxPartKey(device.id, spec.id)),
  ]);
  const directDefectKeys = directDevices
    .filter((device) => getDirectDefectProblems(device).length > 0)
    .map((device) => "device:" + device.id);
  const frameDefectKeys = mountingFrames.map((frame) => "frame:" + frame.id);
  const frameMemberDefectKeys = mountingFrameMembers
    .filter(({ member }) => getDirectDefectProblems(createFrameMemberDevice(member)).length > 0)
    .map(({ frame, member }) => frameMemberPartKey(frame, member));
  const remainingTargets = shuffle([...boxPartKeys, ...directDefectKeys, ...frameDefectKeys, ...frameMemberDefectKeys].filter((key) => !defectPlans.has(key)), random);
  for (const key of remainingTargets.slice(0, Math.max(0, targetDefectCount - defectPlans.size))) {
    defectPlans.set(key, "random");
  }

  const boxes = plannedBoxes.map(({ device, index, wiring, installation, infrastructureSpecs }) =>
    createBox(candidate, device, index, wiring, installation, infrastructureSpecs, defectPlans, random),
  );
  const directParts = [
    ...directDevices.map((device) =>
      createDirectPart(candidate, device, defectPlans.has("device:" + device.id), random),
    ),
    ...mountingFrames.map((frame) =>
      createMountingFramePart(candidate, frame, defectPlans.has("frame:" + frame.id), random),
    ),
    ...mountingFrameMembers.map(({ frame, member }) =>
      createMountingFrameMemberPart(candidate, frame, member, defectPlans.has(frameMemberPartKey(frame, member)), random),
    ),
  ];
  const defectCount = defectPlans.size;

  return {
    id: options.seed === undefined
      ? Date.now() + "-" + Math.random().toString(36).slice(2)
      : "seed-" + encodeURIComponent(options.seed) + "-candidate-" + candidate.no,
    title: "候補問題No." + candidate.no + " 施工チェック",
    candidate,
    boxes,
    directParts,
    parts: [...boxes.flatMap((box) => box.parts), ...directParts],
    defectCount,
    seed: options.seed,
  };
}

type PlannedBox = {
  device: CandidateDevice;
  wiring: BoxWiringSpecification;
  installation: BoxWiringInstallation;
};

type ConnectionDefectCandidate = {
  boxIndex: number;
  defectType: "box_wrong_connection" | "box_conductor_unconnected";
  groupIds: string[];
  conductorIds: string[];
};

function createConnectionDefectCandidates(boxes: PlannedBox[], random: RandomSource): ConnectionDefectCandidate[] {
  return boxes.flatMap((box, boxIndex) => {
    const disconnected = box.wiring.groups.map((group) => ({
      boxIndex,
      defectType: "box_conductor_unconnected" as const,
      groupIds: [group.id],
      conductorIds: [randomItem(group.conductorIds, random)],
    }));
    const swapped = box.wiring.groups.flatMap((firstGroup, firstIndex) =>
      box.wiring.groups.slice(firstIndex + 1).map((secondGroup) => ({
        boxIndex,
        defectType: "box_wrong_connection" as const,
        groupIds: [firstGroup.id, secondGroup.id],
        conductorIds: [randomItem(firstGroup.conductorIds, random), randomItem(secondGroup.conductorIds, random)],
      })),
    );
    return [...disconnected, ...swapped];
  });
}

function createConnectionSpecs(
  wiring: BoxWiringSpecification,
  installation: BoxWiringInstallation,
): ConnectionSpec[] {
  const conductorById = new Map(wiring.conductors.map((conductor) => [conductor.id, conductor]));
  const cableById = new Map(wiring.cables.map((cable) => [cable.id, cable]));

  return wiring.groups.map((group) => {
    const conductors = wiring.conductors.filter(
      (conductor) => installation.actualConnectionIds[conductor.id] === group.id,
    );
    const correctConductors = group.conductorIds.flatMap((id) => {
      const conductor = conductorById.get(id);
      return conductor ? [conductor] : [];
    });
    const looseConductors = correctConductors.filter(
      (conductor) => installation.actualConnectionIds[conductor.id] === null,
    );
    const sourceCables = getConductorCables(conductors, cableById);
    const sourceCableEnds = getConductorCableEnds(conductors, wiring);
    const looseSourceCables = getConductorCables(looseConductors, cableById);
    const looseSourceCableEnds = getConductorCableEnds(looseConductors, wiring);
    const wireSizes = conductors.map((conductor) => conductor.conductorDiameterMm);
    const wireColors = conductors.map((conductor) => conductor.color);
    const ringRating = getRingRating(correctConductors.map((conductor) => conductor.conductorDiameterMm));

    return {
      id: group.id,
      method: group.method,
      wireCount: conductors.length,
      wireSizes,
      wireColors,
      sourceCables,
      sourceCableEnds,
      conductors,
      correctConductors,
      correctConductorIds: group.conductorIds,
      looseConductors,
      looseSourceCables,
      looseSourceCableEnds,
      sleeveSize: group.method === "ring_sleeve" ? ringRating.size : undefined,
      mark: group.method === "ring_sleeve" ? ringRating.mark : undefined,
      portCount: group.method === "push_connector" ? correctConductors.length : undefined,
    };
  });
}

function getConductorCables(
  conductors: BoxConductorEndpoint[],
  cableById: Map<string, CableRunSpecification>,
) {
  return conductors.flatMap((conductor) => {
      const cable = cableById.get(conductor.cableId);
      return cable ? [cable] : [];
    });
}

function getConductorCableEnds(
  conductors: BoxConductorEndpoint[],
  wiring: BoxWiringSpecification,
) {
  return conductors.flatMap((conductor) => {
      const preparation = wiring.cableEnds[conductor.cableId];
      return preparation ? [preparation] : [];
    });
}

function createInfrastructureSpecs(candidate: CandidateDiagram, device: CandidateDevice): ConnectionSpec[] {
  if (device.type !== "box" || !device.outletBoxOpenings?.length) {
    return [];
  }

  validateOutletBoxOpenings(candidate, device);
  const methods: ConnectionMethod[] = ["outlet_box"];
  if (device.outletBoxOpenings.some((opening) => opening.fitting === "metal_conduit_connector")) methods.push("metal_conduit");
  if (device.outletBoxOpenings.some((opening) => opening.fitting === "pf_conduit_connector")) methods.push("pf_conduit");

  return methods.map((method) => ({
    id: method,
    method,
    wireCount: 0,
    wireSizes: [],
    wireColors: [],
    sourceCables: [],
    sourceCableEnds: [],
    conductors: [],
    correctConductors: [],
    correctConductorIds: [],
    looseConductors: [],
    looseSourceCables: [],
    looseSourceCableEnds: [],
  }));
}
function validateOutletBoxOpenings(candidate: CandidateDiagram, device: CandidateDevice) {
  const openings = device.outletBoxOpenings ?? [];
  const positions = new Set<string>();
  for (const opening of openings) {
    const position = `${opening.side}:${opening.size}`;
    if (positions.has(position)) {
      throw new Error(`候補問題No.${candidate.no} ${device.id}の${position}開口が重複しています。`);
    }
    positions.add(position);
    const connected = candidate.connections.some((connection) =>
      (connection.from === device.id && connection.to === opening.remoteDeviceId)
      || (connection.to === device.id && connection.from === opening.remoteDeviceId));
    if (!connected) {
      throw new Error(`候補問題No.${candidate.no} ${device.id}の開口先${opening.remoteDeviceId}に接続がありません。`);
    }
  }
}

function getRingRating(wireSizes: Array<1.6 | 2.0>): { size: "small" | "medium"; mark: "○" | "小" | "中" } {
  const equivalent = wireSizes.reduce((total, size) => total + (size === 2.0 ? 2 : 1), 0);
  if (wireSizes.length === 2 && wireSizes.every((size) => size === 1.6)) {
    return { size: "small", mark: "○" };
  }
  if (equivalent <= 5) {
    return { size: "small", mark: "小" };
  }
  return { size: "medium", mark: "中" };
}

function createBox(
  candidate: CandidateDiagram,
  device: CandidateDevice,
  index: number,
  wiring: BoxWiringSpecification,
  installation: BoxWiringInstallation,
  infrastructureSpecs: ConnectionSpec[],
  defectPlans: Map<string, DefectType | "random">,
  random: RandomSource,
): InspectionBox {
  const boxType: BoxType = device.type === "box" ? "outlet" : "joint";
  const label = device.label;
  const id = "candidate-" + candidate.no + "-" + device.id;
  const specs = [...createConnectionSpecs(wiring, installation), ...infrastructureSpecs];

  return {
    id,
    sourceDeviceId: device.id,
    label,
    location: "候補問題No." + candidate.no + "「" + device.label + "」付近",
    boxType,
    x: device.x,
    y: device.y,
    cableCount: candidate.connections.filter((connection) => connection.from === device.id || connection.to === device.id).length,
    outletBoxOpenings: device.outletBoxOpenings ?? [],
    wiring,
    installation,
    parts: specs.map((spec, partIndex) => {
      const defectPlan = defectPlans.get(boxPartKey(device.id, spec.id));
      const availableTemplates = templates.filter((item) => item.method === spec.method);
      const template = defectPlan && defectPlan !== "random"
        ? availableTemplates.find((item) => item.defectType === defectPlan)
        : randomItem(availableTemplates.filter((item) => !isConnectionDefect(item.defectType)), random);
      if (!template) throw new Error(`${spec.method}の欠陥テンプレートがありません。`);
      return toPart(template, id, label, spec, partIndex, defectPlan !== undefined);
    }),
  };
}

function boxPartKey(deviceId: string, connectionId: string) {
  return "box:" + deviceId + "-" + connectionId;
}

function isConnectionDefect(defectType: DefectType) {
  return defectType === "box_wrong_connection" || defectType === "box_conductor_unconnected";
}

function toPart(
  template: Template,
  boxId: string,
  label: string,
  connection: ConnectionSpec,
  index: number,
  hasDefect: boolean,
): BoxInspectionPart {
  const conductorSummary = summarizeConductors(connection);
  return {
    id: boxId + "-" + connection.id,
    boxId,
    title: template.title + " " + (index + 1) + "（" + conductorSummary + "）",
    location: label + "内",
    defectType: hasDefect ? template.defectType : "none",
    question: conductorSummary + "の接続です。" + template.question,
    choices: template.choices,
    answer: hasDefect ? template.defectAnswer : "欠陥なし",
    explanation: (hasDefect ? template.defectExplanation : template.normalExplanation)
      + connectionDefectExplanation(connection, hasDefect ? template.defectType : "none")
      + " 接続状態: " + conductorSummary + "。",
    connection,
  };
}

function connectionDefectExplanation(connection: ConnectionSpec, defectType: DefectType) {
  if (defectType === "box_conductor_unconnected") {
    const loose = connection.looseConductors.map(conductorLabel).join("、");
    return loose ? ` 未接続: ${loose}。` : "";
  }
  if (defectType === "box_wrong_connection") {
    const correctIds = new Set(connection.correctConductorIds);
    const actualIds = new Set(connection.conductors.map((conductor) => conductor.id));
    const missing = connection.correctConductors.filter((conductor) => !actualIds.has(conductor.id));
    const foreign = connection.conductors.filter((conductor) => !correctIds.has(conductor.id));
    if (missing.length > 0 && foreign.length > 0) {
      return ` 本来の${missing.map(conductorLabel).join("、")}と、${foreign.map(conductorLabel).join("、")}が入れ替わっています。`;
    }
  }
  return "";
}

function conductorLabel(conductor: BoxConductorEndpoint) {
  const colors: Record<WireColor, string> = {
    black: "黒線",
    white: "白線",
    red: "赤線",
    green: "緑線",
    blue: "青線",
  };
  return `${conductor.remoteLabel}側の${colors[conductor.color]}`;
}

function summarizeConductors(connection: ConnectionSpec) {
  const sizes = connection.wireSizes.map((size) => size.toFixed(1) + "mm").join("・");
  if (connection.method === "ring_sleeve") {
    return connection.wireCount + "芯 " + sizes + " / " + (connection.sleeveSize === "medium" ? "中スリーブ" : "小スリーブ") + "・刻印" + connection.mark;
  }
  if (connection.method === "push_connector") {
    return connection.wireCount + "芯 " + sizes + " / " + connection.portCount + "本用";
  }
  if (connection.method === "metal_conduit") return "金属管 E19・付属品";
  if (connection.method === "pf_conduit") return "PF管 PF16・付属品";
  return "アウトレットボックス・ゴムブッシング";
}

function isDirectInspectionDevice(device: CandidateDevice) {
  return device.type !== "power"
    && device.type !== "connector"
    && device.type !== "box"
    && getDeviceSpecification(device.variant)?.inspectionSelectable === true;
}

function getDirectDefectProblems(device: CandidateDevice): Problem[] {
  const idsByVariant: Partial<Record<NonNullable<CandidateDevice["variant"]>, string[]>> = {
    lamp_receptacle: ["lamp-loop-reverse", "lamp-polarity"],
    ceiling_connector: ["ceiling-connector-polarity"],
    exposed_receptacle: ["exposed-receptacle-sheath", "receptacle-polarity"],
    grounded_receptacle: ["receptacle-ground", "receptacle-polarity"],
    grounded_20a_receptacle: ["receptacle-ground", "receptacle-polarity"],
    eet_receptacle: ["receptacle-ground", "receptacle-polarity"],
    circuit_breaker: ["breaker-line-load-reverse"],
    earth_leakage_breaker: ["breaker-line-load-reverse"],
    terminal_block: ["terminal-block-wrong-terminal"],
    timer_switch: ["terminal-block-wrong-terminal"],
    automatic_switch: ["terminal-block-wrong-terminal"],
    single_pole_switch: ["switch-wrong-terminal"],
    three_way_switch: ["switch-wrong-terminal"],
    four_way_switch: ["switch-wrong-terminal"],
    switch_group: ["switch-wrong-terminal"],
    embedded_receptacle: ["receptacle-polarity"],
    double_receptacle: ["receptacle-polarity"],
    pilot_lamp: ["pilot-lamp-wrong-terminal"],
  };
  const ids = device.variant ? idsByVariant[device.variant] ?? [] : [];
  return problems.filter((problem) => ids.includes(problem.id));
}

function frameMemberPartKey(frame: CandidateMountingFrame, member: CandidateMountingFrameMember) {
  return `frame-member:${frame.id}:${member.id}`;
}

function createFrameMemberDevice(member: CandidateMountingFrameMember): CandidateDevice {
  const receptacle = member.variant === "embedded_receptacle" || member.variant === "double_receptacle" || member.variant === "grounded_receptacle" || member.variant === "grounded_20a_receptacle" || member.variant === "eet_receptacle";
  const pilot = member.variant === "pilot_lamp";
  return {
    id: member.sourceDeviceId ?? member.id,
    label: member.label,
    type: receptacle ? "receptacle" : pilot ? "pilot" : "switch",
    variant: member.variant,
    x: 0,
    y: 0,
  };
}

function createMountingFrameMemberPart(
  candidate: CandidateDiagram,
  frame: CandidateMountingFrame,
  member: CandidateMountingFrameMember,
  hasDefect: boolean,
  random: RandomSource,
): DirectInspectionPart {
  const sourceDevice = member.sourceDeviceId
    ? candidate.devices.find((device) => device.id === member.sourceDeviceId)
    : undefined;
  const memberDevice = createFrameMemberDevice(member);
  const device = sourceDevice
    ? { ...memberDevice, id: sourceDevice.id, x: sourceDevice.x, y: sourceDevice.y }
    : memberDevice;
  const part = createDirectPart(candidate, device, hasDefect, random);
  const positionName = member.position === "top" ? "上段" : member.position === "middle" ? "中段" : "下段";
  return {
    ...part,
    id: frameMemberPartKey(frame, member),
    sourceDeviceId: frameMemberPartKey(frame, member),
    location: `複線図上の${frame.label} ${positionName}`,
    x: frame.x,
    y: frame.y,
    mountingFrameMember: member,
    parentMountingFrameId: frame.id,
  };
}

function createMountingFramePart(
  candidate: CandidateDiagram,
  frame: CandidateMountingFrame,
  hasDefect: boolean,
  random: RandomSource,
): DirectInspectionPart {
  const frameProblems = problems.filter((problem) =>
    problem.id === "mounting-frame-loose" || problem.id === "mounting-frame-wrong-position"
  );
  const defectProblem = hasDefect ? randomItem(frameProblems, random) : undefined;
  return {
    id: "frame-" + frame.id,
    boxId: "",
    sourceDeviceId: frame.id,
    deviceType: "switch",
    cableEntrySide: "bottom",
    title: frame.label,
    location: `複線図上の${frame.label}（${frame.members.length}器具）`,
    defectType: defectProblem?.defectType ?? "none",
    question: defectProblem?.question ?? `${frame.label}の器具構成と取付状態を判定してください。`,
    choices: defectProblem?.choices ?? ["欠陥なし", "器具の取付位置が施工条件と違う", "器具が取付枠へ確実に固定されていない", "端子番号が違う"],
    answer: defectProblem?.answer ?? "欠陥なし",
    explanation: defectProblem?.explanation ?? "指定された器具が上・中・下の正しい位置へ確実に固定されています。",
    x: frame.x,
    y: frame.y,
    mountingFrame: frame,
  };
}

function createDirectPart(
  candidate: CandidateDiagram,
  device: CandidateDevice,
  hasDefect: boolean,
  random: RandomSource,
): DirectInspectionPart {
  const defectProblem = hasDefect ? randomItem(getDirectDefectProblems(device), random) : undefined;
  const deviceName = getInspectionDeviceName(device);
  return {
    id: "device-" + device.id,
    boxId: "",
    sourceDeviceId: device.id,
    deviceType: device.type,
    deviceVariant: device.variant,
    cableEntrySide: getCableEntrySide(candidate, device),
    title: deviceName,
    location: "複線図上の" + deviceName + "（表示記号「" + device.label + "」）",
    defectType: defectProblem?.defectType ?? "none",
    question: defectProblem?.question ?? deviceName + "の施工状態を判定してください。",
    choices: defectProblem?.choices ?? ["欠陥なし", "接続不良", "取付不良", "極性誤り"],
    answer: defectProblem?.answer ?? "欠陥なし",
    explanation: defectProblem?.explanation
      ?? "この器具は正常に施工されています。接続部の欠陥は、ボックス内配線図で判定します。",
    x: device.x,
    y: device.y,
    terminalBlock: device.terminalBlock,
    terminalConnections: resolveTerminalConnections(candidate, device),
  };
}

function resolveTerminalConnections(candidate: CandidateDiagram, device: CandidateDevice) {
  const wiring = candidate.deviceWirings?.find((item) => item.deviceId === device.id);
  if (!wiring) return undefined;

  const cableById = new Map(getCandidateCableRuns(candidate).map((cable) => [cable.id, cable]));
  return wiring.terminals.flatMap((terminal) =>
    terminal.conductors.flatMap((conductor) => {
      const cable = cableById.get(conductor.cableId);
      const color = cable?.coreColors[conductor.coreIndex];
      return color ? [{ terminalId: terminal.terminalId, color }] : [];
    }),
  );
}

function getCableEntrySide(candidate: CandidateDiagram, device: CandidateDevice): CableEntrySide {
  const connectedDevices = candidate.connections.flatMap((connection) => {
    if (connection.from !== device.id && connection.to !== device.id) return [];
    const otherId = connection.from === device.id ? connection.to : connection.from;
    const other = candidate.devices.find((item) => item.id === otherId);
    return other ? [other] : [];
  });
  const source = connectedDevices.find((item) => item.type === "connector" || item.type === "box")
    ?? connectedDevices.find((item) => item.type === "power")
    ?? connectedDevices[0];
  if (!source) return "left";

  const deltaX = source.x - device.x;
  const deltaY = source.y - device.y;
  if (Math.abs(deltaX) >= Math.abs(deltaY)) return deltaX < 0 ? "left" : "right";
  return deltaY < 0 ? "top" : "bottom";
}
function getInspectionDeviceName(device: CandidateDevice) {
  const names: Partial<Record<NonNullable<CandidateDevice["variant"]>, string>> = {
    lamp_receptacle: "ランプレセプタクル",
    ceiling_connector: "引掛シーリングローゼット",
    pilot_lamp: "埋込連用パイロットランプ",
    single_pole_switch: "埋込連用タンブラスイッチ（片切）",
    three_way_switch: "埋込連用タンブラスイッチ（3路）",
    four_way_switch: "埋込連用タンブラスイッチ（4路）",
    switch_group: "埋込連用タンブラスイッチ",
    embedded_receptacle: "埋込連用コンセント",
    double_receptacle: "埋込ダブルコンセント",
    exposed_receptacle: "露出形コンセント",
    grounded_receptacle: "埋込コンセント（接地極付）",
    grounded_20a_receptacle: "埋込コンセント（20A 250V 接地極付）",
    eet_receptacle: "埋込コンセント（接地極付接地端子付）",
    circuit_breaker: "配線用遮断器",
    earth_leakage_breaker: "漏電遮断器",
    timer_switch: "タイムスイッチ",
    automatic_switch: "自動点滅器",
    earth_terminal: "接地端子",
    terminal_block: "端子台",
    motor_terminal: "三相誘導電動機",
    load_device: "負荷器具",
    omitted_work: "施工省略箇所",
  };
  return device.variant ? names[device.variant] ?? device.label : device.label;
}
function randomItem<T>(items: T[], random: RandomSource) {
  return items[Math.floor(random() * items.length)];
}

function randomInt(min: number, max: number, random: RandomSource) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[], random: RandomSource) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}
