import { candidateDiagrams, type CandidateDevice, type CandidateDiagram } from "./candidateDiagrams";
import { problems, type DefectType, type Problem } from "./problems";

export type BoxType = "joint" | "outlet";
export type ConnectionMethod = "ring_sleeve" | "push_connector";
export type WireColor = "black" | "white" | "red" | "green" | "blue";

export type ConnectionSpec = {
  id: string;
  method: ConnectionMethod;
  wireCount: number;
  wireSizes: Array<1.6 | 2.0>;
  wireColors: WireColor[];
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
  parts: BoxInspectionPart[];
};

export type DirectInspectionPart = Omit<BoxInspectionPart, "connection"> & {
  sourceDeviceId: string;
  deviceType: CandidateDevice["type"];
  deviceVariant?: CandidateDevice["variant"];
  x: number;
  y: number;
};

export type BoxInspectionRound = {
  id: string;
  title: string;
  candidate: CandidateDiagram;
  boxes: InspectionBox[];
  directParts: DirectInspectionPart[];
  parts: Array<BoxInspectionPart | DirectInspectionPart>;
  defectCount: number;
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
    title: "差し込みコネクタ",
    method: "push_connector",
    defectType: "push_connector_insufficient_insert",
    question: "差し込みコネクタの心線差し込み状態を判定してください。",
    choices: ["欠陥なし", "心線の差し込み不足", "接続本数に合わないコネクタを使用している", "絶縁被覆をかみ込んでいる"],
    defectAnswer: "心線の差し込み不足",
    normalExplanation: "すべての心線が確認位置まで確実に差し込まれています。",
    defectExplanation: "心線の一部が確認位置まで届いていません。",
  },
  {
    title: "差し込みコネクタ",
    method: "push_connector",
    defectType: "push_connector_wrong_wire_count",
    question: "差し込みコネクタの極数を判定してください。",
    choices: ["欠陥なし", "接続本数に合わないコネクタを使用している", "心線の差し込み不足", "リングスリーブのサイズが不適合"],
    defectAnswer: "接続本数に合わないコネクタを使用している",
    normalExplanation: "接続する心線の本数に合う極数のコネクタを使用しています。",
    defectExplanation: "接続する心線の本数とコネクタの極数が合っていません。",
  },
];

export function createBoxInspectionRound(): BoxInspectionRound {
  const candidate = randomItem(candidateDiagrams);
  const devices = candidate.devices.filter((device) => device.type === "connector" || device.type === "box");
  const sources = devices.length ? devices : candidate.devices.filter((device) => device.type !== "power").slice(0, 1);
  const plannedBoxes = sources.map((device, index) => ({
    device,
    index,
    specs: createConnectionSpecs(candidate, device, index),
  }));
  const directDevices = candidate.devices.filter(isDirectInspectionDevice);
  const boxPartKeys = plannedBoxes.flatMap(({ device, specs }) =>
    specs.map((spec) => "box:" + device.id + "-" + spec.id),
  );
  const directDefectKeys = directDevices
    .filter((device) => getDirectDefectProblems(device).length > 0)
    .map((device) => "device:" + device.id);
  const defectTargets = [...boxPartKeys, ...directDefectKeys];
  const defectCount = Math.min(randomInt(2, 3), defectTargets.length);
  const defectIds = new Set(shuffle(defectTargets).slice(0, defectCount));
  const boxes = plannedBoxes.map(({ device, index, specs }) => createBox(candidate, device, index, specs, defectIds));
  const directParts = directDevices.map((device) => createDirectPart(device, defectIds.has("device:" + device.id)));

  return {
    id: Date.now() + "-" + Math.random().toString(36).slice(2),
    title: "候補問題No." + candidate.no + " 施工チェック",
    candidate,
    boxes,
    directParts,
    parts: [...boxes.flatMap((box) => box.parts), ...directParts],
    defectCount,
  };
}

