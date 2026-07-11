import type { DefectType } from "./problems";

export type InspectionPart = {
  id: string;
  title: string;
  location: string;
  defectType: DefectType;
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
  hotspot: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export const inspectionParts: InspectionPart[] = [
  {
    id: "lamp-a",
    title: "ランプレセプタクルA",
    location: "図面上部の照明器具",
    defectType: "none",
    question: "このランプレセプタクルの施工状態を判定してください。",
    choices: ["欠陥なし", "輪作りの向きが逆", "白線と黒線の接続が逆", "接地線の接続忘れ"],
    answer: "欠陥なし",
    explanation: "黒線、白線、輪作りの向きが適切な状態です。この部分は欠陥なしです。",
    hotspot: { x: 395, y: 58, width: 155, height: 110 },
  },
  {
    id: "lamp-b",
    title: "ランプレセプタクルB",
    location: "図面右上の照明器具",
    defectType: "reverse_polarity",
    question: "このランプレセプタクルの電線色と接続先を判定してください。",
    choices: ["欠陥なし", "白線と黒線の接続が逆", "輪作りの向きが逆", "心線の差し込み不足"],
    answer: "白線と黒線の接続が逆",
    explanation: "ランプレセプタクルの中心接点側とねじ受け側に対して、白線と黒線の接続が逆です。",
    hotspot: { x: 535, y: 88, width: 130, height: 120 },
  },
  {
    id: "switch-loop",
    title: "スイッチ端子の輪作り",
    location: "図面左上の片切スイッチ",
    defectType: "reverse_loop",
    question: "スイッチ端子まわりの輪作りを判定してください。",
    choices: ["欠陥なし", "輪作りの向きが逆", "絶縁被覆をかみ込んでいる", "リングスリーブの刻印が不適合"],
    answer: "輪作りの向きが逆",
    explanation: "輪作りがねじの締付け方向に沿っておらず、締付け時に輪が開きやすい状態です。",
    hotspot: { x: 210, y: 62, width: 130, height: 115 },
  },
  {
    id: "grounded-receptacle",
    title: "接地極付コンセント",
    location: "図面右下の接地極付コンセント",
    defectType: "missing_ground",
    question: "接地極付コンセントの接地線を判定してください。",
    choices: ["欠陥なし", "接地線の接続忘れ", "白線と黒線の接続が逆", "外装がボックス内に十分入っていない"],
    answer: "接地線の接続忘れ",
    explanation: "緑の接地線が接地端子へ接続されていないため、接地線の接続忘れです。",
    hotspot: { x: 515, y: 228, width: 150, height: 118 },
  },
  {
    id: "ring-sleeve",
    title: "リングスリーブ圧着",
    location: "図面中央のジョイント部",
    defectType: "ring_sleeve_wrong_mark",
    question: "リングスリーブの圧着刻印を判定してください。",
    choices: ["欠陥なし", "リングスリーブの刻印が不適合", "心線の差し込み不足", "接地線の接続忘れ"],
    answer: "リングスリーブの刻印が不適合",
    explanation: "接続する電線の条件に対して、リングスリーブの刻印が合っていない状態です。",
    hotspot: { x: 285, y: 208, width: 135, height: 100 },
  },
  {
    id: "outlet-box",
    title: "アウトレットボックス",
    location: "図面左下のボックス内処理",
    defectType: "sheath_too_short",
    question: "アウトレットボックス内のケーブル外装処理を判定してください。",
    choices: ["欠陥なし", "外装がボックス内に十分入っていない", "白線と黒線の接続が逆", "輪作りの向きが逆"],
    answer: "外装がボックス内に十分入っていない",
    explanation: "ケーブル外装がボックス内へ十分に入っていないため、外装剥ぎ取り不足として扱います。",
    hotspot: { x: 70, y: 222, width: 150, height: 112 },
  },
];

export const requiredDefectCount = inspectionParts.filter((part) => part.answer !== "欠陥なし").length;
