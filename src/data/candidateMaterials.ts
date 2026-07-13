export type CandidateMaterialGroup = {
  category: string;
  items: string[];
};

const commonConnectionMaterials = ["電線接続材料（リングスリーブ／差込形コネクタの種類・数量は試験問題で指定）"];

export const candidateMaterials: Record<number, CandidateMaterialGroup[]> = {
  1: [
    { category: "電線", items: ["EM-EEF 2.0mm 2心", "VVF 1.6mm（心数・長さは試験問題で指定）"] },
    { category: "器具", items: ["ランプレセプタクル", "引掛シーリング", "スイッチ群（表示灯内蔵を含む）"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
  2: [
    { category: "電線", items: ["VVF 2.0mm 2心", "VVF 1.6mm（心数・長さは試験問題で指定）"] },
    { category: "器具", items: ["ランプレセプタクル", "確認表示灯（常時点灯）", "スイッチ", "施工省略用端子"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
  3: [
    { category: "電線", items: ["VVF 2.0mm 2心", "VVF 1.6mm", "接地線 E 1.6mm"] },
    { category: "器具", items: ["タイムスイッチまたは代用端子台", "ランプレセプタクル", "引掛シーリング", "スイッチ", "接地極付器具", "接地端子"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
  4: [
    { category: "電線", items: ["VVF 2.0mm 2心", "VVF 2.0mm 3心", "接地線 E 1.6mm"] },
    { category: "器具", items: ["配線用遮断器 B", "漏電遮断器 BE", "電源表示灯", "三相200V電動機用端子または代用端子台", "引掛シーリング", "スイッチ", "接地端子"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
  5: [
    { category: "電線", items: ["VVF 2.0mm 2心", "VVF 2.0mm 3心", "接地線 E 1.6mm"] },
    { category: "器具", items: ["配線用遮断器 B", "漏電遮断器 BE", "20A 250V 接地極付コンセント", "ランプレセプタクル", "引掛シーリング", "スイッチ", "接地端子"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
  6: [
    { category: "電線", items: ["VVF 2.0mm 2心", "VVF 1.6mm（心数・長さは試験問題で指定）"] },
    { category: "器具", items: ["引掛シーリング", "露出形コンセント", "3路スイッチ"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
  7: [
    { category: "電線", items: ["VVF 2.0mm 2心", "VVF 1.6mm（心数・長さは試験問題で指定）"] },
    { category: "器具", items: ["ランプレセプタクル", "3路スイッチ", "4路スイッチ", "ジョイントボックス"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
  8: [
    { category: "電線", items: ["VVR 2.0mm 2心", "VVF 1.6mm（心数・長さは試験問題で指定）"] },
    { category: "器具", items: ["配線用遮断器 B", "端子台 T", "3路スイッチ", "ランプレセプタクル", "引掛シーリング", "接続箱"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
  9: [
    { category: "電線", items: ["VVF 2.0mm 2心", "VVF 1.6mm", "接地線 E 1.6mm"] },
    { category: "器具", items: ["ランプレセプタクル", "引掛シーリング", "接地極付接地端子付コンセント EET", "スイッチ", "接地端子"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
  10: [
    { category: "電線", items: ["VVF 2.0mm 2心", "VVF 1.6mm（心数・長さは試験問題で指定）"] },
    { category: "器具", items: ["配線用遮断器 B", "引掛シーリング", "ランプレセプタクル", "確認表示灯（同時点滅）", "スイッチ"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
  11: [
    { category: "電線・管", items: ["VVF 2.0mm 2心", "IV 1.6mm", "金属管 E19"] },
    { category: "器具・付属品", items: ["ランプレセプタクル", "引掛シーリング", "スイッチ", "金属製ボックス", "金属管用付属品", "接地端子"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
  12: [
    { category: "電線・管", items: ["VVF 2.0mm 2心", "IV 1.6mm", "合成樹脂製可とう電線管 PF16"] },
    { category: "器具・付属品", items: ["ランプレセプタクル", "引掛シーリング", "スイッチ", "ボックス", "PF管用付属品"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
  13: [
    { category: "電線", items: ["VVF 2.0mm 2心", "VVR 1.6mm 2心", "接地線 E 1.6mm"] },
    { category: "器具", items: ["ランプレセプタクル", "自動点滅器 A（3A）または代用端子台", "スイッチ", "接地極付器具", "接地端子"] },
    { category: "接続材料", items: commonConnectionMaterials },
  ],
};

export function getCandidateMaterials(candidateNo: number) {
  return candidateMaterials[candidateNo] ?? [];
}
