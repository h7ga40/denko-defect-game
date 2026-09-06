import type { CableEntrySide } from "../../../data/boxInspectionGame";

const backRotation: Record<CableEntrySide, number> = { bottom: 0, left: -90, top: -180, right: -270 };

export function LampEntryOrthographic({
  bypassEntry,
  cableEntrySide = "left",
  side,
  mirrored,
  loose,
  cannotClose,
}: {
  bypassEntry: boolean;
  cableEntrySide?: CableEntrySide;
  side: boolean;
  mirrored: boolean;
  loose: boolean;
  cannotClose: boolean;
}) {
  return (
    <g data-cable-routing={bypassEntry ? "over_base" : "through_entry"}>
      {side ? (
        <>
          <g transform={mirrored ? "translate(720 0) scale(-1 1)" : undefined}>
            <path className="lamp-cable-sheath" d={bypassEntry ? "M 604 215 H 512" : "M 604 296 H 512"} />
            <path className="lamp-base" d="M 245 245 H 407 V 269 H 245 Z M 452 245 H 490 V 269 H 452 Z" />
            <path className="lamp-entry-section" d="M 407 243 V 271 M 452 243 V 271" />
            <path className="lamp-insulation black" d={bypassEntry
              ? "M 512 215 H 460 Q 440 215 420 219 H 321"
              : "M 512 296 H 438 Q 430 296 430 288 V 227 Q 430 219 422 219 H 321"} />
            <rect className="lamp-terminal-plate" x="298" y="233" width="62" height="12" rx="2" />
            <path className="lamp-loop-copper" d="M 321 219 H 306 V 230 H 326" />
            <rect className="lamp-screw-shank" x="310" y={loose ? 198 : 212} width="15" height="27" rx="2" />
            <rect className="lamp-screw-head" x="298" y={loose ? 193 : 207} width="40" height="11" rx="3" />
            {cannotClose && (
              <>
                <path className="lamp-base" d="M 375 124 Q 465 122 483 187 L 464 193 Q 445 148 375 146 Z" />
                <path className="lamp-insulation black" d="M 350 219 Q 403 148 466 191" />
              </>
            )}
          </g>
          <text className="lamp-view-note" x="360" y="335" textAnchor="middle">台座断面（黒線1本を表示）</text>
        </>
      ) : (
        <g transform={`translate(360 205) rotate(${backRotation[cableEntrySide]})`}>
          {bypassEntry && (
            <>
              <path className="lamp-cable-sheath" d="M 0 157 V 103" />
              <path className="lamp-insulation black" d="M -10 111 Q -56 123 -56 52" />
              <path className="lamp-insulation white" d="M 10 111 Q 56 123 56 52" />
            </>
          )}
          <circle className="lamp-base" r="110" />
          <circle className="lamp-base-rim" r="99" />
          <circle className="lamp-mounting-hole" cx="0" cy="-83" r="7" />
          <circle className="lamp-mounting-hole" cx="-68" cy="65" r="7" />
          <rect className="lamp-entry-hole" x="-23" y="65" width="46" height="29" rx="5" />
          {!bypassEntry && (
            <>
              <path className="lamp-cable-sheath" d="M 0 157 V 103" />
              <path className="lamp-insulation black" d="M -10 103 V 82" />
              <path className="lamp-insulation white" d="M 10 103 V 82" />
            </>
          )}
        </g>
      )}
    </g>
  );
}
