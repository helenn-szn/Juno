// The juno logo: five coins fanned on stems from one base coin.
// The centre coin is the newest one, so it's purple.
// `earned` (0 to 5) turns it into a progress fan: coins she hasn't earned yet
// are dark, with dashed stems. Without it, all five are lit.
import { cx } from "@/utils/cx";

const outline = { strokeWidth: 2, strokeLinejoin: "round" } as const;
const ANGLES = [-60, -30, 30, 60] as const;

type CoinFanProps = React.ComponentProps<"svg"> & {
  label?: string;
  /** On load the coins rise along their stems one after another, the purple one last. */
  animate?: boolean;
  /** Coins earned, 0 to 5. */
  earned?: number;
  /** Colour of the coin outlines. Use the surface the logo sits on. */
  surface?: "stroke-dark-green" | "stroke-green";
};

export function CoinFan({ label, animate = false, earned = 5, surface = "stroke-dark-green", ...svg }: CoinFanProps) {
  // The newest (centre) coin lights first, then the rest from the left.
  const lit = (angle: number) => ANGLES.indexOf(angle as (typeof ANGLES)[number]) < earned - 1;
  return (
    <svg
      viewBox="-8 30 156 108"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...svg}
    >
      {[...ANGLES.slice(0, 2), 0, ...ANGLES.slice(2)].map((angle) => {
        const on = angle === 0 ? earned >= 1 : lit(angle);
        return (
          <line
            key={angle}
            x1="70"
            y1="122"
            x2="70"
            y2="70"
            transform={`rotate(${angle} 70 124)`}
            strokeWidth={5}
            strokeDasharray={on ? undefined : "4 4"}
            className={on ? "stroke-radiant" : "stroke-line"}
          />
        );
      })}
      {ANGLES.map((angle, index) => (
        <Coin
          key={angle}
          angle={angle}
          tone={lit(angle) ? "radiant" : "off"}
          surface={surface}
          delay={animate ? index * 120 : undefined}
        />
      ))}
      <Coin angle={0} tone={earned >= 1 ? "purple" : "off"} surface={surface} delay={animate ? 4 * 120 : undefined} />
      <g className={surface} {...outline}>
        <path d="M54,124 A16,5 0 0,0 86,124 L86,129 A16,5 0 0,1 54,129 Z" className="fill-coin-side" />
        <ellipse cx="70" cy="124" rx="16" ry="5" className="fill-radiant" />
      </g>
    </svg>
  );
}

const tones = {
  radiant: { face: "fill-radiant", side: "fill-coin-side", line: "" },
  purple: { face: "fill-purple", side: "fill-coin-newest-side", line: "" },
  off: { face: "fill-dark-green", side: "fill-coin-off-side", line: "stroke-line" },
};

type Tone = keyof typeof tones;

function CoinShape({ tone, surface }: { tone: Tone; surface: string }) {
  const { face, side, line } = tones[tone];
  return (
    <g className={cx(surface, line)} {...outline}>
      <ellipse cx="74.5" cy="54" rx="13" ry="15" className={side} />
      <rect x="70" y="39" width="4.5" height="30" className={cx(side, "stroke-none")} />
      <ellipse cx="70" cy="54" rx="13" ry="15" className={face} />
      <ellipse cx="70" cy="54" rx="8" ry="9.5" fill="none" />
    </g>
  );
}

function Coin({ angle, tone, surface, delay }: { angle: number; tone: Tone; surface: string; delay?: number }) {
  return (
    <g transform={`rotate(${angle} 70 124)`}>
      <g className={delay !== undefined ? "coin-rise" : undefined} style={delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}>
        <CoinShape tone={tone} surface={surface} />
      </g>
    </g>
  );
}

/** One coin on its own, for "You earn" rows. */
export function CoinIcon({ tone = "radiant", className }: { tone?: "radiant" | "purple"; className?: string }) {
  return (
    <svg viewBox="55 37 35 34" aria-hidden className={className}>
      <CoinShape tone={tone} surface="stroke-dark-green" />
    </svg>
  );
}
