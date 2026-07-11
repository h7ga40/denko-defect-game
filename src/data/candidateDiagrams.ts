export type DeviceType =
  | "power"
  | "switch"
  | "lamp"
  | "receptacle"
  | "grounded_receptacle"
  | "pilot"
  | "breaker"
  | "terminal"
  | "connector";

export type CandidateDevice = {
  id: string;
  label: string;
  type: DeviceType;
  x: number;
  y: number;
};

export type CandidateConnection = {
  from: string;
  to: string;
  color: "black" | "white" | "red" | "green" | "blue";
  label?: string;
};

export type CandidateDiagram = {
  no: number;
  title: string;
  theme: string;
  points: string[];
  devices: CandidateDevice[];
  connections: CandidateConnection[];
};

export const candidateDiagrams: CandidateDiagram[] = [
  {
    no: 1,
    title: "ランプレセプタクルと片切スイッチ",
    theme: "電源、片切スイッチ、ランプレセプタクル、コンセントの基本回路",
    points: ["黒線をスイッチ経由で負荷へ送る", "白線は負荷とコンセントへ共通で戻す"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 95, y: 190 },
      { id: "s", label: "片切S", type: "switch", x: 280, y: 115 },
      { id: "l", label: "ランプ", type: "lamp", x: 510, y: 115 },
      { id: "r", label: "コンセント", type: "receptacle", x: 510, y: 265 },
      { id: "j", label: "接続", type: "connector", x: 285, y: 265 },
    ],
    connections: [
      { from: "p", to: "s", color: "black", label: "非接地側" },
      { from: "s", to: "l", color: "red", label: "スイッチ返り" },
      { from: "p", to: "j", color: "white", label: "接地側" },
      { from: "j", to: "l", color: "white" },
      { from: "p", to: "r", color: "black" },
      { from: "j", to: "r", color: "white" },
    ],
  },
  {
    no: 2,
    title: "ランプ2灯と片切スイッチ",
    theme: "1つの片切スイッチで2灯を同時点滅する回路",
    points: ["スイッチ返りを2灯へ分岐する", "白線は2灯へ共通で戻す"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 90, y: 190 },
      { id: "s", label: "片切S", type: "switch", x: 260, y: 105 },
      { id: "j1", label: "分岐", type: "connector", x: 400, y: 105 },
      { id: "l1", label: "ランプ1", type: "lamp", x: 570, y: 90 },
      { id: "l2", label: "ランプ2", type: "lamp", x: 570, y: 205 },
      { id: "j2", label: "戻り", type: "connector", x: 400, y: 275 },
    ],
    connections: [
      { from: "p", to: "s", color: "black" },
      { from: "s", to: "j1", color: "red" },
      { from: "j1", to: "l1", color: "red" },
      { from: "j1", to: "l2", color: "red" },
      { from: "p", to: "j2", color: "white" },
      { from: "j2", to: "l1", color: "white" },
      { from: "j2", to: "l2", color: "white" },
    ],
  },
  {
    no: 3,
    title: "3路スイッチ回路",
    theme: "2か所から1灯を点滅する3路スイッチ回路",
    points: ["3路間の渡り線を2本通す", "共通端子の行き先を区別する"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 90, y: 190 },
      { id: "s1", label: "3路S1", type: "switch", x: 245, y: 120 },
      { id: "s2", label: "3路S2", type: "switch", x: 430, y: 120 },
      { id: "l", label: "ランプ", type: "lamp", x: 590, y: 120 },
      { id: "j", label: "戻り", type: "connector", x: 340, y: 275 },
    ],
    connections: [
      { from: "p", to: "s1", color: "black", label: "共通" },
      { from: "s1", to: "s2", color: "red", label: "渡り" },
      { from: "s1", to: "s2", color: "blue", label: "渡り" },
      { from: "s2", to: "l", color: "black", label: "共通" },
      { from: "p", to: "j", color: "white" },
      { from: "j", to: "l", color: "white" },
    ],
  },
  {
    no: 4,
    title: "4路スイッチ回路",
    theme: "3か所から1灯を点滅する3路・4路スイッチ回路",
    points: ["3路、4路、3路の順で渡り線を接続する", "負荷へ送る共通線を取り違えない"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 70, y: 190 },
      { id: "s1", label: "3路", type: "switch", x: 200, y: 110 },
      { id: "s2", label: "4路", type: "switch", x: 360, y: 110 },
      { id: "s3", label: "3路", type: "switch", x: 520, y: 110 },
      { id: "l", label: "ランプ", type: "lamp", x: 640, y: 205 },
      { id: "j", label: "戻り", type: "connector", x: 360, y: 285 },
    ],
    connections: [
      { from: "p", to: "s1", color: "black" },
      { from: "s1", to: "s2", color: "red", label: "渡り" },
      { from: "s1", to: "s2", color: "blue", label: "渡り" },
      { from: "s2", to: "s3", color: "red", label: "渡り" },
      { from: "s2", to: "s3", color: "blue", label: "渡り" },
      { from: "s3", to: "l", color: "black" },
      { from: "p", to: "j", color: "white" },
      { from: "j", to: "l", color: "white" },
    ],
  },
  {
    no: 5,
    title: "常時点灯パイロットランプ",
    theme: "負荷とは別にパイロットランプを常時点灯させる回路",
    points: ["パイロットランプは電源と並列に接続する", "負荷はスイッチ返りで制御する"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 90, y: 190 },
      { id: "s", label: "片切S", type: "switch", x: 280, y: 105 },
      { id: "pl", label: "PL", type: "pilot", x: 280, y: 265 },
      { id: "l", label: "ランプ", type: "lamp", x: 540, y: 105 },
      { id: "j", label: "戻り", type: "connector", x: 435, y: 265 },
    ],
    connections: [
      { from: "p", to: "s", color: "black" },
      { from: "s", to: "l", color: "red" },
      { from: "p", to: "pl", color: "black", label: "常時電源" },
      { from: "p", to: "j", color: "white" },
      { from: "j", to: "pl", color: "white" },
      { from: "j", to: "l", color: "white" },
    ],
  },
  {
    no: 6,
    title: "同時点滅パイロットランプ",
    theme: "負荷とパイロットランプを同時に点滅させる回路",
    points: ["パイロットランプは負荷と並列に接続する", "スイッチ返りをランプとPLへ分岐する"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 90, y: 190 },
      { id: "s", label: "片切S", type: "switch", x: 270, y: 105 },
      { id: "j1", label: "分岐", type: "connector", x: 430, y: 105 },
      { id: "l", label: "ランプ", type: "lamp", x: 585, y: 105 },
      { id: "pl", label: "PL", type: "pilot", x: 585, y: 240 },
      { id: "j2", label: "戻り", type: "connector", x: 430, y: 285 },
    ],
    connections: [
      { from: "p", to: "s", color: "black" },
      { from: "s", to: "j1", color: "red" },
      { from: "j1", to: "l", color: "red" },
      { from: "j1", to: "pl", color: "red" },
      { from: "p", to: "j2", color: "white" },
      { from: "j2", to: "l", color: "white" },
      { from: "j2", to: "pl", color: "white" },
    ],
  },
  {
    no: 7,
    title: "異時点滅パイロットランプ",
    theme: "負荷OFF時にパイロットランプを点灯させる回路",
    points: ["パイロットランプはスイッチの反対側へ入れる", "同時点滅との違いを確認する"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 90, y: 190 },
      { id: "s", label: "片切S", type: "switch", x: 285, y: 115 },
      { id: "pl", label: "PL", type: "pilot", x: 285, y: 260 },
      { id: "l", label: "ランプ", type: "lamp", x: 540, y: 115 },
      { id: "j", label: "戻り", type: "connector", x: 430, y: 285 },
    ],
    connections: [
      { from: "p", to: "s", color: "black" },
      { from: "s", to: "l", color: "red" },
      { from: "p", to: "pl", color: "black" },
      { from: "pl", to: "l", color: "blue", label: "異時点滅" },
      { from: "p", to: "j", color: "white" },
      { from: "j", to: "l", color: "white" },
    ],
  },
  {
    no: 8,
    title: "接地極付コンセント",
    theme: "接地線を含むコンセント回路",
    points: ["接地側白線と接地線を区別する", "緑線は接地端子へ接続する"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 95, y: 190 },
      { id: "r", label: "接地極付", type: "grounded_receptacle", x: 530, y: 190 },
      { id: "g", label: "接地", type: "terminal", x: 320, y: 285 },
    ],
    connections: [
      { from: "p", to: "r", color: "black" },
      { from: "p", to: "r", color: "white" },
      { from: "g", to: "r", color: "green", label: "接地線" },
    ],
  },
  {
    no: 9,
    title: "引掛シーリング",
    theme: "引掛シーリングとスイッチの照明回路",
    points: ["黒線をスイッチへ送る", "白線は引掛シーリングへ戻す"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 90, y: 190 },
      { id: "s", label: "片切S", type: "switch", x: 275, y: 120 },
      { id: "c", label: "引掛シーリング", type: "lamp", x: 555, y: 120 },
      { id: "j", label: "戻り", type: "connector", x: 350, y: 280 },
    ],
    connections: [
      { from: "p", to: "s", color: "black" },
      { from: "s", to: "c", color: "red" },
      { from: "p", to: "j", color: "white" },
      { from: "j", to: "c", color: "white" },
    ],
  },
  {
    no: 10,
    title: "配線用遮断器とコンセント",
    theme: "配線用遮断器を通したコンセント回路",
    points: ["非接地側を遮断器に通す", "白線は接地側としてコンセントへ接続する"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 80, y: 190 },
      { id: "b", label: "遮断器", type: "breaker", x: 285, y: 130 },
      { id: "r1", label: "コンセント1", type: "receptacle", x: 545, y: 115 },
      { id: "r2", label: "コンセント2", type: "receptacle", x: 545, y: 260 },
      { id: "j", label: "分岐", type: "connector", x: 400, y: 260 },
    ],
    connections: [
      { from: "p", to: "b", color: "black" },
      { from: "b", to: "r1", color: "black" },
      { from: "b", to: "r2", color: "black" },
      { from: "p", to: "j", color: "white" },
      { from: "j", to: "r1", color: "white" },
      { from: "j", to: "r2", color: "white" },
    ],
  },
  {
    no: 11,
    title: "200Vコンセント回路",
    theme: "2極の電源線を使う200V負荷回路",
    points: ["2本の電源線を負荷へ送る", "接地極がある場合は緑線を接地端子へ入れる"],
    devices: [
      { id: "p", label: "200V電源", type: "power", x: 95, y: 190 },
      { id: "b", label: "2P遮断器", type: "breaker", x: 290, y: 190 },
      { id: "r", label: "200Vコンセント", type: "grounded_receptacle", x: 545, y: 190 },
      { id: "g", label: "接地", type: "terminal", x: 320, y: 300 },
    ],
    connections: [
      { from: "p", to: "b", color: "black", label: "L1" },
      { from: "p", to: "b", color: "red", label: "L2" },
      { from: "b", to: "r", color: "black" },
      { from: "b", to: "r", color: "red" },
      { from: "g", to: "r", color: "green" },
    ],
  },
  {
    no: 12,
    title: "端子台経由の照明回路",
    theme: "端子台を介してスイッチと照明器具を接続する回路",
    points: ["端子台で電源側と負荷側を整理する", "端子番号と線色を対応させる"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 75, y: 190 },
      { id: "t", label: "端子台", type: "terminal", x: 290, y: 190 },
      { id: "s", label: "片切S", type: "switch", x: 500, y: 105 },
      { id: "l", label: "ランプ", type: "lamp", x: 610, y: 255 },
    ],
    connections: [
      { from: "p", to: "t", color: "black" },
      { from: "t", to: "s", color: "black" },
      { from: "s", to: "l", color: "red" },
      { from: "p", to: "t", color: "white" },
      { from: "t", to: "l", color: "white" },
    ],
  },
  {
    no: 13,
    title: "複合回路",
    theme: "照明、スイッチ、コンセント、接地線を含む総合回路",
    points: ["電源、負荷、コンセントの分岐を整理する", "接地線と接地側電線を取り違えない"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 75, y: 190 },
      { id: "s", label: "片切S", type: "switch", x: 250, y: 95 },
      { id: "l", label: "ランプ", type: "lamp", x: 465, y: 95 },
      { id: "r", label: "接地極付", type: "grounded_receptacle", x: 560, y: 255 },
      { id: "j", label: "接続", type: "connector", x: 305, y: 255 },
      { id: "g", label: "接地", type: "terminal", x: 160, y: 305 },
    ],
    connections: [
      { from: "p", to: "s", color: "black" },
      { from: "s", to: "l", color: "red" },
      { from: "p", to: "r", color: "black" },
      { from: "p", to: "j", color: "white" },
      { from: "j", to: "l", color: "white" },
      { from: "j", to: "r", color: "white" },
      { from: "g", to: "r", color: "green" },
    ],
  },
];
