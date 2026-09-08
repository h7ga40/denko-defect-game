import type { ReactNode } from "react";
import type { DeviceVariant } from "../data/candidateDiagrams";
import type { CableEntrySide, WireColor } from "../data/boxInspectionGame";
import { LampEntryOrthographic } from "./svg/diagrams/LampEntryOrthographic";
import { ExposedReceptacleDiagram } from "./svg/diagrams/ExposedReceptacleDiagram";
import { getDeviceSpecification } from "../data/deviceSpecifications";
import type { CableRunSpecification } from "../data/cableSpecifications";
import { CableInspectionDiagram } from "./svg/CableInspectionDiagram";
import type {
  InspectionObservation,
  InspectionViewpoint,
  PhysicalInspectionModel,
  PhysicalTargetState,
} from "../data/physicalInspection";

export type PhysicalInspectionDisplayPart = {
  title: string;
  defectType: import("../data/problems").DefectType;
  physicalInspection: PhysicalInspectionModel;
  deviceVariant?: DeviceVariant;
  cableEntrySide?: CableEntrySide;
  connection?: { method: string; wireColors: WireColor[] };
  installedCable?: CableRunSpecification;
  correctCable?: CableRunSpecification;
  fromLabel?: string;
  toLabel?: string;
};

type Props = {
  children: ReactNode;
  part: PhysicalInspectionDisplayPart;
  viewpoint: InspectionViewpoint;
  latestObservation?: InspectionObservation;
};

const colorStroke: Record<WireColor, string> = {
  black: "#171717",
  white: "#ffffff",
  red: "#c83349",
  green: "#17945f",
  blue: "#2f6fbb",
};

export function PhysicalInspectionView({ children, part, viewpoint, latestObservation }: Props) {
  const motionClass = latestObservation?.result === "released"
    ? "inspection-motion-released"
    : latestObservation?.result === "movement_detected"
      ? "inspection-motion-wiggle"
      : latestObservation?.result === "retained"
        ? "inspection-motion-pull"
        : "";

  return (
    <div className={["physical-inspection-view", `viewpoint-${viewpoint}`, motionClass].filter(Boolean).join(" ")}>
      {viewpoint === "front" ? children : (
        <OrthographicDiagram latestObservation={latestObservation} part={part} viewpoint={viewpoint} />
      )}
    </div>
  );
}

function OrthographicDiagram({
  latestObservation,
  part,
  viewpoint,
}: {
  latestObservation?: InspectionObservation;
  part: PhysicalInspectionDisplayPart;
  viewpoint: InspectionViewpoint;
}) {
  const target = selectInspectionTarget(part, latestObservation);
  const title = part.title.split("（")[0].trim();
  const directVariant = part.deviceVariant;
  const terminalCount = directVariant ? getDeviceSpecification(directVariant)?.terminals.length ?? 2 : 2;
  const side = viewpoint === "left" || viewpoint === "right";
  if (part.installedCable && part.correctCable) {
    return <CableInspectionDiagram viewpoint={viewpoint} part={{ title: part.title, defectType: part.defectType, installedCable: part.installedCable, correctCable: part.correctCable, fromLabel: part.fromLabel ?? "始端", toLabel: part.toLabel ?? "終端" }} />;
  }

  if (directVariant === "exposed_receptacle") {
    const states = Object.values(part.physicalInspection.installed.targets);
    const defectType = states.some(item => item.cableRouting === "over_base")
      ? "exposed_receptacle_entry_bypass"
      : states.some(item => item.sheathPosition === "outside_base") ? "exposed_receptacle_sheath"
      : states.some(item => item.tightening === "loose") ? "terminal_screw_loose"
      : states.some(item => item.connection === "wrong_target") ? "receptacle_polarity" : "none";
    return <div className="orthographic-object"><ExposedReceptacleDiagram cableEntrySide={part.cableEntrySide} defectType={defectType} viewpoint={viewpoint} /></div>;
  }

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={`${title}の${viewpointName(viewpoint)}確認図`}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="52" textAnchor="middle">{title}</text>
      <text className="inspection-view-label" x="360" y="78" textAnchor="middle">{viewpointName(viewpoint)}確認図</text>
      <g className="orthographic-object" data-physical-target={target?.id}>
        {directVariant === "lamp_receptacle" ? (
          <LampEntryOrthographic
            bypassEntry={Object.values(part.physicalInspection.installed.targets).some((item) => item.cableRouting === "over_base")}
            cableEntrySide={part.cableEntrySide}
            side={side}
            mirrored={viewpoint === "right"}
            loose={Object.values(part.physicalInspection.installed.targets).some((item) => item.tightening === "loose")}
            cannotClose={Object.values(part.physicalInspection.installed.targets).some((item) => item.assembly === "cannot_close")}
          />
        ) : part.installedCable ? (
          <CableOrthographic part={part} side={side} />
        ) : part.connection ? (
          <ConnectionOrthographic method={part.connection.method} side={side} wireColors={part.connection.wireColors} />
        ) : side ? (
          <DeviceSideView mirrored={viewpoint === "right"} round={isRoundVariant(directVariant)} target={target} variant={directVariant} />
        ) : (
          <DeviceBackView round={isRoundVariant(directVariant)} target={target} terminalCount={terminalCount} variant={directVariant} />
        )}
      </g>
      {(part.installedCable || part.connection) && (
        <text className="small" x="360" y="342" textAnchor="middle">
          {side ? "側面から収まりと固定状態を確認" : "背面から端子と固定状態を確認"}
        </text>
      )}
    </svg>
  );
}

