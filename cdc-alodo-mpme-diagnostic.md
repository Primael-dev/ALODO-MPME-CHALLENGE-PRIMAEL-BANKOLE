# Cahier des charges — Prototype de diagnostic ALODO MPME

**Exercice de sélection Développeur — ALODO TECH**
**Candidat :** Mael Bankolé (BANKOLE Primaël)
**Durée :** 3 jours
**Dépôt :** `ALODO-MPME-CHALLENGE-PRIMAEL-BANKOLE`

---

## 1. Objectif du projet

Développer un prototype fonctionnel d'une interface de diagnostic MPME simulant une partie réaliste du parcours ALODO MPME, sur un périmètre volontairement restreint, afin de démontrer :

- la compréhension du produit ALODO et de son marché cible (MPME béninoises/panafricaines) ;
- la capacité à transformer un problème métier en solution technique concrète ;
- le niveau de compétence technique, la qualité du code et l'autonomie ;
- la capacité à prioriser et à justifier des choix de scope.

Le prototype **n'a pas vocation à couvrir les 8 dimensions du diagnostic**, ni à intégrer de backend complexe, d'authentification, de base de données réelle ou de système de financement.

---

## 2. Périmètre fonctionnel

### 2.1 Dimensions couvertes

Sur les 8 dimensions du diagnostic ALODO MPME, le prototype couvre **3 dimensions cohérentes entre elles**, orientées "outils / fonctionnement / capacité à vendre" :

| Dimension | Justification du choix |
|---|---|
| **Digitalisation** | Cœur de la proposition de valeur ALODO (outils numériques, paiements, présence digitale) ; dimension la plus visible et différenciante pour une MPME |
| **Opérations** | Révèle la dépendance au dirigeant et le niveau de structuration interne, souvent le premier frein à la croissance |
| **Commercial** | Complète le tableau en évaluant la capacité de l'entreprise à générer et fidéliser des clients |

Ce triptyque permet de raconter une histoire cohérente au moment du résultat : une MPME peut être bien digitalisée mais mal structurée en interne, ou l'inverse — ce qui donne du sens aux recommandations.

### 2.2 Parcours utilisateur

```
Écran 1 : Introduction
   ↓ (bouton "Commencer")
Écran 2 : Questions (9 questions, 3 par dimension)
   ↓ (validation de la dernière réponse)
Écran 3 : Résultat (score global + par dimension + recommandation)
```

---

## 3. Spécifications détaillées par écran

### 3.1 Écran Introduction

