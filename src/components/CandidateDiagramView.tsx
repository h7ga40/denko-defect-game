import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  candidateDiagrams,
  type CandidateDevice,
  type CandidateDiagram,
  type CandidateMountingFrame,
  type CandidateMountingFrameMember,
  type MountingFramePosition,
} from "../data/candidateDiagrams";
import { resolveCableRunSpecification } from "../data/cableSpecifications";
import type { DirectInspectionPart, InspectionBox } from "../data/boxInspectionGame";
import { CandidateMaterials } from "./CandidateMaterials";
import { FluorescentLampSymbol } from "./svg/FluorescentLampSymbol";
import { OutdoorLightSymbol } from "./svg/OutdoorLightSymbol";

type InspectionAnswers = Record<string, string>;
type SelectionStatus = "idle" | "selected" | "answered" | "correct" | "wrong";

type CandidateSvgProps = {
  diagram: CandidateDiagram;
  inspectionBoxes?: InspectionBox[];
  directParts?: DirectInspectionPart[];
  answers?: InspectionAnswers;
  selectedBoxId?: string;
  selectedDirectPartId?: string;
  submitted?: boolean;
  onSelectBox?: (boxId: string) => void;
  onSelectDirectPart?: (partId: string) => void;
};

type Interaction = {
  label: string;
  status: SelectionStatus;
  onSelect: () => void;
};

export function CandidateDiagramView({ initialCandidateNo = 1 }: { initialCandidateNo?: number }) {
  const [selectedNo, setSelectedNo] = useState(initialCandidateNo);
  const selected = useMemo(
    () => candidateDiagrams.find((diagram) => diagram.no === selectedNo) ?? candidateDiagrams[0],
    [selectedNo],
  );

  return (
    <section className="candidate-layout">
      <aside className="candidate-list" aria-label="候補問題一覧">
        {candidateDiagrams.map((diagram) => (
          <button
            className={diagram.no === selected.no ? "candidate-tab selected" : "candidate-tab"}
            key={diagram.no}
            onClick={() => setSelectedNo(diagram.no)}
            type="button"
          >
            <span>No.{diagram.no}</span>
            {diagram.title}
          </button>
        ))}
      </aside>

      <article className="problem-card candidate-card">
        <div className="problem-meta">
          <span>候補問題 No.{selected.no}</span>
          <span>学習用簡略複線図</span>
        </div>
        <h2>{selected.title}</h2>
        <p className="candidate-theme">{selected.theme}</p>
        <CandidateMaterials candidateNo={selected.no} />
        <div className="diagram-wrap">
          <CandidateSvg diagram={selected} />
        </div>
        <ul className="point-list">
          {selected.points.map((point) => <li key={point}>{point}</li>)}
        </ul>
      </article>
    </section>
  );
}