function DeviceBackView({
  round,
  target,
  terminalCount,
  variant,
}: {
  round: boolean;
  target?: PhysicalTargetState;
  terminalCount: number;
  variant?: DeviceVariant;
}) {
  const specification = getDeviceSpecification(variant);
  const terminals = specification?.terminals
    ?? Array.from({ length: Math.max(2, terminalCount) }, (_, index) => ({
      id: String(index + 1),
      label: String(index + 1),
      insertionHoles: 1,
    }));

  if (variant === "terminal_block" || variant === "timer_switch" || variant === "automatic_switch") {
    return <TerminalBlockBackView target={target} terminals={terminals} />;
  }
  if (variant === "circuit_breaker" || variant === "earth_leakage_breaker") {
    return <BreakerBackView target={target} terminals={terminals} />;
  }
  if (specification?.connectionMethod === "push_in") {
    return <PushInDeviceBackView target={target} terminals={terminals} />;
  }
  return <ScrewDeviceBackView round={round} target={target} terminals={terminals} />;
}

function TerminalBlockBackView({
  target,
  terminals,
}: {
  target?: PhysicalTargetState;
  terminals: ReadonlyArray<{ id: string; label: string }>;
}) {
  const spacing = Math.min(54, 260 / Math.max(1, terminals.length - 1));
  const startX = 360 - ((terminals.length - 1) * spacing) / 2;
  return (
    <>
      <rect className="orthographic-terminal-block" x="190" y="118" width="340" height="168" rx="10" />
      <rect className="orthographic-terminal-bridge" x="208" y="166" width="304" height="72" rx="8" />
      {terminals.map((terminal, index) => {
        const x = startX + index * spacing;
        const active = isPhysicalTerminal(target, terminal.id);
        const loose = active && target?.tightening === "loose";
        const upperY = loose ? 159 : 169;
        return (
          <g data-physical-target={terminalTargetId(target, terminal.id)} key={terminal.id}>
            <text className="orthographic-terminal-label" x={x} y="145" textAnchor="middle">{terminal.label}</text>
            <circle className={active ? "orthographic-terminal alert-stroke" : "orthographic-terminal"} cx={x} cy={upperY} r="12" />
            <line className={active ? "orthographic-screw alert-stroke" : "orthographic-screw"} x1={x - 7} y1={upperY} x2={x + 7} y2={upperY} />
            <circle className="orthographic-terminal" cx={x} cy="235" r="12" />
            <line className="orthographic-screw" x1={x - 7} y1="235" x2={x + 7} y2="235" />
            <path className={active ? "orthographic-wire black alert-stroke" : "orthographic-wire black"} d={`M ${x} ${upperY - 12} V 92`} />
          </g>
        );
      })}
      <text className="orthographic-caption" x="360" y="312" textAnchor="middle">端子台 施工側・施工省略側</text>
      {target?.tightening === "loose" && <text className="defect-label" x="360" y="332" textAnchor="middle">選択端子のねじが浮いている</text>}
    </>
  );
}

