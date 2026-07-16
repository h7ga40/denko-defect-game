import type { DeviceVariant } from "../../../data/candidateDiagrams";
import { getDeviceSpecification } from "../../../data/deviceSpecifications";

export function TerminalBlockDiagram({
  title = "端子台",
  variant = "terminal_block",
}: {
  title?: string;
  variant?: DeviceVariant;
}) {
  const terminals = getDeviceSpecification(variant)?.terminals
    ?? getDeviceSpecification("terminal_block")!.terminals;
  const startX = 235;
  const spacing = 50;

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        {title}
      </text>
      <rect className="device" x="210" y="110" width="320" height="150" rx="10" />
      {terminals.map((terminal, index) => (
        <g key={terminal.id}>
          <rect className="terminal" x={startX + index * spacing} y="150" width="34" height="58" rx="5" />
          <text className="small" x={startX + 17 + index * spacing} y="135" textAnchor="middle">
            {terminal.label}
          </text>
        </g>
      ))}
      <path className="wire black" d={"M 95 165 C 170 165, 205 178, " + (startX + 17) + " 178"} />
      <path className="wire alert" d={"M 95 220 C 185 240, 255 178, " + (startX + spacing * Math.min(1, terminals.length - 1) + 17) + " 178"} />
      <text className="defect-label" x="360" y="330" textAnchor="middle">
        指定端子ではなく隣の端子へ接続
      </text>
    </svg>
  );
}
