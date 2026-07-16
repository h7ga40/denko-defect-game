import type { CandidateConnection, CandidateDevice, CandidateDiagram } from "./candidateDiagrams";

export type CableType = "VVF" | "VVR" | "EM-EEF" | "IV";
export type CableCoreColor = "black" | "white" | "red" | "green" | "blue";
export type CableMeasurementSource = "specified" | "inferred";

export type CableEndPreparation = {
  endpointId: string;
  sheathStripLengthMm: number | null;
  insulationStripLengthsMm: Array<number | null>;
};

export type CableRunSpecification = {
  id: string;
  cableType: CableType;
  hasSheath: boolean;
  conductorDiameterMm: 1.6 | 2.0;
  coreCount: 1 | 2 | 3 | 4;
  coreColors: CableCoreColor[];
  lengthMm: number | null;
  fromEnd: CableEndPreparation;
  toEnd: CableEndPreparation;
  measurementSource: CableMeasurementSource;
};

export type CableStockSpecification = {
  id: string;
  cableType: CableType;
  hasSheath: boolean;
  conductorDiameterMm: 1.6 | 2.0;
  coreCount: 1 | 2 | 3 | 4;
  coreColors: CableCoreColor[];
  suppliedLengthMm: number;
  quantity: number;
};

export type CableEndPreparationOverride = Partial<
  Pick<CableEndPreparation, "sheathStripLengthMm" | "insulationStripLengthsMm">
>;

export type CableRunOverride = Partial<
  Pick<
    CableRunSpecification,
    "cableType" | "conductorDiameterMm" | "coreCount" | "coreColors" | "lengthMm"
  >
> & {
  fromEnd?: CableEndPreparationOverride;
  toEnd?: CableEndPreparationOverride;
};

const defaultCoreColors: Record<CableRunSpecification["coreCount"], CableCoreColor[]> = {
  1: ["black"],
  2: ["black", "white"],
  3: ["black", "white", "red"],
  4: ["black", "white", "red", "blue"],
};

export function resolveCableRunSpecification(
  diagram: CandidateDiagram,
  connection: CandidateConnection,
  index: number,
): CableRunSpecification {
  const fromDevice = diagram.devices.find((device) => device.id === connection.from);
  const toDevice = diagram.devices.find((device) => device.id === connection.to);
  const inferred = inferCableProperties(connection, fromDevice, toDevice);
  const override = connection.cable;
  const coreCount = override?.coreCount ?? inferred.coreCount;
  const cableType = override?.cableType ?? inferred.cableType;

  return {
    id: `candidate-${diagram.no}-cable-${index + 1}`,
    cableType,
    hasSheath: cableType !== "IV",
    conductorDiameterMm: override?.conductorDiameterMm ?? inferred.conductorDiameterMm,
    coreCount,
    coreColors: override?.coreColors ?? inferCoreColors(connection, cableType, coreCount),
    lengthMm: override?.lengthMm ?? null,
    fromEnd: {
      endpointId: connection.from,
      sheathStripLengthMm: override?.fromEnd?.sheathStripLengthMm ?? null,
      insulationStripLengthsMm: override?.fromEnd?.insulationStripLengthsMm
        ?? Array.from({ length: coreCount }, () => null),
    },
    toEnd: {
      endpointId: connection.to,
      sheathStripLengthMm: override?.toEnd?.sheathStripLengthMm ?? null,
      insulationStripLengthsMm: override?.toEnd?.insulationStripLengthsMm
        ?? Array.from({ length: coreCount }, () => null),
    },
    measurementSource: override ? "specified" : "inferred",
  };
}

export function getCandidateCableRuns(diagram: CandidateDiagram) {
  return diagram.connections.map((connection, index) =>
    resolveCableRunSpecification(diagram, connection, index),
  );
}

export function validateCableRunSpecification(cable: CableRunSpecification) {
  const errors: string[] = [];
  if (cable.coreColors.length !== cable.coreCount) {
    errors.push("芯数と芯線色の数が一致していません。");
  }
  if (cable.lengthMm !== null && cable.lengthMm <= 0) {
    errors.push("ケーブル区間長は0mmより大きい値が必要です。");
  }
  for (const [label, end] of [["from", cable.fromEnd], ["to", cable.toEnd]] as const) {
    if (end.sheathStripLengthMm !== null && end.sheathStripLengthMm < 0) {
      errors.push(`${label}側のシース剥ぎ長に負の値は指定できません。`);
    }
    if (end.insulationStripLengthsMm.length !== cable.coreCount) {
      errors.push(`${label}側の絶縁被覆ストリップ長の数が芯数と一致していません。`);
    }
    if (end.insulationStripLengthsMm.some((length) => length !== null && length < 0)) {
      errors.push(`${label}側の絶縁被覆ストリップ長に負の値は指定できません。`);
    }
    if (!cable.hasSheath && end.sheathStripLengthMm !== null) {
      errors.push(`${cable.cableType}にはシース剥ぎ長を指定できません。`);
    }
  }
  return errors;
}

