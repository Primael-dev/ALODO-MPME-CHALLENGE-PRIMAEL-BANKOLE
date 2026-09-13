"use client";

import dynamic from "next/dynamic";

/** Fallback affiché pendant le téléchargement du chunk 3D. */
function ScenePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-20 w-20 animate-pulse rounded-3xl bg-gradient-to-br from-emerald-300 to-emerald-500" />
    </div>
  );
}

// Chargement paresseux : `three` n'est téléchargé que sur l'accueil, jamais au SSR.
const HeroScene = dynamic(() => import("@/components/HeroScene"), {
  ssr: false,
  loading: () => <ScenePlaceholder />,
});

/** Conteneur du visuel 3D de l'accueil, avec repli pendant le chargement. */
export default function HeroVisual() {
  return (
    <div className="h-full w-full">
      <HeroScene />
    </div>
  );
}
