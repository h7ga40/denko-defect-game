import type { ReactNode } from "react";
import type { InspectionPart, WireColor } from "../data/boxInspectionGame";
import { getDeviceSpecification } from "../data/deviceSpecifications";
import type { InspectionObservation, InspectionViewpoint } from "../data/physicalInspection";

type Props = {
  children: ReactNode;
  part: InspectionPart;
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
      {viewpoint === "front" ? children : <OrthographicDiagram part={part} viewpoint={viewpoint} />}
    </div>
  );
}

function OrthographicDiagram({ part, viewpoint }: { part: InspectionPart; viewpoint: InspectionViewpoint }) {
  const target = Object.values(part.physicalInspection.installed.targets)[0];
  const title = part.title.split("（")[0].trim();
  const directVariant = "deviceVariant" in part ? part.deviceVariant : undefined;
  const terminalCount = directVariant ? getDeviceSpecification(directVariant)?.terminals.length ?? 2 : 2;
  const side = viewpoint === "left" || viewpoint === "right";

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={`${title}の${viewpointName(viewpoint)}確認図`}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="52" textAnchor="middle">{title}</text>
      <text className="inspection-view-label" x="360" y="78" textAnchor="middle">{viewpointName(viewpoint)}確認図</text>
      <g className="orthographic-object" data-physical-target={target?.id}>
        {"installedCable" in part ? (
          <CableOrthographic part={part} side={side} />
        ) : "connection" in part ? (
          <ConnectionOrthographic method={part.connection.method} side={side} wireColors={part.connection.wireColors} />
        ) : side ? (
          <DeviceSideView mirrored={viewpoint === "right"} round={isRoundVariant(directVariant)} />
        ) : (
          <DeviceBackView round={isRoundVariant(directVariant)} terminalCount={terminalCount} />
        )}
      </g>
      <text className="small" x="360" y="342" textAnchor="middle">
        {side ? "器具の厚み、電線の収まり、固定状態を確認" : "器具背面の端子、電線、固定状態を確認"}
      </text>
    </svg>
  );
}

function DeviceBackView({ round, terminalCount }: { round: boolean; terminalCount: number }) {
  const positions = Array.from({ length: Math.max(2, terminalCount) }, (_, index) => {
    const count = Math.max(2, terminalCount);
    return 360 + (index - (count - 1) / 2) * Math.min(58, 190 / Math.max(1, count - 1));
  });
  return (
    <>
      {round
        ? <circle className="orthographic-body" cx="360" cy="202" r="92" />
        : <rect className="orthographic-mount" x="270" y="105" width="180" height="194" rx="12" />}
      <rect className="orthographic-back" x="292" y="127" width="136" height="150" rx="15" />
      {positions.map((x, index) => (
        <g key={index}>
          <circle className="orthographic-terminal" cx={x} cy="201" r="13" />
          <line className="orthographic-screw" x1={x - 8} y1="201" x2={x + 8} y2="201" />
        </g>
      ))}
      <rect className="orthographic-cable-entry" x="330" y="260" width="60" height="19" rx="8" />
      <path className="orthographic-wire black" d="M 345 260 C 338 245, 326 228, 320 216" />
      <path className="orthographic-wire white" d="M 375 260 C 382 245, 394 228, 400 216" />
      <text className="orthographic-caption" x="360" y="112" textAnchor="middle">端子側</text>
    </>
  );
}

function DeviceSideView({ mirrored, round }: { mirrored: boolean; round: boolean }) {
  return (
    <>
      <g transform={mirrored ? "translate(720 0) scale(-1 1)" : undefined}>
        <rect className="orthographic-mount" x="292" y="105" width="22" height="194" rx="7" />
        {round
          ? <path className="orthographic-body" d="M 314 126 C 410 133, 449 161, 449 202 C 449 243, 410 271, 314 278 Z" />
          : <rect className="orthographic-body" x="314" y="126" width="126" height="152" rx="18" />}
        <rect className="orthographic-back" x="410" y="146" width="34" height="112" rx="9" />
        <circle className="orthographic-terminal" cx="427" cy="183" r="10" />
        <circle className="orthographic-terminal" cx="427" cy="222" r="10" />
        <path className="orthographic-wire black" d="M 427 183 C 500 183, 548 167, 624 160" />
        <path className="orthographic-wire white" d="M 427 222 C 500 222, 548 238, 624 245" />
        <path className="orthographic-depth" d="M 314 304 H 440" />
      </g>
      <text className="orthographic-caption" x="360" y="323" textAnchor="middle">{mirrored ? "右側面" : "左側面"}</text>
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

function CableOrthographic({ part, side }: { part: Extract<InspectionPart, { installedCable: unknown }>; side: boolean }) {
  const cable = part.installedCable;
  return side ? (
    <>
      <path className="orthographic-cable" d="M 82 202 H 638" />
      <rect className="orthographic-strip-window" x="486" y="166" width="122" height="72" rx="14" />
      {cable.coreColors.map((color, index) => (
        <path className={`orthographic-wire ${color}`} d={`M 500 ${180 + index * 20} H 638`} key={color + index} />
      ))}
      <text className="orthographic-caption" x="360" y="282" textAnchor="middle">ケーブル側面</text>
    </>
  ) : (
    <>
      <circle className="orthographic-cable-face" cx="360" cy="202" r="88" />
      {cable.coreColors.map((color, index) => {
        const angle = (Math.PI * 2 * index) / cable.coreColors.length - Math.PI / 2;
        return <circle fill={colorStroke[color]} key={color + index} cx={360 + Math.cos(angle) * 42} cy={202 + Math.sin(angle) * 42} r="15" />;
      })}
      <text className="orthographic-caption" x="360" y="306" textAnchor="middle">ケーブル端面</text>
    </>
  );
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