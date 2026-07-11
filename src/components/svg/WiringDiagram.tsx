import type { DefectType } from "../../data/problems";

type WiringDiagramProps = {
  defectType: DefectType;
};

export function WiringDiagram({ defectType }: WiringDiagramProps) {
  if (defectType === "missing_ground") {
    return <GroundedReceptacleDiagram />;
  }

  if (defectType === "sheath_too_short") {
    return <OutletBoxDiagram />;
  }
  if (
    defectType === "ring_sleeve_wrong_mark" ||
    defectType === "ring_sleeve_insufficient_insert"
  ) {
    return <RingSleeveDiagram defectType={defectType} />;
  }

  if (
    defectType === "exposed_receptacle_sheath" ||
    defectType === "breaker_line_load_reverse" ||
    defectType === "push_connector_insufficient_insert" ||
    defectType === "terminal_block_wrong_terminal" ||
    defectType === "ceiling_connector_polarity" ||
    defectType === "mounting_frame_loose" ||
    defectType === "switch_wrong_terminal" ||
    defectType === "receptacle_polarity"
  ) {
    return <AccessoryDefectDiagram defectType={defectType} />;
  }

  return <LampReceptacleDiagram defectType={defectType} />;
}

function AccessoryDefectDiagram({
  defectType,
}: {
  defectType:
    | "exposed_receptacle_sheath"
    | "breaker_line_load_reverse"
    | "push_connector_insufficient_insert"
    | "terminal_block_wrong_terminal"
    | "ceiling_connector_polarity"
    | "mounting_frame_loose"
    | "switch_wrong_terminal"
    | "receptacle_polarity";
}) {
  const titles = {
    exposed_receptacle_sheath: "露出コンセント",
    breaker_line_load_reverse: "配線用遮断器",
    push_connector_insufficient_insert: "差し込みコネクタ",
    terminal_block_wrong_terminal: "端子台",
    ceiling_connector_polarity: "引掛けシーリング",
    mounting_frame_loose: "連用取付枠",
    switch_wrong_terminal: "スイッチ",
    receptacle_polarity: "コンセント",
  };

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={`${titles[defectType]}の欠陥図`}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        {titles[defectType]}
      </text>
      {defectType === "exposed_receptacle_sheath" && <ExposedReceptacleDefect />}
      {defectType === "breaker_line_load_reverse" && <BreakerDefect />}
      {defectType === "push_connector_insufficient_insert" && <PushConnectorDefect />}
      {defectType === "terminal_block_wrong_terminal" && <TerminalBlockDefect />}
      {defectType === "ceiling_connector_polarity" && <CeilingConnectorDefect />}
      {defectType === "mounting_frame_loose" && <MountingFrameDefect />}
      {defectType === "switch_wrong_terminal" && <SwitchDefect />}
      {defectType === "receptacle_polarity" && <ReceptacleDefect />}
    </svg>
  );
}

function ExposedReceptacleDefect() {
  return (
    <g>
      <rect className="device" x="410" y="118" width="130" height="150" rx="16" />
      <line className="device-mark" x1="450" y1="158" x2="450" y2="215" />
      <line className="device-mark" x1="500" y1="158" x2="500" y2="215" />
      <rect className="cable-sheath alert-fill" x="96" y="176" width="82" height="38" rx="18" />
      <path className="wire black" d="M 176 186 C 250 160, 330 150, 425 170" />
      <path className="wire white" d="M 176 206 C 250 236, 330 242, 425 215" />
      <line className="missing" x1="178" y1="176" x2="278" y2="142" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">外装が器具内まで入っていません</text>
    </g>
  );
}

function BreakerDefect() {
  return (
    <g>
      <rect className="device" x="298" y="105" width="135" height="170" rx="12" />
      <text className="small" x="365" y="135" textAnchor="middle">上: 電源側</text>
      <text className="small" x="365" y="255" textAnchor="middle">下: 負荷側</text>
      <circle className="terminal center" cx="335" cy="155" r="14" />
      <circle className="terminal center" cx="395" cy="155" r="14" />
      <circle className="terminal side" cx="335" cy="225" r="14" />
      <circle className="terminal side" cx="395" cy="225" r="14" />
      <path className="wire alert" d="M 110 150 C 190 260, 250 225, 335 225" />
      <path className="wire alert" d="M 110 230 C 200 105, 270 155, 395 155" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">電源側と負荷側が逆です</text>
    </g>
  );
}

function PushConnectorDefect() {
  return (
    <g>
      <rect className="device" x="300" y="135" width="150" height="105" rx="18" />
      <circle className="connector" cx="340" cy="188" r="15" />
      <circle className="connector" cx="375" cy="188" r="15" />
      <circle className="connector" cx="410" cy="188" r="15" />
      <path className="wire black" d="M 110 150 C 190 150, 230 175, 340 188" />
      <path className="wire white" d="M 110 225 C 190 225, 225 200, 375 188" />
      <path className="wire alert" d="M 110 188 C 165 188, 205 188, 275 188" />
      <line className="missing" x1="282" y1="188" x2="323" y2="188" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">心線が確認位置まで届いていません</text>
    </g>
  );
}