function BreakerBackView({
  target,
  terminals,
}: {
  target?: PhysicalTargetState;
  terminals: ReadonlyArray<{ id: string; label: string }>;
}) {
  const positions = [
    { x: 325, y: 137 },
    { x: 395, y: 137 },
    { x: 325, y: 267 },
    { x: 395, y: 267 },
  ];
  return (
    <>
      <rect className="orthographic-breaker-body" x="280" y="93" width="160" height="218" rx="12" />
      <rect className="orthographic-breaker-center" x="307" y="166" width="106" height="72" rx="9" />
      <path className="orthographic-breaker-toggle" d="M 348 218 V 184 H 374 V 218" />
      {terminals.map((terminal, index) => {
        const position = positions[index] ?? { x: 325 + (index % 2) * 70, y: 137 + Math.floor(index / 2) * 130 };
        const active = isPhysicalTerminal(target, terminal.id);
        const loose = active && target?.tightening === "loose";
        const y = loose ? position.y - 9 : position.y;
        const wireEnd = position.y < 200 ? 82 : 322;
        return (
          <g data-physical-target={terminalTargetId(target, terminal.id)} key={terminal.id}>
            <circle className={active ? "orthographic-terminal alert-stroke" : "orthographic-terminal"} cx={position.x} cy={y} r="14" />
            <line className={active ? "orthographic-screw alert-stroke" : "orthographic-screw"} x1={position.x - 9} y1={y} x2={position.x + 9} y2={y} />
            <path className={active ? "orthographic-wire black alert-stroke" : "orthographic-wire black"} d={`M ${position.x} ${y + (position.y < 200 ? -14 : 14)} V ${wireEnd}`} />
            <text className="orthographic-terminal-label" x={position.x} y={position.y < 200 ? 160 : 291} textAnchor="middle">{terminal.label}</text>
          </g>
        );
      })}
      <text className="orthographic-caption" x="360" y="336" textAnchor="middle">遮断器端子側</text>
    </>
  );
}

function PushInDeviceBackView({
  target,
  terminals,
}: {
  target?: PhysicalTargetState;
  terminals: ReadonlyArray<{ id: string; label: string; insertionHoles?: number }>;
}) {
  const rowGap = Math.min(50, 122 / Math.max(1, terminals.length - 1));
  const startY = 202 - ((terminals.length - 1) * rowGap) / 2;
  return (
    <>
      <rect className="orthographic-mount" x="270" y="91" width="34" height="222" rx="8" />
      <rect className="orthographic-push-body" x="304" y="112" width="154" height="180" rx="13" />
      <rect className="orthographic-strip-gauge" x="323" y="130" width="42" height="10" rx="4" />
      {terminals.map((terminal, index) => {
        const y = startY + index * rowGap;
        const active = isPhysicalTerminal(target, terminal.id);
        const releases = active && target?.retention === "releases_on_pull";
        const holeCount = Math.max(1, terminal.insertionHoles ?? 1);
        return (
          <g data-physical-target={terminalTargetId(target, terminal.id)} key={terminal.id}>
            <text className="orthographic-terminal-label" x="326" y={y + 5}>{terminal.label}</text>
            {Array.from({ length: holeCount }, (_, holeIndex) => {
              const x = 396 + holeIndex * 30;
              return (
                <g key={holeIndex}>
                  <circle className={active ? "orthographic-terminal alert-stroke" : "orthographic-terminal"} cx={x} cy={y} r="11" />
                  <circle className={active ? "orthographic-retention-claw alert-stroke" : "orthographic-retention-claw"} cx={x} cy={y} r="4" />
                </g>
              );
            })}
            <path
              className={releases ? "orthographic-wire black alert-stroke" : "orthographic-wire black"}
              d={releases ? `M 392 ${y} H 510` : `M 407 ${y} H 594`}
            />
          </g>
        );
      })}
      <text className="orthographic-caption" x="360" y="323" textAnchor="middle">差込端子側</text>
      {target?.retention === "releases_on_pull" && <text className="defect-label" x="360" y="343" textAnchor="middle">選択端子の固定爪が心線を保持していない</text>}
    </>
  );
}

