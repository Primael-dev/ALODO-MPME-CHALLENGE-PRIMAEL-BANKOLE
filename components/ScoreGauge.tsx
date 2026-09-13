import type { CSSProperties } from "react";

interface ScoreGaugeProps {
  label: string;
  /** Score sur 100. */
  score: number;
  /** `lg` pour le score global, `md` pour les scores par dimension. */
  size?: "md" | "lg";
  /** `bar` (jauge linéaire) ou `ring` (anneau circulaire, style dashboard). */
  variant?: "bar" | "ring";
}

type Tone = "emerald" | "amber" | "rose";

/** Niveau de maturité associé au score (couleurs alignées sur les jauges). */
function toneOf(score: number): Tone {
  if (score >= 70) return "emerald";
  if (score >= 40) return "amber";
  return "rose";
}

const BAR_COLORS: Record<Tone, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

const RING_STROKES: Record<Tone, string> = {
  emerald: "stroke-emerald-500",
  amber: "stroke-amber-500",
  rose: "stroke-rose-500",
};

/** Jauge circulaire : anneau animé + score au centre. */
function RingGauge({
  label,
  score,
  isLarge,
}: {
  label: string;
  score: number;
  isLarge: boolean;
}) {
  const dimension = isLarge ? 168 : 96;
  const strokeWidth = isLarge ? 12 : 8;
  const radius = (dimension - strokeWidth) / 2;
  const center = dimension / 2;
  // pathLength={100} normalise l'anneau : dashoffset = 100 - score.
  const offset = 100 - score;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="-rotate-90"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
          aria-label={`${label} : ${score} sur 100`}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-slate-200"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            className={`animate-ring ${RING_STROKES[toneOf(score)]}`}
            style={
              {
                strokeDashoffset: offset,
                "--ring-offset": `${offset}`,
              } as CSSProperties
            }
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={
              isLarge
                ? "text-4xl font-bold text-slate-900"
                : "text-xl font-bold text-slate-900"
            }
          >
            {score}
          </span>
          <span className="text-[11px] font-medium text-slate-400">/ 100</span>
        </div>
      </div>
      <p
        className={`mt-3 text-center font-medium text-slate-600 ${
          isLarge ? "text-sm" : "text-xs"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

/** Représentation visuelle d'un score, réutilisable (barre ou anneau). */
export default function ScoreGauge({
  label,
  score,
  size = "md",
  variant = "bar",
}: ScoreGaugeProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const isLarge = size === "lg";

  if (variant === "ring") {
    return <RingGauge label={label} score={clamped} isLarge={isLarge} />;
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span
          className={
            isLarge
              ? "text-sm font-medium text-slate-600"
              : "text-sm font-medium text-slate-700"
          }
        >
          {label}
        </span>
        <span
          className={
            isLarge
              ? "shrink-0 text-3xl font-bold text-slate-900"
              : "shrink-0 text-sm font-semibold text-slate-900"
          }
        >
          {clamped}
          {isLarge ? (
            <span className="text-base font-medium text-slate-400">/100</span>
          ) : null}
        </span>
      </div>
      <div
        className={`w-full overflow-hidden rounded-full bg-slate-200 ${
          isLarge ? "h-3" : "h-2"
        }`}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={`${label} : ${clamped} sur 100`}
      >
        <div
          className={`h-full rounded-full animate-grow-x ${BAR_COLORS[toneOf(clamped)]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
