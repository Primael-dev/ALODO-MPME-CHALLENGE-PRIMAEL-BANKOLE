import Link from "next/link";
import HeroVisual from "@/components/HeroVisual";

const KEY_POINTS = [
  {
    title: "3 dimensions analysées",
    description:
      "Digitalisation, Opérations et Commercial : les fondations pour passer à l'échelle.",
  },
  {
    title: "Environ 3 minutes",
    description: "9 questions rapides, aucune préparation nécessaire.",
  },
  {
    title: "Sans bonne ni mauvaise réponse",
    description:
      "Vos réponses restent dans votre navigateur et ne sont pas enregistrées.",
  },
];

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center overflow-hidden px-4 py-12 sm:px-6 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-emerald-50 to-transparent"
      />

      <div className="mb-10 flex items-center gap-3 animate-fade-up">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white">
          A
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-wide text-slate-800">
            ALODO <span className="text-emerald-600">MPME</span>
          </p>
          <p className="text-xs text-slate-500">Diagnostic de maturité</p>
        </div>
      </div>

      <section
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm animate-fade-up sm:p-12"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex flex-col-reverse items-center gap-8 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Diagnostic MPME
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Où en est la maturité de votre entreprise ?
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Répondez à 9 questions pour obtenir un score global, le détail par
              dimension et une recommandation concrète pour votre prochaine
              étape.
            </p>
          </div>

          {/* Visuel 3D décoratif (lazy-loadé, purement esthétique). */}
          <div className="h-44 w-44 shrink-0 sm:h-56 sm:w-56">
            <HeroVisual />
          </div>
        </div>

        <ul className="mt-10 space-y-5">
          {KEY_POINTS.map((point) => (
            <li key={point.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700"
              >
                ✓
              </span>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-800 sm:text-base">
                  {point.title}
                </p>
                <p className="text-sm leading-relaxed text-slate-500">
                  {point.description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/diagnostic"
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          Commencer le diagnostic
          <span aria-hidden="true">→</span>
        </Link>

        <p className="mt-4 text-center text-xs text-slate-400">
          Aucun compte requis. Aucune donnée envoyée à un serveur.
        </p>
      </section>
    </main>
  );
}
