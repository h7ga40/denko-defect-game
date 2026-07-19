import type { CableRunOverride } from "./cableSpecifications";

export type DeviceType =
  | "power"
  | "switch"
  | "lamp"
  | "receptacle"
  | "grounded_receptacle"
  | "pilot"
  | "breaker"
  | "terminal"
  | "connector"
  | "box"
  | "motor";

export type DeviceVariant =
  | "lamp_receptacle"
  | "ceiling_connector"
  | "pilot_lamp"
  | "single_pole_switch"
  | "three_way_switch"
  | "four_way_switch"
  | "switch_group"
  | "exposed_receptacle"
  | "grounded_receptacle"
  | "grounded_20a_receptacle"
  | "eet_receptacle"
  | "circuit_breaker"
  | "earth_leakage_breaker"
  | "timer_switch"
  | "automatic_switch"
  | "earth_terminal"
  | "terminal_block"
  | "motor_terminal"
  | "load_device"
  | "omitted_work";

export type CandidateDevice = {
  id: string;
  label: string;
  type: DeviceType;
  variant?: DeviceVariant;
  x: number;
  y: number;
};

export type CandidateConnection = {
  id?: string;
  from: string;
  to: string;
  color: "black" | "white" | "red" | "green" | "blue";
  label?: string;
  cable?: CableRunOverride;
};

export type CandidateConductorReference = {
  cableId: string;
  coreIndex: number;
};

export type CandidateBoxConnectionGroup = {
  id: string;
  method: "ring_sleeve" | "push_connector";
  conductors: CandidateConductorReference[];
};

export type CandidateBoxWiring = {
  deviceId: string;
  groups: CandidateBoxConnectionGroup[];
};

export type CandidateDeviceTerminalConnection = {
  terminalId: string;
  conductors: CandidateConductorReference[];
};

export type CandidateDeviceWiring = {
  deviceId: string;
  terminals: CandidateDeviceTerminalConnection[];
};

export type CandidateDiagram = {
  no: number;
  title: string;
  theme: string;
  points: string[];
  devices: CandidateDevice[];
  connections: CandidateConnection[];
  boxWirings?: CandidateBoxWiring[];
  deviceWirings?: CandidateDeviceWiring[];
};

const sourceNote = "令和8年度第二種電気工事士技能試験候補問題の公式No.に対応";

const hozanCable = (
  sourceStockId: string,
  diagramLengthMm: number,
  override: CableRunOverride = {},
): CableRunOverride => ({ sourceStockId, diagramLengthMm, ...override });