export function formatCableStockLabel(stock: CableStockSpecification) {
  const colorLabel = stock.coreColors.length === 1
    ? ` ${formatColor(stock.coreColors[0])}`
    : isStandardCoreColorOrder(stock.coreColors) ? "" : `（${stock.coreColors.map(formatColor).join("・")}）`;
  const coreLabel = stock.coreCount === 1 ? "" : ` ${stock.coreCount}心`;
  const quantityLabel = stock.quantity > 1 ? ` ×${stock.quantity}` : "";
  return `${stock.cableType} ${stock.conductorDiameterMm.toFixed(1)}mm${coreLabel}${colorLabel} ${stock.suppliedLengthMm}mm${quantityLabel}`;
}

export function validateCableStockSpecification(stock: CableStockSpecification) {
  const errors: string[] = [];
  if (stock.coreColors.length !== stock.coreCount) {
    errors.push("支給ケーブルの芯数と芯線色の数が一致していません。");
  }
  if (stock.suppliedLengthMm <= 0) {
    errors.push("支給ケーブル長は0mmより大きい値が必要です。");
  }
  if (stock.quantity <= 0 || !Number.isInteger(stock.quantity)) {
    errors.push("支給数量は1以上の整数が必要です。");
  }
  if (stock.hasSheath !== (stock.cableType !== "IV")) {
    errors.push("ケーブル種別とシース有無が一致していません。");
  }
  return errors;
}

function inferCableProperties(
  connection: CandidateConnection,
  fromDevice?: CandidateDevice,
  toDevice?: CandidateDevice,
): Pick<CableRunSpecification, "cableType" | "conductorDiameterMm" | "coreCount"> {
  const explicit = connection.label?.match(/(EM-EEF|VVF|VVR)\s*(1\.6|2\.0)(?:mm)?-(2|3|4)C/i);
  if (explicit) {
    return {
      cableType: explicit[1].toUpperCase() as CableType,
      conductorDiameterMm: Number(explicit[2]) as 1.6 | 2.0,
      coreCount: Number(explicit[3]) as 2 | 3 | 4,
    };
  }

  if (/E1\.6|IV\s*1\.6/i.test(connection.label ?? "")) {
    return { cableType: "IV", conductorDiameterMm: 1.6, coreCount: 1 };
  }

  const cableType: CableType = /EM-EEF/i.test(connection.label ?? "")
    ? "EM-EEF"
    : /VVR/i.test(connection.label ?? "") ? "VVR" : "VVF";
  const conductorDiameterMm: 1.6 | 2.0 = /2\.0/.test(connection.label ?? "") ? 2.0 : 1.6;
  const coreCount = inferCoreCount(connection, fromDevice, toDevice);
  return { cableType, conductorDiameterMm, coreCount };
}

function inferCoreCount(
  connection: CandidateConnection,
  fromDevice?: CandidateDevice,
  toDevice?: CandidateDevice,
): CableRunSpecification["coreCount"] {
  if (/3路|イ3|イ4|3A/.test(connection.label ?? "")) return 3;
  const variants = [fromDevice?.variant, toDevice?.variant];
  if (variants.includes("three_way_switch") || variants.includes("four_way_switch")) return 3;
  return 2;
}

function inferCoreColors(
  connection: CandidateConnection,
  cableType: CableType,
  coreCount: CableRunSpecification["coreCount"],
) {
  if (cableType === "IV") {
    return [connection.color] as CableCoreColor[];
  }
  return [...defaultCoreColors[coreCount]];
}

function isStandardCoreColorOrder(colors: CableCoreColor[]) {
  return colors.every((color, index) => color === defaultCoreColors[colors.length as 1 | 2 | 3 | 4][index]);
}

function formatColor(color: CableCoreColor) {
  const labels: Record<CableCoreColor, string> = {
    black: "黒",
    white: "白",
    red: "赤",
    green: "緑",
    blue: "青",
  };
  return labels[color];
}