export function CandidateSvg({
  answers = {},
  diagram,
  inspectionBoxes = [],
  directParts = [],
  onSelectBox,
  onSelectDirectPart,
  selectedBoxId,
  selectedDirectPartId,
  submitted = false,
}: CandidateSvgProps) {
  const devicesById = new Map(diagram.devices.map((device) => [device.id, device]));
  const boxesByDeviceId = new Map(inspectionBoxes.map((box) => [box.sourceDeviceId, box]));
  const partsByDeviceId = new Map(directParts.map((part) => [part.sourceDeviceId, part]));
  const framedDeviceIds = new Set(
    (diagram.mountingFrames ?? []).flatMap((frame) => frame.members.flatMap((member) => member.sourceDeviceId ? [member.sourceDeviceId] : [])),
  );

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={"候補問題" + diagram.no + "の複線図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="candidate-svg-title" x="360" y="54" textAnchor="middle">
        No.{diagram.no} {diagram.title}
      </text>

      {diagram.connections.map((connection, index) => {
        const fromDevice = devicesById.get(connection.from);
        const toDevice = devicesById.get(connection.to);
        const from = fromDevice && getDeviceRenderPoint(diagram, fromDevice);
        const to = toDevice && getDeviceRenderPoint(diagram, toDevice);
        if (!from || !to) return null;

        const offset = getParallelOffset(diagram.connections, index, from, to);
        const cable = resolveCableRunSpecification(diagram, connection, index);
        const wireOffsets = getCoreOffsets(cable.coreColors.length);
        const labelX = (from.x + to.x) / 2 + offset.x * 1.8;
        const labelY = (from.y + to.y) / 2 + offset.y * 1.8 - 8;
        const showDimension = cable.diagramLengthMm !== null
          && !diagram.connections.slice(0, index).some((previous) =>
            previous.from === connection.from && previous.to === connection.to
          );

        return (
          <g key={connection.from + "-" + connection.to + "-" + connection.color + "-" + index}>
            {cable.coreColors.map((color, coreIndex) => (
              <path
                className={"candidate-wire " + color}
                d={makeWirePath(from, to, addCoreOffset(offset, from, to, wireOffsets[coreIndex]))}
                key={cable.id + "-core-" + coreIndex}
              />
            ))}
            {connection.label && (
              <text className="wire-label" x={labelX} y={labelY} textAnchor="middle">
                {connection.label}
              </text>
            )}
            {showDimension && (
              <text
                className="wire-dimension"
                x={labelX}
                y={labelY + (connection.label ? 13 : 0)}
                textAnchor="middle"
              >
                {cable.diagramLengthMm}mm
              </text>
            )}
          </g>
        );
      })}

      {diagram.devices.map((device) => {
        if (framedDeviceIds.has(device.id)) return null;
        const box = boxesByDeviceId.get(device.id);
        if (box) {
          const answered = box.parts.every((part) => Boolean(answers[part.id]));
          const correct = box.parts.every((part) => answers[part.id] === part.answer);
          const status = getStatus(box.id === selectedBoxId, answered, correct, submitted);
          return (
            <BoxNode
              box={box}
              interaction={{
                label: box.label + "を選択",
                status,
                onSelect: () => onSelectBox?.(box.id),
              }}
              key={box.id}
            />
          );
        }

        const part = partsByDeviceId.get(device.id);
        const interaction = part
          ? {
              label: part.title + "を選択",
              status: getStatus(
                part.id === selectedDirectPartId,
                Boolean(answers[part.id]),
                answers[part.id] === part.answer,
                submitted,
              ),
              onSelect: () => onSelectDirectPart?.(part.id),
            }
          : undefined;

        return <CandidateDeviceNode device={device} interaction={interaction} key={device.id} />;
      })}
      {(diagram.mountingFrames ?? []).map((frame) => {
        const part = partsByDeviceId.get(frame.id);
        const interaction = part ? {
          label: part.title + "を選択",
          status: getStatus(
            part.id === selectedDirectPartId,
            Boolean(answers[part.id]),
            answers[part.id] === part.answer,
            submitted,
          ),
          onSelect: () => onSelectDirectPart?.(part.id),
        } : undefined;
        const memberInteractions = new Map(frame.members.flatMap((member) => {
          const memberPart = partsByDeviceId.get(`frame-member:${frame.id}:${member.id}`);
          if (!memberPart) return [];
          return [[member.id, {
            label: memberPart.title + "を選択",
            status: getStatus(
              memberPart.id === selectedDirectPartId,
              Boolean(answers[memberPart.id]),
              answers[memberPart.id] === memberPart.answer,
              submitted,
            ),
            onSelect: () => onSelectDirectPart?.(memberPart.id),
          } satisfies Interaction] as const];
        }));
        return <MountingFrameNode frame={frame} interaction={interaction} key={frame.id} memberInteractions={memberInteractions} />;
      })}
    </svg>
  );
}

const mountingFrameOffsets: Record<MountingFramePosition, number> = { top: -25, middle: 0, bottom: 25 };

function getDeviceRenderPoint(diagram: CandidateDiagram, device: CandidateDevice): CandidateDevice {
  for (const frame of diagram.mountingFrames ?? []) {
    const member = frame.members.find((item) => item.sourceDeviceId === device.id);
    if (member) return { ...device, x: frame.x, y: frame.y + mountingFrameOffsets[member.position] };
  }
  return device;
}

