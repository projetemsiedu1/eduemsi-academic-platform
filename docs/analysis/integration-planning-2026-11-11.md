# Intégration du module Responsable planning

Date : 11 novembre 2026. Dépôt local EMSI Univora.

## Résultat

Les ajouts de `frontend1/`, `backend-spring1/` et `scripts1/` ont été comparés aux dossiers principaux puis intégrés dans **`frontend/`, `backend-spring/` et `scripts/`**. Les dossiers du collaborateur sont conservés. Aucun fichier source original des trois dossiers principaux n’a été supprimé.

La connexion Univora, ses logos, ses animations et son adaptation au zoom 100 % sont conservés. Après connexion, un responsable planning arrive sur `/timetable`. Un administrateur dispose d’un accès au module depuis `/dashboard`.

Statuts : **VERIFIED** = vérifié dans les sources ou les contrôles exécutés ; **UNKNOWN** = non vérifié dans cette session ; **PROPOSED** = recommandation pour la suite.

## Comparaison initiale — VERIFIED

- Frontend du collaborateur : 15 nouveaux fichiers de planning, 6 fichiers communs différents et 12 fichiers communs identiques. Ses versions du thème, du layout et du client HTTP ne contenaient pas vos évolutions de connexion : elles n’ont pas remplacé les vôtres.
- Backend du collaborateur : 11 nouveaux fichiers, 9 fichiers communs différents et 93 identiques. Ajouts principaux : CRUD étudiants, écritures des enseignants et filières, justification/suppression des absences et tests.
- Scripts du collaborateur : un script de contrôle API ajouté ; 9 fichiers identiques.
- Le frontend planning initial utilisait essentiellement un jeu de données local. Son action de solveur temporisait puis réinitialisait les données en annonçant un résultat optimal. Ce comportement a été remplacé.

L’inventaire initial est conservé dans `.integration/comparison.json`. Une copie des sources des trois dossiers principaux avant fusion est disponible sous `.integration/before-2026-11-11T10-48-40-658Z/`. Les fichiers de travail et sauvegardes sont ignorés par Git pour ne pas publier de configurations locales ou de données de test.

## Fonctionnalités intégrées — VERIFIED

### Interface Responsable planning

- Vue d’ensemble avec indicateurs calculés et répartition des ressources par campus.
- Ressources : consultation et recherche des campus, salles, enseignants, groupes et modules.
- Création/modification des salles, enseignants et groupes ; création de modules avec un premier élément pédagogique.
- Disponibilités des enseignants saisissables par jour et créneau.
- Grille hebdomadaire par groupe et par enseignant ; volumes calculés selon la durée réelle des séances.
- Impression de la grille de groupe, avec un cadre spécifique au format A4 paysage.
- Création, modification et suppression de séances.
- Contrôles de cohérence et de chevauchement ; affichage détaillé des anomalies.
- Proposition automatique demandée au véritable solveur du backend, affichée comme **aperçu non enregistré**.
- Navigation mobile ouvrable et fermable au clavier, dialogues natifs avec gestion du focus, retours d’erreur et confirmation des suppressions.

La charte Univora est partagée : Geist, tokens EMSI, surfaces claires, navigation neutre, actions vert foncé. Les polices déjà utilisées sont hébergées dans `frontend/src/app/fonts/` avec leurs licences OFL, pour éviter une dépendance à Google Fonts pendant la compilation.

### Données réelles et démonstration

Le mode par défaut charge le référentiel depuis le serveur. Les données de démonstration sont disponibles uniquement par l’action explicite « Explorer la démonstration ». Le bandeau indique alors qu’elles sont fictives et temporaires. Les modifications de ce mode n’écrivent pas dans la base.

Le prototype local n’est plus présenté comme une application connectée par défaut. Une indisponibilité du serveur reste visible : le logiciel n’invente pas de données réelles pour masquer une erreur.

### Contrat d’API ajouté

- `GET /api/v1/planning/workspace` : lecture cohérente des campus, salles, enseignants, filières, options, groupes, modules, éléments et séances.
- `POST /api/v1/planning/modules` : création transactionnelle d’un module et de son premier élément.
- `POST /api/v1/planning/seances` : création d’une séance.
- `PUT /api/v1/planning/seances/{id}` : modification.
- `DELETE /api/v1/planning/seances/{id}` : suppression, refusée si des absences y sont rattachées.
- `PUT /api/v1/groupes/{id}` : modification complète d’un groupe.

