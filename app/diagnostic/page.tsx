"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/LoadingState";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import {
  DIMENSION_LABELS,
  QUESTIONS,
  TOTAL_QUESTIONS,
  getQuestionsByDimension,
} from "@/lib/questions";
import { isAnswerProvided } from "@/lib/scoring";
import {
  hydratedStore,
  progressStore,
  setAnswer,
  setCurrentIndex,
} from "@/lib/storage";
import type { AnswerValue, Dimension } from "@/types/diagnostic";

/** Accent visuel par dimension (repère rapide dans le parcours). */
const DIMENSION_ACCENTS: Record<
  Dimension,
  { dot: string; text: string; bg: string }
> = {
  digitalisation: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  operations: { dot: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50" },
  commercial: {
    dot: "bg-violet-500",
    text: "text-violet-700",
    bg: "bg-violet-50",
  },
};

export default function DiagnosticPage() {
  const router = useRouter();

  // La progression vit dans le store localStorage, lu via useSyncExternalStore :
  // pas de setState dans un effet, donc pas d'écart d'hydratation.
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

  // Recentre et redonne le focus à chaque changement de question.
  const questionRegionRef = useRef<HTMLElement>(null);
  const hasHandledInitialRef = useRef(false);

  const currentIndex = Math.min(
    Math.max(progress.currentIndex, 0),
    TOTAL_QUESTIONS - 1,
  );
  const { answers } = progress;

  const question = QUESTIONS[currentIndex];
  const accent = DIMENSION_ACCENTS[question.dimension];
  const currentAnswer = answers[question.id];
  const canProceed = isAnswerProvided(currentAnswer);
  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1;

  const dimensionQuestions = getQuestionsByDimension(question.dimension);
  const positionInDimension =
    dimensionQuestions.findIndex((item) => item.id === question.id) + 1;

  useEffect(() => {
    if (!isHydrated) return;
    if (!hasHandledInitialRef.current) {
      hasHandledInitialRef.current = true;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    questionRegionRef.current?.focus();
  }, [currentIndex, isHydrated]);

  const handleChange = useCallback(
    (value: AnswerValue) => {
      setAnswer(question.id, value);
    },
    [question.id],
  );

  const handlePrevious = useCallback(() => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (!canProceed) return;

    if (isLastQuestion) {
      // La réponse courante est déjà persistée par setAnswer.
      router.push("/resultat");
      return;
    }

    setCurrentIndex(currentIndex + 1);
  }, [canProceed, currentIndex, isLastQuestion, router]);

  const progressPercent = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col overflow-hidden px-4 py-6 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-72 bg-gradient-to-b from-emerald-50 to-transparent"
      />

      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide text-slate-800">
            ALODO <span className="text-emerald-600">MPME</span>
          </span>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-500 backdrop-blur">
            Question {currentIndex + 1}/{TOTAL_QUESTIONS}
          </span>
        </div>
        <ProgressBar
          value={progressPercent}
          totalSteps={TOTAL_QUESTIONS}
          currentStep={currentIndex + 1}
        />
      </header>

      {isHydrated ? (
        <>
          <section
            ref={questionRegionRef}
            tabIndex={-1}
            className="flex flex-1 flex-col justify-center py-6 focus:outline-none"
          >
            {/* La clé (id de question) rejoue l'animation à chaque changement. */}
            <div key={question.id} className="animate-fade-up">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${accent.bg} ${accent.text}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${accent.dot}`}
                    />
                    {DIMENSION_LABELS[question.dimension]}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {positionInDimension}/{dimensionQuestions.length}
                  </span>
                </div>

                <div className="mt-4">
                  <QuestionCard
                    question={question}
                    value={currentAnswer}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </section>

          <footer className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className="flex-1 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:shadow-none disabled:active:scale-100"
            >
              {isLastQuestion ? "Voir mon résultat" : "Suivant"}
            </button>
          </footer>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center py-10">
          <LoadingState message="Préparation du diagnostic…" />
        </div>
      )}
    </main>
  );
}
