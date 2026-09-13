import type { Dimension, Question } from "@/types/diagnostic";

/**
 * Configuration du diagnostic : questions, options et barème de scoring.
 *
 * Ce fichier isole volontairement toute la donnée métier (CDC §4) de la logique
 * de calcul (`scoring.ts`) et de l'affichage (composants). Toute réponse produit
 * in fine un score 0–100, ce qui rend les dimensions comparables.
 */

/** Libellés d'affichage des dimensions. */
export const DIMENSION_LABELS: Record<Dimension, string> = {
  digitalisation: "Digitalisation",
  operations: "Opérations",
  commercial: "Commercial",
};

/** Ordre d'affichage des dimensions (et des blocs de questions). */
export const DIMENSION_ORDER: Dimension[] = [
  "digitalisation",
  "operations",
  "commercial",
];

/**
 * Les 9 questions, dans l'ordre du parcours.
 *
 * Barème (CDC §4) :
 * - choix unique  → score de l'option retenue ;
 * - choix multiple → somme des scores des options retenues, plafonnée à 100 ;
 * - échelle        → ((valeur - min) / (max - min)) * 100 ;
 * - oui/non        → trueScore ou falseScore.
 */
export const QUESTIONS: Question[] = [
  // --- Bloc Digitalisation ---
  {
    id: "digitalisation-outils",
    order: 1,
    dimension: "digitalisation",
    type: "multiple",
    prompt:
      "Quels outils numériques utilisez-vous pour gérer votre activité ?",
    options: [
      { value: "facturation", label: "Facturation", score: 34 },
      { value: "gestion_stock", label: "Gestion de stock", score: 34 },
      { value: "comptabilite", label: "Comptabilité", score: 34 },
      { value: "aucun", label: "Aucun", score: 0 },
    ],
  },
  {
    id: "digitalisation-reseaux",
    order: 2,
    dimension: "digitalisation",
    type: "scale",
    prompt:
      "Utilisez-vous WhatsApp Business ou les réseaux sociaux pour votre activité ?",
    steps: [
      { value: 0, label: "Jamais" },
      { value: 1, label: "Rarement (quelques fois par mois)" },
      { value: 2, label: "Parfois (environ une fois par semaine)" },
      { value: 3, label: "Souvent (plusieurs fois par semaine)" },
      { value: 4, label: "Quotidiennement" },
    ],
  },
  {
    id: "digitalisation-paiement",
    order: 3,
    dimension: "digitalisation",
    type: "single",
    prompt: "Comment vos clients vous paient-ils majoritairement ?",
    options: [
      { value: "especes", label: "Espèces", score: 0 },
      { value: "mobile_money", label: "Mobile Money", score: 75 },
      { value: "carte", label: "Carte", score: 100 },
      { value: "mixte", label: "Mixte", score: 100 },
    ],
  },

  // --- Bloc Opérations ---
  {
    id: "operations-continuite",
    order: 4,
    dimension: "operations",
    type: "scale",
    prompt:
      "Si vous êtes absent une semaine, l'activité continue-t-elle normalement ?",
    steps: [
      { value: 1, label: "Pas du tout" },
      { value: 2, label: "Très peu" },
      { value: 3, label: "Partiellement" },
      { value: 4, label: "Presque totalement" },
      { value: 5, label: "Totalement" },
    ],
  },
  {
    id: "operations-procedures",
    order: 5,
    dimension: "operations",
    type: "boolean",
    prompt: "Avez-vous des processus ou procédures écrites, même simples ?",
    trueScore: 100,
    falseScore: 0,
  },
  {
    id: "operations-fournisseurs",
    order: 6,
    dimension: "operations",
    type: "single",
    prompt: "Comment gérez-vous vos fournisseurs et votre stock ?",
    options: [
      { value: "aucun_suivi", label: "Pas de suivi", score: 0 },
      { value: "suivi_manuel", label: "Suivi manuel", score: 50 },
      { value: "outil_dedie", label: "Outil dédié", score: 100 },
    ],
  },

  // --- Bloc Commercial ---
  {
    id: "commercial-clients",
    order: 7,
    dimension: "commercial",
    type: "single",
    prompt: "Combien de clients réguliers avez-vous ?",
    options: [
      { value: "0_10", label: "0 – 10", score: 0 },
      { value: "10_50", label: "10 – 50", score: 50 },
      { value: "50_plus", label: "50+", score: 100 },
    ],
  },
  {
    id: "commercial-canal",
    order: 8,
    dimension: "commercial",
    type: "single",
    prompt: "Quel est votre principal canal d'acquisition de clients ?",
    options: [
      { value: "bouche_a_oreille", label: "Bouche-à-oreille", score: 50 },
      { value: "reseaux_sociaux", label: "Réseaux sociaux", score: 100 },
      { value: "physique", label: "Physique (boutique, terrain)", score: 50 },
      { value: "autre", label: "Autre", score: 25 },
    ],
  },
  {
    id: "commercial-prospects",
    order: 9,
    dimension: "commercial",
    type: "boolean",
    prompt: "Suivez-vous vos prospects jusqu'à la conversion en client ?",
    trueScore: 100,
    falseScore: 0,
  },
];

/** Nombre total de questions (utilisé pour la progression et la validation). */
export const TOTAL_QUESTIONS = QUESTIONS.length;

/** Récupère une question par son identifiant. */
export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS.find((question) => question.id === id);
}

/** Récupère les questions d'une dimension, dans l'ordre d'affichage. */
export function getQuestionsByDimension(dimension: Dimension): Question[] {
  return QUESTIONS.filter((question) => question.dimension === dimension);
}
