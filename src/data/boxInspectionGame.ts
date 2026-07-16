import { candidateDiagrams, type CandidateDevice, type CandidateDiagram } from "./candidateDiagrams";
import {
  resolveCableRunSpecification,
  type CableRunSpecification,
} from "./cableSpecifications";
import { getDeviceSpecification } from "./deviceSpecifications";
import { problems, type DefectType, type Problem } from "./problems";

export type BoxType = "joint" | "outlet";
export type ConnectionMethod = "ring_sleeve" | "push_connector" | "outlet_box" | "metal_conduit" | "pf_conduit";
export type WireColor = "black" | "white" | "red" | "green" | "blue";

export type ConnectionSpec = {
  id: string;
  method: ConnectionMethod;
  wireCount: number;
  wireSizes: Array<1.6 | 2.0>;
  wireColors: WireColor[];
  sourceCables: CableRunSpecification[];
  sleeveSize?: "small" | "medium";
  mark?: "○" | "小" | "中";
  portCount?: number;
};

export type BoxInspectionPart = {
  id: string;
  boxId: string;
  title: string;
  location: string;
  defectType: DefectType;
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
  connection: ConnectionSpec;
};

export type InspectionBox = {
  id: string;
  sourceDeviceId: string;
  label: string;
  location: string;
  boxType: BoxType;
  x: number;
  y: number;
  cableCount: number;
  parts: BoxInspectionPart[];
};

export type DirectInspectionPart = Omit<BoxInspectionPart, "connection"> & {
  sourceDeviceId: string;
  deviceType: CandidateDevice["type"];
  deviceVariant?: CandidateDevice["variant"];
  x: number;
  y: number;
};

export type BoxInspectionRound = {
  id: string;
  title: string;
  candidate: CandidateDiagram;
  boxes: InspectionBox[];
  directParts: DirectInspectionPart[];
  parts: Array<BoxInspectionPart | DirectInspectionPart>;
  defectCount: number;
};

type Template = {
  title: string;
  method: ConnectionMethod;
  defectType: DefectType;
  question: string;
  choices: string[];
  defectAnswer: string;
  normalExplanation: string;
  defectExplanation: string;
};

