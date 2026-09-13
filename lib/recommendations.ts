import type { Dimension } from "@/types/diagnostic";

/**
 * Mapping "dimension la plus faible → recommandation pré-rédigée" (CDC §4).
 *
 * Volontairement statique : cohérence et lisibilité avant sophistication
 * (pas d'IA, pas de génération dynamique). Remplacer un message ne touche
 * jamais la logique de calcul.
 */
export const RECOMMENDATIONS: Record<Dimension, string> = {
  digitalisation:
    "Votre principal levier est la digitalisation. Adoptez des outils simples de facturation et de gestion de stock, utilisez WhatsApp Business au quotidien et proposez le Mobile Money pour gagner en temps, en traçabilité et en trésorerie.",
  operations:
    "Votre principal levier est la structuration des opérations. Formalisez vos procédures clés et commencez à déléguer : cela réduira votre dépendance au dirigeant et permettra à l'activité de continuer sans vous.",
  commercial:
    "Votre principal levier est le développement commercial. Professionnalisez votre acquisition (réseaux sociaux, suivi des prospects jusqu'à la conversion) et fidélisez vos clients réguliers pour sécuriser votre chiffre d'affaires.",
};

/**
 * Message dédié au cas où les trois dimensions sont au même niveau :
 * pas de point faible à cibler, on propose une dynamique d'amélioration continue.
 */
export const UNIFORM_RECOMMENDATION =
  "Profil homogène : vos trois dimensions sont au même niveau, sans point de rupture marqué. Aucun axe ne se détache comme prioritaire — choisissez la dimension que vous voulez renforcer en premier et fixez-vous un objectif de progression d'ensemble.";

/** Retourne la recommandation associée à la dimension la plus faible. */
export function getRecommendation(dimension: Dimension): string {
  return RECOMMENDATIONS[dimension];
}

/** Retourne la recommandation pour un profil homogène (aucune dimension faible). */
export function getUniformRecommendation(): string {
  return UNIFORM_RECOMMENDATION;
}
