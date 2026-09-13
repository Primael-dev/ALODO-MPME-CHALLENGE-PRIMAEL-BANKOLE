interface ProgressBarProps {
  /** Progression en pourcentage (0–100) — utilisée en mode barre. */
  value: number;
  /** Repère textuel optionnel. */
  label?: string;
  /** Nombre total d'étapes. Si fourni avec `currentStep`, affiche une progression segmentée. */
  totalSteps?: number;
  /** Étape courante (1-indexée). */
  currentStep?: number;
}

/** Barre de progression accessible : segmentée (étapes) ou continue (barre). */
export default function ProgressBar({
  value,
  label,
  totalSteps,
  currentStep,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const isSegmented =
    typeof totalSteps === "number" &&
    totalSteps > 0 &&
    typeof currentStep === "number";

  return (
    <div>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      ) : null}

      {isSegmented ? (
        <div
          className="flex gap-1.5"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-valuenow={currentStep}
          aria-label={label ?? "Progression du diagnostic"}
        >
          {Array.from({ length: totalSteps }, (_, index) => (
            <span
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ease-out ${
                index < currentStep ? "bg-emerald-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      ) : (
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(clamped)}
          aria-label={label ?? "Progression du diagnostic"}
        >
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-300 ease-out"
            style={{ width: `${clamped}%` }}
          />
        </div>
      )}
    </div>
  );
}