export const candidateDiagrams: CandidateDiagram[] = [
  {
    no: 1,
    title: "公式No.1 基本回路",
    theme: `${sourceNote}。ランプレセプタクル、引掛シーリングローゼット、スイッチ群を含む回路。`,
    points: ["電源: 1φ2W 100V", "電線: EM-EEF 2.0-2C", "器具: ランプレセプタクル、引掛シーリングローゼット、スイッチ群"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 92, y: 205 },
      { id: "j1", label: "接続点", type: "connector", x: 240, y: 205 },
      { id: "c", label: "引掛シーリングローゼット イ", type: "lamp", variant: "ceiling_connector", x: 240, y: 96 },
      { id: "sw", label: "Hイ/ロ/ハ", type: "switch", variant: "switch_group", x: 240, y: 315 },
      { id: "j2", label: "接続点", type: "connector", x: 435, y: 205 },
      { id: "r", label: "R ロ", type: "lamp", variant: "lamp_receptacle", x: 435, y: 96 },
      { id: "omit", label: "施工省略 ハ", type: "receptacle", variant: "omitted_work", x: 435, y: 315 },
    ],
    connections: [
      { from: "p", to: "j1", color: "black", label: "EM-EEF 2.0-2C", cable: hozanCable("1-em-eef", 150) },
      { from: "j1", to: "c", color: "black", label: "イ", cable: hozanCable("1-vvf-1", 150, { sourceStockPieceIndex: 0 }) },
      { from: "j1", to: "sw", color: "black", label: "Hイ/ロ/ハ", cable: hozanCable("1-vvf-1", 150, { sourceStockPieceIndex: 0 }) },
      { from: "j1", to: "j2", color: "black", cable: hozanCable("1-vvf-2", 150) },
      { from: "j2", to: "r", color: "black", label: "ロ", cable: hozanCable("1-vvf-1", 150, { sourceStockPieceIndex: 1 }) },
      { from: "j2", to: "omit", color: "black", label: "ハ 施工省略", cable: hozanCable("1-vvf-1", 150, { sourceStockPieceIndex: 1 }) },
    ],
  },
  {
    no: 2,
    title: "公式No.2 常時点灯確認表示灯",
    theme: `${sourceNote}。確認表示灯（パイロットランプ）は常時点灯。`,
    points: ["電源: 1φ2W 100V", "電線: VVF 2.0-2C", "器具: ランプレセプタクル、確認表示灯、スイッチ、施工省略部"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 80, y: 198 },
      { id: "j1", label: "接続点", type: "connector", x: 220, y: 198 },
      { id: "r1", label: "R イ", type: "lamp", variant: "lamp_receptacle", x: 220, y: 85 },
      { id: "j2", label: "接続点", type: "connector", x: 430, y: 198 },
      { id: "pl", label: "PL 常時", type: "pilot", variant: "pilot_lamp", x: 430, y: 85 },
      { id: "r2", label: "R イ", type: "lamp", variant: "lamp_receptacle", x: 605, y: 198 },
      { id: "sw", label: "スイッチ 2", type: "switch", variant: "single_pole_switch", x: 430, y: 310 },
      { id: "omit", label: "施工省略", type: "box", x: 575, y: 310 },
    ],
    connections: [
      { from: "p", to: "j1", color: "black", label: "VVF 2.0-2C", cable: hozanCable("2-vvf-3", 150) },
      { from: "j1", to: "r1", color: "black", label: "イ", cable: hozanCable("2-vvf-1", 150) },
      { from: "j1", to: "j2", color: "black", cable: hozanCable("2-vvf-2", 150) },
      { from: "j2", to: "pl", color: "black", label: "常時点灯", cable: hozanCable("2-vvf-1", 150) },
      { from: "j2", to: "r2", color: "black", label: "イ", cable: hozanCable("2-vvf-1", 100) },
      { from: "j2", to: "sw", color: "black", cable: hozanCable("2-vvf-2", 150) },
      { from: "sw", to: "omit", color: "black", label: "施工省略", cable: hozanCable("2-vvf-1", 150) },
    ],
  },
  {
    no: 3,
    title: "公式No.3 タイムスイッチ・接地回路",
    theme: `${sourceNote}。タイムスイッチ、ランプレセプタクル、接地を含む回路。`,
    points: ["電源: 1φ2W 100V", "電線: VVF 2.0-2C、VVF 1.6-2C、VVF 1.6-3C、E1.6", "器具: TS（S1・S2・L1）、ランプレセプタクル、引掛シーリングローゼット、接地極付器具"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 88, y: 200 },
      { id: "j1", label: "アウトレットボックス1", type: "connector", x: 210, y: 248 },
      { id: "sw", label: "スイッチ ロ", type: "switch", variant: "single_pole_switch", x: 210, y: 330 },
      { id: "j2", label: "アウトレットボックス2", type: "connector", x: 350, y: 248 },
      { id: "ts", label: "TS イ", type: "terminal", variant: "timer_switch", x: 350, y: 96 },
      { id: "c", label: "引掛 イ", type: "lamp", variant: "ceiling_connector", x: 540, y: 115 },
      { id: "r", label: "R ロ", type: "lamp", variant: "lamp_receptacle", x: 540, y: 248 },
      { id: "e", label: "接地極付 E", type: "grounded_receptacle", variant: "grounded_receptacle", x: 350, y: 330 },
      { id: "ed", label: "ED", type: "terminal", variant: "earth_terminal", x: 560, y: 330 },
    ],
    connections: [
      { from: "p", to: "j1", color: "black", label: "VVF 2.0-2C", cable: hozanCable("3-vvf-3", 150) },
      { from: "j1", to: "sw", color: "black", label: "ロ", cable: hozanCable("3-vvf-1", 150) },
      { id: "3-box1-box2", from: "j1", to: "j2", color: "black", label: "VVF 1.6-3C", cable: hozanCable("3-vvf-2", 150) },
      { id: "3-box2-timer", from: "j2", to: "ts", color: "black", label: "VVF 1.6-2C", cable: hozanCable("3-vvf-1", 150) },
      { id: "3-timer-ceiling", from: "ts", to: "c", color: "black", label: "VVF 1.6-2C イ", cable: hozanCable("3-vvf-1", 200) },
      { from: "j2", to: "r", color: "black", label: "ロ", cable: hozanCable("3-vvf-1", 150) },
      { from: "j2", to: "e", color: "black", label: "E", cable: hozanCable("3-vvf-1", 150) },
      { from: "e", to: "ed", color: "green", label: "E1.6", cable: hozanCable("3-iv", 100, { lengthMm: 150 }) },
    ],
    deviceWirings: [{
      deviceId: "ts",
      terminals: [
        { terminalId: "S1", conductors: [{ cableId: "3-box2-timer", coreIndex: 0 }] },
        {
          terminalId: "S2",
          conductors: [
            { cableId: "3-box2-timer", coreIndex: 1 },
            { cableId: "3-timer-ceiling", coreIndex: 1 },
          ],
        },
        { terminalId: "L1", conductors: [{ cableId: "3-timer-ceiling", coreIndex: 0 }] },
      ],
    }],
  },
  {
    no: 4,
    title: "公式No.4 100V・三相200V混在",
    theme: `${sourceNote}。100V回路、三相200V電動機、電源表示灯を含む回路。`,
    points: ["電源: 1φ2W 100V、3φ3W 200V", "電線: VVF 2.0-2C、VVF 2.0-3C、E1.6", "器具: B、BE、電源表示灯、3φ200V電動機"],
    devices: [
      { id: "p100", label: "100V電源", type: "power", x: 80, y: 135 },
      { id: "p200", label: "3φ200V電源", type: "power", x: 80, y: 232 },
      { id: "b", label: "B", type: "breaker", variant: "circuit_breaker", x: 205, y: 135 },
      { id: "be", label: "BE", type: "breaker", variant: "earth_leakage_breaker", x: 205, y: 232 },
      { id: "j1", label: "接続点", type: "connector", x: 345, y: 135 },
      { id: "j2", label: "接続点", type: "connector", x: 345, y: 232 },
      { id: "r", label: "R 電源表示灯", type: "pilot", variant: "pilot_lamp", x: 255, y: 318 },
      { id: "m", label: "M 3φ200V", type: "motor", variant: "motor_terminal", x: 345, y: 318 },
      { id: "ed", label: "ED", type: "terminal", variant: "earth_terminal", x: 430, y: 338 },
      { id: "c", label: "引掛 イ", type: "lamp", variant: "ceiling_connector", x: 555, y: 242 },
      { id: "sw", label: "スイッチ イ", type: "switch", variant: "single_pole_switch", x: 630, y: 318 },
    ],
    connections: [
      { from: "p100", to: "b", color: "black" },
      { from: "p200", to: "be", color: "black" },
      { from: "b", to: "j1", color: "black", label: "VVF 2.0-2C", cable: hozanCable("4-vvf-3", 300) },
      { from: "be", to: "j2", color: "black", label: "VVF 2.0-3C", cable: hozanCable("4-vvf-4", 150) },
      { from: "j1", to: "c", color: "black", cable: hozanCable("4-vvf-1", 250) },
      { from: "j2", to: "m", color: "black", cable: hozanCable("4-vvf-4", 250, { lengthMm: 300 }) },
      { from: "m", to: "ed", color: "green", label: "ED" },
      { from: "j1", to: "r", color: "black", label: "電源表示灯", cable: hozanCable("4-vvf-1", 250) },
      { from: "c", to: "sw", color: "black", label: "イ", cable: hozanCable("4-vvf-2", 200) },
    ],
  },
  {
    no: 5,
    title: "公式No.5 200Vコンセント・接地",
    theme: `${sourceNote}。100V/200V電源、20A 250Vコンセント、接地を含む回路。`,
    points: ["電源: 100V、200V（対地電圧150V以下）", "電線: VVF 2.0-2C、VVF 2.0-3C、E1.6", "器具: B、BE、20A 250Vコンセント、ランプレセプタクル"],
    devices: [
      { id: "p100", label: "100V電源", type: "power", x: 80, y: 120 },
      { id: "p200", label: "200V電源", type: "power", x: 80, y: 200 },
      { id: "b", label: "B", type: "breaker", variant: "circuit_breaker", x: 185, y: 120 },
      { id: "be", label: "BE", type: "breaker", variant: "earth_leakage_breaker", x: 185, y: 200 },
      { id: "ed", label: "ED", type: "terminal", variant: "earth_terminal", x: 120, y: 278 },
      { id: "j", label: "接続点", type: "connector", x: 360, y: 160 },
      { id: "r", label: "R ロ", type: "lamp", variant: "lamp_receptacle", x: 325, y: 275 },
      { id: "outlet", label: "20A 250V E", type: "grounded_receptacle", variant: "grounded_20a_receptacle", x: 390, y: 320 },
      { id: "sw", label: "スイッチ イ", type: "switch", variant: "single_pole_switch", x: 472, y: 300 },
      { id: "c", label: "引掛 イ", type: "lamp", variant: "ceiling_connector", x: 570, y: 230 },
    ],
    connections: [
      { from: "p100", to: "b", color: "black" },
      { from: "p200", to: "be", color: "black" },
      { from: "b", to: "j", color: "black", label: "VVF 2.0-2C", cable: hozanCable("5-vvf-2", 250) },
      { from: "be", to: "outlet", color: "black", label: "VVF 2.0-3C", cable: hozanCable("5-vvf-3", 250) },
      { from: "outlet", to: "ed", color: "green", label: "E1.6" },
      { from: "j", to: "r", color: "black", label: "ロ", cable: hozanCable("5-vvf-1", 250) },
      { from: "j", to: "c", color: "black", label: "イ", cable: hozanCable("5-vvf-1", 100) },
      { from: "j", to: "sw", color: "black", label: "イ", cable: hozanCable("5-vvf-1", 200) },
    ],
  },
  {
    no: 6,
    title: "公式No.6 露出形コンセント",
    theme: `${sourceNote}。露出形コンセントと2か所の照明器具を含む回路。`,
    points: ["電源: 1φ2W 100V", "電線: VVF 2.0-2C", "器具: 引掛シーリングローゼット、露出形コンセント、スイッチ"],
    devices: [
      { id: "c1", label: "引掛 イ", type: "lamp", variant: "ceiling_connector", x: 185, y: 100 },
      { id: "j1", label: "接続点", type: "connector", x: 300, y: 205 },
      { id: "sw1", label: "スイッチ イ3", type: "switch", variant: "three_way_switch", x: 300, y: 320 },
      { id: "c2", label: "引掛 イ", type: "lamp", variant: "ceiling_connector", x: 410, y: 100 },
      { id: "j2", label: "接続点", type: "connector", x: 525, y: 205 },
      { id: "outlet", label: "露出形", type: "receptacle", variant: "exposed_receptacle", x: 525, y: 100 },
      { id: "sw2", label: "スイッチ イ3", type: "switch", variant: "three_way_switch", x: 525, y: 320 },
      { id: "p", label: "電源", type: "power", x: 645, y: 205 },
    ],
    connections: [
      { from: "c1", to: "j1", color: "black", label: "施工省略", cable: hozanCable("6-vvf-1", 100) },
      { from: "j1", to: "sw1", color: "black", label: "イ3", cable: hozanCable("6-vvf-2", 150) },
      { from: "j1", to: "j2", color: "black", cable: hozanCable("6-vvf-2", 150) },
      { from: "c2", to: "j2", color: "black", label: "イ", cable: hozanCable("6-vvf-1", 150) },
      { from: "j2", to: "outlet", color: "black", label: "露出形", cable: hozanCable("6-vvf-1", 150) },
      { from: "j2", to: "sw2", color: "black", label: "イ3", cable: hozanCable("6-vvf-2", 150) },
      { from: "j2", to: "p", color: "black", label: "VVF 2.0-2C", cable: hozanCable("6-vvf-3", 150) },
    ],
  },
  {
    no: 7,
    title: "公式No.7 アウトレットボックス分岐",
    theme: `${sourceNote}。アウトレットボックスから複数のランプレセプタクルとスイッチへ分岐。`,
    points: ["電源: 1φ2W 100V", "電線: VVF 2.0-2C、VVF 1.6-2C、VVF 1.6-3C", "器具: ランプレセプタクル、アウトレットボックス、3路・4路スイッチ"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 96, y: 105 },
      { id: "j1", label: "アウトレットボックス1", type: "connector", x: 96, y: 250 },
      { id: "sw1", label: "スイッチ イ3", type: "switch", variant: "three_way_switch", x: 96, y: 335 },
      { id: "box", label: "アウトレットボックス2", type: "box", x: 330, y: 250 },
      { id: "r1", label: "R イ", type: "lamp", variant: "lamp_receptacle", x: 330, y: 105 },
      { id: "sw2", label: "スイッチ イ4", type: "switch", variant: "four_way_switch", x: 330, y: 335 },
      { id: "r2", label: "R イ 施工省略", type: "lamp", variant: "omitted_work", x: 540, y: 105 },
      { id: "sw3", label: "スイッチ イ3", type: "switch", variant: "three_way_switch", x: 540, y: 335 },
    ],
    connections: [
      { from: "p", to: "j1", color: "black", label: "VVF 2.0-2C", cable: hozanCable("7-vvf-3", 150) },
      { from: "j1", to: "sw1", color: "black", label: "イ3", cable: hozanCable("7-vvf-2", 150) },
      { id: "7-box1-box2", from: "j1", to: "box", color: "black", label: "VVF 1.6-3C", cable: hozanCable("7-vvf-2", 150) },
      { from: "box", to: "r1", color: "black", label: "イ", cable: hozanCable("7-vvf-1", 150) },
      { id: "7-box2-four-way-a", from: "box", to: "sw2", color: "black", label: "イ4", cable: hozanCable("7-vvf-1", 150) },
      { id: "7-box2-four-way-b", from: "box", to: "sw2", color: "black", cable: hozanCable("7-vvf-1", 150) },
      { from: "box", to: "r2", color: "black", label: "イ 施工省略", cable: hozanCable("7-vvf-1", 250) },
      { from: "box", to: "sw3", color: "black", label: "イ3", cable: hozanCable("7-vvf-2", 250) },
    ],
  },
  {
    no: 8,
    title: "公式No.8 VVR・三路スイッチ",
    theme: `${sourceNote}。B、T、三路スイッチ、VVR 2.0-2Cを含む回路。`,
    points: ["電源: 1φ2W 100V", "電線: VVR 2.0-2C", "器具: B、T、埋込連用タンブラスイッチ（3路）、ランプレセプタクル、引掛シーリングローゼット"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 70, y: 170 },
      { id: "b1", label: "B", type: "breaker", variant: "circuit_breaker", x: 170, y: 140 },
      { id: "b2", label: "B", type: "breaker", variant: "circuit_breaker", x: 170, y: 245 },
      { id: "t", label: "T", type: "terminal", variant: "terminal_block", x: 245, y: 245 },
      { id: "s3", label: "3路S R", type: "switch", variant: "three_way_switch", x: 345, y: 245 },
      { id: "box", label: "アウトレットボックス", type: "box", x: 500, y: 170 },
      { id: "c1", label: "引掛 イ", type: "lamp", variant: "ceiling_connector", x: 650, y: 105 },
      { id: "r", label: "R ロ", type: "lamp", variant: "lamp_receptacle", x: 650, y: 250 },
      { id: "c2", label: "引掛 ハ", type: "lamp", variant: "ceiling_connector", x: 520, y: 328 },
    ],
    connections: [
      { from: "p", to: "b1", color: "black" },
      { from: "p", to: "b2", color: "black" },
      { from: "b1", to: "box", color: "black", label: "VVR 2.0-2C", cable: hozanCable("8-vvr", 200) },
      { from: "b2", to: "t", color: "black" },
      { from: "t", to: "s3", color: "black", label: "Rイ/Rロ/Rハ", cable: hozanCable("8-vvf-1", 250, { sourceStockPieceIndex: 0 }) },
      { from: "s3", to: "box", color: "black", cable: hozanCable("8-vvf-1", 250, { sourceStockPieceIndex: 0 }) },
      { from: "box", to: "c1", color: "black", label: "イ", cable: hozanCable("8-vvf-1", 250, { sourceStockPieceIndex: 1 }) },
      { from: "box", to: "r", color: "black", label: "ロ", cable: hozanCable("8-vvf-1", 250, { sourceStockPieceIndex: 1 }) },
      { from: "box", to: "c2", color: "black", label: "ハ 施工省略", cable: hozanCable("8-vvf-1", 150, { sourceStockPieceIndex: 1 }) },
    ],
  },
  {
    no: 9,
    title: "公式No.9 接地端子付コンセント",
    theme: `${sourceNote}。EET、接地、ランプレセプタクル、引掛シーリングローゼットを含む回路。`,
    points: ["電源: 1φ2W 100V", "電線: VVF 2.0-2C、E1.6", "器具: ランプレセプタクル、引掛シーリングローゼット、EET、接地"],
    devices: [
      { id: "r1", label: "R イ", type: "lamp", variant: "lamp_receptacle", x: 115, y: 105 },
      { id: "j1", label: "接続点", type: "connector", x: 115, y: 235 },
      { id: "sw", label: "スイッチ イ", type: "switch", variant: "single_pole_switch", x: 115, y: 330 },
      { id: "p", label: "電源", type: "power", x: 320, y: 105 },
      { id: "j2", label: "接続点", type: "connector", x: 320, y: 235 },
      { id: "c", label: "引掛 イ", type: "lamp", variant: "ceiling_connector", x: 320, y: 330 },
      { id: "eet", label: "EET 2", type: "grounded_receptacle", variant: "eet_receptacle", x: 535, y: 235 },
      { id: "pl", label: "器具 2", type: "pilot", variant: "pilot_lamp", x: 535, y: 105 },
      { id: "ed", label: "ED", type: "terminal", variant: "earth_terminal", x: 535, y: 330 },
    ],
    connections: [
      { from: "r1", to: "j1", color: "black", label: "イ", cable: hozanCable("9-vvf-1", 150) },
      { from: "j1", to: "sw", color: "black", label: "イ", cable: hozanCable("9-vvf-1", 150) },
      { from: "j1", to: "j2", color: "black", label: "VVF 2.0-2C", cable: hozanCable("9-vvf-2", 150) },
      { from: "p", to: "j2", color: "black", label: "電源", cable: hozanCable("9-vvf-3", 150) },
      { from: "j2", to: "c", color: "black", label: "イ", cable: hozanCable("9-vvf-1", 150) },
      { from: "j2", to: "eet", color: "black", cable: hozanCable("9-vvf-1", 150) },
      { from: "eet", to: "pl", color: "black", label: "2" },
      { from: "eet", to: "ed", color: "green", label: "E1.6", cable: hozanCable("9-iv", 100, { lengthMm: 150 }) },
    ],
  },
  {
    no: 10,
    title: "公式No.10 同時点滅確認表示灯",
    theme: `${sourceNote}。確認表示灯（パイロットランプ）は同時点滅。`,
    points: ["電源: 1φ2W 100V", "電線: VVF 2.0-2C", "器具: B、引掛シーリングローゼット、ランプレセプタクル、確認表示灯、スイッチ"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 105, y: 205 },
      { id: "b", label: "B", type: "breaker", variant: "circuit_breaker", x: 210, y: 205 },
      { id: "j", label: "接続点", type: "connector", x: 365, y: 205 },
      { id: "c", label: "引掛 イ", type: "lamp", variant: "ceiling_connector", x: 365, y: 90 },
      { id: "r", label: "R イ", type: "lamp", variant: "lamp_receptacle", x: 585, y: 205 },
      { id: "pl", label: "PL 同時", type: "pilot", variant: "pilot_lamp", x: 365, y: 330 },
      { id: "sw", label: "スイッチ イ", type: "switch", variant: "single_pole_switch", x: 430, y: 330 },
    ],
    connections: [
      { from: "p", to: "b", color: "black" },
      { from: "b", to: "j", color: "black", label: "VVF 2.0-2C", cable: hozanCable("10-vvf-3", 150) },
      { from: "j", to: "c", color: "black", label: "イ", cable: hozanCable("10-vvf-1", 150) },
      { from: "j", to: "r", color: "black", label: "イ", cable: hozanCable("10-vvf-1", 150) },
      { from: "j", to: "pl", color: "black", label: "同時点滅", cable: hozanCable("10-vvf-2", 150) },
      { from: "pl", to: "sw", color: "black", label: "イ" },
    ],
  },
  {
    no: 11,
    title: "公式No.11 金属管工事",
    theme: `${sourceNote}。IV 1.6（E19）を含む金属管工事の回路。`,
    points: ["電源: 1φ2W 100V", "電線: VVF 2.0-2C、IV 1.6（E19）", "器具: ランプレセプタクル、引掛シーリングローゼット、スイッチ、アウトレットボックス"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 85, y: 160 },
      { id: "box", label: "アウトレットボックス", type: "box", x: 285, y: 160 },
      { id: "c", label: "引掛 イ", type: "lamp", variant: "ceiling_connector", x: 560, y: 160 },
      { id: "r", label: "R ロ", type: "lamp", variant: "lamp_receptacle", x: 170, y: 300 },
      { id: "sw", label: "スイッチ イ", type: "switch", variant: "single_pole_switch", x: 285, y: 325 },
      { id: "load", label: "器具 ロ", type: "switch", variant: "single_pole_switch", x: 435, y: 265 },
    ],
    connections: [
      { from: "p", to: "box", color: "black", label: "VVF 2.0-2C", cable: hozanCable("11-vvf-2", 150) },
      { from: "box", to: "c", color: "black", label: "イ", cable: hozanCable("11-vvf-1", 150) },
      { from: "box", to: "r", color: "black", label: "ロ", cable: hozanCable("11-vvf-1", 150) },
      { id: "11-e19-black", from: "box", to: "sw", color: "black", label: "IV 1.6（E19）", cable: hozanCable("11-iv-1", 250, { lengthMm: 550 }) },
      { id: "11-e19-white", from: "box", to: "sw", color: "white", cable: hozanCable("11-iv-2", 250, { lengthMm: 450 }) },
      { id: "11-e19-red", from: "box", to: "sw", color: "red", cable: hozanCable("11-iv-3", 250, { lengthMm: 450 }) },
      { from: "box", to: "load", color: "black", label: "ロ", cable: hozanCable("11-vvf-1", 250) },
    ],
  },
  {
    no: 12,
    title: "公式No.12 PF管工事",
    theme: `${sourceNote}。IV 1.6（PF16）を含むPF管工事の回路。`,
    points: ["電源: 1φ2W 100V", "電線: VVF 2.0-2C、IV 1.6（PF16）", "器具: ランプレセプタクル、引掛シーリングローゼット、スイッチ、アウトレットボックス"],
    devices: [
      { id: "r", label: "R ロ", type: "lamp", variant: "lamp_receptacle", x: 165, y: 96 },
      { id: "j1", label: "接続点", type: "connector", x: 165, y: 205 },
      { id: "c1", label: "引掛 イ", type: "lamp", variant: "ceiling_connector", x: 165, y: 330 },
      { id: "p", label: "電源", type: "power", x: 375, y: 96 },
      { id: "box", label: "アウトレットボックス", type: "box", x: 375, y: 205 },
      { id: "sw", label: "スイッチ イ", type: "switch", variant: "single_pole_switch", x: 375, y: 330 },
      { id: "c2", label: "引掛 ロ", type: "lamp", variant: "ceiling_connector", x: 585, y: 205 },
    ],
    connections: [
      { from: "r", to: "j1", color: "black", label: "ロ", cable: hozanCable("12-vvf-1", 150) },
      { from: "j1", to: "c1", color: "black", label: "イ", cable: hozanCable("12-vvf-1", 150) },
      { from: "j1", to: "box", color: "black", cable: hozanCable("12-vvf-2", 150) },
      { from: "p", to: "box", color: "black", label: "VVF 2.0-2C", cable: hozanCable("12-vvf-3", 150) },
      { from: "box", to: "sw", color: "black", label: "イ", cable: hozanCable("12-vvf-1", 150) },
      { id: "12-pf16-black", from: "box", to: "c2", color: "black", label: "IV 1.6（PF16） ロ", cable: hozanCable("12-iv-1", 200, { lengthMm: 500 }) },
      { id: "12-pf16-white", from: "box", to: "c2", color: "white", cable: hozanCable("12-iv-2", 200, { lengthMm: 400 }) },
      { id: "12-pf16-red", from: "box", to: "c2", color: "red", cable: hozanCable("12-iv-3", 200, { lengthMm: 400 }) },
    ],
  },
  {
    no: 13,
    title: "公式No.13 VVR・自動点滅器・接地",
    theme: `${sourceNote}。VVR 1.6-2C、自動点滅器、接地を含む回路。`,
    points: ["電源: 1φ2W 100V", "電線: VVF 2.0-2C、VVR 1.6-2C、E1.6", "器具: ランプレセプタクル、自動点滅器、接地極付器具"],
    devices: [
      { id: "p", label: "電源", type: "power", x: 90, y: 105 },
      { id: "j1", label: "接続点", type: "connector", x: 90, y: 240 },
      { id: "sw", label: "スイッチ イ", type: "switch", variant: "single_pole_switch", x: 90, y: 335 },
      { id: "j2", label: "接続点", type: "connector", x: 320, y: 240 },
      { id: "r", label: "R イ", type: "lamp", variant: "lamp_receptacle", x: 320, y: 105 },
      { id: "e", label: "接地極付 E", type: "grounded_receptacle", variant: "grounded_receptacle", x: 320, y: 335 },
      { id: "a", label: "A（3A）ロ", type: "terminal", variant: "automatic_switch", x: 560, y: 240 },
      { id: "ed", label: "ED", type: "terminal", variant: "earth_terminal", x: 420, y: 350 },
      { id: "load", label: "器具 ロ", type: "lamp", variant: "load_device", x: 590, y: 330 },
    ],
    connections: [
      { from: "p", to: "j1", color: "black", label: "VVF 2.0-2C", cable: hozanCable("13-vvf-3", 150) },
      { from: "j1", to: "sw", color: "black", label: "イ", cable: hozanCable("13-vvf-1", 150) },
      { from: "j1", to: "j2", color: "black", cable: hozanCable("13-vvf-2", 150) },
      { from: "j2", to: "r", color: "black", label: "イ", cable: hozanCable("13-vvf-1", 150) },
      { from: "j2", to: "e", color: "black", label: "E", cable: hozanCable("13-vvf-1", 150) },
      { from: "e", to: "ed", color: "green", label: "E1.6", cable: hozanCable("13-iv", 100, { lengthMm: 150 }) },
      { from: "j2", to: "a", color: "black", label: "A（3A）", cable: hozanCable("13-vvf-1", 200) },
      { from: "a", to: "load", color: "black", label: "VVR 1.6-2C ロ", cable: hozanCable("13-vvr", 200, { lengthMm: 250 }) },
    ],
  },
];