const templates: Template[] = [
  {
    title: "リングスリーブ",
    method: "ring_sleeve",
    defectType: "ring_sleeve_wrong_mark",
    question: "リングスリーブの圧着刻印を判定してください。",
    choices: ["欠陥なし", "リングスリーブの刻印が不適合", "心線の差し込み不足", "絶縁被覆をかみ込んでいる"],
    defectAnswer: "リングスリーブの刻印が不適合",
    normalExplanation: "電線の太さと本数に合う刻印で圧着されています。",
    defectExplanation: "接続する電線の太さと本数に対して刻印が合っていません。",
  },
  {
    title: "リングスリーブ",
    method: "ring_sleeve",
    defectType: "ring_sleeve_wrong_size",
    question: "リングスリーブのサイズを判定してください。",
    choices: ["欠陥なし", "リングスリーブのサイズが不適合", "心線の差し込み不足", "絶縁被覆をかみ込んでいる"],
    defectAnswer: "リングスリーブのサイズが不適合",
    normalExplanation: "電線の太さと本数に合うリングスリーブを使用しています。",
    defectExplanation: "接続する電線の太さと本数に対してリングスリーブのサイズが合っていません。",
  },
  {
    title: "差し込みコネクタ",
    method: "push_connector",
    defectType: "push_connector_insufficient_insert",
    question: "差し込みコネクタの心線差し込み状態を判定してください。",
    choices: ["欠陥なし", "心線の差し込み不足", "接続本数に合わないコネクタを使用している", "絶縁被覆をかみ込んでいる"],
    defectAnswer: "心線の差し込み不足",
    normalExplanation: "すべての心線が確認位置まで確実に差し込まれています。",
    defectExplanation: "心線の一部が確認位置まで届いていません。",
  },
  {
    title: "差し込みコネクタ",
    method: "push_connector",
    defectType: "push_connector_wrong_wire_count",
    question: "差し込みコネクタの極数を判定してください。",
    choices: ["欠陥なし", "接続本数に合わないコネクタを使用している", "心線の差し込み不足", "リングスリーブのサイズが不適合"],
    defectAnswer: "接続本数に合わないコネクタを使用している",
    normalExplanation: "接続する心線の本数に合う極数のコネクタを使用しています。",
    defectExplanation: "接続する心線の本数とコネクタの極数が合っていません。",
  },
  {
    title: "アウトレットボックス",
    method: "outlet_box",
    defectType: "outlet_box_wrong_hole",
    question: "ケーブルを通す穴の位置を判定してください。",
    choices: ["欠陥なし", "指定と異なる穴へケーブルを通している", "必要なゴムブッシングがない", "穴径とゴムブッシングのサイズが違う"],
    defectAnswer: "指定と異なる穴へケーブルを通している",
    normalExplanation: "指定された穴に、適合するゴムブッシングを介してケーブルを通しています。",
    defectExplanation: "施工条件で指定された穴とは異なる穴へケーブルを通しています。",
  },
  {
    title: "ゴムブッシング",
    method: "outlet_box",
    defectType: "rubber_bushing_missing",
    question: "ケーブル通過穴の保護状態を判定してください。",
    choices: ["欠陥なし", "必要なゴムブッシングがない", "指定と異なる穴へケーブルを通している", "穴径とゴムブッシングのサイズが違う"],
    defectAnswer: "必要なゴムブッシングがない",
    normalExplanation: "ケーブルを通す穴に適合するゴムブッシングが取り付けられています。",
    defectExplanation: "ケーブルを通す穴に必要なゴムブッシングがありません。",
  },
  {
    title: "ゴムブッシング",
    method: "outlet_box",
    defectType: "rubber_bushing_wrong_size",
    question: "ボックス穴とゴムブッシングの組合せを判定してください。",
    choices: ["欠陥なし", "穴径とゴムブッシングのサイズが違う", "必要なゴムブッシングがない", "指定と異なる穴へケーブルを通している"],
    defectAnswer: "穴径とゴムブッシングのサイズが違う",
    normalExplanation: "穴径に合うゴムブッシングが取り付けられています。",
    defectExplanation: "19mm用と25mm用の組合せが穴径に合っていません。",
  },
  {
    title: "ねじなし電線管 E19",
    method: "metal_conduit",
    defectType: "metal_conduit_insufficient_insert",
    question: "電線管とボックスコネクタの接続状態を判定してください。",
    choices: ["欠陥なし", "電線管の挿入が不足している", "絶縁ブッシングがない", "ロックナットがない"],
    defectAnswer: "電線管の挿入が不足している",
    normalExplanation: "電線管はボックスコネクタへ十分に挿入され、固定されています。",
    defectExplanation: "電線管がボックスコネクタへ十分に挿入されていません。",
  },
  {
    title: "絶縁ブッシング E19",
    method: "metal_conduit",
    defectType: "metal_conduit_missing_insulation_bushing",
    question: "金属管端の保護状態を判定してください。",
    choices: ["欠陥なし", "絶縁ブッシングがない", "ロックナットがない", "電線管の挿入が不足している"],
    defectAnswer: "絶縁ブッシングがない",
    normalExplanation: "金属管端に絶縁ブッシングが取り付けられています。",
    defectExplanation: "電線を保護する絶縁ブッシングが金属管端にありません。",
  },
  {
    title: "ねじなし電線管E19用ボックスコネクタ",
    method: "metal_conduit",
    defectType: "metal_conduit_missing_locknut",
    question: "ボックスコネクタの固定状態を判定してください。",
    choices: ["欠陥なし", "ロックナットがない", "絶縁ブッシングがない", "電線管の挿入が不足している"],
    defectAnswer: "ロックナットがない",
    normalExplanation: "ボックスコネクタはロックナットで確実に固定されています。",
    defectExplanation: "ボックス内側に固定用のロックナットがありません。",
  },
  {
    title: "合成樹脂製可とう電線管 PF16",
    method: "pf_conduit",
    defectType: "pf_conduit_insufficient_insert",
    question: "PF管とボックスコネクタの接続状態を判定してください。",
    choices: ["欠陥なし", "PF管の挿入が不足している", "ロックナットがない", "金属管用コネクタを使用している"],
    defectAnswer: "PF管の挿入が不足している",
    normalExplanation: "PF管は専用コネクタへ十分に挿入され、固定されています。",
    defectExplanation: "PF管が専用コネクタへ十分に挿入されていません。",
  },
  {
    title: "合成樹脂製可とう電線管用ボックスコネクタ",
    method: "pf_conduit",
    defectType: "pf_conduit_missing_locknut",
    question: "PF管用ボックスコネクタの固定状態を判定してください。",
    choices: ["欠陥なし", "ロックナットがない", "PF管の挿入が不足している", "絶縁ブッシングがない"],
    defectAnswer: "ロックナットがない",
    normalExplanation: "PF管用ボックスコネクタはロックナットで確実に固定されています。",
    defectExplanation: "ボックス内側に固定用のロックナットがありません。",
  },
];

