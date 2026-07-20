export type DefectType =
  | "none"
  | "reverse_loop"
  | "reverse_polarity"
  | "missing_ground"
  | "sheath_too_short"
  | "cable_wrong_type"
  | "cable_too_short"
  | "cable_sheath_strip_short"
  | "cable_sheath_strip_long"
  | "ring_sleeve_wrong_mark"
  | "ring_sleeve_wrong_size"
  | "ring_sleeve_insufficient_insert"
  | "ring_sleeve_insulation_bite"
  | "ring_sleeve_uncrimped"
  | "ring_sleeve_partial_mark"
  | "ring_sleeve_double_mark"
  | "ring_sleeve_conductor_overhang"
  | "exposed_receptacle_sheath"
  | "breaker_line_load_reverse"
  | "push_connector_insufficient_insert"
  | "push_connector_wrong_wire_count"
  | "push_connector_exposed_conductor"
  | "push_connector_insulation_overinserted"
  | "box_wrong_connection"
  | "box_conductor_unconnected"
  | "terminal_block_wrong_terminal"
  | "ceiling_connector_polarity"
  | "mounting_frame_loose"
  | "mounting_frame_wrong_position"
  | "pilot_lamp_wrong_terminal"
  | "switch_wrong_terminal"
  | "receptacle_polarity"
  | "outlet_box_wrong_hole"
  | "rubber_bushing_missing"
  | "rubber_bushing_wrong_size"
  | "metal_conduit_insufficient_insert"
  | "metal_conduit_missing_insulation_bushing"
  | "metal_conduit_missing_locknut"
  | "pf_conduit_insufficient_insert"
  | "pf_conduit_missing_locknut";

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
    title: "埋込コンセント（接地極付）接地線忘れ",
    circuitName: "埋込コンセント（接地極付）の簡略配線",
    defectType: "missing_ground",
    question: "埋込コンセント（接地極付）の図として欠陥を選んでください。",
    choices: [
      "欠陥なし",
      "接地線の接続忘れ",
      "白線と黒線の接続が逆",
      "輪作りの向きが逆",
    ],
    answer: "接地線の接続忘れ",
    explanation:
      "埋込コンセント（接地極付）では接地端子へ接地線を接続します。図では緑線が端子へ届いておらず、接地線の接続忘れです。",
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
    id: "ring-sleeve-wrong-size",
    title: "リングスリーブ サイズ不適合",
    circuitName: "リングスリーブ圧着の簡略図",
    defectType: "ring_sleeve_wrong_size",
    question: "図のリングスリーブ圧着状態として、最も適切な欠陥を選んでください。",
    choices: [
      "欠陥なし",
      "リングスリーブのサイズが不適合",
      "心線の差し込み不足",
      "差込形コネクタの接続本数が不適合",
    ],
    answer: "リングスリーブのサイズが不適合",
    explanation:
      "接続する電線の太さと本数に対して、使用するリングスリーブのサイズを合わせる必要があります。図は必要条件より小さいスリーブを使った例です。",
  },
  {
    id: "ring-sleeve-insulation-bite",
    title: "リングスリーブ 絶縁被覆かみ込み",
    circuitName: "リングスリーブ圧着の簡略図",
    defectType: "ring_sleeve_insulation_bite",
    question: "図のリングスリーブ圧着状態として、最も適切な欠陥を選んでください。",
    choices: [
      "欠陥なし",
      "絶縁被覆をかみ込んでいる",
      "白線と黒線の接続が逆",
      "リングスリーブの刻印が不適合",
    ],
    answer: "絶縁被覆をかみ込んでいる",
    explanation:
      "リングスリーブは心線部分を圧着します。絶縁被覆をかみ込むと導体が正しく圧着されず、欠陥になります。",
  },
  {
    id: "exposed-receptacle-sheath",
    title: "露出形コンセント 外装処理不良",
    circuitName: "露出形コンセントの簡略施工図",
    defectType: "exposed_receptacle_sheath",
    question: "露出形コンセントに入るケーブル外装の状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "ケーブル外装が器具内に入っていない", "白線と黒線の接続が逆", "接地線の接続忘れ"],
    answer: "ケーブル外装が器具内に入っていない",
    explanation: "露出形コンセントではケーブル外装を器具内まで適切に入れて固定します。図は外装が手前で終わっており、心線が長く露出しています。",
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
    title: "差込形コネクタ 心線差し込み不足",
    circuitName: "差込形コネクタの簡略施工図",
    defectType: "push_connector_insufficient_insert",
    question: "差込形コネクタの心線差し込み状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "心線の差し込み不足", "外装がボックス内に十分入っていない", "白線と黒線の接続が逆"],
    answer: "心線の差し込み不足",
    explanation: "差込形コネクタは心線を奥まで確実に差し込みます。図では片方の心線が確認窓まで届いていません。",
  },
  {
    id: "push-connector-wire-count",
    title: "差込形コネクタ 接続本数不適合",
    circuitName: "差込形コネクタの簡略施工図",
    defectType: "push_connector_wrong_wire_count",
    question: "差込形コネクタの使用状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "接続本数に合わないコネクタを使用している", "リングスリーブのサイズが不適合", "輪作りの向きが逆"],
    answer: "接続本数に合わないコネクタを使用している",
    explanation:
      "差込形コネクタは接続する心線の本数に合うものを使います。図では4本接続が必要な箇所に3本用のコネクタを使っています。",
  },
  {
    id: "terminal-block-wrong-terminal",
    title: "端子台 端子番号誤り",
    circuitName: "端子台の簡略施工図",
    defectType: "terminal_block_wrong_terminal",
    question: "端子台の接続状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "指定端子と異なる端子へ接続している", "接地線の接続忘れ", "ケーブル外装が器具内に入っていない"],
    answer: "指定端子と異なる端子へ接続している",
    explanation: "端子台は指定された端子番号へ接続します。図では赤く示した線が指定端子ではなく別の端子へ入っています。",
  },
  {
    id: "ceiling-connector-polarity",
    title: "引掛シーリングローゼット 極性誤り",
    circuitName: "引掛シーリングローゼットの簡略施工図",
    defectType: "ceiling_connector_polarity",
    question: "引掛シーリングローゼットの白線・黒線の接続として、欠陥を選んでください。",
    choices: ["欠陥なし", "白線と黒線の接続が逆", "心線の差し込み不足", "輪作りの向きが逆"],
    answer: "白線と黒線の接続が逆",
    explanation: "引掛シーリングローゼットも接地側・非接地側の接続を確認します。図では白線と黒線の接続先が逆です。",
  },
  {
    id: "mounting-frame-loose",
    title: "埋込連用取付枠 器具固定不良",
    circuitName: "埋込連用取付枠の簡略施工図",
    defectType: "mounting_frame_loose",
    question: "連用取付枠への器具取付状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "器具が取付枠へ確実に固定されていない", "端子番号が違う", "接地線の接続忘れ"],
    answer: "器具が取付枠へ確実に固定されていない",
    explanation: "連用取付枠では器具を枠へ確実に固定します。図では片側の固定爪が掛かっていない状態です。",
  },
  {
    id: "mounting-frame-wrong-position",
    title: "埋込連用取付枠 器具位置誤り",
    circuitName: "埋込連用取付枠の組立図",
    defectType: "mounting_frame_wrong_position",
    question: "埋込連用取付枠に取り付けた器具の位置を判定してください。",
    choices: ["欠陥なし", "器具の取付位置が施工条件と違う", "器具が取付枠へ確実に固定されていない", "端子番号が違う"],
    answer: "器具の取付位置が施工条件と違う",
    explanation: "器具の種類は合っていますが、施工条件で指定された上・中・下の位置と異なる位置へ取り付けられています。",
  },
  {
    id: "pilot-lamp-wrong-terminal",
    title: "埋込連用パイロットランプ 端子接続誤り",
    circuitName: "埋込連用パイロットランプの簡略施工図",
    defectType: "pilot_lamp_wrong_terminal",
    question: "埋込連用パイロットランプの端子接続を判定してください。",
    choices: ["欠陥なし", "指定と異なる端子へ接続している", "器具の取付位置が施工条件と違う", "器具が取付枠へ確実に固定されていない"],
    answer: "指定と異なる端子へ接続している",
    explanation: "パイロットランプの点灯方式と施工条件に合う端子へ接続する必要があります。図では一方の心線が指定と異なる端子へ接続されています。",
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
  },
  {
    id: "outlet-box-wrong-hole",
    title: "アウトレットボックス 使用穴違い",
    circuitName: "アウトレットボックスの簡略施工図",
    defectType: "outlet_box_wrong_hole",
    question: "アウトレットボックスへのケーブル引込み位置として、欠陥を選んでください。",
    choices: ["欠陥なし", "指定と異なる穴へケーブルを通している", "ゴムブッシングのサイズが違う", "絶縁ブッシングがない"],
    answer: "指定と異なる穴へケーブルを通している",
    explanation: "施工条件で指定された打抜き穴へケーブルを通します。図では指定穴を使わず、別の穴へ通しています。",
  },
  {
    id: "rubber-bushing-missing",
    title: "ゴムブッシング 取付忘れ",
    circuitName: "アウトレットボックスの簡略施工図",
    defectType: "rubber_bushing_missing",
    question: "ケーブルを通すボックス穴の保護状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "必要なゴムブッシングがない", "指定と異なる穴へケーブルを通している", "管の挿入が不足している"],
    answer: "必要なゴムブッシングがない",
    explanation: "ケーブルを通す金属製ボックスの穴には、穴径に合うゴムブッシングを取り付けます。図では通過穴にブッシングがありません。",
  },
  {
    id: "rubber-bushing-wrong-size",
    title: "ゴムブッシング サイズ違い",
    circuitName: "アウトレットボックスの簡略施工図",
    defectType: "rubber_bushing_wrong_size",
    question: "ボックス穴とゴムブッシングの組合せとして、欠陥を選んでください。",
    choices: ["欠陥なし", "穴径とゴムブッシングのサイズが違う", "必要なゴムブッシングがない", "電線管の種類が違う"],
    answer: "穴径とゴムブッシングのサイズが違う",
    explanation: "19mm用と25mm用は対応する穴へ取り付けます。図では穴径に合わないブッシングを使用しています。",
  },
  {
    id: "metal-conduit-insert",
    title: "ねじなし電線管E19 挿入不足",
    circuitName: "金属管工事の簡略施工図",
    defectType: "metal_conduit_insufficient_insert",
    question: "ねじなし電線管とボックスコネクタの接続状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "電線管の挿入が不足している", "絶縁ブッシングがない", "PF管を使用している"],
    answer: "電線管の挿入が不足している",
    explanation: "ねじなし電線管はボックスコネクタへ十分に挿入して固定します。図では管端とコネクタの間に隙間があります。",
  },
  {
    id: "metal-conduit-insulation-bushing",
    title: "金属管工事 絶縁ブッシング忘れ",
    circuitName: "金属管工事の簡略施工図",
    defectType: "metal_conduit_missing_insulation_bushing",
    question: "ボックス内の金属管端末処理として、欠陥を選んでください。",
    choices: ["欠陥なし", "絶縁ブッシングがない", "ロックナットがない", "ゴムブッシングのサイズが違う"],
    answer: "絶縁ブッシングがない",
    explanation: "金属管の管端には電線を保護する絶縁ブッシングを取り付けます。図では絶縁ブッシングがありません。",
  },
  {
    id: "metal-conduit-locknut",
    title: "金属管コネクタ ロックナット忘れ",
    circuitName: "金属管工事の簡略施工図",
    defectType: "metal_conduit_missing_locknut",
    question: "ボックスコネクタの固定状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "ロックナットがない", "絶縁ブッシングがない", "電線管の色が違う"],
    answer: "ロックナットがない",
    explanation: "ボックスコネクタはボックス内側からロックナットで固定します。図ではロックナットが取り付けられていません。",
  },
  {
    id: "pf-conduit-insert",
    title: "合成樹脂製可とう電線管（PF管） 挿入不足",
    circuitName: "PF管工事の簡略施工図",
    defectType: "pf_conduit_insufficient_insert",
    question: "PF管とボックスコネクタの接続状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "PF管の挿入が不足している", "ロックナットがない", "金属管を使用している"],
    answer: "PF管の挿入が不足している",
    explanation: "PF管は専用コネクタへ十分に挿入して固定します。図では管端とコネクタの間に隙間があります。",
  },
  {
    id: "pf-conduit-locknut",
    title: "合成樹脂製可とう電線管用ボックスコネクタ ロックナット忘れ",
    circuitName: "PF管工事の簡略施工図",
    defectType: "pf_conduit_missing_locknut",
    question: "PF管用ボックスコネクタの固定状態として、欠陥を選んでください。",
    choices: ["欠陥なし", "ロックナットがない", "絶縁ブッシングがない", "PF管の色が違う"],
    answer: "ロックナットがない",
    explanation: "PF管用ボックスコネクタはボックス内側からロックナットで固定します。図ではロックナットがありません。",
  },];
