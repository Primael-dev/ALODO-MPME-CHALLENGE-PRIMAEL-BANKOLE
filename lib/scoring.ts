import type {
  AnswerValue,
  Answers,
  DiagnosticResult,
  Dimension,
  DimensionScore,
  Question,
} from "@/types/diagnostic";
import {
  DIMENSION_ORDER,
  getQuestionsByDimension,
} from "@/lib/questions";
import {
  getRecommendation,
  getUniformRecommendation,
} from "@/lib/recommendations";

/**
 * Logique métier de scoring — fonctions pures (aucun effet de bord, aucun accès
 * au DOM ou au stockage). Elles sont donc testables et réutilisables côté serveur
 * comme côté client.
 */

/** Borne une valeur dans l'intervalle [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Une réponse est valide si elle est présente ; pour un choix multiple, si la sélection est non vide. */
export function isAnswerProvided(answer: AnswerValue | undefined): boolean {
  if (answer === undefined) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  return true;
}

/**
 * Convertit une réponse en score 0–100 selon le barème de la question (CDC §4).
 * Une réponse absente ou invalide vaut 0 (défense en profondeur : le parcours
 * empêche normalement ce cas).
 */
export function scoreAnswer(
  question: Question,
  answer: AnswerValue | undefined,
): number {
  if (answer === undefined) return 0;

  switch (question.type) {
    case "single": {
      if (typeof answer !== "string") return 0;
      const option = question.options.find((opt) => opt.value === answer);
      return option ? clamp(option.score, 0, 100) : 0;
    }

    case "multiple": {
      if (!Array.isArray(answer)) return 0;
      const total = answer.reduce((sum, value) => {
        const option = question.options.find((opt) => opt.value === value);
        return sum + (option?.score ?? 0);
      }, 0);
      // Les scores cumulés sont plafonnés à 100.
      return clamp(total, 0, 100);
    }

    case "scale": {
      if (typeof answer !== "number" || Number.isNaN(answer)) return 0;
      const first = question.steps[0]?.value ?? 0;
      const last = question.steps[question.steps.length - 1]?.value ?? first;
      if (last === first) return 0;
      const value = clamp(answer, first, last);
      return ((value - first) / (last - first)) * 100;
    }

    case "boolean": {
      if (typeof answer !== "boolean") return 0;
      return clamp(answer ? question.trueScore : question.falseScore, 0, 100);
    }
  }
}

/** Calcule le score moyen (0–100) des 3 questions d'une dimension. */
export function scoreDimension(dimension: Dimension, answers: Answers): number {
  const questions = getQuestionsByDimension(dimension);
  if (questions.length === 0) return 0;

  const total = questions.reduce(
    (sum, question) => sum + scoreAnswer(question, answers[question.id]),
    0,
  );

  return Math.round(total / questions.length);
}

/** Calcule les scores de toutes les dimensions, dans l'ordre d'affichage. */
export function computeDimensionScores(answers: Answers): DimensionScore[] {
  return DIMENSION_ORDER.map((dimension) => ({
    dimension,
    score: scoreDimension(dimension, answers),
  }));
}

/** Score global = moyenne des scores de dimension (pondération égale — choix assumé, CDC §4). */
export function computeGlobalScore(dimensionScores: DimensionScore[]): number {
  if (dimensionScores.length === 0) return 0;

  const total = dimensionScores.reduce((sum, item) => sum + item.score, 0);
  return Math.round(total / dimensionScores.length);
}

/**
 * Produit le résultat complet du diagnostic à partir des réponses.
 *
 * Gère les égalités : on conserve toutes les dimensions au score max/min.
 * Si les trois dimensions ont le même score (profil homogène), il n'y a ni
 * point fort ni point faible isolé, et la recommandation devient globale.
 */
export function computeResult(answers: Answers): DiagnosticResult {
  const dimensionScores = computeDimensionScores(answers);
  const scores = dimensionScores.map((item) => item.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const isUniform = maxScore === minScore;

  const strongestDimensions = isUniform
    ? []
    : dimensionScores
        .filter((item) => item.score === maxScore)
        .map((item) => item.dimension);

  const weakestDimensions = isUniform
    ? []
    : dimensionScores
        .filter((item) => item.score === minScore)
        .map((item) => item.dimension);

  const primaryWeakest = weakestDimensions[0];

  return {
    globalScore: computeGlobalScore(dimensionScores),
    dimensionScores,
    strongestDimensions,
    weakestDimensions,
    isUniform,
    recommendation: primaryWeakest
      ? getRecommendation(primaryWeakest)
      : getUniformRecommendation(),
  };
}
