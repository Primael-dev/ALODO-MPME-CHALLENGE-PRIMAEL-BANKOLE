# ALODO MPME — Prototype de diagnostic

Prototype fonctionnel d'une interface de diagnostic pour les MPME, réalisé dans le cadre de
l'**exercice de sélection Développeur ALODO TECH**.

Dépôt : `ALODO-MPME-CHALLENGE-PRIMAEL-BANKOLE`
Démo : https://alodo-mpme-challenge-primael-bankol.vercel.app/

---

## 1. Présentation

Ce projet simule une partie réaliste du parcours **ALODO MPME** : un utilisateur répond à un
questionnaire court, puis obtient un score de maturité, un point fort, une faiblesse et une
recommandation concrète.

Le périmètre est **volontairement restreint** (3 jours, en solo) : il ne couvre pas les 8
dimensions du diagnostic, ni l'authentification, ni le backend.

**Parcours** : Introduction → Questions (9 questions, une à la fois) → Résultat.

---

## 2. Stack technique

| Élément | Choix | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.5 |
| UI | React | 19.2.8 |
| Langage | TypeScript (strict) | ^5 |
| Style | Tailwind CSS | v4 |
| 3D (accueil) | three.js (lazy-loadé) | ^0.186 |
| Données | État local + `localStorage` | — |

Pas de backend, pas de base de données : toute la logique de scoring tourne côté client et la
progression est persistée dans le navigateur.

---

## 3. Choix produit

### Pourquoi ces 3 dimensions ?

Parmi les 8 dimensions du diagnostic, le prototype couvre **Digitalisation, Opérations et
Commercial**, un triptyque cohérent orienté « outils / fonctionnement / capacité à vendre » :

- **Digitalisation** : cœur de la proposition de valeur ALODO (outils numériques, WhatsApp
  Business, paiements, présence digitale).
- **Opérations** : révèle la dépendance au dirigeant et le niveau de structuration interne,
  souvent premier frein à la croissance.
- **Commercial** : évalue la capacité de l'entreprise à générer et fidéliser des clients.

Cette combinaison permet de raconter une histoire utile au moment du résultat : une MPME peut
être bien digitalisée mais mal structurée en interne, ou l'inverse — ce qui donne du sens aux
recommandations.

### Pourquoi 9 questions ?

La consigne autorise 6 à 12 questions ; 9 offre un bon équilibre (**3 par dimension**), assez
court pour tenir en ~3 minutes et assez précis pour distinguer les profils. Les types sont
variés : choix multiple, échelle, choix unique, oui/non, tranche.

### Principe de progression

L'utilisateur voit toujours où il en est : repère textuel (« Digitalisation — 2/3 »), barre
segmentée sur 9 étapes, et compteur « Question 4/9 ». Retour arrière possible, validation
obligatoire avant d'avancer.

---

## 4. Choix techniques

- **Séparation logique / affichage** : toute la donnée métier est dans `/lib` (questions, scoring,
  recommandations), les composants d'affichage dans `/components`, les types dans `/types`.
- **Scoring en fonctions pures** (`/lib/scoring.ts`) : normalisation de chaque réponse sur une
  échelle **0–100**, score de dimension = moyenne de ses 3 questions, score global = moyenne des
  3 dimensions (pondération égale, choix assumé). Testable et sans effet de bord.
- **Persistance via `useSyncExternalStore`** : plutôt que de synchroniser un état React avec
  `localStorage` à coups de `setState` dans un `useEffect` (anti-pattern), le stockage est exposé
  comme *external store*. Cela évite les échecs d'hydratation et respecte les règles React
  modernes. La progression est sauvegardée en continu et restaurée au rechargement.
- **Gestion des égalités** : le résultat conserve **toutes** les dimensions au score max/min. Si
  les 3 scores sont égaux (profil homogène), il n'y a ni point fort ni faiblesse isolés et la
  recommandation devient globale.
- **3D légère et non bloquante** : un petit objet 3D (three.js) uniquement sur l'accueil,
  **chargé en lazy** (jamais au SSR, jamais sur les autres écrans), avec fallback pendant le
  chargement et respect de `prefers-reduced-motion`.
- **Accessibilité** : rôles ARIA (`radiogroup`, `checkbox`, `meter`, `progressbar`, `status`),
  navigation clavier, focus déplacé à chaque changement de question.

### Barème de scoring

Chaque réponse est convertie en un score 0–100 :

| # | Dimension | Type | Barème |
|---|---|---|---|
| 1 | Digitalisation | choix multiple | chaque outil = 34 pts, somme plafonnée à 100 ; « Aucun » = 0 |
| 2 | Digitalisation | échelle (5 niveaux) | normalisé de 0 à 100 |
| 3 | Digitalisation | choix unique | Espèces 0 / Mobile Money 75 / Carte 100 / Mixte 100 |
| 4 | Opérations | échelle (5 niveaux) | normalisé de 0 à 100 |
| 5 | Opérations | oui/non | Oui 100 / Non 0 |
| 6 | Opérations | choix unique | Pas de suivi 0 / Suivi manuel 50 / Outil dédié 100 |
| 7 | Commercial | tranche | 0–10 → 0 / 10–50 → 50 / 50+ → 100 |
| 8 | Commercial | choix unique | Réseaux sociaux 100 / Bouche-à-oreille 50 / Physique 50 / Autre 25 |
| 9 | Commercial | oui/non | Oui 100 / Non 0 |