function ScrewDeviceBackView({
  round,
  target,
  terminals,
}: {
  round: boolean;
  target?: PhysicalTargetState;
  terminals: ReadonlyArray<{ id: string; label: string }>;
}) {
  const positions = terminals.map((_, index) =>
    360 + (index - (terminals.length - 1) / 2) * Math.min(58, 190 / Math.max(1, terminals.length - 1))
  );
  return (
    <>
      {round
        ? <circle className="orthographic-body" cx="360" cy="202" r="92" />
        : <rect className="orthographic-mount" x="270" y="105" width="180" height="194" rx="12" />}
      <rect className="orthographic-back" x="292" y="127" width="136" height="150" rx="15" />
      {terminals.map((terminal, index) => {
        const x = positions[index];
        const active = isPhysicalTerminal(target, terminal.id);
        const loose = active && target?.tightening === "loose";
        const terminalY = loose ? 191 : 201;
        return (
          <g data-physical-target={terminalTargetId(target, terminal.id)} key={terminal.id}>
            <circle className={active ? "orthographic-terminal alert-stroke" : "orthographic-terminal"} cx={x} cy={terminalY} r="13" />
            <line className={active ? "orthographic-screw alert-stroke" : "orthographic-screw"} x1={x - 8} y1={terminalY} x2={x + 8} y2={terminalY} />
            <text className="orthographic-terminal-label" x={x} y="236" textAnchor="middle">{terminal.label}</text>
          </g>
        );
      })}
      <rect className="orthographic-cable-entry" x="330" y="260" width="60" height="19" rx="8" />
      <path className={target?.retention === "releases_on_pull" ? "orthographic-wire black alert-stroke" : "orthographic-wire black"} d="M 345 260 C 338 245, 326 228, 320 216" />
      <path className="orthographic-wire white" d="M 375 260 C 382 245, 394 228, 400 216" />
      <text className="orthographic-caption" x="360" y="112" textAnchor="middle">ねじ端子側</text>
      {target?.tightening === "loose" && <text className="defect-label" x="360" y="314" textAnchor="middle">選択端子のねじが浮いている</text>}
    </>
  );
}
function DeviceSideView({
  mirrored,
  round,
  target,
  variant,
}: {
  mirrored: boolean;
  round: boolean;
  target?: PhysicalTargetState;
  variant?: DeviceVariant;
}) {
  const cannotClose = target?.assembly === "cannot_close";
  const terminalBlock = variant === "terminal_block" || variant === "timer_switch" || variant === "automatic_switch";
  const breaker = variant === "circuit_breaker" || variant === "earth_leakage_breaker";
  const pushIn = getDeviceSpecification(variant)?.connectionMethod === "push_in";
  const alert = target?.tightening === "loose" || target?.retention === "releases_on_pull";
  const caption = cannotClose
    ? "電線が干渉し、カバーが閉じない"
    : terminalBlock
      ? "端子台側面"
      : breaker
        ? "遮断器側面"
        : pushIn
          ? "埋込器具側面"
          : mirrored ? "右側面" : "左側面";

  return (
    <>
      <g transform={mirrored ? "translate(720 0) scale(-1 1)" : undefined}>
        {terminalBlock ? (
          <>
            <rect className="orthographic-terminal-block" x="278" y="145" width="172" height="114" rx="9" />
            <rect className="orthographic-terminal-bridge" x="308" y="158" width="112" height="88" rx="7" />
            <circle className={alert ? "orthographic-terminal alert-stroke" : "orthographic-terminal"} cx="414" cy={alert ? 177 : 184} r="12" />
            <path className={alert ? "orthographic-wire black alert-stroke" : "orthographic-wire black"} d="M 426 184 H 610" />
            <path className="orthographic-wire white" d="M 426 222 H 610" />
          </>
        ) : breaker ? (
          <>
            <rect className="orthographic-mount" x="292" y="101" width="20" height="202" rx="6" />
            <rect className="orthographic-breaker-body" x="312" y="111" width="120" height="182" rx="10" />
            <path className="orthographic-breaker-toggle" d="M 334 220 H 397 V 246 H 334" />
            <circle className={alert ? "orthographic-terminal alert-stroke" : "orthographic-terminal"} cx={alert ? 440 : 430} cy="148" r="12" />
            <circle className="orthographic-terminal" cx="430" cy="256" r="12" />
            <path className={alert ? "orthographic-wire black alert-stroke" : "orthographic-wire black"} d="M 442 148 H 610" />
            <path className="orthographic-wire white" d="M 442 256 H 610" />
          </>
        ) : pushIn ? (
          <>
            <rect className="orthographic-mount" x="292" y="102" width="22" height="200" rx="7" />
            <rect className="orthographic-push-body" x="314" y="128" width="126" height="148" rx="13" />
            <rect className="orthographic-back" x="410" y="146" width="34" height="112" rx="9" />
            <circle className={alert ? "orthographic-terminal alert-stroke" : "orthographic-terminal"} cx="427" cy="183" r="10" />
            <circle className="orthographic-terminal" cx="427" cy="222" r="10" />
            <path className={alert ? "orthographic-wire black alert-stroke" : "orthographic-wire black"} d={alert ? "M 438 183 H 524" : "M 438 183 H 624"} />
            <path className="orthographic-wire white" d="M 438 222 H 624" />
          </>
        ) : (
          <>
            <rect className="orthographic-mount" x="292" y="105" width="22" height="194" rx="7" />
            {round && cannotClose ? (
              <>
                <path className="orthographic-body" d="M 314 150 C 390 150, 424 169, 424 202 C 424 235, 390 254, 314 254 Z" />
                <path className="orthographic-cover alert-stroke" d="M 438 114 C 518 137, 546 175, 532 228 C 501 219, 475 202, 456 177 Z" />
                <path className="orthographic-wire black alert-stroke" d="M 390 204 C 442 247, 480 251, 526 230" />
              </>
            ) : round
              ? <path className="orthographic-body" d="M 314 126 C 410 133, 449 161, 449 202 C 449 243, 410 271, 314 278 Z" />
              : <rect className="orthographic-body" x="314" y="126" width="126" height="152" rx="18" />}
            <rect className="orthographic-back" x="410" y="146" width="34" height="112" rx="9" />
            <circle className="orthographic-terminal" cx="427" cy="183" r="10" />
            <circle className="orthographic-terminal" cx="427" cy="222" r="10" />
            {!cannotClose && <path className={alert ? "orthographic-wire black alert-stroke" : "orthographic-wire black"} d="M 427 183 C 500 183, 548 167, 624 160" />}
            <path className="orthographic-wire white" d="M 427 222 C 500 222, 548 238, 624 245" />
          </>
        )}
        <path className="orthographic-depth" d="M 292 304 H 450" />
      </g>
      <text className="orthographic-caption" x="360" y="323" textAnchor="middle">{caption}</text>
    </>
  );
}
function ConnectionOrthographic({ method, side, wireColors }: { method: string; side: boolean; wireColors: WireColor[] }) {
  const colors: WireColor[] = wireColors.length ? wireColors : ["black", "white"];
  if (method === "outlet_box") {
    return side ? (
      <>
        <rect className="orthographic-box" x="246" y="112" width="228" height="180" rx="10" />
        <rect className="orthographic-box-side" x="438" y="126" width="58" height="152" rx="7" />
        <circle className="orthographic-port" cx="467" cy="202" r="19" />
        <path className="orthographic-cable" d="M 486 202 H 638" />
        <text className="orthographic-caption" x="360" y="318" textAnchor="middle">ボックス側面と引込口</text>
      </>
    ) : (
      <>
        <rect className="orthographic-box" x="235" y="92" width="250" height="220" rx="12" />
        {[292, 360, 428].map((x) => <circle className="orthographic-port" cx={x} cy="128" key={`top-${x}`} r="16" />)}
        {[292, 360, 428].map((x) => <circle className="orthographic-port" cx={x} cy="276" key={`bottom-${x}`} r="16" />)}
        <text className="orthographic-caption" x="360" y="207" textAnchor="middle">ボックス背面</text>
      </>
    );
  }
  if (method === "metal_conduit" || method === "pf_conduit") {
    return side ? (
      <>
        <path className="orthographic-conduit" d="M 90 202 H 330" />
        <rect className="orthographic-fitting" x="330" y="159" width="88" height="86" rx="12" />
        <rect className="orthographic-box-wall" x="418" y="112" width="22" height="180" />
        <circle className="orthographic-locknut" cx="463" cy="202" r="34" />
      </>
    ) : (
      <>
        <circle className="orthographic-conduit-face" cx="360" cy="202" r="92" />
        <circle className="orthographic-locknut" cx="360" cy="202" r="66" />
        {colors.map((color, index) => <circle fill={colorStroke[color]} key={index} cx={330 + index * 30} cy="202" r="9" />)}
      </>
    );
  }
  return side ? (
    <>
      {colors.map((color, index) => (
        <path className={`orthographic-wire ${color}`} d={`M 90 ${165 + index * 24} H 332`} key={index} />
      ))}
      <rect className="orthographic-connector-side" x="332" y="137" width="94" height={Math.max(82, colors.length * 24 + 28)} rx="17" />
      <text className="orthographic-caption" x="470" y="205">接続部側面</text>
    </>
  ) : (
    <>
      <rect className="orthographic-connector-back" x="276" y="122" width="168" height="160" rx="22" />
      {colors.map((color, index) => (
        <circle className="orthographic-port" cx={310 + index * (126 / Math.max(1, colors.length - 1))} cy="202" key={index} r="13" />
      ))}
      <text className="orthographic-caption" x="360" y="306" textAnchor="middle">接続部背面</text>
    </>
  );
}

