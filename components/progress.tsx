import { ProgressTrack } from "@/components/base/progress/progress";

/** A thin progress bar, announced as a progress bar to screen readers. */
export function ProgressLine({ percent, label, size = "lg" }: { percent: number; label: string; size?: "sm" | "lg" }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="w-full">
      <ProgressTrack percentage={percent} size={size} className="bg-dark-green text-radiant" />
    </div>
  );
}

/** The round progress on Course details. */
export function ProgressRing({ percent }: { percent: number }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg role="img" aria-label={`${percent}% complete`} viewBox="0 0 140 140" className="size-35">
      <circle cx="70" cy="70" r={radius} fill="none" strokeWidth="12" className="stroke-dark-green" />
      {percent > 0 && (
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
          transform="rotate(-90 70 70)"
          className="stroke-radiant"
        />
      )}
      <text x="70" y="79" textAnchor="middle" fontSize="28" fontWeight="500" className="fill-mint">
        {percent}%
      </text>
    </svg>
  );
}
