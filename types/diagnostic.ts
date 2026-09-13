/**
 * Types du domaine "diagnostic ALODO MPME".
 *
 * Le prototype couvre 3 dimensions (Digitalisation, Opérations, Commercial).
 * Chaque question expose un barème qui ramène toute réponse sur une échelle 0–100,
 * afin que les scores soient comparables et moyennables entre dimensions.
 */

/** Les 3 dimensions couvertes par le prototype. */
export type Dimension = "digitalisation" | "operations" | "commercial";

/**
 * Discriminant du type de question. Il détermine :
 * - le composant de saisie affiché ;
 * - la forme de la valeur de réponse stockée dans `Answers`.
 */
export type QuestionType = "single" | "multiple" | "scale" | "boolean";

/** Identifiant stable d'une question (utilisé comme clé de réponse et de persistance). */
export type QuestionId = string;

/** Une option de réponse avec le score (0–100) qui lui est associé par le barème. */
export interface QuestionOption {
  value: string;
  label: string;
  score: number;
}

interface BaseQuestion {
  id: QuestionId;
  /** Ordre d'affichage global (1 à 9). */
  order: number;
  dimension: Dimension;
  prompt: string;
}

/** Choix unique : une seule option sélectionnable, son score est retenu tel quel. */
export interface SingleChoiceQuestion extends BaseQuestion {
  type: "single";
  options: QuestionOption[];
}

/**
 * Choix multiple : plusieurs options cumulables.
 * Le score est la somme des `score` des options retenues, plafonnée à 100.
 * L'option "Aucun" porte un score de 0 et sert de réponse valide.
 */
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple";
  options: QuestionOption[];
}

/** Niveau d'une échelle, avec le libellé descriptif affiché à l'utilisateur. */
export interface ScaleStep {
  value: number;
  label: string;
}

/**
 * Échelle ordinale : chaque niveau est un libellé descriptif (ex. « Jamais »
 * → « Quotidiennement »), plus intuitif qu'un simple chiffre.
 * Le score est normalisé : ((valeur - premier) / (dernier - premier)) * 100.
 */
export interface ScaleQuestion extends BaseQuestion {
  type: "scale";
  steps: ScaleStep[];
}

/** Question fermée Oui/Non, avec un score distinct pour chaque réponse. */
export interface BooleanQuestion extends BaseQuestion {
  type: "boolean";
  trueScore: number;
  falseScore: number;
}

/** Union discriminée de toutes les questions du diagnostic. */
export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | ScaleQuestion
  | BooleanQuestion;

/**
 * Valeur possible d'une réponse. Elle dépend du type de question :
 * - `single`   → string (valeur d'option)
 * - `multiple` → string[] (valeurs d'options)
 * - `scale`    → number (valeur d'un des `steps`)
 * - `boolean`  → boolean
 */
export type AnswerValue = string | number | boolean | string[];

/** Réponses indexées par identifiant de question. Partiel tant que le diagnostic est en cours. */
export type Answers = Partial<Record<QuestionId, AnswerValue>>;

/** État persisté dans localStorage pour reprendre le diagnostic après un rechargement. */
export interface DiagnosticProgress {
  answers: Answers;
  /** Index (base 0) de la question en cours dans `QUESTIONS`. */
  currentIndex: number;
}

/** Score agrégé pour une dimension. */
export interface DimensionScore {
  dimension: Dimension;
  score: number;
}

/** Résultat complet du diagnostic, calculé à partir des réponses. */
export interface DiagnosticResult {
  /** Moyenne des scores de dimension, arrondie (0–100). */
  globalScore: number;
  /** Un score par dimension, dans l'ordre d'affichage. */
  dimensionScores: DimensionScore[];
  /**
   * Toutes les dimensions au score maximal (gère les égalités).
   * Vide si le profil est homogène (les 3 dimensions ont le même score).
   */
  strongestDimensions: Dimension[];
  /**
   * Toutes les dimensions au score minimal (gère les égalités).
   * Vide si le profil est homogène.
   */
  weakestDimensions: Dimension[];
  /** Vrai si les 3 dimensions ont exactement le même score. */
  isUniform: boolean;
  /** Recommandation pré-rédigée (globale si profil homogène, sinon liée à la dimension la plus faible). */
  recommendation: string;
}