function MountingFrameNode({
  frame,
  interaction,
  memberInteractions,
}: {
  frame: CandidateMountingFrame;
  interaction?: Interaction;
  memberInteractions: Map<string, Interaction>;
}) {
  return (
    <g>
      <SelectableGroup height={118} interaction={interaction} width={96} x={frame.x} y={frame.y}>
        <rect className="candidate-device mounting-frame" x={frame.x - 37} y={frame.y - 52} width="74" height="104" rx="8" />
        <circle className="device-detail" cx={frame.x} cy={frame.y - 43} r="4" />
        <circle className="device-detail" cx={frame.x} cy={frame.y + 43} r="4" />
        <text className="candidate-label small-label" x={frame.x} y={frame.y > 290 ? frame.y - 62 : frame.y + 68} textAnchor="middle">
          取付枠
        </text>
      </SelectableGroup>
      {(frame.jumpers ?? []).map((jumper) => {
        const from = frame.members.find((member) => member.id === jumper.fromMemberId);
        const to = frame.members.find((member) => member.id === jumper.toMemberId);
        if (!from || !to) return null;
        const fromY = frame.y + mountingFrameOffsets[from.position];
        const toY = frame.y + mountingFrameOffsets[to.position];
        return (
          <path
            className={"candidate-frame-jumper " + jumper.color}
            d={`M ${frame.x - 27} ${fromY} C ${frame.x - 38} ${fromY}, ${frame.x - 38} ${toY}, ${frame.x - 27} ${toY}`}
            key={jumper.id}
          />
        );
      })}
      {frame.members.map((member) => (
        <MountingFrameMemberNode frame={frame} interaction={memberInteractions.get(member.id)} member={member} key={member.id} />
      ))}
    </g>
  );
}

function MountingFrameMemberNode({ frame, interaction, member }: { frame: CandidateMountingFrame; interaction?: Interaction; member: CandidateMountingFrameMember }) {
  const y = frame.y + mountingFrameOffsets[member.position];
  const isReceptacle = member.variant === "embedded_receptacle" || member.variant === "double_receptacle" || member.variant === "grounded_receptacle" || member.variant === "grounded_20a_receptacle" || member.variant === "eet_receptacle";
  const isPilot = member.variant === "pilot_lamp";
  return (
    <SelectableGroup height={22} interaction={interaction} width={68} x={frame.x} y={y}>
      <rect className={"candidate-device candidate-frame-member " + (isReceptacle ? "receptacle" : isPilot ? "pilot" : "switch")} x={frame.x - 27} y={y - 10} width="54" height="20" rx="4" />
      {isReceptacle ? (
        <>
          <line className="device-mark" x1={frame.x - 8} y1={y - 5} x2={frame.x - 8} y2={y + 5} />
          <line className="device-mark" x1={frame.x + 8} y1={y - 5} x2={frame.x + 8} y2={y + 5} />
        </>
      ) : isPilot ? (
        <circle className="pilot-core" cx={frame.x} cy={y} r="5" />
      ) : (
        <text className="candidate-symbol-text centered" x={frame.x} y={y + 5}>{member.variant === "three_way_switch" ? "3" : member.variant === "four_way_switch" ? "4" : member.label.split("（")[0]}</text>
      )}
    </SelectableGroup>
  );
}

function getCoreOffsets(coreCount: number) {
  return Array.from({ length: coreCount }, (_, index) => (index - (coreCount - 1) / 2) * 9);
}

function addCoreOffset(
  baseOffset: { x: number; y: number },
  from: CandidateDevice,
  to: CandidateDevice,
  distance: number,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: baseOffset.x + (-dy / length) * distance,
    y: baseOffset.y + (dx / length) * distance,
  };
}
function getStatus(selected: boolean, answered: boolean, correct: boolean, submitted: boolean): SelectionStatus {
  if (submitted && answered) return correct ? "correct" : "wrong";
  if (selected) return "selected";
  if (answered) return "answered";
  return "idle";
}

