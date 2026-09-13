interface RecommendationBoxProps {
  /** Message pré-rédigé (lié à une dimension ou global si profil homogène). */
  recommendation: string;
  /** Libellé de la dimension concernée. Absent pour une recommandation globale. */
  dimensionLabel?: string;
}

/** Encadré mettant en avant la recommandation. */
export default function RecommendationBox({
  recommendation,
  dimensionLabel,
}: RecommendationBoxProps) {
  const title = dimensionLabel
    ? `Recommandation prioritaire · ${dimensionLabel}`
    : "Recommandation globale";

  return (
    <section
      aria-label="Recommandation"
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-emerald-900 sm:text-base">
        {recommendation}
      </p>
    </section>
  );
}
