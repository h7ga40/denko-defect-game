import type { DeviceVariant } from "../../../data/candidateDiagrams";
import type { CableEntrySide } from "../../../data/boxInspectionGame";
import type { DefectType } from "../../../data/problems";
import type { InspectionViewpoint } from "../../../data/physicalInspection";
import { getDeviceSpecification } from "../../../data/deviceSpecifications";
import { DirectionalSheath, DirectionalWire } from "../DirectionalCable";

export function isEmbeddedInspectionVariant(variant?: DeviceVariant) {
  return variant === "single_pole_switch" || variant === "three_way_switch" || variant === "four_way_switch"
    || variant === "embedded_receptacle" || variant === "double_receptacle"
    || variant === "grounded_receptacle" || variant === "grounded_20a_receptacle" || variant === "eet_receptacle"
    || variant === "pilot_lamp";
}

export function EmbeddedDeviceDiagram({ variant = "single_pole_switch", title, defectType = "none", cableEntrySide = "left", viewpoint = "front", released = false }: {
  variant?: DeviceVariant;
  title?: string;
  defectType?: DefectType;
  cableEntrySide?: CableEntrySide;
  viewpoint?: InspectionViewpoint;
  released?: boolean;
}) {
  const specification = getDeviceSpecification(variant);
  const terminals = specification?.terminals ?? getDeviceSpecification("embedded_receptacle")!.terminals;
  const side = viewpoint === "left" || viewpoint === "right";
  const reverse = defectType === "receptacle_polarity" || defectType === "switch_wrong_terminal" || defectType === "pilot_lamp_wrong_terminal";
  const retention = defectType === "push_in_retention_failure";
  const colors: string[] = terminals.map((terminal, index) => terminal.role === "neutral" ? "white"
    : terminal.role === "ground" ? "green" : index === 0 ? "black" : index === 1 ? "white" : "red");
  if (reverse && colors.length > 1) [colors[0], colors[1]] = [colors[1], colors[0]];
  const name = title ?? specification?.name ?? "埋込連用コンセント";
  const pitch = Math.min(84, 260 / terminals.length);
  const start = 360 - (terminals.length - 1) * pitch / 2;
  return <svg viewBox="0 0 720 390" role="img" aria-label={`${name}の端子確認図`} data-embedded-variant={variant}>
    <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
    <text className="label" x="360" y="52" textAnchor="middle">{name}</text>
    <text className="small" x="360" y="78" textAnchor="middle">{side ? "側面・差込端子の透視断面（端子を展開）" : "背面の差込端子を確認"}</text>
    <rect className="fitting-shell" x="224" y="110" width="272" height="26" rx="5" />
    <rect className="fitting-terminal-body" x="230" y="132" width="260" height="105" rx="10" />
    {[-1, 1].map(sign => <path key={sign} className="fitting-frame-tab" d={`M ${360 + sign * 142} 116 v 35 h ${-sign * 19} v -22`} />)}
    {terminals.map((terminal, index) => {
      const x = start + index * pitch;
      const detached = retention && released && index === 0;
      const color = colors[index];
      const neutral = terminal.role === "neutral";
      const label = neutral && variant !== "pilot_lamp" ? "W" : terminal.label;
      const y = detached ? 270 : 220;
      return <g key={terminal.id} data-embedded-terminal={terminal.id} data-wire-color={color} data-released={detached}>
        <text className="fitting-terminal-label" x={x} y="158" textAnchor="middle" style={{fontSize: label.length > 3 ? 11 : 16}}>{label}</text>
        <rect className="fitting-release" x={x - 13} y="173" width="26" height="10" rx="2" />
        {Array.from({length: terminal.insertionHoles ?? 1}, (_, hole) => <circle className="fitting-hole" key={hole} cx={x + hole * 23 - 6} cy="217" r="9" />)}
        <DirectionalWire className="fitting-wire-outline" side={cableEntrySide} lane={(index - (terminals.length - 1) / 2) * 18} targetX={x - 6} targetY={y} />
        <DirectionalWire className={`fitting-wire ${color}`} side={cableEntrySide} lane={(index - (terminals.length - 1) / 2) * 18} targetX={x - 6} targetY={y} />
        {detached && <path className="material-copper" d={`M ${x - 6} 270 v -22`} data-withdrawn-conductor="true" />}
        {side && <g data-terminal-cutaway={terminal.id}>
          <rect x={x - 19} y="187" width="37" height="43" rx="3" fill="#ebf3ef" fillOpacity="0.85" />
          {!detached && <path className="material-copper" d={`M ${x - 6} 217 v -26`} />}
          <path className="fitting-spring" data-retention={retention && index === 0 ? "open" : "closed"} d={retention && index === 0 ? `M ${x + 13} 192 l 0 15` : `M ${x + 13} 192 l -19 15`} />
        </g>}
      </g>;
    })}
    <DirectionalSheath side={cableEntrySide} />
    <text className="small" x="360" y="352" textAnchor="middle">{side ? "金属の保持ばねと心線の位置を透視表示" : variant.includes("switch") ? "施工条件：先頭端子に黒線を接続" : variant === "pilot_lamp" ? "施工条件：非接地側に黒線・接地側に白線" : "W表示・端子番号・電線の収まり"}</text>
  </svg>;
}
