"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import ScoreGauge from "@/components/ScoreGauge";
import RecommendationBox from "@/components/RecommendationBox";
import LoadingState from "@/components/LoadingState";
import { DIMENSION_LABELS, QUESTIONS } from "@/lib/questions";
import { computeResult, isAnswerProvided } from "@/lib/scoring";
import { hydratedStore, progressStore, resetProgress } from "@/lib/storage";
import type { Dimension } from "@/types/diagnostic";

type Tone = "emerald" | "amber" | "rose";

/** Niveau de maturité (texte) associé à un score. */
function maturityLabel(score: number): string {
  if (score >= 70) return "Solide";
  if (score >= 40) return "À consolider";
  return "Prioritaire";
}

function toneOf(score: number): Tone {
  if (score >= 70) return "emerald";
  if (score >= 40) return "amber";
  return "rose";
}

const TONE_STYLES: Record<Tone, { text: string; bg: string; dot: string }> = {
  emerald: { text: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  amber: { text: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  rose: { text: "text-rose-700", bg: "bg-rose-50", dot: "bg-rose-500" },
};

/** Pastille de statut colorée selon le niveau. */
function StatusTag({ score }: { score: number }) {
  const styles = TONE_STYLES[toneOf(score)];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles.bg} ${styles.text}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
      />
      {maturityLabel(score)}
    </span>
  );
}

export default function ResultatPage() {
  const router = useRouter();

  const progress = useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getSnapshot,
    progressStore.getServerSnapshot,
  );
  const isHydrated = useSyncExternalStore(
    hydratedStore.subscribe,
    hydratedStore.getSnapshot,
    hydratedStore.getServerSnapshot,
  );

  // Le diagnostic est complet si toutes les questions ont une réponse valide.
  const isComplete = useMemo(
    () =>
      QUESTIONS.every((question) =>
        isAnswerProvided(progress.answers[question.id]),
      ),
    [progress.answers],
  );

  const result = useMemo(
    () => (isComplete ? computeResult(progress.answers) : null),
    [isComplete, progress.answers],
  );

  // Accès direct sans diagnostic complet : on renvoie vers le parcours.
  useEffect(() => {
    if (isHydrated && !isComplete) {
      router.replace("/diagnostic");
    }
  }, [isHydrated, isComplete, router]);

  const handleRestart = useCallback(() => {
    resetProgress();
    router.push("/");
  }, [router]);

  // Délai minimum pour laisser l'animation de chargement visible et évaporer
  // un éventuel flash. Le calcul du résultat, lui, est instantané.
  const [minDelayElapsed, setMinDelayElapsed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMinDelayElapsed(true), 850);
    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated || !result || !minDelayElapsed) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-5xl items-center justify-center px-4 py-10">
        <LoadingState message="Analyse de vos réponses…" />
      </main>
    );
  }

  const scoreOf = (dimension: Dimension): number =>
    result.dimensionScores.find((item) => item.dimension === dimension)
      ?.score ?? 0;

  const strongestLabels = result.strongestDimensions
    .map((dimension) => DIMENSION_LABELS[dimension])
    .join(", ");
  const weakestLabels = result.weakestDimensions
    .map((dimension) => DIMENSION_LABELS[dimension])
    .join(", ");
  const strongestScore = result.strongestDimensions.length
    ? scoreOf(result.strongestDimensions[0])
    : result.globalScore;
  const weakestScore = result.weakestDimensions.length
    ? scoreOf(result.weakestDimensions[0])
    : result.globalScore;
  const primaryWeakest = result.weakestDimensions[0];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between animate-fade-up">
        <span className="text-sm font-bold tracking-wide text-slate-800">
          ALODO <span className="text-emerald-600">MPME</span>
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          Diagnostic terminé
        </span>
      </header>

      {/* Synthèse : score global + interprétation */}
      <section
        className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-emerald-50/50 p-6 shadow-sm animate-fade-up sm:p-8"
        style={{ animationDelay: "80ms" }}
      >
        <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
          <div className="flex justify-center">
            <ScoreGauge
              variant="ring"
              size="lg"
              label="Maturité globale"
              score={result.globalScore}
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Votre diagnostic
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              Maturité {maturityLabel(result.globalScore).toLowerCase()}
            </h1>
            {result.isUniform ? (
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Votre entreprise obtient{" "}
                <strong className="font-semibold text-slate-900">
                  {result.globalScore}/100
                </strong>
                . Vos trois dimensions sont au même niveau : profil homogène,
                sans point faible isolé.
              </p>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Votre entreprise obtient{" "}
                <strong className="font-semibold text-slate-900">
                  {result.globalScore}/100
                </strong>
                . Point fort :{" "}
                <strong className="font-semibold text-slate-900">
                  {strongestLabels}
                </strong>{" "}
                ({strongestScore}/100). Axe prioritaire :{" "}
                <strong className="font-semibold text-slate-900">
                  {weakestLabels}
                </strong>{" "}
                ({weakestScore}/100).
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {result.isUniform ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-slate-400"
                  />
                  Profil homogène · {result.globalScore}/100
                </span>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                    />
                    Point fort · {strongestLabels}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-rose-500"
                    />
                    Priorité · {weakestLabels}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Détail par dimension */}
      <section
        className="animate-fade-up"
        style={{ animationDelay: "160ms" }}
      >
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          Détail par dimension
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {result.dimensionScores.map((item) => (
            <article
              key={item.dimension}
              className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <ScoreGauge
                variant="ring"
                size="md"
                label={DIMENSION_LABELS[item.dimension]}
                score={item.score}
              />
              <StatusTag score={item.score} />
            </article>
          ))}
        </div>
      </section>

      {/* Recommandation prioritaire */}
      <div className="animate-fade-up" style={{ animationDelay: "240ms" }}>
        <RecommendationBox
          recommendation={result.recommendation}
          dimensionLabel={
            primaryWeakest ? DIMENSION_LABELS[primaryWeakest] : undefined
          }
        />
      </div>

      <button
        type="button"
        onClick={handleRestart}
        className="mt-auto rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-[0.99] animate-fade-up focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        style={{ animationDelay: "320ms" }}
      >
        Recommencer le diagnostic
      </button>
    </main>
  );
}