Score de dimension = moyenne des 3 questions · Score global = moyenne des 3 dimensions.

La recommandation est choisie par une règle simple : la **dimension au score le plus bas**
détermine un message pré-rédigé (pas d'IA, cohérence avant sophistication). En profil homogène,
un message global est utilisé.

---

## 5. Installation

**Prérequis** : Node.js 18+ (testé sur Node 22) et npm.

```bash
# installer les dépendances
npm install

# lancer en développement
npm run dev
# → http://localhost:3000

# build de production
npm run build
npm run start

# lint
npm run lint
```

---

## 6. Fonctionnalités

- Écran d'introduction présentant l'objectif, la durée et le principe (données locales).
- 9 questions, une à la fois, avec progression visible (barre segmentée + repère de dimension).
- Navigation avant/arrière ; impossible d'avancer sans réponse (sauf « Aucun » sur le choix
  multiple, qui est une réponse valide).
- Progression persistée dans `localStorage` : reprise possible après rechargement.
- Écran de résultat type **dashboard** : score global (jauge circulaire), scores par dimension,
  point fort, faiblesse, recommandation, et bouton « Recommencer ».
- Gestion du cas « profil homogène » (3 dimensions au même niveau).
- Responsive mobile-first (vérifié ~375 px et desktop).
- Visuel 3D décoratif sur l'accueil (lazy, avec fallback).

---

## 7. Structure du projet

```
/app
  page.tsx                → Écran Introduction
  diagnostic/page.tsx     → Écran Questions (state machine)
  resultat/page.tsx       → Écran Résultat (dashboard)
  layout.tsx, globals.css
/components
  QuestionCard.tsx        → Rendu des réponses selon le type
  ProgressBar.tsx         → Barre segmentée / continue
  ScoreGauge.tsx          → Jauge (anneau ou barre) réutilisable
  RecommendationBox.tsx   → Encadré de recommandation
  LoadingState.tsx        → Animation de chargement
  HeroScene.tsx / HeroVisual.tsx → Objet 3D de l'accueil (lazy)
/lib
  questions.ts            → 9 questions + barème
  scoring.ts              → Fonctions pures de calcul
  recommendations.ts      → Mapping dimension faible → message
  storage.ts              → Persistance localStorage (external store)
/types
  diagnostic.ts           → Types TypeScript du domaine
```

---

## 8. Limites (hors périmètre assumé)

- Seules **3 des 8 dimensions** sont couvertes.
- Pas d'authentification, pas de backend, pas de base de données réelle.
- Pas de persistance serveur (tout est local au navigateur).
- Pas de dashboard administrateur ni de gestion de cohorte.
- Pas d'intégration paiement / Mobile Money.
- Pas de scoring ni de recommandations générés par IA.
- Recommandations **pré-rédigées** (une par dimension), non générées dynamiquement.
- Scores **fictifs** mais logique de calcul cohérente et documentée.

---

## 9. Améliorations possibles

- **Diagnostic adaptatif** : adapter le parcours au profil (voir bonus ci-dessous).
- Couvrir les 8 dimensions et enrichir le barème.
- Export du résultat en **PDF** ou rapport partageable.
- Persistance serveur + comptes pour suivre une cohorte de MPME.
- **Tests unitaires** sur `/lib/scoring.ts` (le code pur s'y prête).
- Internationalisation, audit d'accessibilité, analytics produit.

---

## 10. Bonus — réflexion produit

**Piste : un diagnostic adaptatif.**

Aujourd'hui, tous les utilisateurs répondent aux mêmes 9 questions. Or une entreprise
commerciale, une entreprise de services et une entreprise individuelle n'ont ni les mêmes
leviers ni les mêmes risques. On pourrait **brancher le parcours selon une première réponse**
(type d'activité, effectif) :

- entreprise commerciale → questions approfondies sur le stock et les fournisseurs ;
- entreprise de services → questions sur les opérations et la dépendance aux personnes ;
- 30 employés ou plus → volet RH avancé ;
- entreprise individuelle → parcours allégé.

Cela réduirait la fatigue de réponse et augmenterait la pertinence des recommandations, sans
changer la logique de scoring. Cette piste n'est **pas implémentée** dans le prototype — elle
illustre la capacité à détecter ce type d'amélioration.

---

## 11. Usage de l'IA

Le prototype a été développé avec l'assistance d'un **agent de codage IA**. L'usage est assumé et
mentionné ici conformément à la consigne. Le code a été relu, compris et validé (lint, build,
gestion des cas limites) — il peut être expliqué en entretien.

---

## Auteur

**BANKOLE Primaël** — candidat Développeur, ALODO TECH.