Les CRUD du collaborateur pour les étudiants, enseignants, filières et absences ont aussi été repris. Le client existant `src/lib/api-client.ts` reste le point d’accès HTTP unique.

## Corrections apportées lors de la fusion — VERIFIED

- Droits planning et administrateur vérifiés côté interface et sur les nouvelles API de planning. Les écritures de ressources sont réservées aux rôles administratifs concernés.
- L’inscription publique impose le rôle étudiant : transmettre un rôle administrateur dans le JSON ne donne plus ce privilège.
- L’initialisation historique des comptes de démonstration est limitée aux profils `local`, `dev` et `test`. La route manuelle d’initialisation exige un administrateur.
- Gestion CORS centralisée et origines frontend configurables ; suppression des annotations contradictoires dispersées dans les contrôleurs.
- Retrait de la clé OpenRouter encodée dans le service Java. Utiliser `OPENROUTER_API_KEY` pour une clé personnelle. Aucun service IA distant n’a été appelé pendant la validation.
- Erreurs métier et de validation restituées sous une forme lisible ; conflits d’intégrité rendus en HTTP 409 sans exposer les détails SQL.
- Suppression d’un groupe déjà utilisé refusée, au lieu de supprimer implicitement ses étudiants et séances en cascade.
- Contrôle backend des créneaux sur toute la durée d’une séance, de la capacité, des postes, du type de salle, du campus et des disponibilités renseignées.
- Verrous transactionnels lors des affectations partageant un enseignant, un groupe ou une salle.
- Détecteur frontend corrigé pour les chevauchements multi-créneaux, les références manquantes, les salles indisponibles et le nombre de postes.
- Taux d’occupation calculé sur les créneaux physiques occupés, sans double compter une collision.
- Prise en charge du format historique de disponibilité SQL et du format structuré produit par le formulaire.
- Conservation des besoins multiples en laboratoires et des options de filière, au lieu de les réduire silencieusement à une seule valeur.
- Cumul d’absences recalculé après justification et suppression ; durée basée sur les créneaux, et seuil calculé sur le volume configuré de l’étudiant.
- Le fichier SQL `V3__seed_academic_modules_and_seances.sql` du collaborateur contient des données de démonstration et des identifiants imposés. Il est conservé comme fixture sous `backend-spring/src/test/resources/fixtures/planning-demo.sql`, **pas comme migration appliquée automatiquement** à votre base.
- Le script `scripts/test_all_apis.ps1` est maintenant un contrôle de lecture authentifié, sans identifiants codés en dur ni création/suppression implicite dans la base.
- Configuration Compose alignée sur `frontend/`, MySQL et les ports 3000/8085 ; Dockerfile Next.js ajouté. Le packaging standalone est activé uniquement dans le build Docker, pour éviter une copie locale inutile des dépendances.

## Structure et traçabilité

Frontend :

- `src/app/login/`, `src/components/auth/` : connexion conservée, aiguillage planning ajouté.
- `src/app/timetable/` : routes de vue d’ensemble, ressources, groupes, enseignants et vérification.
- `src/components/timetable/` : shell, navigation, en-tête, formulaires et grille réutilisables.
- `src/context/TimetableContext.tsx` : chargement et mutations du référentiel, modes serveur/démonstration séparés.
- `src/types/timetable.ts` : contrats typés.
- `src/lib/timetable-checker.ts` : vérification indépendante de l’affichage.
- `src/data/timetable-mock.ts` : jeu de démonstration explicite.
- `src/components/ui/modal.tsx` : dialogue accessible partagé.
- `scripts/test-planning.cjs` : tests métier du vérificateur et des statistiques.

Backend :

- `controller/PlanningWorkspaceController.java` : endpoints du module.
- `dto/planning/` : contrats de lecture et d’écriture.
- `service/PlanningService.java` : lecture transactionnelle, affectations et persistance.
- `service/PlanningAvailability.java` : interprétation et validation des disponibilités.
- `exception/ApiExceptionHandler.java` : restitution des erreurs.
- `src/test/java/.../planning/PlanningIntegrationTest.java` : tests HTTP, sécurité et JPA sur H2.

Le détail exhaustif des ajouts et modifications des trois dossiers principaux est conservé dans `.integration/final-changes.json`. Les changements racine comprennent également le README, Compose, les exemples d’environnement et les exclusions Git.

