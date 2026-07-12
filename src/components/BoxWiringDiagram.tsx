import type { BoxInspectionPart, InspectionBox } from "../data/boxInspectionGame";

type BoxWiringDiagramProps = {
  box: InspectionBox;
  selectedPartId: string;
  answers: Record<string, string>;
  submitted: boolean;
  onSelectPart: (partId: string) => void;
};

export function BoxWiringDiagram({ box, selectedPartId, answers, submitted, onSelectPart }: BoxWiringDiagramProps) {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={box.label + "内の配線図"}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="56" textAnchor="middle">{box.label}内 配線図</text>
      <rect className="box" x="92" y="82" width="536" height="234" rx="22" />
      <text className="small" x="360" y="108" textAnchor="middle">接続部を選択して欠陥を判定</text>
      <path className="wire black" d="M 118 155 C 205 155, 225 148, 310 154" />
      <path className="wire white" d="M 118 184 C 205 184, 225 194, 310 184" />
      <path className="wire black" d="M 410 154 C 495 148, 520 155, 602 155" />
      <path className="wire white" d="M 410 184 C 495 194, 520 184, 602 184" />
      <path className="wire red" d="M 118 252 C 205 252, 225 246, 310 252" />
      <path className="wire green" d="M 410 252 C 495 246, 520 252, 602 252" />
      {box.parts.map((part, index) => (
        <ConnectionPart
          answered={Boolean(answers[part.id])}
          key={part.id}
          onSelectPart={onSelectPart}
          part={part}
          selected={selectedPartId === part.id}
          submitted={submitted}
          x={index % 2 === 0 ? 270 : 450}
          y={index < 2 ? 169 : 252}
        />
      ))}
    </svg>
  );
}

function ConnectionPart({
  part, x, y, selected, answered, submitted, onSelectPart,
}: {
  part: BoxInspectionPart;
  x: number;
  y: number;
  selected: boolean;
  answered: boolean;
  submitted: boolean;
  onSelectPart: (partId: string) => void;
}) {
  const className = ["box-connection", selected ? "selected" : "", answered ? "answered" : ""].filter(Boolean).join(" ");
  const isRing = part.title.startsWith("リングスリーブ");
  return (
    <g className={className} onClick={() => onSelectPart(part.id)} role="button" tabIndex={0} aria-label={part.title + "を選択"}>
      <rect className="box-connection-hit" x={x - 122} y={y - 30} width="244" height="60" rx="10" />
      {isRing ? (
        <>
          <rect className="sleeve" x={x - 34} y={y - 22} width="68" height="44" rx="14" />
          <rect className="sleeve-mark" x={x - 12} y={y - 12} width="24" height="24" rx="5" />
          <text className="sleeve-text" x={x} y={y + 6} textAnchor="middle">○</text>
        </>
      ) : (
        <>
          <rect className="device" x={x - 48} y={y - 22} width="96" height="44" rx="10" />
          <circle className="connector" cx={x - 20} cy={y} r="8" />
          <circle className="connector" cx={x} cy={y} r="8" />
          <circle className="connector" cx={x + 20} cy={y} r="8" />
        </>
      )}
      <text className="small" x={x + 138} y={y + 5}>{part.title} {answered ? "回答済" : "選択"}</text>
    </g>
  );
}
