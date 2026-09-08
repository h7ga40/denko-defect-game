import type { CandidateMountingFrame, CandidateMountingFrameMember, MountingFramePosition } from "../../../data/candidateDiagrams";
import type { DefectType } from "../../../data/problems";
import type { InspectionViewpoint } from "../../../data/physicalInspection";
import { getDeviceSpecification } from "../../../data/deviceSpecifications";

type Props = {
  frame?: CandidateMountingFrame;
  defectType?: DefectType;
  viewpoint?: InspectionViewpoint;
};

const slotY: Record<MountingFramePosition, number> = { top: 130, middle: 190, bottom: 250 };
const defaultMembers: CandidateMountingFrameMember[] = [
  { id: "switch", label: "片切", variant: "single_pole_switch", position: "top" },
  { id: "pilot", label: "表示灯", variant: "pilot_lamp", position: "bottom" },
];

export function MountingFrameDiagram({ frame, defectType = "mounting_frame_loose", viewpoint = "front" }: Props) {
  const members = getDisplayedMembers(frame?.members ?? defaultMembers, defectType);
  const title = frame?.label ?? "埋込連用取付枠";
  const side = viewpoint === "left" || viewpoint === "right";
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の施工図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="55" textAnchor="middle">{title}</text>
      <text className="small" x="58" y="92">施工条件（指定位置）</text>
      {(frame?.members ?? defaultMembers).map(member => {
        const name = getDeviceSpecification(member.variant)?.name ?? member.label;
        return <text key={member.id} className="fitting-member-name" x="58" y={slotY[member.position] - 12}>
          <tspan x="58">{member.position === "top" ? "上" : member.position === "middle" ? "中" : "下"}</tspan>
          {Array.from({length: Math.ceil(name.length / 14)}, (_, i) => <tspan x="58" dy="16" key={i}>{name.slice(i * 14, (i + 1) * 14)}</tspan>)}
        </text>;
      })}
      <path className="fitting-frame-metal" fillRule="evenodd" d="M 292 78 H 428 V 310 H 292 Z M 317 108 V 280 H 403 V 108 Z" />
      {[91, 298].map(y => <rect key={y} className="fitting-frame-opening" x="348" y={y - 4} width="24" height="8" rx="4" />)}
      {Object.entries(slotY).map(([position, y]) => <g key={position}>
        <text className="small" x="272" y={y + 5} textAnchor="end">{position === "top" ? "上" : position === "middle" ? "中" : "下"}</text>
        {[300, 411].map(x => <rect className="fitting-frame-opening" key={x} x={x} y={y - 12} width="9" height="24" rx="2" />)}
      </g>)}
      {viewpoint === "back" && (frame?.jumpers ?? []).map((jumper) => {
        const from = members.find((member) => member.id === jumper.fromMemberId);
        const to = members.find((member) => member.id === jumper.toMemberId);
        if (!from || !to) return null;
        const fromY = slotY[from.position];
        const toY = slotY[to.position];
        return (
          <path
            className={"mounting-frame-jumper " + jumper.color}
            d={`M 320 ${fromY} C 298 ${fromY}, 298 ${toY}, 320 ${toY}`}
            key={jumper.id}
          />
        );
      })}
      {members.map((member, index) => <FrameMember member={member} key={member.id} loose={defectType === "mounting_frame_loose" && index === members.length - 1} viewpoint={viewpoint} />)}
      <text className="small" x="360" y="350" textAnchor="middle">{side ? "固定爪の側面断面・器具の位置を展開" : viewpoint === "back" ? "背面・器具の配置と固定爪" : "正面・器具の配置と固定爪"}</text>
    </svg>
  );
}

function FrameMember({ member, loose, viewpoint }: { member: CandidateMountingFrameMember; loose: boolean; viewpoint: InspectionViewpoint }) {
  const y = slotY[member.position];
  const receptacle = member.variant === "embedded_receptacle" || member.variant === "double_receptacle" || member.variant === "grounded_receptacle" || member.variant === "grounded_20a_receptacle" || member.variant === "eet_receptacle";
  const pilot = member.variant === "pilot_lamp";
  const side = viewpoint === "left" || viewpoint === "right";
  const name = getDeviceSpecification(member.variant)?.name ?? member.label;
  return (
    <g data-frame-member={member.id} data-position={member.position} data-frame-fixed={!loose}>
      <g transform={loose ? `rotate(-7 310 ${y})` : undefined}>
      <rect className="mounting-frame-slot" x="320" y={y - 24} width="80" height="48" rx="7" />
      {viewpoint === "back" || side ? <>
        <rect className="fitting-terminal-body" x="320" y={y - 24} width="80" height="48" rx="4" />
        {[338, 379].map(x => <circle className="fitting-hole" key={x} cx={x} cy={y + 8} r="6" />)}
      </> : receptacle ? (
        <>
          <line className="device-mark" x1="344" y1={y - 10} x2="344" y2={y + 10} />
          <line className="device-mark" x1="376" y1={y - 10} x2="376" y2={y + 10} />
        </>
      ) : pilot ? (
        <rect className="fitting-pilot-lens" x="331" y={y - 14} width="58" height="28" rx="4" />
      ) : (
        <rect className="mounting-frame-rocker" x="331" y={y - 15} width="58" height="30" rx="5" />
      )}
      <path className="fitting-claw" d={`M 322 ${y - 8} H 307 V ${y + 8} H 316`} />
      <path className="fitting-claw" data-frame-claw={loose ? "open" : "engaged"} d={loose ? `M 398 ${y - 8} L 411 ${y - 21} L 425 ${y - 21}` : `M 398 ${y - 8} H 413 V ${y + 8} H 404`} />
      </g>
      <text className="fitting-member-name" x="446" y={y - 7}><title>{name}</title>{Array.from({length: Math.ceil(name.length / 15)}, (_, i) => <tspan x="446" dy={i === 0 ? 0 : 16} key={i}>{name.slice(i * 15, (i + 1) * 15)}</tspan>)}</text>
    </g>
  );
}

function getDisplayedMembers(members: CandidateMountingFrameMember[], defectType: DefectType) {
  if (defectType !== "mounting_frame_wrong_position" || members.length === 0) return members;
  if (members.length === 1) {
    const member = members[0];
    const position: MountingFramePosition = member.position === "top" ? "bottom" : "top";
    return [{ ...member, position }];
  }
  const first = members[0];
  const last = members[members.length - 1];
  return members.map((member, index) => index === 0
    ? { ...member, position: last.position }
    : index === members.length - 1
      ? { ...member, position: first.position }
      : member);
}