export function createBoxInspectionRound(): BoxInspectionRound {
  const candidate = randomItem(candidateDiagrams);
  const devices = candidate.devices.filter((device) => device.type === "connector" || device.type === "box");
  const sources = devices.length ? devices : candidate.devices.filter((device) => device.type !== "power").slice(0, 1);
  const plannedBoxes = sources.map((device, index) => ({
    device,
    index,
    specs: [...createConnectionSpecs(candidate, device, index), ...createInfrastructureSpecs(candidate, device)],
  }));
  const directDevices = candidate.devices.filter(isDirectInspectionDevice);
  const boxPartKeys = plannedBoxes.flatMap(({ device, specs }) =>
    specs.map((spec) => "box:" + device.id + "-" + spec.id),
  );
  const directDefectKeys = directDevices
    .filter((device) => getDirectDefectProblems(device).length > 0)
    .map((device) => "device:" + device.id);
  const defectTargets = [...boxPartKeys, ...directDefectKeys];
  const defectCount = Math.min(randomInt(2, 3), defectTargets.length);
  const defectIds = new Set(shuffle(defectTargets).slice(0, defectCount));
  const boxes = plannedBoxes.map(({ device, index, specs }) => createBox(candidate, device, index, specs, defectIds));
  const directParts = directDevices.map((device) => createDirectPart(device, defectIds.has("device:" + device.id)));

  return {
    id: Date.now() + "-" + Math.random().toString(36).slice(2),
    title: "候補問題No." + candidate.no + " 施工チェック",
    candidate,
    boxes,
    directParts,
    parts: [...boxes.flatMap((box) => box.parts), ...directParts],
    defectCount,
  };
}

function createConnectionSpecs(candidate: CandidateDiagram, device: CandidateDevice, boxIndex: number): ConnectionSpec[] {
  const incident = candidate.connections.filter((connection) => connection.from === device.id || connection.to === device.id);
  const sourceCables = incident.map((connection) =>
    resolveCableRunSpecification(candidate, connection, candidate.connections.indexOf(connection)),
  );
  const connectionCount = clamp(incident.length, 2, 5);
  const incidentColors = incident.map((connection) => connection.color);
  const functionalColors: WireColor[] = ["white", "black", "red", "green", "blue"];

  return Array.from({ length: connectionCount }, (_, index) => {
    const method: ConnectionMethod = (candidate.no + boxIndex + index) % 2 === 0 ? "ring_sleeve" : "push_connector";
    const wireCount = clamp(incident.length - (index % 2), 2, 4);
    const wireSizes = Array.from({ length: wireCount }, (_, wireIndex): 1.6 | 2.0 =>
      sourceCables[(index + wireIndex) % sourceCables.length]?.conductorDiameterMm ?? 1.6,
    );
    const wireColors = Array.from({ length: wireCount }, (_, wireIndex) =>
      incidentColors[wireIndex] ?? functionalColors[(index + wireIndex) % functionalColors.length],
    );
    const ringRating = getRingRating(wireSizes);

    return {
      id: "connection-" + (index + 1),
      method,
      wireCount,
      wireSizes,
      wireColors,
      sourceCables,
      sleeveSize: method === "ring_sleeve" ? ringRating.size : undefined,
      mark: method === "ring_sleeve" ? ringRating.mark : undefined,
      portCount: method === "push_connector" ? wireCount : undefined,
    };
  });
}

