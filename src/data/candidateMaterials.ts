import {
  formatCableStockLabel,
  type CableCoreColor,
  type CableStockSpecification,
  type CableType,
} from "./cableSpecifications";

export type CandidateMaterialGroup = {
  category: string;
  items: string[];
};

const standardColors: Record<CableStockSpecification["coreCount"], CableCoreColor[]> = {
  1: ["black"],
  2: ["black", "white"],
  3: ["black", "white", "red"],
  4: ["black", "white", "red", "blue"],
};

const stock = (
  id: string,
  cableType: CableType,
  conductorDiameterMm: 1.6 | 2.0,
  coreCount: CableStockSpecification["coreCount"],
  suppliedLengthMm: number,
  quantity = 1,
  coreColors = standardColors[coreCount],
): CableStockSpecification => ({
  id,
  cableType,
  hasSheath: cableType !== "IV",
  conductorDiameterMm,
  coreCount,
  coreColors,
  suppliedLengthMm,
  quantity,
});

export const candidateCableStocks: Record<number, CableStockSpecification[]> = {
  1: [stock("1-vvf-1", "VVF", 1.6, 2, 900, 2), stock("1-vvf-2", "VVF", 1.6, 3, 350), stock("1-em-eef", "EM-EEF", 2.0, 2, 250)],
  2: [stock("2-vvf-1", "VVF", 1.6, 2, 1250), stock("2-vvf-2", "VVF", 1.6, 3, 800), stock("2-vvf-3", "VVF", 2.0, 2, 250)],
  3: [stock("3-vvf-1", "VVF", 1.6, 2, 1650), stock("3-vvf-2", "VVF", 1.6, 3, 350), stock("3-vvf-3", "VVF", 2.0, 2, 250), stock("3-iv", "IV", 1.6, 1, 150, 1, ["green"])],
  4: [stock("4-vvf-1", "VVF", 1.6, 2, 850), stock("4-vvf-2", "VVF", 1.6, 3, 500), stock("4-vvf-3", "VVF", 2.0, 2, 450), stock("4-vvf-4", "VVF", 2.0, 3, 550)],
  5: [stock("5-vvf-1", "VVF", 1.6, 2, 1650), stock("5-vvf-2", "VVF", 2.0, 2, 350), stock("5-vvf-3", "VVF", 2.0, 3, 350, 1, ["red", "black", "green"])],
  6: [stock("6-vvf-1", "VVF", 1.6, 2, 850), stock("6-vvf-2", "VVF", 1.6, 3, 1050), stock("6-vvf-3", "VVF", 2.0, 2, 250)],
  7: [stock("7-vvf-1", "VVF", 1.6, 2, 1400), stock("7-vvf-2", "VVF", 1.6, 3, 1150), stock("7-vvf-3", "VVF", 2.0, 2, 250)],
  8: [stock("8-vvf-1", "VVF", 1.6, 2, 1100, 2), stock("8-vvr", "VVR", 2.0, 2, 300)],
  9: [stock("9-vvf-1", "VVF", 1.6, 2, 1250), stock("9-vvf-2", "VVF", 1.6, 3, 350), stock("9-vvf-3", "VVF", 2.0, 2, 600), stock("9-iv", "IV", 1.6, 1, 150, 1, ["green"])],
  10: [stock("10-vvf-1", "VVF", 1.6, 2, 650), stock("10-vvf-2", "VVF", 1.6, 3, 450), stock("10-vvf-3", "VVF", 2.0, 2, 300)],
  11: [stock("11-vvf-1", "VVF", 1.6, 2, 1200), stock("11-vvf-2", "VVF", 2.0, 2, 250), stock("11-iv-1", "IV", 1.6, 1, 550, 1, ["black"]), stock("11-iv-2", "IV", 1.6, 1, 450, 1, ["white"]), stock("11-iv-3", "IV", 1.6, 1, 450, 1, ["red"])],
  12: [stock("12-vvf-1", "VVF", 1.6, 2, 1000), stock("12-vvf-2", "VVF", 1.6, 3, 350), stock("12-vvf-3", "VVF", 2.0, 2, 250), stock("12-iv-1", "IV", 1.6, 1, 500, 1, ["black"]), stock("12-iv-2", "IV", 1.6, 1, 400, 1, ["white"]), stock("12-iv-3", "IV", 1.6, 1, 400, 1, ["red"])],
  13: [stock("13-vvf-1", "VVF", 1.6, 2, 1400), stock("13-vvf-2", "VVF", 1.6, 3, 350), stock("13-vvf-3", "VVF", 2.0, 2, 250), stock("13-vvr", "VVR", 1.6, 2, 250), stock("13-iv", "IV", 1.6, 1, 150, 1, ["green"])],
};

const cableItems = (candidateNo: number) =>
  candidateCableStocks[candidateNo].map(formatCableStockLabel);