function SelectableGroup({
  children,
  interaction,
  x,
  y,
  width,
  height,
}: {
  children: ReactNode;
  interaction?: Interaction;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  function handleKeyDown(event: KeyboardEvent<SVGGElement>) {
    if (!interaction || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    interaction.onSelect();
  }

  const className = interaction
    ? "candidate-node candidate-selectable " + interaction.status
    : "candidate-node";

  return (
    <g
      aria-label={interaction?.label}
      className={className}
      onClick={interaction?.onSelect}
      onKeyDown={handleKeyDown}
      role={interaction ? "button" : undefined}
      tabIndex={interaction ? 0 : undefined}
    >
      {interaction && (
        <rect
          className="candidate-hit-area"
          height={height}
          width={width}
          x={x - width / 2}
          y={y - height / 2}
          rx="12"
        />
      )}
      {children}
      {interaction && interaction.status !== "idle" && (
        <circle className="candidate-status-dot" cx={x + width / 2 - 10} cy={y - height / 2 + 10} r="7" />
      )}
    </g>
  );
}

function BoxNode({ box, interaction }: { box: InspectionBox; interaction: Interaction }) {
  return (
    <SelectableGroup height={76} interaction={interaction} width={112} x={box.x} y={box.y}>
      <rect className={"candidate-box candidate-device " + box.boxType} x={box.x - 45} y={box.y - 28} width="90" height="56" rx="8" />
      <text className="candidate-label small-label" x={box.x} y={box.y + 5} textAnchor="middle">
        {box.boxType === "joint" ? "JB" : "OB"}
      </text>
    </SelectableGroup>
  );
}

export function CandidateDeviceNode({ device, interaction }: { device: CandidateDevice; interaction?: Interaction }) {
  const label = (
    <text className="candidate-label small-label" x={device.x} y={device.y > 300 ? device.y - 45 : device.y + 54} textAnchor="middle">
      {device.label}
    </text>
  );

  if (device.type === "power") {
    return (
      <SelectableGroup height={80} interaction={interaction} width={100} x={device.x} y={device.y}>
        <rect className="candidate-device power" x={device.x - 42} y={device.y - 34} width="84" height="68" rx="8" />
        <text className="candidate-label" x={device.x} y={device.y + 5} textAnchor="middle">{device.label}</text>
      </SelectableGroup>
    );
  }

  if (device.type === "connector") {
    return (
      <SelectableGroup height={64} interaction={interaction} width={72} x={device.x} y={device.y}>
        <circle className="candidate-connector candidate-device" cx={device.x} cy={device.y} r="18" />
        <text className="candidate-label small-label" x={device.x} y={device.y + 38} textAnchor="middle">{device.label}</text>
      </SelectableGroup>
    );
  }

  if (device.variant === "fluorescent_lamp") {
    return (
      <SelectableGroup height={88} interaction={interaction} width={112} x={device.x} y={device.y}>
        <FluorescentLampSymbol x={device.x} y={device.y} />
        <text className="candidate-label small-label" x={device.x} y={device.y + (device.y > 300 ? 48 : 54)} textAnchor="middle">
          {device.label}
        </text>
      </SelectableGroup>
    );
  }

  if (device.variant === "outdoor_light") {
    return (
      <SelectableGroup height={100} interaction={interaction} width={108} x={device.x} y={device.y}>
        <OutdoorLightSymbol x={device.x} y={device.y} />
        <text className="candidate-label small-label" x={device.x} y={device.y + 48} textAnchor="middle">
          {device.label}
        </text>
      </SelectableGroup>
    );
  }

  if (device.variant === "lamp_receptacle" || (device.variant === "omitted_work" && device.type === "lamp" && device.label.startsWith("R"))) {
    return (
      <SelectableGroup height={104} interaction={interaction} width={98} x={device.x} y={device.y}>
        <circle className="candidate-device lamp" cx={device.x} cy={device.y} r="34" />
        <circle className="device-detail" cx={device.x} cy={device.y} r="14" />
        <circle className="device-detail-fill" cx={device.x - 22} cy={device.y} r="4" />
        <circle className="device-detail-fill" cx={device.x + 22} cy={device.y} r="4" />
        {label}
      </SelectableGroup>
    );
  }

  if (device.variant === "ceiling_connector" || (device.variant === "omitted_work" && device.type === "lamp" && device.label.includes("引掛"))) {
    return (
      <SelectableGroup height={102} interaction={interaction} width={108} x={device.x} y={device.y}>
        <rect className="candidate-device ceiling-connector" x={device.x - 40} y={device.y - 27} width="80" height="54" rx="18" />
        <ellipse className="device-detail" cx={device.x} cy={device.y} rx="18" ry="11" />
        <line className="device-mark" x1={device.x - 24} y1={device.y - 12} x2={device.x - 14} y2={device.y - 12} />
        <line className="device-mark" x1={device.x + 14} y1={device.y + 12} x2={device.x + 24} y2={device.y + 12} />
        {label}
      </SelectableGroup>
    );
  }

  if (device.variant === "pilot_lamp") {
    return (
      <SelectableGroup height={90} interaction={interaction} width={90} x={device.x} y={device.y}>
        <circle className="candidate-device pilot" cx={device.x} cy={device.y} r="27" />
        <circle className="pilot-core" cx={device.x} cy={device.y} r="11" />
        {label}
      </SelectableGroup>
    );
  }

  if (
    device.variant === "single_pole_switch"
    || device.variant === "three_way_switch"
    || device.variant === "four_way_switch"
    || device.variant === "switch_group"
    || (device.variant === "omitted_work" && device.type === "switch")
  ) {
    const switchMark = device.variant === "three_way_switch"
      ? "3"
      : device.variant === "four_way_switch"
        ? "4"
        : device.variant === "switch_group" ? "H" : "1";
    return (
      <SelectableGroup height={100} interaction={interaction} width={112} x={device.x} y={device.y}>
        <rect className="candidate-device switch" x={device.x - 44} y={device.y - 31} width="88" height="62" rx="8" />
        <circle className="device-detail-fill" cx={device.x - 24} cy={device.y + 12} r="4" />
        <circle className="device-detail-fill" cx={device.x + 24} cy={device.y - 12} r="4" />
        <line className="device-mark" x1={device.x - 20} y1={device.y + 9} x2={device.x + 18} y2={device.y - 9} />
        <text className="candidate-symbol-text" x={device.x + 29} y={device.y + 20}>{switchMark}</text>
        {label}
      </SelectableGroup>
    );
  }

  if (device.variant === "timer_switch" || device.variant === "automatic_switch") {
    return (
      <SelectableGroup height={100} interaction={interaction} width={112} x={device.x} y={device.y}>
        <rect className="candidate-device terminal" x={device.x - 44} y={device.y - 32} width="88" height="64" rx="8" />
        <circle className="device-detail" cx={device.x - 19} cy={device.y} r="13" />
        <line className="device-mark" x1={device.x - 19} y1={device.y} x2={device.x - 12} y2={device.y - 8} />
        <text className="candidate-symbol-text centered" x={device.x + 19} y={device.y + 5}>
          {device.variant === "timer_switch" ? "TS" : "A"}
        </text>
        {label}
      </SelectableGroup>
    );
  }

  if (device.variant === "circuit_breaker" || device.variant === "earth_leakage_breaker") {
    return (
      <SelectableGroup height={94} interaction={interaction} width={108} x={device.x} y={device.y}>
        <rect className="candidate-device breaker" x={device.x - 44} y={device.y - 32} width="88" height="64" rx="8" />
        <line className="device-mark" x1={device.x - 20} y1={device.y + 12} x2={device.x + 6} y2={device.y - 12} />
        <circle className="device-detail-fill" cx={device.x - 22} cy={device.y + 14} r="4" />
        <text className="candidate-symbol-text centered" x={device.x + 22} y={device.y + 5}>
          {device.variant === "earth_leakage_breaker" ? "BE" : "B"}
        </text>
        {label}
      </SelectableGroup>
    );
  }

  if (device.variant === "exposed_receptacle") {
    return (
      <SelectableGroup height={104} interaction={interaction} width={104} x={device.x} y={device.y}>
        <circle className="candidate-device receptacle" cx={device.x} cy={device.y} r="36" />
        <line className="device-mark" x1={device.x - 12} y1={device.y - 15} x2={device.x - 12} y2={device.y + 8} />
        <line className="device-mark" x1={device.x + 12} y1={device.y - 15} x2={device.x + 12} y2={device.y + 8} />
        <circle className="device-detail" cx={device.x} cy={device.y + 20} r="5" />
        {label}
      </SelectableGroup>
    );
  }

  if (
    device.variant === "embedded_receptacle"
    || device.variant === "double_receptacle"
    ||
    device.type === "receptacle"
    || device.type === "grounded_receptacle"
  ) {
    const grounded = device.type === "grounded_receptacle";
    const is20A = device.variant === "grounded_20a_receptacle";
    return (
      <SelectableGroup height={106} interaction={interaction} width={108} x={device.x} y={device.y}>
        <rect className="candidate-device receptacle" x={device.x - 42} y={device.y - 40} width="84" height="80" rx="12" />
        <line className="device-mark" x1={device.x - 14} y1={device.y - 16} x2={device.x - 14} y2={device.y + 12} />
        <line className="device-mark" x1={device.x + 14} y1={device.y - 16} x2={device.x + 14} y2={device.y + 12} />
        {is20A && <line className="device-mark" x1={device.x + 4} y1={device.y - 16} x2={device.x + 24} y2={device.y - 16} />}
        {grounded && <circle className="ground-hole" cx={device.x} cy={device.y + 24} r="5" />}
        {device.variant === "eet_receptacle" && (
          <text className="candidate-symbol-text centered" x={device.x + 27} y={device.y + 31}>EET</text>
        )}
        {label}
      </SelectableGroup>
    );
  }

  if (device.variant === "terminal_block") {
    const terminalRows = [-45, -27, -9, 9, 27, 45];
    return (
      <SelectableGroup height={160} interaction={interaction} width={112} x={device.x} y={device.y}>
        <text className="candidate-terminal-heading" x={device.x - 20} y={device.y - 63} textAnchor="middle">省略</text>
        <text className="candidate-terminal-heading" x={device.x + 20} y={device.y - 63} textAnchor="middle">施工</text>
        <rect className="candidate-device terminal" x={device.x - 40} y={device.y - 57} width="80" height="114" rx="6" />
        {terminalRows.map((yOffset, row) => (
          <g key={row}>
            <circle className="device-detail omitted-terminal" cx={device.x - 20} cy={device.y + yOffset} r="6" />
            <circle className="device-detail" cx={device.x + 20} cy={device.y + yOffset} r="6" />
            <text className="candidate-terminal-number" x={device.x} y={device.y + yOffset + 3} textAnchor="middle">
              {device.terminalBlock?.poles[row]?.label ?? row + 1}
            </text>
          </g>
        ))}
        <text className="candidate-label small-label" x={device.x} y={device.y + 76} textAnchor="middle">{device.label}</text>
      </SelectableGroup>
    );
  }

  if (device.variant === "earth_terminal") {
    return (
      <SelectableGroup height={94} interaction={interaction} width={108} x={device.x} y={device.y}>
        <rect className="candidate-device terminal" x={device.x - 44} y={device.y - 30} width="88" height="60" rx="8" />
        {[-22, 0, 22].map((offset) => (
          <circle className="device-detail" cx={device.x + offset} cy={device.y} key={offset} r="6" />
        ))}
        <text className="candidate-symbol-text centered" x={device.x} y={device.y + 23}>
          ED
        </text>
        {label}
      </SelectableGroup>
    );
  }

  if (device.variant === "motor_terminal") {
    return (
      <SelectableGroup height={100} interaction={interaction} width={104} x={device.x} y={device.y}>
        <circle className="candidate-device terminal" cx={device.x} cy={device.y} r="35" />
        <text className="candidate-symbol-text motor-mark" x={device.x} y={device.y + 8} textAnchor="middle">M</text>
        {label}
      </SelectableGroup>
    );
  }

  if (device.variant === "load_device") {
    return (
      <SelectableGroup height={100} interaction={interaction} width={104} x={device.x} y={device.y}>
        <circle className="candidate-device terminal" cx={device.x} cy={device.y} r="33" />
        <text className="candidate-symbol-text motor-mark" x={device.x} y={device.y + 8} textAnchor="middle">負荷</text>
        {label}
      </SelectableGroup>
    );
  }

  return (
    <SelectableGroup height={84} interaction={interaction} width={108} x={device.x} y={device.y}>
      <rect className={"candidate-device " + device.type} x={device.x - 44} y={device.y - 32} width="88" height="64" rx="8" />
      <text className="candidate-label" x={device.x} y={device.y + 5} textAnchor="middle">{device.label}</text>
    </SelectableGroup>
  );
}
function makeWirePath(from: CandidateDevice, to: CandidateDevice, offset: { x: number; y: number }) {
  const startX = from.x + offset.x;
  const startY = from.y + offset.y;
  const endX = to.x + offset.x;
  const endY = to.y + offset.y;
  const controlX = (startX + endX) / 2;
  const controlY = (startY + endY) / 2 - Math.min(44, Math.abs(endX - startX) * 0.12);
  return "M " + startX + " " + startY + " Q " + controlX + " " + controlY + " " + endX + " " + endY;
}

function getParallelOffset(
  connections: CandidateDiagram["connections"],
  index: number,
  from: CandidateDevice,
  to: CandidateDevice,
) {
  const parallelIndexes = connections.flatMap((connection, connectionIndex) =>
    connection.from === connections[index].from && connection.to === connections[index].to
      ? [connectionIndex]
      : []
  );
  const occurrenceIndex = parallelIndexes.indexOf(index);
  const pairOffset = parallelIndexes.length > 1
    ? (occurrenceIndex - (parallelIndexes.length - 1) / 2) * 18
    : ((index % 3) - 1) * 8;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: (-dy / length) * pairOffset,
    y: (dx / length) * pairOffset,
  };
}
