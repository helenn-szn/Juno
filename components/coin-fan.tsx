// The juno logo: five coins fanned on stems from one base coin.
// The centre coin is the newest one, so it's purple.
// `earned` (0 to 5) turns it into a progress fan: coins she hasn't earned yet
// are blank, with dashed stems. Without it, all five are lit.
// `theme` is the surface it sits on: "dark" (radiant coins) or "light" (green coins).
import { cx } from "@/utils/cx";

const outline = { strokeWidth: 2, strokeLinejoin: "round" } as const;
const ANGLES = [-60, -30, 30, 60] as const;

const palettes = {
  dark: {
    stem: "stroke-radiant",
    stemOff: "stroke-line",
    surface: "stroke-dark-green",
    lit: { face: "fill-radiant", side: "fill-coin-side", line: "" },
    off: { face: "fill-dark-green", side: "fill-coin-off-side", line: "stroke-line" },
    baseFace: "fill-radiant",
    baseSide: "fill-coin-side",
  },
  light: {
    stem: "stroke-green",
    stemOff: "stroke-separator-border",
    surface: "stroke-white",
    lit: { face: "fill-green", side: "fill-dark-green", line: "" },
    off: { face: "fill-white", side: "fill-coin-light-off-side", line: "stroke-separator-border" },
    baseFace: "fill-green",
    baseSide: "fill-dark-green",
  },
  // On the purple band of the mentors page: dark coins, and the newest one radiant (purple would vanish there).
  ink: {
    stem: "stroke-dark-green",
    stemOff: "stroke-dark-green",
    surface: "stroke-purple",
    lit: { face: "fill-dark-green", side: "fill-green", line: "" },
    off: { face: "fill-purple", side: "fill-purple", line: "stroke-dark-green" },
    baseFace: "fill-dark-green",
    baseSide: "fill-green",
  },
};

const purple = { face: "fill-purple", side: "fill-coin-newest-side", line: "" };
const radiant = { face: "fill-radiant", side: "fill-coin-side", line: "" };

type Palette = (typeof palettes)["dark"];
type Theme = keyof typeof palettes;

type CoinFanProps = React.ComponentProps<"svg"> & {
  label?: string;
  /** On load the coins rise along their stems one after another, the purple one last. */
  animate?: boolean;
  /** Coins earned, 0 to 5. */
  earned?: number;
  theme?: Theme;
  /** Colour of the coin outlines. Defaults to the surface the logo sits on. */
  surface?: "stroke-dark-green" | "stroke-green" | "stroke-white" | "stroke-footer" | "stroke-purple" | "stroke-mint";
};

export function CoinFan({ label, animate = false, earned = 5, theme = "dark", surface, ...svg }: CoinFanProps) {
  const palette = palettes[theme];
  const outlineClass = surface ?? palette.surface;
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
            className={on ? palette.stem : palette.stemOff}
          />
        );
      })}
      {ANGLES.map((angle, index) => (
        <Coin
          key={angle}
          angle={angle}
          tone={lit(angle) ? palette.lit : palette.off}
          surface={outlineClass}
          delay={animate ? index * 120 : undefined}
        />
      ))}
      <Coin angle={0} tone={earned >= 1 ? (theme === "ink" ? radiant : purple) : palette.off} surface={outlineClass} delay={animate ? 4 * 120 : undefined} />
      <g className={outlineClass} {...outline}>
        <path d="M54,124 A16,5 0 0,0 86,124 L86,129 A16,5 0 0,1 54,129 Z" className={palette.baseSide} />
        <ellipse cx="70" cy="124" rx="16" ry="5" className={palette.baseFace} />
      </g>
    </svg>
  );
}

type Tone = Palette["lit"];

function CoinShape({ tone, surface }: { tone: Tone; surface: string }) {
  return (
    <g className={cx(surface, tone.line)} {...outline}>
      <ellipse cx="74.5" cy="54" rx="13" ry="15" className={tone.side} />
      <rect x="70" y="39" width="4.5" height="30" className={cx(tone.side, "stroke-none")} />
      <ellipse cx="70" cy="54" rx="13" ry="15" className={tone.face} />
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
export function CoinIcon({ tone = "skill", theme = "light", className }: { tone?: "skill" | "newest"; theme?: "dark" | "light"; className?: string }) {
  const palette = palettes[theme];
  return (
    <svg viewBox="55 37 35 34" aria-hidden className={className}>
      <CoinShape tone={tone === "newest" ? purple : palette.lit} surface={palette.surface} />
    </svg>
  );
}
