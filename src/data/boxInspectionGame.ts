import { candidateDiagrams, type CandidateDevice, type CandidateDiagram } from "./candidateDiagrams";
import type { DefectType } from "./problems";

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
  hotspot: { x: number; y: number; width: number; height: number };
  parts: BoxInspectionPart[];
};

export type DirectInspectionPart = Omit<BoxInspectionPart, "connection"> & {
  sourceDeviceId: string;
  deviceType: CandidateDevice["type"];
  x: number;
  y: number;
  hotspot: { x: number; y: number; width: number; height: number };
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
  const partKeys = plannedBoxes.flatMap(({ device, specs }) => specs.map((spec) => device.id + "-" + spec.id));
  const defectCount = Math.min(randomInt(2, 3), partKeys.length);
  const defectIds = new Set(shuffle(partKeys).slice(0, defectCount));
  const boxes = plannedBoxes.map(({ device, index, specs }) => createBox(candidate, device, index, specs, defectIds));
  const directParts = candidate.devices
    .filter((device) => device.type !== "power" && device.type !== "connector" && device.type !== "box")
    .map(createDirectPart);

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
    hotspot: {
      x: clamp(device.x - 75, 28, 542),
      y: clamp(device.y - 50, 60, 260),
      width: 150,
      height: 100,
    },
    parts: specs.map((spec, partIndex) => {
      const template = randomItem(templates.filter((item) => item.method === spec.method));
      return toPart(template, id, label, spec, partIndex, defectIds.has(device.id + "-" + spec.id));
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

function createDirectPart(device: CandidateDevice): DirectInspectionPart {
  const width = device.type === "lamp" || device.type === "pilot" ? 112 : 124;
  const height = 94;
  return {
    id: "device-" + device.id,
    boxId: "",
    sourceDeviceId: device.id,
    deviceType: device.type,
    title: device.label,
    location: "複線図上の「" + device.label + "」",
    defectType: "none",
    question: device.label + "の施工状態を判定してください。",
    choices: ["欠陥なし", "接続不良", "取付不良", "極性誤り"],
    answer: "欠陥なし",
    explanation: "この器具は正常に施工されています。接続部の欠陥は、ボックス内配線図で判定します。",
    x: device.x,
    y: device.y,
    hotspot: {
      x: clamp(device.x - width / 2, 28, 692 - width),
      y: clamp(device.y - height / 2, 60, 360 - height),
      width,
      height,
    },
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
