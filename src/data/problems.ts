export type DefectType =
  | "none"
  | "reverse_loop"
  | "reverse_polarity"
  | "missing_ground"
  | "sheath_too_short"
  | "ring_sleeve_wrong_mark"
  | "ring_sleeve_insufficient_insert"
  | "exposed_receptacle_sheath"
  | "breaker_line_load_reverse"
  | "push_connector_insufficient_insert"
  | "terminal_block_wrong_terminal"
  | "ceiling_connector_polarity"
  | "mounting_frame_loose"
  | "switch_wrong_terminal"
  | "receptacle_polarity";

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
  {
    id: "exposed-receptacle-sheath",
    title: "露出コンセント 外装処理不良",
    circuitName: "露出コンセントの簡略施工図",
    defectType: "exposed_receptacle_sheath",
    question: "露出コンセントに入るケーブル外装の状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "ケーブル外装が器具内に入っていない", "白線と黒線の接続が逆", "接地線の接続忘れ"],
    answer: "ケーブル外装が器具内に入っていない",
    explanation: "露出コンセントではケーブル外装を器具内まで適切に入れて固定します。図は外装が手前で終わっており、心線が長く露出しています。",
  },
  {
    id: "breaker-line-load-reverse",
    title: "配線用遮断器 電源側・負荷側誤り",
    circuitName: "配線用遮断器の簡略施工図",
    defectType: "breaker_line_load_reverse",
    question: "配線用遮断器の接続状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "電源側と負荷側の接続が逆", "リングスリーブの刻印が不適合", "輪作りの向きが逆"],
    answer: "電源側と負荷側の接続が逆",
    explanation: "配線用遮断器は指定された電源側と負荷側を守って接続します。図では電源線が負荷側端子へ入っています。",
  },
  {
    id: "push-connector-insert",
    title: "差し込みコネクタ 心線差し込み不足",
    circuitName: "差し込みコネクタの簡略施工図",
    defectType: "push_connector_insufficient_insert",
    question: "差し込みコネクタの心線差し込み状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "心線の差し込み不足", "外装がボックス内に十分入っていない", "白線と黒線の接続が逆"],
    answer: "心線の差し込み不足",
    explanation: "差し込みコネクタは心線を奥まで確実に差し込みます。図では片方の心線が確認窓まで届いていません。",
  },
  {
    id: "terminal-block-wrong-terminal",
    title: "端子台 端子番号誤り",
    circuitName: "端子台の簡略施工図",
    defectType: "terminal_block_wrong_terminal",
    question: "端子台の接続状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "指定端子と異なる端子へ接続している", "接地線の接続忘れ", "ケーブル外装が器具内に入っていない"],
    answer: "指定端子と異なる端子へ接続している",
    explanation: "端子台は指定された端子番号へ接続します。図では赤く示した線が指定端子ではなく隣の端子へ入っています。",
  },
  {
    id: "ceiling-connector-polarity",
    title: "引掛けシーリング 極性誤り",
    circuitName: "引掛けシーリングの簡略施工図",
    defectType: "ceiling_connector_polarity",
    question: "引掛けシーリングの白線・黒線の接続として、欠陥を選んでください。",
    choices: ["欠陥なし", "白線と黒線の接続が逆", "心線の差し込み不足", "輪作りの向きが逆"],
    answer: "白線と黒線の接続が逆",
    explanation: "引掛けシーリングも接地側・非接地側の接続を確認します。図では白線と黒線の接続先が逆です。",
  },
  {
    id: "mounting-frame-loose",
    title: "連用取付枠 器具固定不良",
    circuitName: "連用取付枠の簡略施工図",
    defectType: "mounting_frame_loose",
    question: "連用取付枠への器具取付状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "器具が取付枠へ確実に固定されていない", "端子番号が違う", "接地線の接続忘れ"],
    answer: "器具が取付枠へ確実に固定されていない",
    explanation: "連用取付枠では器具を枠へ確実に固定します。図では片側の固定爪が掛かっていない状態です。",
  },
  {
    id: "switch-wrong-terminal",
    title: "スイッチ 接続端子誤り",
    circuitName: "スイッチの簡略施工図",
    defectType: "switch_wrong_terminal",
    question: "スイッチの接続端子として、欠陥を選んでください。",
    choices: ["欠陥なし", "指定と異なる端子へ接続している", "リングスリーブの刻印が不適合", "外装がボックス内に十分入っていない"],
    answer: "指定と異なる端子へ接続している",
    explanation: "スイッチは回路に応じて指定端子へ接続します。図では黒線が共通側ではなく別端子へ接続されています。",
  },
  {
    id: "receptacle-polarity",
    title: "コンセント 極性誤り",
    circuitName: "コンセントの簡略施工図",
    defectType: "receptacle_polarity",
    question: "コンセントの白線・黒線の接続として、欠陥を選んでください。",
    choices: ["欠陥なし", "白線と黒線の接続が逆", "接地線の接続忘れ", "輪作りの向きが逆"],
    answer: "白線と黒線の接続が逆",
    explanation: "コンセントは接地側に白線、非接地側に黒線を接続します。図では左右の極性が逆です。",
  },];
