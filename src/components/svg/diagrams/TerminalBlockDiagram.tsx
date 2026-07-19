import type { DeviceVariant } from "../../../data/candidateDiagrams";
import { getDeviceSpecification } from "../../../data/deviceSpecifications";

export function TerminalBlockDiagram({
  defect = true,
  title = "端子台",
  variant = "terminal_block",
}: {
  defect?: boolean;
  title?: string;
  variant?: DeviceVariant;
}) {
  if (variant === "timer_switch") {
    return <TimerSwitchTerminalDiagram defect={defect} title={title} />;
  }

  const terminals = getDeviceSpecification(variant)?.terminals
    ?? getDeviceSpecification("terminal_block")!.terminals;
  const omittedX = 325;
  const installedX = 395;
  const startY = 120;
  const spacing = 34;

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の欠陥図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        {title}
      </text>
      <rect className="device" x="280" y="88" width="160" height="228" rx="10" />
      <text className="small" x={omittedX} y="108" textAnchor="middle">施工省略</text>
      <text className="small" x={installedX} y="108" textAnchor="middle">施工</text>
      {terminals.map((terminal, index) => (
        <g key={terminal.id}>
          <circle className="terminal omitted-terminal" cx={omittedX} cy={startY + index * spacing} r="10" />
          <circle className="terminal" cx={installedX} cy={startY + index * spacing} r="10" />
          <text className="small" x="360" y={startY + index * spacing + 5} textAnchor="middle">
            {terminal.label}
          </text>
        </g>
      ))}
      <path className="wire black" d={`M 650 135 C 545 135, 480 120, ${installedX} ${startY}`} />
      <path className="wire alert" d={`M 650 245 C 545 245, 480 ${startY + spacing}, ${installedX} ${startY + spacing}`} />
      <text className="defect-label" x="360" y="330" textAnchor="middle">
        指定端子ではなく隣の端子へ接続
      </text>
    </svg>
  );
}

function TimerSwitchTerminalDiagram({ defect, title }: { defect: boolean; title: string }) {
  const terminals = [
    { id: "S1", x: 280 },
    { id: "S2", x: 360 },
    { id: "L1", x: 440 },
  ];
  const loadBlackX = defect ? 360 : 440;

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + (defect ? "の欠陥図" : "の正常施工図")}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="54" textAnchor="middle">{title}</text>
      <text className="small" x="92" y="95" textAnchor="middle">アウトレットボックス2</text>
      <text className="small" x="628" y="95" textAnchor="middle">引掛シーリングローゼット</text>
      <rect className="device" x="230" y="128" width="260" height="132" rx="10" />
      {terminals.map((terminal) => (
        <g key={terminal.id}>
          <rect className="terminal" x={terminal.x - 20} y="160" width="40" height="62" rx="5" />
          <circle className="terminal" cx={terminal.x} cy="190" r="7" />
          <text className="small" x={terminal.x} y="150" textAnchor="middle">{terminal.id}</text>
        </g>
      ))}
      <path className="wire black" d="M 68 140 C 150 140, 210 172, 280 180" />
      <path className="wire white" d="M 68 230 C 165 230, 255 210, 360 202" />
      <path className="wire white" d="M 652 140 C 550 140, 455 166, 360 178" />
      <path className={defect ? "wire alert" : "wire black"} d={`M 652 230 C 560 230, 505 210, ${loadBlackX} 202`} />
      <text className="small" x="92" y="127" textAnchor="middle">黒→S1 / 白→S2</text>
      <text className="small" x="628" y="127" textAnchor="middle">白→S2 / 黒→L1</text>
      <text className={defect ? "defect-label" : "small"} x="360" y="326" textAnchor="middle">
        {defect ? "引掛シーリングローゼット側の黒線をL1ではなくS2へ接続" : "S2端子には白線2本を接続"}
      </text>
    </svg>
  );
}