export const candidateMaterials: Record<number, CandidateMaterialGroup[]> = {
  1: [
    { category: "電線", items: cableItems(1) },
    { category: "器具", items: ["ランプレセプタクル ×1", "角形引掛シーリング ×1", "埋込連用取付枠 ×1", "単極スイッチ ×2", "位置表示灯内蔵スイッチ ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ 2本用 ×2", "差込形コネクタ 3本用 ×1", "リングスリーブ 小 ×5"] },
  ],
  2: [
    { category: "電線", items: cableItems(2) },
    { category: "器具", items: ["ランプレセプタクル ×1", "埋込連用取付枠 ×1", "単極スイッチ ×1", "埋込コンセント ×1", "パイロットランプ ×1", "ダブルコンセント ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ 3本用 ×2", "差込形コネクタ 4本用 ×1", "リングスリーブ 小 ×3"] },
  ],
  3: [
    { category: "電線", items: cableItems(3) },
    { category: "器具", items: ["ランプレセプタクル ×1", "角形引掛シーリング ×1", "埋込連用取付枠 ×1", "単極スイッチ ×1", "接地極付コンセント ×1", "6極端子台 ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ 2本用 ×1", "差込形コネクタ 3本用 ×1", "差込形コネクタ 4本用 ×1", "リングスリーブ 小 ×3"] },
  ],
  4: [
    { category: "電線", items: cableItems(4) },
    { category: "器具", items: ["ランプレセプタクル ×1", "角形引掛シーリング ×1", "埋込連用取付枠 ×1", "単極スイッチ ×1", "埋込コンセント ×1", "6極端子台 ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ 2本用 ×1", "差込形コネクタ 3本用 ×2", "リングスリーブ 小 ×3"] },
  ],
  5: [
    { category: "電線", items: cableItems(5) },
    { category: "器具", items: ["ランプレセプタクル ×1", "埋込連用取付枠 ×1", "単極スイッチ ×2", "埋込コンセント ×1", "6極端子台 ×1", "接地極付コンセント 20A 250V ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ 4本用 ×1", "リングスリーブ 小 ×3"] },
  ],
  6: [
    { category: "電線", items: cableItems(6) },
    { category: "器具", items: ["角形引掛シーリング ×1", "埋込連用取付枠 ×2", "露出形コンセント ×1", "3路スイッチ ×2"] },
    { category: "接続・付属部材", items: ["差込形コネクタ 2本用 ×2", "差込形コネクタ 3本用 ×2", "リングスリーブ 小 ×4"] },
  ],
  7: [
    { category: "電線", items: cableItems(7) },
    { category: "器具", items: ["アウトレットボックス ×1", "埋込連用取付枠 ×1", "ランプレセプタクル ×1", "3路スイッチ ×2", "4路スイッチ ×1"] },
    { category: "接続・付属部材", items: ["ゴムブッシング 19mm用 ×3", "ゴムブッシング 25mm用 ×2", "差込形コネクタ 2本用 ×4", "差込形コネクタ 3本用 ×2", "リングスリーブ 小 ×4"] },
  ],
  8: [
    { category: "電線", items: cableItems(8) },
    { category: "器具", items: ["アウトレットボックス ×1", "ランプレセプタクル ×1", "丸形引掛シーリング ×1", "6極端子台 ×1"] },
    { category: "接続・付属部材", items: ["ゴムブッシング 19mm用 ×2", "ゴムブッシング 25mm用 ×3", "差込形コネクタ 4本用 ×2", "リングスリーブ 小 ×3"] },
  ],
  9: [
    { category: "電線", items: cableItems(9) },
    { category: "器具", items: ["ランプレセプタクル ×1", "丸形引掛シーリング ×1", "埋込連用取付枠 ×1", "単極スイッチ ×1", "接地極・接地端子付コンセント ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ 2本用 ×2", "差込形コネクタ 3本用 ×1", "リングスリーブ 小 ×1", "リングスリーブ 中 ×2"] },
  ],
  10: [
    { category: "電線", items: cableItems(10) },
    { category: "器具", items: ["ランプレセプタクル ×1", "角形引掛シーリング ×1", "埋込連用取付枠 ×1", "単極スイッチ ×1", "埋込コンセント ×1", "パイロットランプ ×1", "配線用遮断器 ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ 3本用 ×1", "リングスリーブ 小 ×1", "リングスリーブ 中 ×1"] },
  ],
  11: [
    { category: "電線・管", items: [...cableItems(11), "ねじなし電線管 E19 ×1"] },
    { category: "器具", items: ["アウトレットボックス ×1", "ランプレセプタクル ×1", "角形引掛シーリング ×1", "埋込連用取付枠 ×1", "単極スイッチ ×2", "埋込コンセント ×1"] },
    { category: "接続・付属部材", items: ["E19用ボックスコネクタ ×1", "絶縁ブッシング ×1", "ゴムブッシング 19mm用 ×2", "ゴムブッシング 25mm用 ×2", "差込形コネクタ 2本用 ×2", "リングスリーブ 小 ×1", "リングスリーブ 中 ×1"] },
  ],
  12: [
    { category: "電線・管", items: [...cableItems(12), "合成樹脂製可とう電線管 PF16 ×1"] },
    { category: "器具", items: ["アウトレットボックス ×1", "ランプレセプタクル ×1", "角形引掛シーリング ×1", "埋込連用取付枠 ×1", "単極スイッチ ×2", "埋込コンセント ×1"] },
    { category: "接続・付属部材", items: ["PF管用ボックスコネクタ ×1", "ゴムブッシング 19mm用 ×3", "差込形コネクタ 2本用 ×2", "差込形コネクタ 3本用 ×1", "リングスリーブ 小 ×4"] },
  ],
  13: [
    { category: "電線", items: cableItems(13) },
    { category: "器具", items: ["ランプレセプタクル ×1", "埋込連用取付枠 ×1", "単極スイッチ ×1", "接地極付コンセント ×1", "6極端子台 ×1"] },
    { category: "接続・付属部材", items: ["差込形コネクタ 2本用 ×1", "差込形コネクタ 3本用 ×1", "差込形コネクタ 4本用 ×1", "リングスリーブ 小 ×3"] },
  ],
};

export function getCandidateMaterials(candidateNo: number) {
  return candidateMaterials[candidateNo] ?? [];
}

export function getCandidateCableStocks(candidateNo: number) {
  return candidateCableStocks[candidateNo] ?? [];
}
