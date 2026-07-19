import type {
  CableCoreColor,
  CableStockSpecification,
  CableType,
} from "./cableSpecifications";

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

export function getCandidateCableStocks(candidateNo: number) {
  return candidateCableStocks[candidateNo] ?? [];
}

export function getCandidateCableStock(candidateNo: number, stockId: string) {
  return getCandidateCableStocks(candidateNo).find((item) => item.id === stockId);
}
