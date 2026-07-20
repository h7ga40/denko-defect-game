import type { CandidateTerminalBlockLayout, DeviceVariant } from "../../../data/candidateDiagrams";
import type { DeviceTerminalConnection } from "../../../data/boxInspectionGame";
import { getDeviceSpecification } from "../../../data/deviceSpecifications";

export function TerminalBlockDiagram({
  defect = true,
  title = "端子台",
  variant = "terminal_block",
  terminalBlock,
  terminalConnections,
}: {
  defect?: boolean;
  title?: string;
  variant?: DeviceVariant;
  terminalBlock?: CandidateTerminalBlockLayout;
  terminalConnections?: DeviceTerminalConnection[];
}) {
  if (variant === "timer_switch") {
    return <TimerSwitchTerminalDiagram defect={defect} terminalConnections={terminalConnections} title={title} />;
  }
  if (variant === "automatic_switch") {
    return <AutomaticSwitchTerminalDiagram defect={defect} terminalConnections={terminalConnections} title={title} />;
  }

  const specificationTerminals = getDeviceSpecification(variant)?.terminals
    ?? getDeviceSpecification("terminal_block")!.terminals;
  const poles = terminalBlock?.poles ?? specificationTerminals.map((terminal) => ({
    terminalId: terminal.id,
    label: terminal.label,
    circuitLabel: "",
  }));
  const connections = terminalConnections ?? [
    { conductorId: "fallback:0", terminalId: poles[0]?.terminalId ?? "1", actualTerminalId: poles[0]?.terminalId ?? "1", color: "black" as const },
    { conductorId: "fallback:1", terminalId: poles[1]?.terminalId ?? "2", actualTerminalId: poles[1]?.terminalId ?? "2", color: "white" as const },
  ];
  const connectedIds = new Set(connections.map((connection) => connection.terminalId));
  const unusedPoleIndex = poles.findIndex((pole) => !connectedIds.has(pole.terminalId));
  const hasGraphDefect = connections.some((connection) => connection.actualTerminalId !== connection.terminalId);
  const showDefect = hasGraphDefect || (defect && !terminalConnections);
  const omittedX = 325;
  const installedX = 395;
  const startY = 120;
  const spacing = 34;
  const colorLabels = {
    black: "黒線",
    white: "白線",
    red: "赤線",
    green: "緑線",
    blue: "青線",
  };

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + (defect ? "の欠陥図" : "の正常施工図")}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="55" textAnchor="middle">{title}</text>
      <rect className="device" x="280" y="88" width="160" height="228" rx="10" />
      <text className="small" x={omittedX} y="108" textAnchor="middle">
        {terminalBlock ? "電源側" : "施工省略"}
      </text>
      <text className="small" x={installedX} y="108" textAnchor="middle">施工</text>
      {poles.map((pole, index) => (
        <g key={pole.terminalId}>
          <text className="small" x="270" y={startY + index * spacing + 5} textAnchor="end">
            {pole.circuitLabel}
          </text>
          <circle className="terminal omitted-terminal" cx={omittedX} cy={startY + index * spacing} r="10" />
          <circle className="terminal" cx={installedX} cy={startY + index * spacing} r="10" />
          <text className="small" x="360" y={startY + index * spacing + 5} textAnchor="middle">
            {pole.label}
          </text>
        </g>
      ))}
      {connections.map((connection, index) => {
        const poleIndex = Math.max(0, poles.findIndex((pole) => pole.terminalId === connection.terminalId));
        const wrong = connection.actualTerminalId !== connection.terminalId
          || (defect && !terminalConnections && index === connections.length - 1);
        const actualPoleIndex = poles.findIndex((pole) => pole.terminalId === connection.actualTerminalId);
        const targetIndex = actualPoleIndex >= 0
          ? actualPoleIndex
          : wrong && unusedPoleIndex >= 0 ? unusedPoleIndex : poleIndex;
        const sourceY = startY + poleIndex * spacing;
        const targetY = startY + targetIndex * spacing;
        return (
          <g key={connection.conductorId}>
            <path
              className={"wire " + (wrong ? "alert" : connection.color)}
              d={`M 650 ${sourceY} C 545 ${sourceY}, 480 ${targetY}, ${installedX} ${targetY}`}
            />
            <text className="small" x="625" y={sourceY - 7} textAnchor="end">
              {colorLabels[connection.color]}
            </text>
          </g>
        );
      })}
      <text className={showDefect ? "defect-label" : "small"} x="360" y="346" textAnchor="middle">
        {showDefect ? "接続グラフの指定端子とは異なる端子へ接続" : "端子名と線色どおりに接続"}
      </text>
    </svg>
  );
}
function AutomaticSwitchTerminalDiagram({ defect, terminalConnections, title }: { defect: boolean; terminalConnections?: DeviceTerminalConnection[]; title: string }) {
  const terminals = [
    { id: "1", x: 280 },
    { id: "2", x: 360 },
    { id: "3", x: 440 },
  ];
  const loadConnection = terminalConnections?.find((connection) => connection.terminalId === "3");
  const actualLoadTerminal = loadConnection?.actualTerminalId ?? (defect ? "2" : "3");
  const outdoorBlackX = terminals.find((terminal) => terminal.id === actualLoadTerminal)?.x ?? 440;
  const showDefect = actualLoadTerminal !== "3";

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + (defect ? "の欠陥図" : "の正常施工図")}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="54" textAnchor="middle">{title}</text>
      <text className="small" x="92" y="95" textAnchor="middle">アウトレットボックス2</text>
      <text className="small" x="628" y="95" textAnchor="middle">屋外灯</text>
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
      <path className={showDefect ? "wire alert" : "wire black"} d={`M 652 230 C 560 230, 505 210, ${outdoorBlackX} 202`} />
      <text className="small" x="92" y="127" textAnchor="middle">黒→1 / 白→2</text>
      <text className="small" x="628" y="127" textAnchor="middle">白→2 / 黒→3</text>
      <text className={showDefect ? "defect-label" : "small"} x="360" y="326" textAnchor="middle">
        {showDefect ? `屋外灯側の黒線を3ではなく${actualLoadTerminal}へ接続` : "2端子には白線2本を接続"}
      </text>
    </svg>
  );
}

function TimerSwitchTerminalDiagram({ defect, terminalConnections, title }: { defect: boolean; terminalConnections?: DeviceTerminalConnection[]; title: string }) {
  const terminals = [
    { id: "S1", x: 280 },
    { id: "S2", x: 360 },
    { id: "L1", x: 440 },
  ];
  const loadConnection = terminalConnections?.find((connection) => connection.terminalId === "L1");
  const actualLoadTerminal = loadConnection?.actualTerminalId ?? (defect ? "S2" : "L1");
  const loadBlackX = terminals.find((terminal) => terminal.id === actualLoadTerminal)?.x ?? 440;
  const showDefect = actualLoadTerminal !== "L1";

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
      <path className={showDefect ? "wire alert" : "wire black"} d={`M 652 230 C 560 230, 505 210, ${loadBlackX} 202`} />
      <text className="small" x="92" y="127" textAnchor="middle">黒→S1 / 白→S2</text>
      <text className="small" x="628" y="127" textAnchor="middle">白→S2 / 黒→L1</text>
      <text className={showDefect ? "defect-label" : "small"} x="360" y="326" textAnchor="middle">
        {showDefect ? `引掛シーリングローゼット側の黒線をL1ではなく${actualLoadTerminal}へ接続` : "S2端子には白線2本を接続"}
      </text>
    </svg>
  );
}
