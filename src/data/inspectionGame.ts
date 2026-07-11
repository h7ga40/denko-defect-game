import { candidateDiagrams, type CandidateDevice, type CandidateDiagram } from "./candidateDiagrams";
import type { DefectType } from "./problems";

export type InspectionSlot = {
  id: string;
  location: string;
  overviewLabel: string;
  overviewType: "power" | "switch" | "lamp" | "connector" | "box" | "receptacle" | "ground" | "device";
  x: number;
  y: number;
  hotspot: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type InspectionPart = {
  id: string;
  slotId: string;
  title: string;
  location: string;
  overviewLabel: string;
  overviewType: InspectionSlot["overviewType"];
  x: number;
  y: number;
  defectType: DefectType;
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
  hotspot: InspectionSlot["hotspot"];
};

type InspectionTemplate = {
  id: string;
  title: string;
  overviewLabel: string;
  overviewType: InspectionSlot["overviewType"];
  defectType: DefectType;
  question: string;
  choices: string[];
  defectAnswer: string;
  normalExplanation: string;
  defectExplanation: string;
};

export type InspectionGameRound = {
  id: string;
  title: string;
  candidate: CandidateDiagram;
  parts: InspectionPart[];
  defectCount: number;
};

export const inspectionSlots: InspectionSlot[] = [
  {
    id: "upper-left",
    location: "図面左上の工作部分",
    overviewLabel: "部分A",
    overviewType: "switch",
    x: 255,
    y: 116,
    hotspot: { x: 190, y: 58, width: 138, height: 118 },
  },
  {
    id: "upper-center",
    location: "図面上部中央の工作部分",
    overviewLabel: "部分B",
    overviewType: "lamp",
    x: 440,
    y: 108,
    hotspot: { x: 370, y: 54, width: 150, height: 120 },
  },
  {
    id: "upper-right",
    location: "図面右上の工作部分",
    overviewLabel: "部分C",
    overviewType: "lamp",
    x: 592,
    y: 150,
    hotspot: { x: 525, y: 90, width: 145, height: 120 },
  },
  {
    id: "center",
    location: "図面中央の接続部分",
    overviewLabel: "部分D",
    overviewType: "connector",
    x: 350,
    y: 252,
    hotspot: { x: 285, y: 198, width: 138, height: 108 },
  },
  {
    id: "lower-left",
    location: "図面左下の工作部分",
    overviewLabel: "部分E",
    overviewType: "box",
    x: 145,
    y: 278,
    hotspot: { x: 70, y: 220, width: 150, height: 116 },
  },
  {
    id: "lower-right",
    location: "図面右下の工作部分",
    overviewLabel: "部分F",
    overviewType: "receptacle",
    x: 585,
    y: 286,
    hotspot: { x: 510, y: 226, width: 158, height: 122 },
  },
];

export const inspectionTemplates: InspectionTemplate[] = [
  {
    id: "lamp-normal",
    title: "ランプレセプタクル",
    overviewLabel: "ランプ",
    overviewType: "lamp",
    defectType: "none",
    question: "このランプレセプタクルの施工状態を判定してください。",
    choices: ["欠陥なし", "輪作りの向きが逆", "白線と黒線の接続が逆", "接地線の接続忘れ"],
    defectAnswer: "欠陥なし",
    normalExplanation: "黒線、白線、輪作りの向きが適切な状態です。",
    defectExplanation: "この部分は欠陥なしです。",
  },
  {
    id: "lamp-polarity",
    title: "ランプレセプタクル",
    overviewLabel: "ランプ",
    overviewType: "lamp",
    defectType: "reverse_polarity",
    question: "このランプレセプタクルの電線色と接続先を判定してください。",
    choices: ["欠陥なし", "白線と黒線の接続が逆", "輪作りの向きが逆", "心線の差し込み不足"],
    defectAnswer: "白線と黒線の接続が逆",
    normalExplanation: "白線と黒線が正しい接続先に入っています。",
    defectExplanation: "中心接点側とねじ受け側に対して、白線と黒線の接続が逆です。",
  },
  {
    id: "switch-loop",
    title: "スイッチ端子",
    overviewLabel: "スイッチ",
    overviewType: "switch",
    defectType: "reverse_loop",
    question: "スイッチ端子まわりの輪作りを判定してください。",
    choices: ["欠陥なし", "輪作りの向きが逆", "絶縁被覆をかみ込んでいる", "リングスリーブの刻印が不適合"],
    defectAnswer: "輪作りの向きが逆",
    normalExplanation: "輪作りは締付け方向に沿っています。",
    defectExplanation: "輪作りがねじの締付け方向に沿っておらず、締付け時に輪が開きやすい状態です。",
  },
  {
    id: "grounded-receptacle",
    title: "接地極付コンセント",
    overviewLabel: "接地極付",
    overviewType: "receptacle",
    defectType: "missing_ground",
    question: "接地極付コンセントの接地線を判定してください。",
    choices: ["欠陥なし", "接地線の接続忘れ", "白線と黒線の接続が逆", "外装がボックス内に十分入っていない"],
    defectAnswer: "接地線の接続忘れ",
    normalExplanation: "接地線は接地端子へ接続されています。",
    defectExplanation: "緑の接地線が接地端子へ接続されていないため、接地線の接続忘れです。",
  },
  {
    id: "ring-sleeve",
    title: "リングスリーブ圧着",
    overviewLabel: "リング",
    overviewType: "connector",
    defectType: "ring_sleeve_wrong_mark",
    question: "リングスリーブの圧着刻印を判定してください。",
    choices: ["欠陥なし", "リングスリーブの刻印が不適合", "心線の差し込み不足", "接地線の接続忘れ"],
    defectAnswer: "リングスリーブの刻印が不適合",
    normalExplanation: "接続条件に合う刻印で圧着されています。",
    defectExplanation: "接続する電線の条件に対して、リングスリーブの刻印が合っていない状態です。",
  },
  {
    id: "outlet-box",
    title: "アウトレットボックス",
    overviewLabel: "ボックス",
    overviewType: "box",
    defectType: "sheath_too_short",
    question: "アウトレットボックス内のケーブル外装処理を判定してください。",
    choices: ["欠陥なし", "外装がボックス内に十分入っていない", "白線と黒線の接続が逆", "輪作りの向きが逆"],
    defectAnswer: "外装がボックス内に十分入っていない",
    normalExplanation: "ケーブル外装はボックス内へ適切に入っています。",
    defectExplanation: "ケーブル外装がボックス内へ十分に入っていないため、外装剥ぎ取り不足として扱います。",
  },
  {
    id: "connector-insert",
    title: "差し込みコネクタ",
    overviewLabel: "コネクタ",
    overviewType: "connector",
    defectType: "push_connector_insufficient_insert",
    question: "差し込みコネクタの心線差し込み状態を判定してください。",
    choices: ["欠陥なし", "心線の差し込み不足", "外装がボックス内に十分入っていない", "白線と黒線の接続が逆"],
    defectAnswer: "心線の差し込み不足",
    normalExplanation: "心線は確認位置まで確実に差し込まれています。",
    defectExplanation: "片方の心線が確認窓まで届いていません。",
  },
  {
    id: "terminal-block",
    title: "端子台",
    overviewLabel: "端子台",
    overviewType: "device",
    defectType: "terminal_block_wrong_terminal",
    question: "端子台の接続端子を判定してください。",
    choices: ["欠陥なし", "指定端子と異なる端子へ接続している", "接地線の接続忘れ", "ケーブル外装が器具内に入っていない"],
    defectAnswer: "指定端子と異なる端子へ接続している",
    normalExplanation: "指定された端子番号へ接続されています。",
    defectExplanation: "指定端子ではなく隣の端子へ接続されています。",
  },
  {
    id: "ceiling-connector",
    title: "引掛けシーリング",
    overviewLabel: "シーリング",
    overviewType: "lamp",
    defectType: "ceiling_connector_polarity",
    question: "引掛けシーリングの白線・黒線の接続を判定してください。",
    choices: ["欠陥なし", "白線と黒線の接続が逆", "心線の差し込み不足", "輪作りの向きが逆"],
    defectAnswer: "白線と黒線の接続が逆",
    normalExplanation: "白線と黒線は正しい接続先に入っています。",
    defectExplanation: "白線と黒線の接続先が逆です。",
  },
  {
    id: "mounting-frame",
    title: "連用取付枠",
    overviewLabel: "取付枠",
    overviewType: "device",
    defectType: "mounting_frame_loose",
    question: "連用取付枠への器具取付状態を判定してください。",
    choices: ["欠陥なし", "器具が取付枠へ確実に固定されていない", "端子番号が違う", "接地線の接続忘れ"],
    defectAnswer: "器具が取付枠へ確実に固定されていない",
    normalExplanation: "器具は取付枠へ確実に固定されています。",
    defectExplanation: "片側の固定爪が掛かっていない状態です。",
  },
  {
    id: "switch-terminal",
    title: "スイッチ",
    overviewLabel: "スイッチ",
    overviewType: "switch",
    defectType: "switch_wrong_terminal",
    question: "スイッチの接続端子を判定してください。",
    choices: ["欠陥なし", "指定と異なる端子へ接続している", "リングスリーブの刻印が不適合", "外装がボックス内に十分入っていない"],
    defectAnswer: "指定と異なる端子へ接続している",
    normalExplanation: "スイッチの線は指定端子へ接続されています。",
    defectExplanation: "黒線が指定端子に入っていません。",
  },
  {
    id: "receptacle-polarity",
    title: "コンセント",
    overviewLabel: "コンセント",
    overviewType: "receptacle",
    defectType: "receptacle_polarity",
    question: "コンセントの白線・黒線の接続を判定してください。",
    choices: ["欠陥なし", "白線と黒線の接続が逆", "接地線の接続忘れ", "輪作りの向きが逆"],
    defectAnswer: "白線と黒線の接続が逆",
    normalExplanation: "白線と黒線は正しい極性で接続されています。",
    defectExplanation: "接地側と非接地側が逆です。",
  },
];

export function createInspectionRound(): InspectionGameRound {
  const candidate = randomItem(candidateDiagrams);
  const slots = shuffle(createSlotsForCandidate(candidate)).slice(0, 6);
  const defectCount = Math.min(randomInt(2, 3), slots.length);
  const defectSlotIds = new Set(shuffle(slots).slice(0, defectCount).map((slot) => slot.id));
  const usedTemplateIds = new Set<string>();
  const parts = slots.map((slot, index) => {
    const hasDefect = defectSlotIds.has(slot.id);
    const template = selectTemplateForSlot(slot, hasDefect, usedTemplateIds);
    usedTemplateIds.add(template.id);
    return toInspectionPart(template, slot, hasDefect, index + 1);
  });

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: `候補問題No.${candidate.no} 施工チェック`,
    candidate,
    parts,
    defectCount,
  };
}