## Validation et limites

- **VERIFIED :** lint frontend, tests du vérificateur et compilation de production.
- **VERIFIED :** 20 tests backend réussis, dont 7 tests d’intégration Spring/H2. Ils couvrent notamment l’accès anonyme et étudiant, l’accès planning, les écritures de séances, les chevauchements, les équipements, CORS, les modules, l’inscription et les totaux d’absences.
- **VERIFIED :** 12 tests métier frontend réussis.
- **VERIFIED :** 22 contrôles de régression de la connexion réussis après intégration, dont zoom 200 %, clavier, réduction des animations, stockage, expiration et déconnexion. Le bouton de relance des animations revient à la ligne si nécessaire sur écran étroit.
- **VERIFIED :** 21 contrôles navigateur du planning réussis : accès, ressources, écritures HTTP, modules, navigation, erreurs, démonstration et absence de débordement mobile. Ils utilisent des réponses API synthétiques ; la persistance et les autorisations réelles sont testées séparément sur H2. Résultats : `.integration/browser-check-results.json`.
- **VERIFIED :** inspecteur visuel du planning : 0 échec et 0 avertissement à 1440, 768 et 390 px. Captures : `.integration/visual-report/`.
- **UNKNOWN :** démarrage de cette version sur votre base MySQL existante ; aucune migration ni écriture n’a été lancée sur celle-ci pendant la fusion.
- **UNKNOWN :** exécution de Docker Compose, Docker n’étant pas disponible dans la session. Sa configuration a été alignée mais n’est pas annoncée comme validée en conteneurs.
- Le solveur existant sait proposer des affectations sur un créneau par séance. L’interface ne lui confie pas les séances longues et ne publie pas automatiquement sa proposition.
- Le module ne prouve pas l’ensemble des contraintes avancées du cahier des charges, par exemple tous les temps de transit ou toutes les règles de pause. Il n’annonce donc plus de certification d’optimalité.
- Le PFE existant conserve son stockage mémoire. Paiements, délibérations et autres modules documentaires restent hors de cette intégration.
- Cette fusion ne constitue pas un audit de sécurité complet ni une certification de déploiement en production. Les comptes et secrets historiques de développement doivent être remplacés avant toute exposition publique.

## Lancer et tester

Utiliser les dossiers **sans suffixe `1`**. Les commandes détaillées sont dans le README racine.

```powershell
# Terminal backend : Java 21 sélectionné, MySQL de développement configuré
cd backend-spring
mvn.cmd "-Dmaven.repo.local=$env:USERPROFILE\.m2\repository" spring-boot:run
```

```powershell
# Deuxième terminal
cd frontend
npm.cmd ci
npm.cmd run dev
```

Connexion : `/login` ; responsable planning : `/timetable` ; Swagger : `http://localhost:8085/swagger-ui.html`.

```powershell
# Dans frontend/
npm.cmd run lint
npm.cmd run test:planning
npm.cmd run build
```

```powershell
# Dans backend-spring/
mvn.cmd "-Dmaven.repo.local=$env:USERPROFILE\.m2\repository" clean test
```

Les tests Maven de cette session ont utilisé le JDK 23 installé, avec cible Java 21 et traitement Lombok explicite. Pour le lancement courant, le JDK 21 déclaré par le projet reste le choix à configurer.

## Travail en équipe — PROPOSED

Pour les prochains échanges, conserver un seul dépôt et les trois dossiers canoniques. Chaque membre travaille dans une branche de fonctionnalité, par exemple `feat/planning` ou `feat/login`, puis soumet ses changements pour revue. Éviter de créer une nouvelle copie `frontend2/` ou `backend-spring2/` à chaque contribution.

Partager les contrats d’API et les tokens de thème ; réutiliser les composants et le client HTTP. Ajouter les migrations sans réécrire les versions déjà appliquées. Garder les jeux de démonstration dans les fixtures. Exécuter lint, tests frontend, build et tests backend avant de fusionner une contribution.

Aucun dépôt Git n’étant initialisé dans cette copie téléchargée, aucune branche, publication ou action Git distante n’a été créée pendant ce travail.


## Liste des fichiers ajoutés ou modifiés

### frontend

