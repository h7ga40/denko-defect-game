export function OutdoorLightSymbol({ x, y }: { x: number; y: number }) {
  const inner = 15.5;
  const outer = 24;

  return (
    <g aria-hidden="true">
      <circle className="candidate-device outdoor-light" cx={x} cy={y} r="34" />
      {[
        [-inner, -inner, -outer, -outer],
        [inner, -inner, outer, -outer],
        [inner, inner, outer, outer],
        [-inner, inner, -outer, outer],
      ].map(([x1, y1, x2, y2], index) => (
        <line className="device-mark" key={index} x1={x + x1} y1={y + y1} x2={x + x2} y2={y + y2} />
      ))}
      <circle className="candidate-device outdoor-light" cx={x} cy={y} r="22" />
    </g>
  );
}