function createConnectionSpecs(candidate: CandidateDiagram, device: CandidateDevice, boxIndex: number): ConnectionSpec[] {
  const incident = candidate.connections.filter((connection) => connection.from === device.id || connection.to === device.id);
  const connectionCount = clamp(incident.length, 2, 5);
  const hasTwoMillimeter = incident.some((connection) => connection.label?.includes("2.0"));
  const incidentColors = incident.map((connection) => connection.color);
  const functionalColors: WireColor[] = ["white", "black", "red", "green", "blue"];

  return Array.from({ length: connectionCount }, (_, index) => {
    const method: ConnectionMethod = (candidate.no + boxIndex + index) % 2 === 0 ? "ring_sleeve" : "push_connector";
    const wireCount = clamp(incident.length - (index % 2), 2, 4);
    const wireSizes = Array.from({ length: wireCount }, (_, wireIndex): 1.6 | 2.0 =>
      hasTwoMillimeter && index < 2 && wireIndex === 0 ? 2.0 : 1.6,
    );
    const wireColors = Array.from({ length: wireCount }, (_, wireIndex) =>
      incidentColors[wireIndex] ?? functionalColors[(index + wireIndex) % functionalColors.length],
    );
    const ringRating = getRingRating(wireSizes);

    return {
      id: "connection-" + (index + 1),
      method,
      wireCount,
      wireSizes,
      wireColors,
      sleeveSize: method === "ring_sleeve" ? ringRating.size : undefined,
      mark: method === "ring_sleeve" ? ringRating.mark : undefined,
      portCount: method === "push_connector" ? wireCount : undefined,
    };
  });
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
  specs: ConnectionSpec[],
  defectIds: Set<string>,
): InspectionBox {
  const boxType: BoxType = device.type === "box" ? "joint" : "outlet";
  const label = boxType === "joint" ? "ジョイントボックス" : "アウトレットボックス";
  const id = "candidate-" + candidate.no + "-" + device.id;

  return {
    id,
    sourceDeviceId: device.id,
    label: label + " " + (index + 1),
    location: "候補問題No." + candidate.no + "「" + device.label + "」付近",
    boxType,
    x: device.x,
    y: device.y,
    cableCount: candidate.connections.filter((connection) => connection.from === device.id || connection.to === device.id).length,
    parts: specs.map((spec, partIndex) => {
      const template = randomItem(templates.filter((item) => item.method === spec.method));
      return toPart(template, id, label, spec, partIndex, defectIds.has("box:" + device.id + "-" + spec.id));
    }),
  };
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
    explanation: (hasDefect ? template.defectExplanation : template.normalExplanation) + " 接続条件: " + conductorSummary + "。",
    connection,
  };
}

function summarizeConductors(connection: ConnectionSpec) {
  const sizes = connection.wireSizes.map((size) => size.toFixed(1) + "mm").join("・");
  if (connection.method === "ring_sleeve") {
    return connection.wireCount + "芯 " + sizes + " / " + (connection.sleeveSize === "medium" ? "中スリーブ" : "小スリーブ") + "・刻印" + connection.mark;
  }
  return connection.wireCount + "芯 " + sizes + " / " + connection.portCount + "本用";
}

function isDirectInspectionDevice(device: CandidateDevice) {
  return device.type !== "power"
    && device.type !== "connector"
    && device.type !== "box"
    && device.variant !== "omitted_work";
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
  };
  const ids = device.variant ? idsByVariant[device.variant] ?? [] : [];
  return problems.filter((problem) => ids.includes(problem.id));
}

function createDirectPart(device: CandidateDevice, hasDefect: boolean): DirectInspectionPart {
  const defectProblem = hasDefect ? randomItem(getDirectDefectProblems(device)) : undefined;
  return {
    id: "device-" + device.id,
    boxId: "",
    sourceDeviceId: device.id,
    deviceType: device.type,
    deviceVariant: device.variant,
    title: device.label,
    location: "複線図上の「" + device.label + "」",
    defectType: defectProblem?.defectType ?? "none",
    question: defectProblem?.question ?? device.label + "の施工状態を判定してください。",
    choices: defectProblem?.choices ?? ["欠陥なし", "接続不良", "取付不良", "極性誤り"],
    answer: defectProblem?.answer ?? "欠陥なし",
    explanation: defectProblem?.explanation
      ?? "この器具は正常に施工されています。接続部の欠陥は、ボックス内配線図で判定します。",
    x: device.x,
    y: device.y,
  };
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
