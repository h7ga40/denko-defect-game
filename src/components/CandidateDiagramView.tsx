import { useMemo, useState } from "react";
import { candidateDiagrams, type CandidateDevice, type CandidateDiagram } from "../data/candidateDiagrams";

export function CandidateDiagramView() {
  const [selectedNo, setSelectedNo] = useState(1);
  const selected = useMemo(
    () => candidateDiagrams.find((diagram) => diagram.no === selectedNo) ?? candidateDiagrams[0],
    [selectedNo],
  );

  return (
    <section className="candidate-layout">
      <aside className="candidate-list" aria-label="候補問題一覧">
        {candidateDiagrams.map((diagram) => (
          <button
            className={diagram.no === selected.no ? "candidate-tab selected" : "candidate-tab"}
            key={diagram.no}
            onClick={() => setSelectedNo(diagram.no)}
            type="button"
          >
            <span>No.{diagram.no}</span>
            {diagram.title}
          </button>
        ))}
      </aside>

      <article className="problem-card candidate-card">
        <div className="problem-meta">
          <span>候補問題 No.{selected.no}</span>
          <span>学習用簡略複線図</span>
        </div>
        <h2>{selected.title}</h2>
        <p className="candidate-theme">{selected.theme}</p>
        <div className="diagram-wrap">
          <CandidateSvg diagram={selected} />
        </div>
        <ul className="point-list">
          {selected.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function CandidateSvg({ diagram }: { diagram: CandidateDiagram }) {
  const devicesById = new Map(diagram.devices.map((device) => [device.id, device]));

  return (
    <svg viewBox="0 0 720 390" role="img" aria-label={`候補問題${diagram.no}の複線図`}>
      <rect className="panel" x="18" y="18" width="684" height="354" rx="18" />
      <text className="candidate-svg-title" x="360" y="54" textAnchor="middle">
        No.{diagram.no} {diagram.title}
      </text>

      {diagram.connections.map((connection, index) => {
        const from = devicesById.get(connection.from);
        const to = devicesById.get(connection.to);
        if (!from || !to) {
          return null;
        }

        const offset = getParallelOffset(index, from, to);
        const path = makeWirePath(from, to, offset);
        const labelX = (from.x + to.x) / 2 + offset.x * 1.8;
        const labelY = (from.y + to.y) / 2 + offset.y * 1.8 - 8;

        return (
          <g key={`${connection.from}-${connection.to}-${connection.color}-${index}`}>
            <path className={`candidate-wire ${connection.color}`} d={path} />
            {connection.label && (
              <text className="wire-label" x={labelX} y={labelY} textAnchor="middle">
                {connection.label}
              </text>
            )}
          </g>
        );
      })}

      {diagram.devices.map((device) => (
        <DeviceNode device={device} key={device.id} />
      ))}
    </svg>
  );
}

function DeviceNode({ device }: { device: CandidateDevice }) {
  if (device.type === "power") {
    return (
      <g>
        <rect className="candidate-device power" x={device.x - 42} y={device.y - 34} width="84" height="68" rx="8" />
        <text className="candidate-label" x={device.x} y={device.y + 5} textAnchor="middle">
          {device.label}
        </text>
      </g>
    );
  }

  if (device.type === "connector") {
    return (
      <g>
        <circle className="candidate-connector" cx={device.x} cy={device.y} r="18" />
        <text className="candidate-label small-label" x={device.x} y={device.y + 38} textAnchor="middle">
          {device.label}
        </text>
      </g>
    );
  }

  if (device.type === "lamp" || device.type === "pilot") {
    return (
      <g>
        <circle className={`candidate-device ${device.type}`} cx={device.x} cy={device.y} r="34" />
        <line className="device-mark" x1={device.x - 18} y1={device.y - 18} x2={device.x + 18} y2={device.y + 18} />
        <line className="device-mark" x1={device.x + 18} y1={device.y - 18} x2={device.x - 18} y2={device.y + 18} />
        <text className="candidate-label small-label" x={device.x} y={device.y + 54} textAnchor="middle">
          {device.label}
        </text>
      </g>
    );
  }

  if (device.type === "receptacle" || device.type === "grounded_receptacle") {
    return (
      <g>
        <rect className="candidate-device receptacle" x={device.x - 42} y={device.y - 40} width="84" height="80" rx="12" />
        <line className="device-mark" x1={device.x - 14} y1={device.y - 16} x2={device.x - 14} y2={device.y + 16} />
        <line className="device-mark" x1={device.x + 14} y1={device.y - 16} x2={device.x + 14} y2={device.y + 16} />
        {device.type === "grounded_receptacle" && <circle className="ground-hole" cx={device.x} cy={device.y + 22} r="5" />}
        <text className="candidate-label small-label" x={device.x} y={device.y + 60} textAnchor="middle">
          {device.label}
        </text>
      </g>
    );
  }

  return (
    <g>
      <rect className={`candidate-device ${device.type}`} x={device.x - 44} y={device.y - 32} width="88" height="64" rx="8" />
      <text className="candidate-label" x={device.x} y={device.y + 5} textAnchor="middle">
        {device.label}
      </text>
    </g>
  );
}

function makeWirePath(from: CandidateDevice, to: CandidateDevice, offset: { x: number; y: number }) {
  const startX = from.x + offset.x;
  const startY = from.y + offset.y;
  const endX = to.x + offset.x;
  const endY = to.y + offset.y;
  const controlX = (startX + endX) / 2;
  const controlY = (startY + endY) / 2 - Math.min(44, Math.abs(endX - startX) * 0.12);
  return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
}

function getParallelOffset(index: number, from: CandidateDevice, to: CandidateDevice) {
  const pairOffset = (index % 3) - 1;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: (-dy / length) * pairOffset * 8,
    y: (dx / length) * pairOffset * 8,
  };
}
