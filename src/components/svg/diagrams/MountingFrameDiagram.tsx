import type { CandidateMountingFrame, CandidateMountingFrameMember, MountingFramePosition } from "../../../data/candidateDiagrams";
import type { DefectType } from "../../../data/problems";

type Props = {
  frame?: CandidateMountingFrame;
  defectType?: DefectType;
};

const slotY: Record<MountingFramePosition, number> = { top: 130, middle: 190, bottom: 250 };
const defaultMembers: CandidateMountingFrameMember[] = [
  { id: "switch", label: "片切", variant: "single_pole_switch", position: "top" },
  { id: "pilot", label: "表示灯", variant: "pilot_lamp", position: "bottom" },
];

export function MountingFrameDiagram({ frame, defectType = "mounting_frame_loose" }: Props) {
  const members = getDisplayedMembers(frame?.members ?? defaultMembers, defectType);
  const title = frame?.label ?? "埋込連用取付枠";
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={title + "の施工図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="55" textAnchor="middle">{title}</text>
      <rect className="mounting-frame-body" x="285" y="80" width="150" height="220" rx="12" />
      <rect className="device-detail" x="310" y="96" width="100" height="188" rx="7" />
      <circle className="device-detail" cx="360" cy="94" r="6" />
      <circle className="device-detail" cx="360" cy="286" r="6" />
      {(frame?.jumpers ?? []).map((jumper) => {
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
      {members.map((member) => <FrameMember member={member} key={member.id} />)}
      {defectType === "mounting_frame_loose" && (
        <>
          <circle className="warning" cx="420" cy="250" r="20" />
          <line className="missing" x1="407" y1="237" x2="433" y2="263" />
          <line className="missing" x1="433" y1="237" x2="407" y2="263" />
        </>
      )}
      <text className={defectType === "none" ? "small" : "defect-label"} x="360" y="350" textAnchor="middle">
        {defectType === "mounting_frame_wrong_position"
          ? "器具の取付位置が施工条件と異なります"
          : defectType === "mounting_frame_loose"
            ? "片側の固定爪が掛かっていません"
            : "指定位置に確実に固定されています"}
      </text>
    </svg>
  );
}

function FrameMember({ member }: { member: CandidateMountingFrameMember }) {
  const y = slotY[member.position];
  const receptacle = member.variant === "embedded_receptacle" || member.variant === "double_receptacle" || member.variant === "grounded_receptacle" || member.variant === "grounded_20a_receptacle" || member.variant === "eet_receptacle";
  const pilot = member.variant === "pilot_lamp";
  return (
    <g>
      <rect className="mounting-frame-slot" x="320" y={y - 24} width="80" height="48" rx="7" />
      {receptacle ? (
        <>
          <line className="device-mark" x1="344" y1={y - 10} x2="344" y2={y + 10} />
          <line className="device-mark" x1="376" y1={y - 10} x2="376" y2={y + 10} />
        </>
      ) : pilot ? (
        <><circle className="pilot-core" cx="360" cy={y} r="12" /><text className="small" x="412" y={y + 5}>{member.label}</text></>
      ) : (
        <><rect className="mounting-frame-rocker" x="331" y={y - 15} width="58" height="30" rx="5" /><text className="small" x="412" y={y + 5}>{member.label}</text></>
      )}
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
