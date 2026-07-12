import { candidateDiagrams, type CandidateDevice, type CandidateDiagram } from "./candidateDiagrams";
import type { DefectType } from "./problems";

export type BoxType = "joint" | "outlet";

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
};

export type InspectionBox = {
  id: string;
  sourceDeviceId: string;
  label: string;
  location: string;
  boxType: BoxType;
  x: number;
  y: number;
  hotspot: { x: number; y: number; width: number; height: number };
  parts: BoxInspectionPart[];
};

export type DirectInspectionPart = BoxInspectionPart & {
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
  parts: BoxInspectionPart[];
  defectCount: number;
};

type Template = Omit<BoxInspectionPart, "id" | "boxId" | "location" | "answer" | "explanation"> & {
  defectAnswer: string;
  normalExplanation: string;
  defectExplanation: string;
};

const templates: Template[] = [
  {
    title: "リングスリーブ", defectType: "ring_sleeve_wrong_mark",
    question: "リングスリーブの圧着刻印を判定してください。",
    choices: ["欠陥なし", "リングスリーブの刻印が不適合", "心線の差し込み不足", "絶縁被覆をかみ込んでいる"],
    defectAnswer: "リングスリーブの刻印が不適合",
    normalExplanation: "接続条件に合う刻印で圧着されています。",
    defectExplanation: "接続条件に対してリングスリーブの刻印が合っていません。",
  },
  {
    title: "リングスリーブ", defectType: "ring_sleeve_wrong_size",
    question: "リングスリーブのサイズを判定してください。",
    choices: ["欠陥なし", "リングスリーブのサイズが不適合", "心線の差し込み不足", "絶縁被覆をかみ込んでいる"],
    defectAnswer: "リングスリーブのサイズが不適合",
    normalExplanation: "電線の太さと本数に合うリングスリーブを使用しています。",
    defectExplanation: "電線の太さと本数に対してリングスリーブのサイズが合っていません。",
  },
  {
    title: "差し込みコネクタ", defectType: "push_connector_insufficient_insert",
    question: "差し込みコネクタの心線差し込み状態を判定してください。",
    choices: ["欠陥なし", "心線の差し込み不足", "接続本数に合わないコネクタを使用している", "絶縁被覆をかみ込んでいる"],
    defectAnswer: "心線の差し込み不足",
    normalExplanation: "心線は確認位置まで確実に差し込まれています。",
    defectExplanation: "片方の心線が確認位置まで届いていません。",
  },
  {
    title: "差し込みコネクタ", defectType: "push_connector_wrong_wire_count",
    question: "差し込みコネクタの本数選定を判定してください。",
    choices: ["欠陥なし", "接続本数に合わないコネクタを使用している", "心線の差し込み不足", "リングスリーブのサイズが不適合"],
    defectAnswer: "接続本数に合わないコネクタを使用している",
    normalExplanation: "接続する心線の本数に合う差し込みコネクタを使用しています。",
    defectExplanation: "接続本数に対してコネクタの極数が足りていません。",
  },
];

export function createBoxInspectionRound(): BoxInspectionRound {
  const candidate = randomItem(candidateDiagrams);
  const devices = candidate.devices.filter((device) => device.type === "connector" || device.type === "box");
  const sources = devices.length ? devices : candidate.devices.filter((device) => device.type !== "power").slice(0, 1);
  const defectCount = Math.min(randomInt(2, 3), sources.length * 2);
  const defectIds = new Set(shuffle(sources.flatMap((device) => [device.id + "-ring-1", device.id + "-ring-2", device.id + "-connector-1", device.id + "-connector-2"])).slice(0, defectCount));
  const boxes = sources.map((device, index) => createBox(candidate, device, index, defectIds));
  const directParts = candidate.devices.filter((device) => device.type !== "power" && device.type !== "connector" && device.type !== "box").map(createDirectPart);
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

function createBox(candidate: CandidateDiagram, device: CandidateDevice, index: number, defectIds: Set<string>): InspectionBox {
  const boxType: BoxType = device.type === "box" ? "joint" : "outlet";
  const label = boxType === "joint" ? "ジョイントボックス" : "アウトレットボックス";
  const width = 150;
  const height = 100;
  const id = "candidate-" + candidate.no + "-" + device.id;
  const ring = randomItem(templates.slice(0, 2));
  const connector = randomItem(templates.slice(2));
  return {
    id,
    sourceDeviceId: device.id,
    label: label + " " + (index + 1),
    location: "候補問題No." + candidate.no + "「" + device.label + "」付近",
    boxType,
    x: device.x,
    y: device.y,
    hotspot: { x: clamp(device.x - width / 2, 28, 692 - width), y: clamp(device.y - height / 2, 60, 360 - height), width, height },
    parts: [
      toPart(ring, id, label, "ring-1", defectIds.has(device.id + "-ring-1")),
      toPart(randomItem(templates.slice(0, 2)), id, label, "ring-2", defectIds.has(device.id + "-ring-2")),
      toPart(connector, id, label, "connector-1", defectIds.has(device.id + "-connector-1")),
      toPart(randomItem(templates.slice(2)), id, label, "connector-2", defectIds.has(device.id + "-connector-2")),
    ],
  };
}

function toPart(template: Template, boxId: string, label: string, kind: string, hasDefect: boolean): BoxInspectionPart {
  return {
    id: boxId + "-" + kind,
    boxId,
    title: template.title,
    location: label + "内",
    defectType: hasDefect ? template.defectType : "none",
    question: template.question,
    choices: template.choices,
    answer: hasDefect ? template.defectAnswer : "欠陥なし",
    explanation: hasDefect ? template.defectExplanation : template.normalExplanation,
  };
}

function randomItem<T>(items: T[]) { return items[Math.floor(Math.random() * items.length)]; }
function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle<T>(items: T[]) { return [...items].sort(() => Math.random() - 0.5); }
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }

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