function CableOrthographic({ part, side }: { part: PhysicalInspectionDisplayPart; side: boolean }) {
  const cable = part.installedCable!;
  return side ? (
    <>
      <path className="orthographic-cable" d="M 82 202 H 638" />
      {part.defectType === "cable_sheath_damage" && <path className="damage-cut" d="M 342 178 L 354 202 L 368 178 M 350 226 L 362 202 L 376 226" />}
      <rect className="orthographic-strip-window" x="486" y="166" width="122" height="72" rx="14" />
      {cable.coreColors.map((color, index) => (
        <path className={`orthographic-wire ${color}`} d={`M 500 ${180 + index * 20} H 638`} key={color + index} />
      ))}
      {part.defectType === "cable_insulation_damage" && <path className="damage-cut" d="M 548 171 L 558 181 L 568 171" />}
      <text className="orthographic-caption" x="360" y="282" textAnchor="middle">ケーブル側面</text>
    </>
  ) : (
    <>
      <circle className="orthographic-cable-face" cx="360" cy="202" r="88" />
      {cable.coreColors.map((color, index) => {
        const angle = (Math.PI * 2 * index) / cable.coreColors.length - Math.PI / 2;
        const x = 360 + Math.cos(angle) * 42;
        const y = 202 + Math.sin(angle) * 42;
        return (
          <g key={color + index}>
            <circle fill={colorStroke[color]} cx={x} cy={y} r="15" />
            {part.defectType === "cable_insulation_damage" && index === 0 && <path className="damage-cut" d={`M ${x - 12} ${y - 5} L ${x} ${y + 5} L ${x + 12} ${y - 5}`} />}
          </g>
        );
      })}
      <text className="orthographic-caption" x="360" y="306" textAnchor="middle">ケーブル端面</text>
    </>
  );
}

