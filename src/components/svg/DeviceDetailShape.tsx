import type { DeviceVariant } from "../../data/candidateDiagrams";
import { getDeviceSpecification } from "../../data/deviceSpecifications";

type DeviceDetailShapeProps = {
  variant?: DeviceVariant | "receptacle" | "mounting_frame";
  x: number;
  y: number;
};

// Proportions follow the downloaded manufacturer drawings. Geometry is an original,
// simplified SVG intended for defect training rather than a converted CAD asset.
export function DeviceDetailShape({ variant, x, y }: DeviceDetailShapeProps) {
  if (variant === "lamp_receptacle") {
    return (
      <g aria-label="ランプレセプタクル">
        <circle className="cad-body warm" cx={x} cy={y} r="68" />
        <circle className="cad-face" cx={x} cy={y} r="48" />
        <rect className="cad-recess" x={x - 19} y={y - 31} width="38" height="62" rx="16" />
        <circle className="cad-terminal" cx={x - 47} cy={y + 12} r="11" />
        <circle className="cad-terminal" cx={x + 47} cy={y + 12} r="11" />
        <line className="cad-screw" x1={x - 53} y1={y + 12} x2={x - 41} y2={y + 12} />
        <line className="cad-screw" x1={x + 41} y1={y + 12} x2={x + 53} y2={y + 12} />
        <path className="cad-detail" d={"M " + (x - 10) + " " + (y - 17) + " L " + (x + 10) + " " + (y - 17) + " L " + (x + 10) + " " + (y + 17) + " L " + (x - 10) + " " + (y + 17) + " Z"} />
      </g>
    );
  }

  if (variant === "ceiling_connector") {
    return (
      <g aria-label="引掛シーリング">
        <rect className="cad-body warm" x={x - 76} y={y - 43} width="152" height="86" rx="18" />
        <rect className="cad-face" x={x - 61} y={y - 31} width="122" height="62" rx="14" />
        <circle className="cad-terminal" cx={x - 50} cy={y} r="8" />
        <circle className="cad-terminal" cx={x + 50} cy={y} r="8" />
        <path className="cad-slot" d={"M " + (x - 29) + " " + (y - 7) + " H " + (x - 5) + " V " + (y + 6) + " H " + (x - 17)} />
        <path className="cad-slot" d={"M " + (x + 29) + " " + (y + 7) + " H " + (x + 5) + " V " + (y - 6) + " H " + (x + 17)} />
        <circle className="cad-detail" cx={x} cy={y} r="5" />
      </g>
    );
  }

  if (
    variant === "single_pole_switch"
    || variant === "three_way_switch"
    || variant === "four_way_switch"
    || variant === "switch_group"
  ) {
    const terminals = getDeviceSpecification(variant)?.terminals ?? [];
    return (
      <g aria-label="埋込スイッチ">
        <rect className="cad-mounting-yoke" x={x - 66} y={y - 78} width="132" height="156" rx="10" />
        <rect className="cad-body" x={x - 48} y={y - 68} width="96" height="136" rx="13" />
        <rect className="cad-rocker" x={x - 35} y={y - 52} width="70" height="104" rx="8" />
        <line className="cad-detail" x1={x - 27} y1={y - 42} x2={x + 27} y2={y - 42} />
        {terminals.map((terminal, index) => {
          const side = index % 2 === 0 ? -1 : 1;
          const row = Math.floor(index / 2);
          const terminalY = y - 34 + row * 34;
          return (
            <g key={terminal.id}>
              {Array.from({ length: terminal.insertionHoles }, (_, holeIndex) => (
                <circle
                  className="cad-terminal-hole"
                  cx={x + side * 52}
                  cy={terminalY + (holeIndex - (terminal.insertionHoles - 1) / 2) * 12}
                  key={holeIndex}
                  r="5"
                />
              ))}
              <text className="cad-mark" x={x + side * 35} y={terminalY + 4} textAnchor="middle">
                {terminal.label.length <= 2 ? terminal.label : ""}
              </text>
            </g>
          );
        })}
        <text className="cad-mark" x={x} y={y + 8} textAnchor="middle">
          {variant === "three_way_switch" ? "3" : variant === "four_way_switch" ? "4" : ""}
        </text>
      </g>
    );
  }

  if (variant === "circuit_breaker" || variant === "earth_leakage_breaker") {
    return (
      <g aria-label={variant === "earth_leakage_breaker" ? "漏電遮断器" : "配線用遮断器"}>
        <rect className="cad-body" x={x - 62} y={y - 88} width="124" height="176" rx="8" />
        <rect className="cad-terminal-strip" x={x - 52} y={y - 78} width="104" height="35" rx="4" />
        <rect className="cad-terminal-strip" x={x - 52} y={y + 43} width="104" height="35" rx="4" />
        {[-27, 27].map((offset) => (
          <g key={offset}>
            <circle className="cad-terminal" cx={x + offset} cy={y - 60} r="11" />
            <line className="cad-screw" x1={x + offset - 7} y1={y - 60} x2={x + offset + 7} y2={y - 60} />
            <circle className="cad-terminal" cx={x + offset} cy={y + 60} r="11" />
            <line className="cad-screw" x1={x + offset - 7} y1={y + 60} x2={x + offset + 7} y2={y + 60} />
          </g>
        ))}
        <rect className="cad-breaker-toggle" x={x - 19} y={y - 24} width="38" height="53" rx="7" />
        <path className="cad-detail" d={"M " + (x - 13) + " " + (y + 13) + " L " + (x + 12) + " " + (y - 13)} />
        {variant === "earth_leakage_breaker" && <circle className="cad-test-button" cx={x + 39} cy={y + 5} r="8" />}
      </g>
    );
  }

  if (
    variant === "receptacle"
    || variant === "exposed_receptacle"
    || variant === "grounded_receptacle"
    || variant === "grounded_20a_receptacle"
    || variant === "eet_receptacle"
  ) {
    const exposed = variant === "exposed_receptacle";
    const grounded = variant === "grounded_receptacle" || variant === "grounded_20a_receptacle" || variant === "eet_receptacle";
    const twentyAmp = variant === "grounded_20a_receptacle";
    return (
      <g aria-label="コンセント">
        {exposed
          ? <circle className="cad-body" cx={x} cy={y} r="70" />
          : <rect className="cad-mounting-yoke" x={x - 65} y={y - 81} width="130" height="162" rx="8" />}
        <rect className="cad-body" x={x - 46} y={y - 68} width="92" height="136" rx="13" />
        <rect className="cad-face" x={x - 34} y={y - 47} width="68" height={grounded ? "94" : "74"} rx="12" />
        <path className="cad-slot" d={"M " + (x - 17) + " " + (y - 27) + " V " + (y - 4)} />
        <path className="cad-slot" d={"M " + (x + 17) + " " + (y - 27) + " V " + (y - 4) + (twentyAmp ? " H " + (x + 31) : "")} />
        {grounded && <path className="cad-slot" d={"M " + (x - 10) + " " + (y + 24) + " Q " + x + " " + (y + 36) + " " + (x + 10) + " " + (y + 24)} />}
        {variant === "eet_receptacle" && <circle className="cad-ground-terminal" cx={x + 27} cy={y + 49} r="8" />}
      </g>
    );
  }

  if (variant === "pilot_lamp") {
    return (
      <g aria-label="パイロットランプ">
        <rect className="cad-body" x={x - 46} y={y - 68} width="92" height="136" rx="12" />
        <rect className="cad-lens" x={x - 29} y={y - 25} width="58" height="50" rx="9" />
        <line className="cad-detail" x1={x - 20} y1={y + 37} x2={x + 20} y2={y + 37} />
      </g>
    );
  }

  if (variant === "mounting_frame") {
    return (
      <g aria-label="連用取付枠">
        <rect className="cad-mounting-yoke" x={x - 82} y={y - 96} width="164" height="192" rx="6" />
        <rect className="cad-frame-opening" x={x - 48} y={y - 72} width="96" height="144" rx="4" />
        <path className="cad-detail" d={"M " + (x - 68) + " " + (y - 74) + " H " + (x - 46) + " M " + (x + 46) + " " + (y - 74) + " H " + (x + 68)} />
        <path className="cad-detail" d={"M " + (x - 68) + " " + (y + 74) + " H " + (x - 46) + " M " + (x + 46) + " " + (y + 74) + " H " + (x + 68)} />
        {[-45, 0, 45].map((offset) => (
          <g key={offset}>
            <path className="cad-frame-claw" d={"M " + (x - 80) + " " + (y + offset - 9) + " H " + (x - 59) + " V " + (y + offset + 9) + " H " + (x - 80)} />
            <path className="cad-frame-claw" d={"M " + (x + 80) + " " + (y + offset - 9) + " H " + (x + 59) + " V " + (y + offset + 9) + " H " + (x + 80)} />
          </g>
        ))}
        <rect className="cad-rocker" x={x - 34} y={y - 52} width="68" height="104" rx="7" />
      </g>
    );
  }
  if (variant === "terminal_block" || variant === "earth_terminal" || variant === "timer_switch" || variant === "automatic_switch") {
    const terminals = getDeviceSpecification(variant)?.terminals ?? [];
    const spacing = terminals.length > 1 ? 120 / (terminals.length - 1) : 0;
    return (
      <g aria-label={variant === "earth_terminal" ? "接地端子" : variant === "timer_switch" ? "タイムスイッチ端子台" : variant === "automatic_switch" ? "自動点滅器端子台" : "端子台"}>
        <rect className="cad-body" x={x - 84} y={y - 45} width="168" height="90" rx="8" />
        {terminals.map((terminal, index) => {
          const offset = terminals.length > 1 ? -60 + index * spacing : 0;
          return (
            <g key={terminal.id}>
              <rect className="cad-terminal-strip" x={x + offset - 10} y={y - 31} width="20" height="62" rx="4" />
              <circle className="cad-terminal" cx={x + offset} cy={y} r="7" />
              <line className="cad-screw" x1={x + offset - 5} y1={y} x2={x + offset + 5} y2={y} />
              <text className="cad-mark" x={x + offset} y={y - 34} textAnchor="middle">{terminal.label}</text>
            </g>
          );
        })}
      </g>
    );
  }

  return (
    <g aria-label="電気器具">
      <rect className="cad-body" x={x - 58} y={y - 62} width="116" height="124" rx="12" />
      <circle className="cad-terminal" cx={x - 32} cy={y} r="10" />
      <circle className="cad-terminal" cx={x + 32} cy={y} r="10" />
    </g>
  );
}