function createInfrastructureSpecs(candidate: CandidateDiagram, device: CandidateDevice): ConnectionSpec[] {
  if (device.type !== "box" || ![7, 8, 11, 12].includes(candidate.no)) {
    return [];
  }

  const methods: ConnectionMethod[] = ["outlet_box"];
  if (candidate.no === 11) methods.push("metal_conduit");
  if (candidate.no === 12) methods.push("pf_conduit");

  return methods.map((method) => ({
    id: method,
    method,
    wireCount: 0,
    wireSizes: [],
    wireColors: [],
    sourceCables: [],
  }));
}
function getRingRating(wireSizes: Array<1.6 | 2.0>): { size: "small" | "medium"; mark: "○" | "小" | "中" } {
  const equivalent = wireSizes.reduce((total, size) => total + (size === 2.0 ? 2 : 1), 0);
  if (wireSizes.length === 2 && wireSizes.every((size) => size === 1.6)) {
    return { size: "small", mark: "○" };
  }
  if (equivalent <= 5) {
    return { size: "small", mark: "小" };
  }
  return { size: "medium", mark: "中" };
}

function createBox(
  candidate: CandidateDiagram,
  device: CandidateDevice,
  index: number,
  specs: ConnectionSpec[],
  defectIds: Set<string>,
): InspectionBox {
  const boxType: BoxType = [7, 8, 11, 12].includes(candidate.no) && device.type === "box"
    ? "outlet"
    : device.type === "box" ? "joint" : "outlet";
  const label = boxType === "joint" ? "ジョイントボックス" : "アウトレットボックス";
  const id = "candidate-" + candidate.no + "-" + device.id;

  return {
    id,
    sourceDeviceId: device.id,
    label: label + " " + (index + 1),
    location: "候補問題No." + candidate.no + "「" + device.label + "」付近",
    boxType,
    x: device.x,
    y: device.y,
    cableCount: candidate.connections.filter((connection) => connection.from === device.id || connection.to === device.id).length,
    parts: specs.map((spec, partIndex) => {
      const template = randomItem(templates.filter((item) => item.method === spec.method));
      return toPart(template, id, label, spec, partIndex, defectIds.has("box:" + device.id + "-" + spec.id));
    }),
  };
}

function toPart(
  template: Template,
  boxId: string,
  label: string,
  connection: ConnectionSpec,
  index: number,
  hasDefect: boolean,
): BoxInspectionPart {
  const conductorSummary = summarizeConductors(connection);
  return {
    id: boxId + "-" + connection.id,
    boxId,
    title: template.title + " " + (index + 1) + "（" + conductorSummary + "）",
    location: label + "内",
    defectType: hasDefect ? template.defectType : "none",
    question: conductorSummary + "の接続です。" + template.question,
    choices: template.choices,
    answer: hasDefect ? template.defectAnswer : "欠陥なし",
    explanation: (hasDefect ? template.defectExplanation : template.normalExplanation) + " 接続条件: " + conductorSummary + "。",
    connection,
  };
}

function summarizeConductors(connection: ConnectionSpec) {
  const sizes = connection.wireSizes.map((size) => size.toFixed(1) + "mm").join("・");
  if (connection.method === "ring_sleeve") {
    return connection.wireCount + "芯 " + sizes + " / " + (connection.sleeveSize === "medium" ? "中スリーブ" : "小スリーブ") + "・刻印" + connection.mark;
  }
  if (connection.method === "push_connector") {
    return connection.wireCount + "芯 " + sizes + " / " + connection.portCount + "本用";
  }
  if (connection.method === "metal_conduit") return "金属管 E19・付属品";
  if (connection.method === "pf_conduit") return "PF管 PF16・付属品";
  return "アウトレットボックス・ゴムブッシング";
}

