export type DefectType =
  | "none"
  | "reverse_loop"
  | "reverse_polarity"
  | "missing_ground"
  | "sheath_too_short"
  | "ring_sleeve_wrong_mark"
  | "ring_sleeve_insufficient_insert";

export type Problem = {
  id: string;
  title: string;
  circuitName: string;
  defectType: DefectType;
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
};

export const problems: Problem[] = [
  {
    id: "lamp-normal",
    title: "ランプレセプタクル 正常施工",
    circuitName: "候補問題の簡略配線",
    defectType: "none",
    question: "図の施工状態として最も適切な判定を選んでください。",
    choices: [
      "欠陥なし",
      "輪作りの向きが逆",
      "白線と黒線の接続が逆",
      "接地線の接続忘れ",
    ],
    answer: "欠陥なし",
    explanation:
      "黒線が中心接点、白線がねじ受け側に接続され、輪作りも締付け方向に沿っています。この簡略図では欠陥なしと判定します。",
  },
  {
    id: "lamp-loop-reverse",
    title: "ランプレセプタクル 輪作り向き不良",
    circuitName: "候補問題の簡略配線",
    defectType: "reverse_loop",
    question: "赤く示した端子まわりの欠陥を選んでください。",
    choices: [
      "欠陥なし",
      "輪作りの向きが逆",
      "白線と黒線の接続が逆",
      "絶縁被覆をかみ込んでいる",
    ],
    answer: "輪作りの向きが逆",
    explanation:
      "輪作りはねじを締める方向に沿わせるのが基本です。逆向きだと締付け時に輪が開きやすく、欠陥になります。",
  },
  {
    id: "lamp-polarity",
    title: "ランプレセプタクル 極性誤り",
    circuitName: "候補問題の簡略配線",
    defectType: "reverse_polarity",
    question: "電線色と接続先の関係として正しい判定を選んでください。",
    choices: [
      "欠陥なし",
      "白線と黒線の接続が逆",
      "接地線の接続忘れ",
      "輪作りの向きが逆",
    ],
    answer: "白線と黒線の接続が逆",
    explanation:
      "ランプレセプタクルでは、非接地側の黒線を中心接点側、接地側の白線をねじ受け側へ接続します。図は白黒が逆です。",
  },
  {
    id: "receptacle-ground",
    title: "接地極付コンセント 接地線忘れ",
    circuitName: "接地極付コンセントの簡略配線",
    defectType: "missing_ground",
    question: "接地極付コンセントの図として欠陥を選んでください。",
    choices: [
      "欠陥なし",
      "接地線の接続忘れ",
      "白線と黒線の接続が逆",
      "輪作りの向きが逆",
    ],
    answer: "接地線の接続忘れ",
    explanation:
      "接地極付コンセントでは接地端子へ接地線を接続します。図では緑線が端子へ届いておらず、接地線の接続忘れです。",
  },
  {
    id: "box-sheath",
    title: "アウトレットボックス 外装剥ぎ取り不足",
    circuitName: "ボックス内接続の簡略配線",
    defectType: "sheath_too_short",
    question: "ボックス内のケーブル処理として欠陥を選んでください。",
    choices: [
      "欠陥なし",
      "外装がボックス内に十分入っていない",
      "白線と黒線の接続が逆",
      "接地線の接続忘れ",
    ],
    answer: "外装がボックス内に十分入っていない",
    explanation:
      "ケーブル外装はボックス内へ適切に入れる必要があります。図では外装の入り込みが短すぎる状態として示しています。",
  },
  {
    id: "ring-sleeve-wrong-mark",
    title: "リングスリーブ 刻印不適合",
    circuitName: "リングスリーブ圧着の簡略図",
    defectType: "ring_sleeve_wrong_mark",
    question: "図のリングスリーブ圧着状態として、最も適切な欠陥を選んでください。",
    choices: [
      "欠陥なし",
      "リングスリーブの刻印が不適合",
      "心線の差し込み不足",
      "接地線の接続忘れ",
    ],
    answer: "リングスリーブの刻印が不適合",
    explanation:
      "リングスリーブは電線の本数と太さに合うサイズ・刻印で圧着します。図は接続条件に対して刻印が合っていない例として示しています。",
  },
  {
    id: "ring-sleeve-insert",
    title: "リングスリーブ 心線差し込み不足",
    circuitName: "リングスリーブ圧着の簡略図",
    defectType: "ring_sleeve_insufficient_insert",
    question: "図のリングスリーブ圧着状態として、最も適切な欠陥を選んでください。",
    choices: [
      "欠陥なし",
      "心線の差し込み不足",
      "白線と黒線の接続が逆",
      "輪作りの向きが逆",
    ],
    answer: "心線の差し込み不足",
    explanation:
      "心線はリングスリーブ内へ十分に差し込んでから圧着します。図では片方の心線が短く、圧着部に十分入っていない状態です。",
  },
];
