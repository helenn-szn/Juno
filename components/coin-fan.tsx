// The juno logo: five coins fanned on stems from one base coin.
// The centre coin is the newest one, so it's purple.
import { cx } from "@/utils/cx";

const outline = { strokeWidth: 2, strokeLinejoin: "round" } as const;

type CoinFanProps = React.ComponentProps<"svg"> & { label?: string; animate?: boolean };

// `animate`: on load the coins rise along their stems one after another, the new purple one last.
export function CoinFan({ label, animate = false, ...svg }: CoinFanProps) {
  return (
    <svg
      viewBox="-8 30 156 108"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...svg}
    >
      <g className="stroke-radiant" strokeWidth={5}>
        {[-60, -30, 0, 30, 60].map((angle) => (
          <line key={angle} x1="70" y1="122" x2="70" y2="70" transform={`rotate(${angle} 70 124)`} />
        ))}
      </g>
      {[-60, -30, 30, 60].map((angle, index) => (
        <Coin key={angle} angle={angle} delay={animate ? index * 120 : undefined} />
      ))}
      <Coin angle={0} newest delay={animate ? 4 * 120 : undefined} />
      <g className="stroke-dark-green" {...outline}>
        <path d="M54,124 A16,5 0 0,0 86,124 L86,129 A16,5 0 0,1 54,129 Z" className="fill-coin-side" />
        <ellipse cx="70" cy="124" rx="16" ry="5" className="fill-radiant" />
      </g>
    </svg>
  );
}

function Coin({ angle, newest = false, delay }: { angle: number; newest?: boolean; delay?: number }) {
  const face = newest ? "fill-purple" : "fill-radiant";
  const side = newest ? "fill-coin-newest-side" : "fill-coin-side";
  return (
    <g transform={`rotate(${angle} 70 124)`}>
      <g
        className={cx("stroke-dark-green", delay !== undefined && "coin-rise")}
        style={delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
        {...outline}
      >
        <ellipse cx="74.5" cy="54" rx="13" ry="15" className={side} />
        <rect x="70" y="39" width="4.5" height="30" className={cx(side, "stroke-none")} />
        <ellipse cx="70" cy="54" rx="13" ry="15" className={face} />
        <ellipse cx="70" cy="54" rx="8" ry="9.5" fill="none" />
      </g>
    </g>
  );
}
