import type { DefectType } from "../../../data/problems";

export function PfConduitDiagram({ defectType }: { defectType: DefectType }) {
  const shortInsert = defectType === "pf_conduit_insufficient_insert";
  const missingLocknut = defectType === "pf_conduit_missing_locknut";
  const conduitEnd = shortInsert ? 318 : 390;

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="PF管工事の欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="58" textAnchor="middle">合成樹脂製可とう電線管 PF16</text>
      <rect className="box" x="390" y="90" width="230" height="220" rx="18" />
      <rect className="pf-connector" x="348" y="150" width="90" height="96" rx="16" />
      {!missingLocknut && <rect className="locknut" x="410" y="146" width="18" height="104" rx="4" />}

      <path className={shortInsert ? "pf-conduit alert-stroke" : "pf-conduit"} d={"M 76 198 L " + conduitEnd + " 198"} />
      {[105, 135, 165, 195, 225, 255, 285].map((x) => (
        <line className="pf-rib" key={x} x1={x} y1="177" x2={x} y2="219" />
      ))}
      <path className="wire black" d="M 95 187 L 520 187" />
      <path className="wire white" d="M 95 198 L 520 198" />
      <path className="wire red" d="M 95 209 L 520 209" />
      {shortInsert && <line className="missing" x1="320" y1="178" x2="348" y2="178" />}

      <text className="small" x="195" y="248" textAnchor="middle">PF16</text>
      <text className="defect-label" x="360" y="350" textAnchor="middle">
        {shortInsert
          ? "PF管がコネクタへ十分に挿入されていない"
          : missingLocknut
            ? "ボックス内側のロックナットが取り付けられていない"
            : "PF管と専用付属品を正しく取り付けた正常な状態"}
      </text>
    </svg>
  );
}