- Titre et présentation courte du diagnostic ALODO MPME
- Objectif du diagnostic (comprendre la maturité de l'entreprise)
- Durée estimée (ex. "~3 minutes, 9 questions")
- Principe de fonctionnement (aucune bonne ou mauvaise réponse, données non enregistrées)
- Bouton "Commencer le diagnostic"

### 3.2 Écran Questions

**9 questions au total, réparties en 3 blocs de 3 (Digitalisation → Opérations → Commercial)**

| # | Dimension | Question | Type | Réponses |
|---|---|---|---|---|
| 1 | Digitalisation | Quels outils numériques utilisez-vous pour gérer votre activité ? | Choix multiple | Facturation / Gestion de stock / Comptabilité / Aucun |
| 2 | Digitalisation | Utilisez-vous WhatsApp Business ou les réseaux sociaux pour votre activité ? | Échelle (0–4) | Jamais → Quotidiennement |
| 3 | Digitalisation | Comment vos clients vous paient-ils majoritairement ? | Choix unique | Espèces / Mobile Money / Carte / Mixte |
| 4 | Opérations | Si vous êtes absent une semaine, l'activité continue-t-elle normalement ? | Échelle (1–5) | Pas du tout → Totalement |
| 5 | Opérations | Avez-vous des processus ou procédures écrites, même simples ? | Oui / Non | — |
| 6 | Opérations | Comment gérez-vous vos fournisseurs et votre stock ? | Choix unique | Pas de suivi / Suivi manuel / Outil dédié |
| 7 | Commercial | Combien de clients réguliers avez-vous ? | Tranche | 0–10 / 10–50 / 50+ |
| 8 | Commercial | Quel est votre principal canal d'acquisition de clients ? | Choix unique | Bouche-à-oreille / Réseaux sociaux / Physique / Autre |
| 9 | Commercial | Suivez-vous vos prospects jusqu'à la conversion en client ? | Oui / Non | — |

**Exigences UX :**
- Une question à la fois (pas de scroll infini)
- Barre de progression + repère textuel (ex. "Commercial — 2/3")
- Navigation retour possible (bouton "Précédent")
- Impossible de passer à la suite sans répondre (sauf cases à cocher où "aucun" est une réponse valide)

### 3.3 Écran Résultat

- Score global sur 100 (moyenne des 3 scores de dimension)
- Score détaillé par dimension (Digitalisation / Opérations / Commercial), affiché visuellement (barres ou jauges)
- Au moins 1 point fort (dimension la mieux notée)
- Au moins 1 point faible (dimension la moins bien notée)
- 1 recommandation textuelle générée dynamiquement à partir du profil de scores
- Bouton "Recommencer le diagnostic"

Exemple de rendu :
```
ALODO MPME Score — 64/100
Digitalisation: 58   Opérations: 55   Commercial: 78

"Bonne dynamique commerciale, mais la dépendance au dirigeant
et l'absence de processus écrits freinent la capacité à passer
à l'échelle. Prioriser la formalisation des opérations."
```

---

## 4. Logique de scoring

- Chaque réponse est convertie en un score de **0 à 100** selon un barème fixe et documenté par question (ex. échelle 0–4 → score = valeur × 25 ; oui/non → 100/0 ou 0/100 selon le sens de la question ; choix unique → valeur pondérée par option).
- Score de dimension = moyenne des 3 questions de la dimension.
- Score global = moyenne des 3 scores de dimension (pondération égale, choix assumé et documenté).
- La recommandation est choisie par une règle simple : on identifie la dimension au score le plus bas et on sélectionne un message pré-rédigé associé à cette dimension (pas d'IA, pas de génération dynamique complexe — cohérence avant sophistication).
- Barème et mapping question → score stockés dans un fichier de configuration séparé (`questions.ts` ou équivalent), pour rester lisible et modifiable sans toucher à la logique d'affichage.

---

## 5. Spécifications techniques

### 5.1 Stack

| Composant | Choix | Justification |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Full-stack léger en un seul framework, rapide à livrer en solo, stack maîtrisée |
| Style | **Tailwind CSS** | Rapidité de mise en œuvre, responsive natif |
| Données | **Mock / état local (React state)**, persistance de la progression en **localStorage** | Aucune base de données réelle exigée par la consigne ; simplicité assumée |
| Backend | Aucun serveur dédié ; logique de scoring exécutée côté client (fonctions pures) | Le prototype ne nécessite pas de persistance serveur ; garde le projet simple et maîtrisé de bout en bout |

### 5.2 Architecture du code (indicative)

```
/app
  /page.tsx                → Écran Introduction
  /diagnostic/page.tsx     → Écran Questions (state machine)
  /resultat/page.tsx       → Écran Résultat
/components
  ProgressBar.tsx
  QuestionCard.tsx
  ScoreGauge.tsx
  RecommendationBox.tsx
/lib
  questions.ts             → Définition des 9 questions + barème
  scoring.ts               → Fonctions pures de calcul de score
  recommendations.ts       → Mapping dimension faible → message
/types
  diagnostic.ts            → Types TypeScript (Question, Answer, Result...)
```

### 5.3 Qualité de code attendue

- Composants réutilisables et typés (TypeScript strict)
- Séparation claire logique métier (`/lib`) vs affichage (`/components`)
- Gestion des cas limites (réponse vide, retour en arrière, rechargement de page)
- Nommage explicite, code commenté aux endroits non triviaux
- Historique Git organisé (commits atomiques, messages clairs)

### 5.4 Responsive

- Mobile-first (le marché cible ALODO est majoritairement mobile)
- Vérification manuelle sur viewport mobile (~375px) et desktop

---

## 6. Hors périmètre (assumé et documenté dans le README)

- Les 5 autres dimensions du diagnostic (Formalisation, Finance, Comptabilité, RH, Préparation au financement)
- Authentification, gestion multi-utilisateurs
- Base de données réelle / persistance serveur
- Dashboard administrateur
- Application mobile native
- Intégration paiement / Mobile Money
- Scoring ou recommandations générés par IA

---

## 7. Livrables

- [ ] Dépôt GitHub public nommé `ALODO-MPME-CHALLENGE-PRIMAEL-BANKOLE`
- [ ] README complet (présentation, choix produit, choix techniques, installation, fonctionnalités, limites, améliorations)
- [ ] Code source du prototype (3 écrans fonctionnels)
- [ ] Lien de démo si déployé (ex. Vercel)
- [ ] (Optionnel) Courte vidéo de démonstration
- [ ] (Optionnel — bonus) Note de réflexion produit sur une amélioration du diagnostic

---

## 8. Planning indicatif sur 3 jours

| Jour | Objectif |
|---|---|
| **Jour 1** | Cadrage (ce document), scaffolding Next.js/Tailwind, définition des types et du barème, écran Introduction + structure des Questions |
| **Jour 2** | Logique de scoring, écran Questions complet (navigation, progression), écran Résultat (scores + recommandations), responsive |
| **Jour 3** | Polish UX/UI, tests manuels desktop/mobile, README, nettoyage du code, réflexion bonus (optionnel), déploiement démo, vidéo (optionnel) |

---

## 9. Rappel — grille d'évaluation ALODO TECH

| Critère | Poids |
|---|---|
| Compréhension d'ALODO | 15 % |
| Produit / UX | 15 % |
| Compétence technique | 30 % |
| Résolution de problèmes | 15 % |
| Autonomie | 10 % |
| Discipline (délai, organisation, README, Git) | 10 % |
| Intérêt pour ALODO | 5 % |
