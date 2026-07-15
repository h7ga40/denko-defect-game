import type { DefectType } from "../../../data/problems";

export function OutletBoxAccessoryDiagram({ defectType }: { defectType: DefectType }) {
  const wrongHole = defectType === "outlet_box_wrong_hole";
  const missing = defectType === "rubber_bushing_missing";
  const wrongSize = defectType === "rubber_bushing_wrong_size";
  const usedHoleX = wrongHole ? 510 : 210;

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="アウトレットボックスとゴムブッシングの欠陥図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="58" textAnchor="middle">アウトレットボックス・ブッシング</text>
      <rect className="box" x="125" y="92" width="470" height="215" rx="20" />

      {[210, 360, 510].map((x, index) => (
        <g key={x}>
          <circle className={index === 0 && wrongSize ? "box-hole alert-stroke" : "box-hole"} cx={x} cy="112" r={index === 0 ? "30" : "22"} />
          {!(missing && index === 0) && (
            <circle
              className={index === 0 && wrongSize ? "rubber-bushing alert-stroke" : "rubber-bushing"}
              cx={x}
              cy="112"
              r={index === 0 && wrongSize ? "19" : "25"}
            />
          )}
        </g>
      ))}

      <path className={wrongHole ? "box-cable alert-stroke" : "box-cable"} d={"M " + usedHoleX + " 112 L " + usedHoleX + " 255"} />
      <path className="wire black" d={"M " + (usedHoleX - 8) + " 150 L " + (usedHoleX - 8) + " 260"} />
      <path className="wire white" d={"M " + (usedHoleX + 8) + " 150 L " + (usedHoleX + 8) + " 260"} />

      <text className="small" x="210" y="330" textAnchor="middle">指定穴</text>
      <text className="small" x="510" y="330" textAnchor="middle">別の穴</text>
      <text className="defect-label" x="360" y="360" textAnchor="middle">
        {wrongHole
          ? "指定と異なる穴へケーブルを通している"
          : missing
            ? "ケーブル通過穴にゴムブッシングがない"
            : wrongSize
              ? "穴径とゴムブッシングのサイズが合っていない"
              : "指定穴に適合するゴムブッシングを取り付けた正常な状態"}
      </text>
    </svg>
  );
}
