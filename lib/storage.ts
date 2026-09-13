import type {
  AnswerValue,
  Answers,
  DiagnosticProgress,
  QuestionId,
} from "@/types/diagnostic";

/**
 * Persistance de la progression dans localStorage, exposée comme "external store"
 * consommable via `useSyncExternalStore` (CDC §5.1).
 *
 * Ce choix évite de synchroniser un état React avec localStorage à coups de
 * `setState` dans un `useEffect` (anti-pattern et interdit par ESLint). Ici :
 * - `getServerSnapshot` renvoie une valeur stable pour un rendu SSR cohérent ;
 * - `getSnapshot` renvoie une référence mise en cache, rafraîchie à chaque écriture ;
 * - les composants lisent l'état et déclenchent des actions (setAnswer, etc.).
 *
 * Ajout par rapport à l'architecture indicative du CDC ; les erreurs de stockage
 * (navigation privée, quota) sont absorbées pour ne jamais casser le parcours.
 */

const STORAGE_KEY = "alodo-mpme-diagnostic:v1";

/** Valeur utilisée côté serveur et pendant l'hydratation. */
const SERVER_SNAPSHOT: DiagnosticProgress = { answers: {}, currentIndex: 0 };

let cachedSnapshot: DiagnosticProgress | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): DiagnosticProgress {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SERVER_SNAPSHOT;

    const parsed = JSON.parse(raw) as Partial<DiagnosticProgress>;
    if (typeof parsed !== "object" || parsed === null) return SERVER_SNAPSHOT;

    return {
      answers: (parsed.answers ?? {}) as Answers,
      currentIndex:
        typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0,
    };
  } catch {
    return SERVER_SNAPSHOT;
  }
}

function writeToStorage(progress: DiagnosticProgress): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Stockage indisponible : la progression reste en mémoire pour la session.
  }
}

/** Écrit l'état, met à jour le cache puis notifie les abonnés. */
function commit(progress: DiagnosticProgress): void {
  cachedSnapshot = progress;
  writeToStorage(progress);
  listeners.forEach((listener) => listener());
}

/** Enregistre une réponse et persiste immédiatement. */
export function setAnswer(questionId: QuestionId, value: AnswerValue): void {
  const current = progressStore.getSnapshot();
  commit({
    ...current,
    answers: { ...current.answers, [questionId]: value },
  });
}

/** Met à jour l'index de la question en cours. */
export function setCurrentIndex(index: number): void {
  const current = progressStore.getSnapshot();
  commit({ ...current, currentIndex: index });
}

/** Réinitialise entièrement la progression. */
export function resetProgress(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Rien à faire : l'absence de stockage est déjà gérée.
    }
  }
  commit(SERVER_SNAPSHOT);
}

/** Store de progression à passer à `useSyncExternalStore`. */
export const progressStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): DiagnosticProgress {
    if (typeof window === "undefined") return SERVER_SNAPSHOT;
    if (cachedSnapshot === null) cachedSnapshot = readFromStorage();
    return cachedSnapshot;
  },
  getServerSnapshot(): DiagnosticProgress {
    return SERVER_SNAPSHOT;
  },
};

/**
 * Store trivial indiquant si l'on est monté côté client. Sert à afficher un état
 * de chargement tant que les données localStorage ne sont pas disponibles, sans
 * provoquer d'écart d'hydratation.
 */
export const hydratedStore = {
  subscribe(): () => void {
    return () => {};
  },
  getSnapshot(): boolean {
    return true;
  },
  getServerSnapshot(): boolean {
    return false;
  },
};
