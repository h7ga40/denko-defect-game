import type { DeviceVariant } from "./candidateDiagrams";

export type TerminalConnectionMethod = "screw" | "push_in" | "terminal_block" | "none";
export type TerminalRole = "line" | "neutral" | "load" | "traveler" | "ground" | "control" | "other";
export type TerminalGroup = { id: string; label: string; role: TerminalRole; insertionHoles: number };
export type DeviceSpecification = {
  name: string;
  connectionMethod: TerminalConnectionMethod;
  terminals: TerminalGroup[];
  requiresWiring: boolean;
  inspectionSelectable: boolean;
};

const terminal = (id: string, label: string, role: TerminalRole, insertionHoles = 1): TerminalGroup => ({
  id, label, role, insertionHoles,
});
const wired = (
  name: string,
  connectionMethod: TerminalConnectionMethod,
  terminals: TerminalGroup[],
  inspectionSelectable = true,
): DeviceSpecification => ({ name, connectionMethod, terminals, requiresWiring: true, inspectionSelectable });
const unwired = (name: string): DeviceSpecification => ({
  name, connectionMethod: "none", terminals: [], requiresWiring: false, inspectionSelectable: false,
});
const sixPoleTerminalBlock = (name: string) => wired(
  name,
  "terminal_block",
  Array.from({ length: 6 }, (_, index) => terminal(String(index + 1), String(index + 1), "control")),
);

export const deviceSpecifications: Record<DeviceVariant, DeviceSpecification> = {
  lamp_receptacle: wired("ランプレセプタクル", "screw", [
    terminal("center", "中心接点", "line"),
    terminal("shell", "受金", "neutral"),
  ]),
  ceiling_connector: wired("引掛シーリングローゼット", "push_in", [
    terminal("line", "非接地側", "line"),
    terminal("neutral", "接地側", "neutral"),
  ]),
  pilot_lamp: wired("埋込連用パイロットランプ", "push_in", [
    terminal("line", "非接地側", "line", 2),
    terminal("neutral", "接地側", "neutral", 2),
  ]),
  single_pole_switch: wired("埋込連用タンブラスイッチ（片切）", "push_in", [
    terminal("0", "0", "line", 2),
    terminal("1", "1", "load", 2),
  ]),
  three_way_switch: wired("埋込連用タンブラスイッチ（3路）", "push_in", [
    terminal("0", "0", "line", 2),
    terminal("1", "1", "traveler", 2),
    terminal("3", "3", "traveler", 2),
  ]),
  four_way_switch: wired("埋込連用タンブラスイッチ（4路）", "push_in", [
    terminal("1", "1", "traveler", 2),
    terminal("2", "2", "traveler", 2),
    terminal("3", "3", "traveler", 2),
    terminal("4", "4", "traveler", 2),
  ]),
  switch_group: wired("埋込連用タンブラスイッチ", "push_in", [
    terminal("i-line", "イ電源", "line", 2),
    terminal("i-load", "イ返り", "load", 2),
    terminal("ro-line", "ロ電源", "line", 2),
    terminal("ro-load", "ロ返り", "load", 2),
    terminal("ha-line", "ハ電源", "line", 2),
    terminal("ha-load", "ハ返り", "load", 2),
  ]),
  exposed_receptacle: wired("露出形コンセント", "screw", [
    terminal("line", "非接地側", "line"),
    terminal("neutral", "接地側", "neutral"),
  ]),
  grounded_receptacle: wired("埋込コンセント（接地極付）", "push_in", [
    terminal("line", "非接地側", "line", 2),
    terminal("neutral", "接地側", "neutral", 2),
    terminal("ground", "接地極", "ground"),
  ]),
  grounded_20a_receptacle: wired("埋込コンセント（20A 250V 接地極付）", "push_in", [
    terminal("line-1", "極1", "line", 2),
    terminal("line-2", "極2", "line", 2),
    terminal("ground", "接地極", "ground"),
  ]),
  eet_receptacle: wired("埋込コンセント（接地極付接地端子付）", "push_in", [
    terminal("line", "非接地側", "line", 2),
    terminal("neutral", "接地側", "neutral", 2),
    terminal("earth", "接地極・接地端子", "ground"),
  ]),
  circuit_breaker: wired("配線用遮断器", "screw", [
    terminal("line-l", "電源側L", "line"),
    terminal("line-n", "電源側N", "neutral"),
    terminal("load-l", "負荷側L", "load"),
    terminal("load-n", "負荷側N", "load"),
  ]),
  earth_leakage_breaker: wired("漏電遮断器", "screw", [
    terminal("line-l", "電源側L", "line"),
    terminal("line-n", "電源側N", "neutral"),
    terminal("load-l", "負荷側L", "load"),
    terminal("load-n", "負荷側N", "load"),
  ]),
  timer_switch: sixPoleTerminalBlock("タイムスイッチ（端子台代用）"),
  automatic_switch: sixPoleTerminalBlock("自動点滅器（端子台代用）"),
  earth_terminal: wired("接地端子", "screw", [terminal("earth", "E", "ground")], false),
  terminal_block: sixPoleTerminalBlock("6P端子台"),
  motor_terminal: unwired("三相誘導電動機（施工省略）"),
  load_device: unwired("負荷器具（施工省略）"),
  omitted_work: unwired("施工省略箇所"),
};

export function getDeviceSpecification(variant?: DeviceVariant) {
  return variant ? deviceSpecifications[variant] : undefined;
}
export function getTerminalCount(variant?: DeviceVariant) {
  return getDeviceSpecification(variant)?.terminals.length ?? 0;
}
export function getInsertionHoleCount(variant?: DeviceVariant) {
  return getDeviceSpecification(variant)?.terminals.reduce((sum, item) => sum + item.insertionHoles, 0) ?? 0;
}
