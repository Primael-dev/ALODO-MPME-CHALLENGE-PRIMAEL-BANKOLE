"use client";

import type { AnswerValue, Question } from "@/types/diagnostic";

interface QuestionCardProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}

interface OptionRowProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  /** `checkbox` pour les choix multiples, `radio` sinon. */
  multiple?: boolean;
  /** Alignement du contenu (centre utilisé pour Oui/Non). */
  align?: "left" | "center";
}

/**
 * Ligne de réponse réutilisable : indicateur (radio/case) + libellé.
 * Offre un retour visuel net et une micro-interaction fluide au survol/pression.
 */
function OptionRow({
  label,
  selected,
  onClick,
  multiple = false,
  align = "left",
}: OptionRowProps) {
  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={[
        "group flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium",
        "transition-all duration-200 ease-out active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        align === "center" ? "justify-center text-center" : "text-left",
        selected
          ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "flex h-5 w-5 shrink-0 items-center justify-center text-[11px] font-bold transition-colors duration-200",
          multiple ? "rounded-md border" : "rounded-full border",
          selected
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-slate-300 bg-white text-transparent group-hover:border-slate-400",
        ].join(" ")}
      >
        ✓
      </span>
      {label}
    </button>
  );
}

/** Rend le contrôle de saisie adapté au type de question. */
function renderInput(
  question: Question,
  value: AnswerValue | undefined,
  onChange: (value: AnswerValue) => void,
) {
  switch (question.type) {
    case "single": {
      const selected = typeof value === "string" ? value : undefined;

      return (
        <div
          role="radiogroup"
          aria-label={question.prompt}
          className="space-y-2.5"
        >
          {question.options.map((option) => (
            <OptionRow
              key={option.value}
              label={option.label}
              selected={selected === option.value}
              onClick={() => onChange(option.value)}
            />
          ))}
        </div>
      );
    }

    case "multiple": {
      const selected = Array.isArray(value) ? value : [];

      const toggle = (optionValue: string) => {
        const next = selected.includes(optionValue)
          ? selected.filter((item) => item !== optionValue)
          : [...selected, optionValue];
        onChange(next);
      };

      return (
        <div role="group" aria-label={question.prompt} className="space-y-2.5">
          {question.options.map((option) => (
            <OptionRow
              key={option.value}
              multiple
              label={option.label}
              selected={selected.includes(option.value)}
              onClick={() => toggle(option.value)}
            />
          ))}
        </div>
      );
    }

    case "scale": {
      const selected = typeof value === "number" ? value : undefined;

      return (
        <div
          role="radiogroup"
          aria-label={question.prompt}
          className="space-y-2.5"
        >
          {question.steps.map((step) => (
            <OptionRow
              key={step.value}
              label={step.label}
              selected={selected === step.value}
              onClick={() => onChange(step.value)}
            />
          ))}
        </div>
      );
    }

    case "boolean": {
      const selected = typeof value === "boolean" ? value : undefined;

      return (
        <div
          role="radiogroup"
          aria-label={question.prompt}
          className="grid grid-cols-2 gap-2.5"
        >
          <OptionRow
            align="center"
            label="Oui"
            selected={selected === true}
            onClick={() => onChange(true)}
          />
          <OptionRow
            align="center"
            label="Non"
            selected={selected === false}
            onClick={() => onChange(false)}
          />
        </div>
      );
    }
  }
}

/** Affiche une question unique et son contrôle de réponse. */
export default function QuestionCard({
  question,
  value,
  onChange,
}: QuestionCardProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
        {question.prompt}
      </h2>
      {question.type === "multiple" ? (
        <p className="mt-1.5 text-xs font-medium text-slate-400">
          Plusieurs réponses possibles
        </p>
      ) : null}
      <div className="mt-5">{renderInput(question, value, onChange)}</div>
    </div>
  );
}
