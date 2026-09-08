import type { ConnectionSpec, WireColor } from "./boxInspectionGame";
import { getRingRating } from "./boxInspectionGame";
import type { DefectType } from "./problems";

export type ConnectionVisualSpec = Pick<ConnectionSpec, "method" | "wireColors"> & Partial<Pick<ConnectionSpec,
  "wireSizes" | "wireCount" | "sleeveSize" | "mark" | "portCount" | "conductors" | "looseConductors"
>>;

export function quizConnectionVisual(defectType: DefectType, method: ConnectionSpec["method"]): ConnectionVisualSpec {
  const wireSizes: Array<1.6 | 2.0> = defectType === "ring_sleeve_wrong_size" ? [2.0, 2.0, 1.6]
    : defectType === "push_connector_wrong_wire_count" ? [1.6, 1.6, 1.6, 1.6] : [1.6, 1.6, 1.6];
  const rating = getRingRating(wireSizes);
  return { method, wireSizes, wireCount: wireSizes.length, wireColors: (["black", "white", "red", "black"] as WireColor[]).slice(0, wireSizes.length), sleeveSize: rating.size, mark: rating.mark, portCount: wireSizes.length };
}

export function visualConductors(connection: ConnectionVisualSpec) {
  const connected = connection.conductors?.length ? connection.conductors.map(wire => ({
    color: wire.color, diameter: wire.conductorDiameterMm, label: wire.remoteLabel, loose: false,
  })) : connection.wireColors.map((color, index) => ({ color, diameter: connection.wireSizes?.[index] ?? 1.6, label: "", loose: false }));
  return [...connected, ...(connection.looseConductors ?? []).map(wire => ({ color: wire.color, diameter: wire.conductorDiameterMm, label: wire.remoteLabel, loose: true }))];
}

export const wirePaint: Record<WireColor, string> = { black: "#202629", white: "#fff", red: "#cb4052", green: "#208757", blue: "#3477b3" };
export function wireSummary(connection: ConnectionVisualSpec) {
  const wires = visualConductors(connection);
  return `${wires.length}本 / ` + [1.6, 2.0].flatMap(size => {
    const count = wires.filter(wire => wire.diameter === size).length;
    return count ? [`${size.toFixed(1)}mm × ${count}本`] : [];
  }).join("・");
}