function createSlotsForCandidate(candidate: CandidateDiagram): InspectionSlot[] {
  return candidate.devices
    .filter((device) => device.type !== "power")
    .map((device) => toInspectionSlot(candidate, device));
}

function toInspectionSlot(candidate: CandidateDiagram, device: CandidateDevice): InspectionSlot {
  const width = device.type === "lamp" || device.type === "pilot" ? 132 : 144;
  const height = device.type === "lamp" || device.type === "pilot" ? 120 : 112;

  return {
    id: `candidate-${candidate.no}-${device.id}`,
    location: `候補問題No.${candidate.no}「${device.label}」付近`,
    overviewLabel: device.label,
    overviewType: toOverviewType(device),
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

function toOverviewType(device: CandidateDevice): InspectionSlot["overviewType"] {
  if (device.type === "lamp" || device.type === "pilot") {
    return "lamp";
  }

  if (device.type === "receptacle" || device.type === "grounded_receptacle") {
    return "receptacle";
  }

  if (device.type === "terminal" || device.type === "breaker" || device.type === "box" || device.type === "motor") {
    return "device";
  }

  return device.type;
}

function selectTemplateForSlot(
  slot: InspectionSlot,
  hasDefect: boolean,
  usedTemplateIds: Set<string>,
): InspectionTemplate {
  const compatibleTemplates = inspectionTemplates.filter((template) => isTemplateCompatible(template, slot));
  const preferredTemplates = hasDefect
    ? compatibleTemplates.filter((template) => template.defectType !== "none")
    : compatibleTemplates;
  const unusedTemplates = preferredTemplates.filter((template) => !usedTemplateIds.has(template.id));
  const candidates = unusedTemplates.length > 0 ? unusedTemplates : preferredTemplates;
  return randomItem(candidates.length > 0 ? candidates : inspectionTemplates);
}

function isTemplateCompatible(template: InspectionTemplate, slot: InspectionSlot) {
  return template.overviewType === slot.overviewType || template.overviewType === "connector";
}

function toInspectionPart(
  template: InspectionTemplate,
  slot: InspectionSlot,
  hasDefect: boolean,
  number: number,
): InspectionPart {
  return {
    id: `${slot.id}-${template.id}-${number}`,
    slotId: slot.id,
    title: `${template.title} ${number}`,
    location: slot.location,
    overviewLabel: template.overviewLabel,
    overviewType: template.overviewType,
    x: slot.x,
    y: slot.y,
    defectType: hasDefect ? template.defectType : "none",
    question: template.question,
    choices: template.choices,
    answer: hasDefect ? template.defectAnswer : "欠陥なし",
    explanation: hasDefect ? template.defectExplanation : template.normalExplanation,
    hotspot: slot.hotspot,
  };
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