function isDirectInspectionDevice(device: CandidateDevice) {
  return device.type !== "power"
    && device.type !== "connector"
    && device.type !== "box"
    && getDeviceSpecification(device.variant)?.inspectionSelectable === true;
}

function getDirectDefectProblems(device: CandidateDevice): Problem[] {
  const idsByVariant: Partial<Record<NonNullable<CandidateDevice["variant"]>, string[]>> = {
    lamp_receptacle: ["lamp-loop-reverse", "lamp-polarity"],
    ceiling_connector: ["ceiling-connector-polarity"],
    exposed_receptacle: ["exposed-receptacle-sheath", "receptacle-polarity"],
    grounded_receptacle: ["receptacle-ground", "receptacle-polarity"],
    grounded_20a_receptacle: ["receptacle-ground", "receptacle-polarity"],
    eet_receptacle: ["receptacle-ground", "receptacle-polarity"],
    circuit_breaker: ["breaker-line-load-reverse"],
    earth_leakage_breaker: ["breaker-line-load-reverse"],
    terminal_block: ["terminal-block-wrong-terminal"],
    timer_switch: ["terminal-block-wrong-terminal"],
    automatic_switch: ["terminal-block-wrong-terminal"],
    single_pole_switch: ["switch-wrong-terminal"],
    three_way_switch: ["switch-wrong-terminal"],
    four_way_switch: ["switch-wrong-terminal"],
    switch_group: ["switch-wrong-terminal"],
  };
  const ids = device.variant ? idsByVariant[device.variant] ?? [] : [];
  return problems.filter((problem) => ids.includes(problem.id));
}

function createDirectPart(device: CandidateDevice, hasDefect: boolean): DirectInspectionPart {
  const defectProblem = hasDefect ? randomItem(getDirectDefectProblems(device)) : undefined;
  const deviceName = getInspectionDeviceName(device);
  return {
    id: "device-" + device.id,
    boxId: "",
    sourceDeviceId: device.id,
    deviceType: device.type,
    deviceVariant: device.variant,
    title: deviceName,
    location: "複線図上の" + deviceName + "（表示記号「" + device.label + "」）",
    defectType: defectProblem?.defectType ?? "none",
    question: defectProblem?.question ?? deviceName + "の施工状態を判定してください。",
    choices: defectProblem?.choices ?? ["欠陥なし", "接続不良", "取付不良", "極性誤り"],
    answer: defectProblem?.answer ?? "欠陥なし",
    explanation: defectProblem?.explanation
      ?? "この器具は正常に施工されています。接続部の欠陥は、ボックス内配線図で判定します。",
    x: device.x,
    y: device.y,
  };
}

function getInspectionDeviceName(device: CandidateDevice) {
  const names: Partial<Record<NonNullable<CandidateDevice["variant"]>, string>> = {
    lamp_receptacle: "ランプレセプタクル",
    ceiling_connector: "引掛シーリング",
    pilot_lamp: "パイロットランプ",
    single_pole_switch: "単極スイッチ",
    three_way_switch: "3路スイッチ",
    four_way_switch: "4路スイッチ",
    switch_group: "連用スイッチ",
    exposed_receptacle: "露出形コンセント",
    grounded_receptacle: "接地極付コンセント",
    grounded_20a_receptacle: "接地極付20A 250Vコンセント",
    eet_receptacle: "接地極・接地端子付コンセント",
    circuit_breaker: "配線用遮断器",
    earth_leakage_breaker: "漏電遮断器",
    timer_switch: "タイムスイッチ",
    automatic_switch: "自動点滅器",
    earth_terminal: "接地端子",
    terminal_block: "端子台",
    motor_terminal: "三相誘導電動機",
    load_device: "負荷器具",
    omitted_work: "施工省略箇所",
  };
  return device.variant ? names[device.variant] ?? device.label : device.label;
}
function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
