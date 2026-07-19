import { formatCableStockLabel } from "./cableSpecifications";
import {
  candidateCableStocks,
  getCandidateCableStocks,
} from "./candidateCableStocks";

export { candidateCableStocks, getCandidateCableStocks } from "./candidateCableStocks";

export type CandidateMaterialGroup = {
  category: string;
  items: string[];
};

const cableItems = (candidateNo: number) =>
  candidateCableStocks[candidateNo].map(formatCableStockLabel);

export const candidateMaterials: Record<number, CandidateMaterialGroup[]> = {
  1: [
    { category: "電線", items: cableItems(1) },
    { category: "器具", items: ["ランプレセプタクル ×1", "引掛シーリングローゼット（角形）×1", "埋込連用取付枠 ×1", "埋込連用タンブラスイッチ（片切）×2", "位置表示灯内蔵スイッチ ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ（2本用）×2", "差込形コネクタ（3本用）×1", "リングスリーブ（小）×5"] },
  ],
  2: [
    { category: "電線", items: cableItems(2) },
    { category: "器具", items: ["ランプレセプタクル ×1", "埋込連用取付枠 ×1", "埋込連用タンブラスイッチ（片切）×1", "埋込連用コンセント ×1", "埋込連用パイロットランプ ×1", "埋込コンセント（2口）×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ（3本用）×2", "差込形コネクタ（4本用）×1", "リングスリーブ（小）×3"] },
  ],
  3: [
    { category: "電線", items: cableItems(3) },
    { category: "器具", items: ["ランプレセプタクル ×1", "引掛シーリングローゼット（角形）×1", "埋込連用取付枠 ×1", "埋込連用タンブラスイッチ（片切）×1", "埋込コンセント（接地極付）×1", "6極端子台 ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ（2本用）×1", "差込形コネクタ（3本用）×1", "差込形コネクタ（4本用）×1", "リングスリーブ（小）×3"] },
  ],
  4: [
    { category: "電線", items: cableItems(4) },
    { category: "器具", items: ["ランプレセプタクル ×1", "引掛シーリングローゼット（角形）×1", "埋込連用取付枠 ×1", "埋込連用タンブラスイッチ（片切）×1", "埋込連用コンセント ×1", "6極端子台 ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ（2本用）×1", "差込形コネクタ（3本用）×2", "リングスリーブ（小）×3"] },
  ],
  5: [
    { category: "電線", items: cableItems(5) },
    { category: "器具", items: ["ランプレセプタクル ×1", "埋込連用取付枠 ×1", "埋込連用タンブラスイッチ（片切）×2", "埋込連用コンセント ×1", "6極端子台 ×1", "埋込コンセント（20A 250V 接地極付）×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ（4本用）×1", "リングスリーブ（小）×3"] },
  ],
  6: [
    { category: "電線", items: cableItems(6) },
    { category: "器具", items: ["引掛シーリングローゼット（角形）×1", "埋込連用取付枠 ×2", "露出形コンセント ×1", "埋込連用タンブラスイッチ（3路）×2"] },
    { category: "接続・付属部材", items: ["差込形コネクタ（2本用）×2", "差込形コネクタ（3本用）×2", "リングスリーブ（小）×4"] },
  ],
  7: [
    { category: "電線", items: cableItems(7) },
    { category: "器具", items: ["アウトレットボックス ×1", "埋込連用取付枠 ×1", "ランプレセプタクル ×1", "埋込連用タンブラスイッチ（3路）×2", "埋込連用タンブラスイッチ（4路）×1"] },
    { category: "接続・付属部材", items: ["ゴムブッシング 19mm用 ×3", "ゴムブッシング 25mm用 ×2", "差込形コネクタ（2本用）×4", "差込形コネクタ（3本用）×2", "リングスリーブ（小）×4"] },
  ],
  8: [
    { category: "電線", items: cableItems(8) },
    { category: "器具", items: ["アウトレットボックス ×1", "ランプレセプタクル ×1", "引掛シーリングローゼット（丸形）×1", "6極端子台 ×1"] },
    { category: "接続・付属部材", items: ["ゴムブッシング 19mm用 ×2", "ゴムブッシング 25mm用 ×3", "差込形コネクタ（4本用）×2", "リングスリーブ（小）×3"] },
  ],
  9: [
    { category: "電線", items: cableItems(9) },
    { category: "器具", items: ["ランプレセプタクル ×1", "引掛シーリングローゼット（丸形）×1", "埋込連用取付枠 ×1", "埋込連用タンブラスイッチ（片切）×1", "埋込コンセント（接地極付接地端子付）×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ（2本用）×2", "差込形コネクタ（3本用）×1", "リングスリーブ（小）×1", "リングスリーブ（中）×2"] },
  ],
  10: [
    { category: "電線", items: cableItems(10) },
    { category: "器具", items: ["ランプレセプタクル ×1", "引掛シーリングローゼット（角形）×1", "埋込連用取付枠 ×1", "埋込連用タンブラスイッチ（片切）×1", "埋込連用コンセント ×1", "埋込連用パイロットランプ ×1", "配線用遮断器 ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ（3本用）×1", "リングスリーブ（小）×1", "リングスリーブ（中）×1"] },
  ],
  11: [
    { category: "電線・管", items: [...cableItems(11), "ねじなし電線管 E19 ×1"] },
    { category: "器具", items: ["アウトレットボックス ×1", "ランプレセプタクル ×1", "引掛シーリングローゼット（角形）×1", "埋込連用取付枠 ×1", "埋込連用タンブラスイッチ（片切）×2", "埋込連用コンセント ×1"] },
    { category: "接続・付属部材", items: ["E19用ボックスコネクタ ×1", "絶縁ブッシング ×1", "ゴムブッシング 19mm用 ×2", "ゴムブッシング 25mm用 ×2", "差込形コネクタ（2本用）×2", "リングスリーブ（小）×1", "リングスリーブ（中）×1"] },
  ],
  12: [
    { category: "電線・管", items: [...cableItems(12), "合成樹脂製可とう電線管 PF16 ×1"] },
    { category: "器具", items: ["アウトレットボックス ×1", "ランプレセプタクル ×1", "引掛シーリングローゼット（角形）×1", "埋込連用取付枠 ×1", "埋込連用タンブラスイッチ（片切）×2", "埋込連用コンセント ×1"] },
    { category: "接続・付属部材", items: ["PF管用ボックスコネクタ ×1", "ゴムブッシング 19mm用 ×3", "差込形コネクタ（2本用）×2", "差込形コネクタ（3本用）×1", "リングスリーブ（小）×4"] },
  ],
  13: [
    { category: "電線", items: cableItems(13) },
    { category: "器具", items: ["ランプレセプタクル ×1", "埋込連用取付枠 ×1", "埋込連用タンブラスイッチ（片切）×1", "埋込コンセント（接地極付）×1", "6極端子台 ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ（2本用）×1", "差込形コネクタ（3本用）×1", "差込形コネクタ（4本用）×1", "リングスリーブ（小）×3"] },
  ],
};

export function getCandidateMaterials(candidateNo: number) {
  return candidateMaterials[candidateNo] ?? [];
}
