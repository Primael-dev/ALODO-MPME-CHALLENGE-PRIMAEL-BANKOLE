interface LoadingStateProps {
  /** Message affiché sous l'animation. */
  message?: string;
}

/** Animation de chargement légère (anneau qui tourne + message). */
export default function LoadingState({
  message = "Chargement…",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4"
    >
      <span className="relative flex h-12 w-12" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border-2 border-emerald-100" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-600" />
      </span>
      <p className="animate-fade-in text-sm font-medium text-slate-400">
        {message}
      </p>
    </div>
  );
}
