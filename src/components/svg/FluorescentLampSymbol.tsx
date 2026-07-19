export function FluorescentLampSymbol({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <rect className="candidate-device fluorescent-lamp" x={x - 47} y={y - 9} width="22" height="18" />
      <rect className="candidate-device fluorescent-lamp" x={x + 25} y={y - 9} width="22" height="18" />
      <circle className="candidate-device fluorescent-lamp" cx={x} cy={y} r="27" />
    </g>
  );
}