- Ajout : `frontend/.dockerignore`
- Ajout : `frontend/Dockerfile`
- Ajout : `frontend/scripts/test-planning.cjs`
- Ajout : `frontend/src/app/fonts/geist-latin.woff2`
- Ajout : `frontend/src/app/fonts/geist-mono-latin.woff2`
- Ajout : `frontend/src/app/fonts/geist-OFL.txt`
- Ajout : `frontend/src/app/fonts/geistmono-OFL.txt`
- Ajout : `frontend/src/app/timetable/constraints/page.tsx`
- Ajout : `frontend/src/app/timetable/groups/page.tsx`
- Ajout : `frontend/src/app/timetable/layout.tsx`
- Ajout : `frontend/src/app/timetable/page.tsx`
- Ajout : `frontend/src/app/timetable/resources/page.tsx`
- Ajout : `frontend/src/app/timetable/teachers/page.tsx`
- Ajout : `frontend/src/components/timetable/ResourceModal.tsx`
- Ajout : `frontend/src/components/timetable/ScheduleGrid.tsx`
- Ajout : `frontend/src/components/timetable/StatsCard.tsx`
- Ajout : `frontend/src/components/timetable/TimetableHeader.tsx`
- Ajout : `frontend/src/components/timetable/TimetableShell.tsx`
- Ajout : `frontend/src/components/timetable/TimetableSidebar.tsx`
- Ajout : `frontend/src/components/ui/modal.tsx`
- Ajout : `frontend/src/context/TimetableContext.tsx`
- Ajout : `frontend/src/data/timetable-mock.ts`
- Ajout : `frontend/src/lib/timetable-checker.ts`
- Ajout : `frontend/src/types/timetable.ts`
- Modification : `frontend/.gitignore`
- Modification : `frontend/eslint.config.mjs`
- Modification : `frontend/LOGIN.md`
- Modification : `frontend/next.config.ts`
- Modification : `frontend/package-lock.json`
- Modification : `frontend/package.json`
- Modification : `frontend/src/app/globals.css`
- Modification : `frontend/src/app/layout.tsx`
- Modification : `frontend/src/app/page.tsx`
- Modification : `frontend/src/components/auth/dashboard-session.tsx`
- Modification : `frontend/src/components/auth/login-form.tsx`
- Modification : `frontend/src/lib/api-client.ts`

### backend-spring

- Ajout : `backend-spring/src/main/java/ma/emsi/academic/controller/EtudiantController.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/controller/PlanningWorkspaceController.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/dto/enseignant/CreateEnseignantRequest.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/dto/etudiant/CreateEtudiantRequest.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/dto/etudiant/EtudiantDto.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/dto/filiere/CreateFiliereRequest.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/dto/planning/CreatePlanningModuleRequest.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/dto/planning/PlanningSnapshot.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/dto/planning/SaveSeanceRequest.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/exception/ApiExceptionHandler.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/exception/BadRequestException.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/EtudiantService.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/impl/EtudiantServiceImpl.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/PlanningAvailability.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/PlanningService.java`
- Ajout : `backend-spring/src/test/java/ma/emsi/academic/planning/PlanningIntegrationTest.java`
- Ajout : `backend-spring/src/test/java/ma/emsi/academic/service/EtudiantServiceTest.java`
- Ajout : `backend-spring/src/test/java/ma/emsi/academic/service/FiliereServiceTest.java`
- Ajout : `backend-spring/src/test/resources/fixtures/planning-demo.sql`
- Modification : `backend-spring/pom.xml`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/controller/AbsenceController.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/controller/AuthController.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/controller/EnseignantController.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/controller/FiliereController.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/controller/GroupeController.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/controller/SalleController.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/dto/auth/LoginResponse.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/dto/salle/CreateSalleRequest.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/EmsiAcademicApplication.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/repository/AbsenceRepository.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/repository/EtudiantRepository.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/repository/SeanceRepository.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/security/SecurityConfig.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/service/AbsenceService.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/service/ai/OpenRouterAiService.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/service/EnseignantService.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/service/FiliereService.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/service/GroupeService.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/service/impl/AbsenceServiceImpl.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/service/impl/AuthServiceImpl.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/service/impl/EnseignantServiceImpl.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/service/impl/FiliereServiceImpl.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/service/impl/GroupeServiceImpl.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/web/controller/PfeAiController.java`
- Modification : `backend-spring/src/main/java/ma/emsi/academic/web/controller/TimetableController.java`

### scripts

- Ajout : `scripts/test_all_apis.ps1`
