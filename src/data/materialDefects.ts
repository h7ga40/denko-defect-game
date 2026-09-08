import type { Problem } from "./problems";

export const materialDefectDefinitions = [
  { id: "loop-short", defectType: "loop_insufficient_wrap", group: "輪づくり", answer: "輪の巻付きが不足している", explanation: "図は半周程度しかねじを囲んでおらず、輪の巻付きが不足しています。", normal: "ねじを十分に囲む輪が作られています。" },
  { id: "loop-overlap", defectType: "loop_tip_overlap", group: "輪づくり", answer: "輪の先端が重なっている", explanation: "輪の先端が根元の心線に重なり、ねじの下で心線が二重になっています。", normal: "輪の先端と根元が重ならず収まっています。" },
  { id: "loop-long-tail", defectType: "loop_excess_tail", group: "輪づくり", answer: "輪の先端の心線が長く出ている", explanation: "図では輪の先端がねじの外へ8mm出ています。長く残った心線は適切に処理する必要があります。", normal: "輪の先端がねじの外へ長く突出していません。" },
  { id: "loop-oversized", defectType: "loop_oversized", group: "輪づくり", answer: "輪がねじ頭より大きすぎる", explanation: "輪が大きく、ねじ頭の外側へ大きくはみ出しています。", normal: "輪がねじ頭の下に収まっています。" },
  { id: "cable-split-sheath", defectType: "cable_split_sheath", group: "電線加工", answer: "シースの縦割りが長く残っている", explanation: "図では縦割りしたシースが30mm残っています。剥ぎ取り時に分割した外装が長く残った状態です。", normal: "剥ぎ取ったシースの縦割り残りはありません。" },
  { id: "cable-conductor-cut", defectType: "cable_conductor_damage", group: "電線加工", answer: "導体に深い傷がある", explanation: "裸の導体が深くえぐられ、断面が大きく減っています。絶縁被覆だけの傷とは区別します。", normal: "導体に深い切り傷はありません。" },
  { id: "ring-sleeve-damaged", defectType: "ring_sleeve_damaged", group: "リングスリーブ", answer: "リングスリーブ本体が破損している", explanation: "スリーブの上端が欠け、筒の側面まで裂けています。刻印の欠けではなく本体の破損です。", normal: "スリーブ本体に割れや欠けはありません。" },
  { id: "ring-sleeve-extra", defectType: "ring_sleeve_extra", group: "リングスリーブ", answer: "不要なリングスリーブが残っている", explanation: "接続に使用したスリーブの下に、接続に関係のないスリーブが電線に残っています。", normal: "接続に必要なスリーブだけを使用しています。" },
  { id: "ring-sleeve-short-insulation", defectType: "ring_sleeve_short_insulation", group: "リングスリーブ", answer: "外装端からの絶縁電線が短すぎる", explanation: "電線1の外装端から絶縁被覆端までが10mmしかなく、接続部の絶縁処理に必要な長さがありません。", normal: "外装端から接続部まで絶縁処理できる長さがあります。" },
  { id: "ring-sleeve-long-bare", defectType: "ring_sleeve_excess_bare", group: "リングスリーブ", answer: "スリーブ根元の裸銅線が長すぎる", explanation: "スリーブ下端から絶縁被覆端まで、裸銅線が15mm露出しています。上端からの突出とは別の欠陥です。", normal: "スリーブ根元に裸銅線が長く露出していません。" },
] as const;

export type MaterialDefectType = typeof materialDefectDefinitions[number]["defectType"];
export function isMaterialDefect(type: string): type is MaterialDefectType {
  return materialDefectDefinitions.some(item => item.defectType === type);
}
export const additionalMaterialProblems: Problem[] = materialDefectDefinitions.map(item => ({
  id: item.id,
  title: item.group + " 施工状態の確認",
  circuitName: item.group + "の拡大図",
  defectType: item.defectType,
  question: "図の施工状態を確認し、欠陥を選んでください。",
  choices: ["欠陥なし", ...materialDefectDefinitions.filter(other => other.group === item.group).map(other => other.answer)],
  answer: item.answer,
  explanation: item.explanation,
}));