function TerminalBlockDefect() {
  return (
    <g>
      <rect className="device" x="250" y="110" width="220" height="150" rx="10" />
      {[0, 1, 2, 3].map((index) => (
        <g key={index}>
          <rect className="terminal" x={275 + index * 45} y="150" width="34" height="58" rx="5" />
          <text className="small" x={292 + index * 45} y="135" textAnchor="middle">{index + 1}</text>
        </g>
      ))}
      <path className="wire black" d="M 95 165 C 170 165, 215 178, 292 178" />
      <path className="wire alert" d="M 95 220 C 185 240, 255 178, 382 178" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">指定端子ではなく隣の端子へ接続</text>
    </g>
  );
}

function CeilingConnectorDefect() {
  return (
    <g>
      <circle className="fixture" cx="420" cy="190" r="78" />
      <rect className="device" x="372" y="150" width="96" height="80" rx="16" />
      <circle className="terminal center" cx="395" cy="190" r="16" />
      <circle className="terminal side" cx="445" cy="190" r="16" />
      <path className="wire black" d="M 105 150 C 210 150, 260 190, 445 190" />
      <path className="wire white" d="M 105 230 C 220 230, 285 190, 395 190" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">白線と黒線の接続先が逆です</text>
    </g>
  );
}

function MountingFrameDefect() {
  return (
    <g>
      <rect className="device" x="250" y="96" width="220" height="190" rx="8" />
      <rect className="device" x="310" y="135" width="100" height="112" rx="10" />
      <circle className="terminal center" cx="290" cy="126" r="12" />
      <circle className="warning" cx="430" cy="254" r="22" />
      <line className="missing" x1="416" y1="238" x2="446" y2="270" />
      <line className="missing" x1="446" y1="238" x2="416" y2="270" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">片側の固定爪が掛かっていません</text>
    </g>
  );
}

function SwitchDefect() {
  return (
    <g>
      <rect className="device" x="325" y="110" width="120" height="165" rx="14" />
      <text className="small" x="385" y="143" textAnchor="middle">共通</text>
      <circle className="terminal center" cx="355" cy="170" r="15" />
      <circle className="terminal side" cx="415" cy="170" r="15" />
      <circle className="terminal side" cx="385" cy="230" r="15" />
      <path className="wire alert" d="M 95 180 C 190 180, 250 170, 415 170" />
      <path className="wire red" d="M 95 240 C 205 250, 285 230, 385 230" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">黒線が指定端子に入っていません</text>
    </g>
  );
}

