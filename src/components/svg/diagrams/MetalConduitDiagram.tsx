import type { DefectType } from "../../../data/problems";

export function MetalConduitDiagram({ defectType }: { defectType: DefectType }) {
  const shortInsert = defectType === "metal_conduit_insufficient_insert";
  const missingInsulation = defectType === "metal_conduit_missing_insulation_bushing";
  const missingLocknut = defectType === "metal_conduit_missing_locknut";
  const conduitEnd = shortInsert ? 320 : 390;

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="ねじなし電線管E19の欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="58" textAnchor="middle">ねじなし電線管 E19</text>
      <rect className="box" x="390" y="90" width="230" height="220" rx="18" />
      <rect className="conduit-connector" x="350" y="150" width="85" height="96" rx="10" />
      {!missingLocknut && <rect className="locknut" x="410" y="146" width="18" height="104" rx="4" />}
      {!missingInsulation && <circle className="insulation-bushing" cx="440" cy="198" r="30" />}

      <path className={shortInsert ? "metal-conduit alert-stroke" : "metal-conduit"} d={"M 78 198 L " + conduitEnd + " 198"} />
      <path className="wire black" d="M 95 187 L 520 187" />
      <path className="wire white" d="M 95 198 L 520 198" />
      <path className="wire red" d="M 95 209 L 520 209" />
      {shortInsert && <line className="missing" x1="322" y1="178" x2="350" y2="178" />}

      <text className="small" x="195" y="235" textAnchor="middle">E19</text>
      <text className="defect-label" x="360" y="350" textAnchor="middle">
        {shortInsert
          ? "電線管がボックスコネクタへ十分に挿入されていない"
          : missingInsulation
            ? "管端に絶縁ブッシングが取り付けられていない"
            : missingLocknut
              ? "ボックス内側のロックナットが取り付けられていない"
              : "電線管と付属品を正しく取り付けた正常な状態"}
      </text>
    </svg>
  );
}