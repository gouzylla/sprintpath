# SprintPath — Programme de développement

## Vision
Une application personnelle d'apprentissage adaptatif pour progresser en SQL, Python et anglais professionnel, utilisable en priorité pendant les trajets, avec une forte lisibilité et un usage à une main.

## Objectifs measurable
- Ouvrir une session en moins de 10 secondes.
- Permettre des sessions de 2, 10 ou 20 minutes, interruptibles.
- Conserver la progression hors connexion.
- Adapter la difficulté à partir des tentatives.
- Expliquer chaque erreur avec une correction concrète.
- Permettre l'usage mobile installable (PWA).

## Périmètre du MVP
1. Parcours SQL, Python et anglais professionnel.
2. Diagnostic initial court et sélection d'exercices.
3. Sessions courtes avec réponse, correction et explication.
4. Persistance locale des tentatives et du planning de révision.
5. Tableau de bord par compétence.
6. Interface mobile-first utilisable à une main.
7. Mode hors connexion et installation PWA.
8. Backend FastAPI et adaptateur NVIDIA NIM optionnel.

## Hors périmètre du premier incrément
- Authentification multi-utilisateur et synchronisation multi-appareils.
- Paiements, notifications push, voix et RAG documentaire.
- Agent autonome ou génération illimitée de contenu.

## Architecture
- `frontend/` : React, TypeScript, Vite, PWA.
- `backend/` : FastAPI, SQLAlchemy, SQLite en local.
- Le backend reste propriétaire du score, des règles de répétition espacée et de l'historique.
- NVIDIA NIM sert à générer des variantes et un feedback; un mode local déterministe garantit le fonctionnement sans clé.
- Migration prévue : PostgreSQL/Supabase pour comptes et synchronisation.

## Modèle métier
- `Skill`: domaine, nom, niveau et date de prochaine révision.
- `Exercise`: consigne, réponse attendue, explication, difficulté.
- `Attempt`: réponse, score, durée, correction et date.
- Règle de progression : score 0–100, intervalle de 1, 3, 7 puis 15 jours ; les erreurs sont replanifiées le lendemain.

## Direction UX
- **Aesthetic** : carnet de terrain éditorial, chaleureux et précis, avec fond ivoire, encre sombre et accent vert acide.
- Typographie expressive pour les titres et sans-serif très lisible pour le contenu.
- Une action principale persistante en bas de l'écran.
- Zones tactiles d'au moins 44 px, contraste élevé, aucun élément essentiel hors du pouce.

## Critères d'acceptation du MVP
- [ ] Le tableau de bord affiche les trois domaines et les compétences faibles.
- [ ] Une session SQL/Python/anglais peut être démarrée depuis l'accueil.
- [ ] La réponse est enregistrée et une correction expliquée est affichée.
- [ ] Le score et les métriques sont mis à jour après une tentative.
- [ ] Les données survivent à un rechargement et à un redémarrage du navigateur.
- [ ] L'application est installable et affiche un écran hors connexion.
- [ ] Les erreurs d'API n'effacent pas les données locales.
- [ ] La navigation principale fonctionne au clavier et sur mobile.

## Sprint 2 — Enrichissement NVIDIA NIM (livré)
- Génération et persistance de variantes SQL, Python et anglais professionnel.
- Coach conversationnel : indice, explication et question d’entretien.
- Feedback de tentative enrichi par le modèle, sans déporter le score ni la progression.
- Validation stricte des réponses JSON NIM et erreurs HTTP explicites.
- Dégradation gracieuse hors connexion : les actions IA sont désactivées, les corrections locales restent disponibles.

## Roadmap
- Sprint 1 (MVP) : application locale, sessions, progression, PWA.
- Sprint 2 : contenu enrichi NVIDIA NIM, variantes et coach conversationnel — livré.
- Sprint 3 : compte, synchronisation cloud et répétition espacée avancée.
- Sprint 4 : recommandations, voix et simulation d’entretien approfondie.