function ReceptacleDefect() {
  return (
    <g>
      <rect className="device" x="390" y="115" width="130" height="160" rx="18" />
      <line className="device-mark" x1="430" y1="160" x2="430" y2="220" />
      <line className="device-mark" x1="480" y1="160" x2="480" y2="220" />
      <path className="wire black" d="M 105 150 C 220 150, 290 195, 480 195" />
      <path className="wire white" d="M 105 235 C 220 235, 290 195, 430 195" />
      <text className="defect-label" x="360" y="330" textAnchor="middle">接地側と非接地側が逆です</text>
    </g>
  );
}
function LampReceptacleDiagram({
  defectType,
}: {
  defectType: "none" | "reverse_loop" | "reverse_polarity";
}) {
  const blackTarget = defectType === "reverse_polarity" ? "shell" : "center";
  const whiteTarget = defectType === "reverse_polarity" ? "center" : "shell";
  const reverseLoop = defectType === "reverse_loop";

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="ランプレセプタクル配線図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <rect className="cable-sheath" x="72" y="170" width="88" height="40" rx="20" />
      <circle className="fixture" cx="424" cy="190" r="92" />
      <circle className="fixture-inner" cx="424" cy="190" r="58" />
      <circle className="terminal center" cx="424" cy="190" r="21" />
      <circle className="terminal side" cx="508" cy="190" r="21" />
      <text className="label" x="360" y="103" textAnchor="middle">
        ランプレセプタクル
      </text>
      <text className="small" x="424" y="266" textAnchor="middle">
        中心接点
      </text>
      <text className="small" x="508" y="266" textAnchor="middle">
        ねじ受け側
      </text>

      <Wire
        colorName="black"
        label="黒"
        y={154}
        target={blackTarget}
        reverseLoop={reverseLoop && blackTarget === "center"}
      />
      <Wire
        colorName="white"
        label="白"
        y={226}
        target={whiteTarget}
        reverseLoop={reverseLoop && whiteTarget === "shell"}
      />

      {defectType !== "none" && (
        <text className="defect-label" x="360" y="340" textAnchor="middle">
          欠陥候補を図から判定
        </text>
      )}
    </svg>
  );
}
function Wire({
  colorName,
  label,
  y,
  target,
  reverseLoop,
}: {
  colorName: "black" | "white";
  label: string;
  y: number;
  target: "center" | "shell";
  reverseLoop: boolean;
}) {
  const targetX = target === "center" ? 424 : 508;
  const targetY = 190;
  const approachX = reverseLoop ? targetX + 44 : targetX - 44;
  const loopPath = reverseLoop
    ? `M ${targetX + 12} ${targetY - 27} C ${targetX + 45} ${targetY - 10}, ${targetX + 45} ${targetY + 27}, ${targetX + 12} ${targetY + 27}`
    : `M ${targetX - 12} ${targetY - 27} C ${targetX - 45} ${targetY - 10}, ${targetX - 45} ${targetY + 27}, ${targetX - 12} ${targetY + 27}`;

  return (
    <g>
      <path className={`wire ${colorName}`} d={`M 120 ${y} C 214 ${y}, 286 ${targetY}, ${approachX} ${targetY}`} />
      <path className={`wire loop ${reverseLoop ? "alert" : colorName}`} d={loopPath} />
      <rect className={`tag ${colorName}`} x="50" y={y - 21} width="54" height="42" rx="9" />
      <text className="tag-text" x="77" y={y + 7} textAnchor="middle">
        {label}
      </text>
      {reverseLoop && <circle className="warning" cx={targetX + 38} cy={targetY} r="18" />}
    </g>
  );
}
function RingSleeveDiagram({
  defectType,
}: {
  defectType: "ring_sleeve_wrong_mark" | "ring_sleeve_insufficient_insert";
}) {
  const wrongMark = defectType === "ring_sleeve_wrong_mark";
  const shortInsert = defectType === "ring_sleeve_insufficient_insert";

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="リングスリーブ圧着図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="label" x="360" y="62" textAnchor="middle">
        リングスリーブ圧着
      </text>

      <path className="wire black" d="M 84 132 C 180 132, 240 154, 330 172" />
      <path className="wire white" d="M 84 242 C 180 242, 244 222, 330 204" />
      <path
        className={shortInsert ? "wire green broken" : "wire green"}
        d={shortInsert ? "M 84 188 C 160 188, 216 190, 282 190" : "M 84 188 C 180 188, 246 190, 330 190"}
      />

      <rect className="sleeve" x="312" y="142" width="110" height="96" rx="28" />
      <rect className={wrongMark ? "sleeve-mark alert-fill" : "sleeve-mark"} x="346" y="170" width="42" height="40" rx="8" />
      <text className="sleeve-text" x="367" y="197" textAnchor="middle">
        {wrongMark ? "小" : "○"}
      </text>

      <path className="wire black" d="M 404 172 C 470 172, 534 142, 628 136" />
      <path className="wire white" d="M 404 204 C 470 204, 536 238, 628 246" />
      <path className="wire green" d="M 404 190 C 486 190, 548 190, 628 190" />

      {wrongMark && (
        <text className="defect-label" x="360" y="340" textAnchor="middle">
          電線条件に対して刻印が合っていない状態
        </text>
      )}
      {shortInsert && (
        <text className="defect-label" x="360" y="340" textAnchor="middle">
          緑線の心線が圧着部まで十分に入っていない状態
        </text>
      )}
    </svg>
  );
}
function GroundedReceptacleDiagram() {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="接地極付コンセント配線図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <rect className="device" x="355" y="82" width="140" height="220" rx="28" />
      <circle className="terminal side" cx="390" cy="142" r="18" />
      <circle className="terminal center" cx="460" cy="142" r="18" />
      <circle className="terminal ground" cx="425" cy="250" r="20" />
      <text className="label" x="425" y="62" textAnchor="middle">
        接地極付コンセント
      </text>
      <path className="wire black" d="M 80 128 C 180 128, 230 142, 442 142" />
      <path className="wire white" d="M 80 190 C 178 190, 238 142, 372 142" />
      <path className="wire green broken" d="M 80 260 C 180 260, 250 250, 338 250" />
      <line className="missing" x1="356" y1="250" x2="396" y2="250" />
      <text className="defect-label" x="360" y="340" textAnchor="middle">
        緑の接地線が接地端子まで接続されていません
      </text>
    </svg>
  );
}

function OutletBoxDiagram() {
  return (
    <svg viewBox="0 0 720 390" role="img" aria-label="アウトレットボックス配線図">
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <rect className="box" x="250" y="82" width="230" height="220" rx="22" />
      <rect className="cable-sheath alert-fill" x="132" y="176" width="88" height="36" rx="18" />
      <path className="wire black" d="M 215 185 C 260 155, 310 138, 430 150" />
      <path className="wire white" d="M 215 203 C 270 228, 315 245, 426 232" />
      <circle className="connector" cx="444" cy="150" r="21" />
      <circle className="connector" cx="444" cy="232" r="21" />
      <line className="missing" x1="220" y1="176" x2="256" y2="176" />
      <line className="missing" x1="220" y1="212" x2="256" y2="212" />
      <text className="label" x="365" y="62" textAnchor="middle">
        アウトレットボックス
      </text>
      <text className="defect-label" x="360" y="340" textAnchor="middle">
        外装がボックス内に十分入っていない状態
      </text>
    </svg>
  );
}