function selectInspectionTarget(part: PhysicalInspectionDisplayPart, latestObservation?: InspectionObservation) {
  const model = part.physicalInspection;
  if (latestObservation && !latestObservation.actionId.endsWith(":view")) {
    const observed = model.installed.targets[latestObservation.targetId];
    if (observed) return observed;
  }
  return Object.values(model.installed.targets).find((target) => {
    const expected = model.expected.targets[target.id];
    return expected && JSON.stringify(expected) !== JSON.stringify(target);
  }) ?? Object.values(model.installed.targets)[0];
}

function isPhysicalTerminal(target: PhysicalTargetState | undefined, terminalId: string) {
  return target?.kind === "terminal" && target.id.endsWith(":terminal-" + terminalId);
}

function terminalTargetId(target: PhysicalTargetState | undefined, terminalId: string) {
  if (!target) return undefined;
  const rootId = target.parentId ?? target.id.split(":terminal-")[0].split(":cover")[0];
  return rootId + ":terminal-" + terminalId;
}

function isRoundVariant(variant: string | undefined) {
  return variant === "lamp_receptacle" || variant === "ceiling_connector" || variant === "exposed_receptacle";
}

function viewpointName(viewpoint: InspectionViewpoint) {
  if (viewpoint === "back") return "背面";
  if (viewpoint === "left") return "左側面";
  if (viewpoint === "right") return "右側面";
  return "正面";
}
