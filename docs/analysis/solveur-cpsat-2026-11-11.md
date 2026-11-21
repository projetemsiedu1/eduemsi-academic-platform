# Solveur global OR-Tools CP-SAT — EMSI Univora

Date : 11 novembre 2026. Branche locale : `feat/solveur-cpsat`, issue de `NOUSAIRE`. Aucun push ni merge effectué pour cette mission.

## Fonctionnement livré

Le responsable saisit ses ressources, les qualifications des enseignants et les besoins pédagogiques hebdomadaires, puis clique sur **Planifier** dans `/timetable/constraints`. Le backend charge la base et construit un modèle global : les groupes partagent réellement les mêmes salles et enseignants.

CP-SAT retourne une proposition vérifiée. Elle est consultable sous forme de grille par groupe et n’est enregistrée qu’après **Accepter et enregistrer**. Le rejet laisse les séances intactes. Les pages groupes et enseignants relisent ensuite les séances persistées via `/planning/workspace`.

Les salles et filières seules ne définissent pas un enseignement. Il faut également enregistrer les groupes et leurs effectifs, les modules/éléments, un enseignant qualifié et le nombre de séances souhaitées chaque semaine. Le solveur ne déduit pas arbitrairement ces données du volume semestriel.

L’ancien solveur et les dossiers des collègues restent conservés. La nouvelle interface ne leur confie plus la génération : elle appelle exclusivement `/api/v1/planning/solver/solve`. Cette nouvelle route ne contient aucun fallback heuristique ni jeu de démonstration injecté en production.

## Prérequis vérifiés

- Java 21 : compilation et tests avec le JDK Eclipse Adoptium 21 installé.
- Maven : projet Spring Boot 3.3.4, cible Java 21 et Lombok conservés.
- OR-Tools : dépendance existante `com.google.ortools:ortools-java:9.8.3296` réutilisée. Aucune nouvelle dépendance applicative, aucun microservice Python.
- Chargement natif Windows réellement exécuté par les tests. Un échec natif produit `NATIVE_UNAVAILABLE`, sans planning de remplacement.
- Branche de départ propre, puis création de la branche dédiée. Les sources `frontend1/`, `backend-spring1/` et `scripts1/` ne sont pas modifiées par cette mission.
- MySQL : lecture et écriture via les repositories JPA existants ; aucune connexion à la base partagée de l’équipe n’a été utilisée pour les tests.

Les tests ont rencontré un disque temporairement plein. L’extraction native a alors échoué ; cet échec n’a pas été masqué. Après nettoyage des caches natifs de tests terminés, les contrôles ont été relancés avec succès.

## Architecture et données ajoutées

Le package `service/solver/global/` contient :

- `TimetableSolverService` : orchestration et limitation à une résolution simultanée par instance du backend.
- `TimetableProblemBuilder` : lecture transactionnelle de la base et construction d’une entrée immuable, détachée de JPA.
- `CpSatTimetableSolver` : domaines compatibles, contraintes CP-SAT, objectif et extraction du statut réel.
- `TimetableSolutionValidator` : vérificateur indépendant du modèle et compteur de trous.
- `TimetableProposalService` : persistance des propositions, propriété, expiration, rejet et acceptation transactionnelle.
- `TimetableRequirementService` : saisie et validation des besoins/qualifications.
- `TimetableCalendar` : définition centrale du calendrier exposée au frontend.
- `TimetableProblem` : contrats immuables du moteur, sans dépendance au stockage.

`TimetableSolverController` expose ces services sans porter la logique mathématique.

La décision d’intégration Java et de validation par propositions est documentée dans [ADR-007](../architecture/03-architecture-decisions/ADR-007-global-cpsat-java-proposals.md). Elle précise le choix Python/FastAPI de l’ADR-002 historique, sans modifier ce document des collègues.

Trois tables sont ajoutées par `V4__planning_solver_proposals.sql` :

- `planning_requirements` : groupe, élément de module, enseignant préaffecté, nombre de séances hebdomadaires. Un seul besoin par couple groupe/élément. Le type de salle provient de l’élément pédagogique existant.
- `planning_qualifications` : qualification explicite d’un enseignant pour un module, unique par couple.
- `planning_proposals` : résultat, auteur, état, expiration, empreinte du problème et version optimiste.

La migration ajoute les tables et leurs clés étrangères ; elle ne contient aucune insertion ni modification des données académiques existantes. Aucun champ n’a été ajouté aux entités des collègues.

Les séances existantes sont conservées et considérées fixes, quel que soit leur statut historique. Elles comptent dans le besoin si leur groupe, élément et enseignant correspondent. Une séance longue existante compte pour autant de créneaux de 90 minutes qu’elle couvre ; les nouvelles séances générées durent un créneau.

## Contraintes réellement implémentées

- **H1** : au plus une séance par enseignant/jour/créneau, ressources existantes comprises.
- **H2** : au plus une séance par groupe/jour/créneau.
- **H3** : au plus une séance par salle/jour/créneau.
- **H4** : qualification enseignant/module obligatoire ; les combinaisons non qualifiées ne sont pas candidates.
- **H5** : respect des disponibilités renseignées des enseignants.
- **H6** : disponibilités obligatoires pour les vacataires ; aucun domaine entièrement libre ne leur est inventé.
- **H7** : laboratoire informatique et nombre de postes opérationnels suffisants pour un TP PC ; laboratoire réseaux ou amphithéâtre imposé quand demandé.
- **H8** : capacité de la salle au moins égale à l’effectif du groupe.
- **H9** : campus unique par groupe et par jour. La règle historique du projet est plus stricte : campus fixe du groupe pour toute la semaine, conservé ici.
- **H10** : campus unique par enseignant et par jour, y compris avec les séances existantes.
- **H11** : chaque occurrence du besoin restant est affectée exactement une fois ; les séances conservées et générées couvrent exactement le besoin déclaré.
- **H12** : jours ouverts, créneaux de 90 minutes et pause déjeuner configurée respectés. Les créneaux qui chevauchent le déjeuner sont exclus du domaine.
- **Règle supplémentaire** : charge hebdomadaire de l’enseignant plafonnée par ses heures contractuelles, séances existantes comprises.

Un permanent sans restriction de disponibilité est considéré disponible sur les créneaux ouverts ; cette convention est annoncée dans les diagnostics. Une qualification manquante, une référence incohérente ou une séance existante invalide bloque la génération au lieu de disparaître silencieusement.

Les contrôles préalables signalent notamment les salles incompatibles, capacités/postes insuffisants, disponibilités insuffisantes et demandes dépassant les capacités horaires. Une absence de salle compatible est une impossibilité démontrable ; une incompatibilité globale retournée par CP-SAT n’est pas attribuée artificiellement à une cause exacte.

## Variables et objectif mathématique

Pour chaque occurrence d’un besoin, `x[séance, jour, créneau, salle]` vaut 1 si elle utilise cette combinaison. Les variables ne sont créées que pour les combinaisons compatibles avec les ressources, disponibilités et séances fixes. Leur somme vaut exactement 1 pour chaque séance.

Pour chaque ressource et créneau, une somme « au plus 1 » interdit les collisions. Une variable de présence dans un campus, par enseignant et par jour, est liée aux affectations ; au plus un campus est autorisé. Une contrainte linéaire plafonne les minutes enseignées.

Pour chaque groupe et jour, des booléens indiquent si un créneau est occupé, s’il existe un cours avant, et s’il existe un cours après. La variable `trou` est vraie **si et seulement si** le créneau est libre avec un cours avant et un cours après. CP-SAT minimise la somme de ces variables. Les créneaux avant le premier cours et après le dernier ne coûtent rien ; le déjeuner n’est pas un créneau candidat.

Exemple testé : avec des cours fixes en S1 et S4, placer le troisième cours en S5 laisse un trou en S2. Le solveur place ce cours en S2 et prouve un objectif de zéro. Le temps de déjeuner entre S2 et S4 ne devient pas un trou artificiel.

Les statuts `OPTIMAL`, `FEASIBLE`, `INFEASIBLE`, `UNKNOWN` et `MODEL_INVALID` proviennent directement de CP-SAT. Les statuts applicatifs `INPUT_INVALID`, `NATIVE_UNAVAILABLE` et `VALIDATION_FAILED` identifient des échecs hors résolution. `FEASIBLE` n’est jamais renommé `OPTIMAL`. Voir la [documentation officielle CP-SAT](https://developers.google.com/optimization/cp/cp_solver) et l’[API Java du modèle](https://or-tools.github.io/docs/javadoc/com/google/ortools/sat/CpModel.html).

## Calendrier partagé et configuration

Les identifiants `CreneauHoraire` historiques sont conservés, ainsi que leurs horaires centralisés dans l’enum Java. Le backend expose les créneaux effectivement ouverts ; les grilles Next.js utilisent cette réponse. Un créneau historique conservé reste affichable, même s’il est fermé pour les nouvelles générations.

Par défaut : lundi–samedi, créneaux de 90 minutes et déjeuner 11:45–13:45. Cela ferme S3_12H00. Les cinq créneaux ouverts sont donc 08:30–10:00, 10:15–11:45, 13:45–15:15, 15:30–17:00 et 17:15–18:45. **Ce calendrier est une démonstration à confirmer, pas une déclaration des horaires officiels de l’EMSI.**

Configuration possible par propriétés Spring :

```yaml
univora:
  timetable:
    max-seconds: 15
    days: LUNDI,MARDI,MERCREDI,JEUDI,VENDREDI,SAMEDI
    slots: S1_08H30,S2_10H15,S3_12H00,S4_13H45,S5_15H30,S6_17H15
    lunch-start: "11:45"
    lunch-end: "13:45"
```

La limite CP-SAT est plafonnée à 30 secondes dans cette version synchrone. La construction et la lecture des données s’ajoutent au temps de recherche. Le client attend jusqu’à 60 secondes pour ce seul appel. Le prototype refuse plus de 300 nouvelles séances ou 120 000 variables candidates.

## API disponible

Préfixe commun : `/api/v1/planning/solver`. Toutes les routes exigent un rôle responsable planning ou super administrateur.

- `GET /calendar` : calendrier actif et libellé de démonstration.
- `GET /requirements` : besoins et qualifications.
- `POST /requirements`, `PUT /requirements/{id}`, `DELETE /requirements/{id}` : gestion des besoins.
- `POST /qualifications`, `DELETE /qualifications/{id}` : qualifications explicites.
- `POST /solve` : génération depuis la base, sans planning ni ressources fournis par le navigateur.
- `GET /proposals/{id}` : consultation d’une proposition appartenant au responsable connecté.
- `POST /proposals/{id}/accept` : validation et persistance.
- `POST /proposals/{id}/reject` : rejet.

La réponse du solveur contient le statut, le temps de calcul, le nombre de nouvelles séances demandées/affectées, l’objectif, sa meilleure borne lorsque disponible, les affectations, diagnostics, résultat de validation et référence de proposition.

## Protection lors de l’acceptation

Une proposition expire après 30 minutes et appartient à son auteur. Dans une transaction, le backend verrouille la proposition et les ressources concernées, reconstruit les données, compare leur empreinte puis relance la validation indépendante. Une différence produit HTTP 409 : il faut recalculer.

Les nouvelles séances sont ajoutées dans une seule transaction ; aucune séance publiée n’est supprimée ou déplacée. Une deuxième acceptation de la même proposition est idempotente. Le test concurrent exécute deux transactions réellement simultanées et constate une seule insertion des séances attendues.

## Tests exécutés et résultat calculé

- **49 tests backend** réussis, sans échec ni test supprimé : 20 tests existants, 18 tests du modèle/validateur, 9 tests HTTP/JPA d’intégration, un test de migration et un test d’acceptation concurrente avec commits réels.
- **12 tests métier frontend** réussis.
- `npm run lint` et `npm run build` réussis.
- **21 contrôles navigateur** réussis, dont qualification, besoin, confirmation de retrait, chargement, proposition, rejet, conflit 409, acceptation, vues groupes/enseignants, saisie de filière, impossibilité et adaptation mobile.
- Inspecteur visuel : **0 échec, 0 avertissement** aux largeurs 1440, 768 et 390 px. Rendu examiné sur captures ordinateur et mobile.

Les tests navigateur interceptent le transport HTTP pour vérifier les interactions de l’interface. Leurs affectations de démonstration proviennent de la sortie réellement calculée en Java. Les autorisations et la persistance réelles sont vérifiées séparément par les tests Spring/H2, y compris les commits concurrents. Ces deux niveaux ne sont pas présentés comme un démarrage MySQL réel.

Jeu fictif réutilisable : 2 campus, 6 salles, 5 enseignants dont 2 vacataires, 3 groupes, 6 modules et 18 séances. La dernière sortie exportée prouve `OPTIMAL`, 18/18 nouvelles séances affectées, objectif 0 et meilleure borne 0. Le temps de cet exemple est enregistré dans le JSON ; il dépend de la machine et inclut la préparation native lors du premier appel.

- [Entrées du jeu fictif](../examples/solver/input-fixture.json).
- [Résultat réellement calculé](../examples/solver/calculated-fixture.json).
- [Planning calculé en CSV](../examples/solver/calculated-timetable.csv).

La fixture Java est dans `TimetableSolverFixture`. Elle est chargée en H2 isolée par les tests d’intégration ; aucun seed automatique de ces données n’est ajouté à l’application.

## Lancer et vérifier

Depuis la racine, avec une base MySQL **de développement dédiée** :

```powershell
.\scripts\start-backend-local.ps1
```

Le script demande le mot de passe MySQL dans le terminal. Arrêter d’abord une ancienne instance : les nouvelles routes et entités nécessitent un redémarrage. Flyway applique la migration additive V4 au démarrage.

```powershell
# Autre terminal
cd frontend
npm.cmd ci
npm.cmd run dev
```

Dans l’interface : se connecter comme responsable planning, ouvrir les ressources, ajouter les filières/salles/enseignants/groupes/modules nécessaires, puis ouvrir **Séances et vérification**. Déclarer les qualifications et disponibilités, ajouter les besoins hebdomadaires, cliquer **Planifier**, examiner les grilles et accepter ou rejeter.

```powershell
# Dans backend-spring/, avec JAVA_HOME sur le JDK 21
mvn.cmd "-Dmaven.repo.local=$env:USERPROFILE\.m2\repository" test

# Uniquement les nouveaux tests et l’exemple calculé
mvn.cmd "-Dmaven.repo.local=$env:USERPROFILE\.m2\repository" "-Dtest=CpSatTimetableSolverTest,TimetableSolverIntegrationTest,TimetableMigrationTest,TimetableConcurrentApprovalTest" test
```

Les tests produisent l’exemple sous `backend-spring/target/solver/`. La copie sous `docs/examples/solver/` est une sortie de la session, pas une donnée de production.

```powershell
# Dans frontend/
npm.cmd run lint
npm.cmd run test:planning
npm.cmd run build
```

## Limites explicites

- Le planning demeure une semaine type, comme les entités actuelles. Pas encore de dates de semestre, semaines alternées ni versions académiques par période.
- Enseignant préaffecté, nouvelles séances de 90 minutes, besoins saisis par élément de module. Pas d’attribution automatique des enseignants ni de découpage inventé du volume semestriel.
- Pas de fonction de remplacement d’un planning existant. Les corrections de séances conservées restent explicites dans les outils manuels existants.
- Les autres préférences — étages, équilibrage journalier, trous enseignants — ne font pas partie de l’objectif. L’optimalité prouvée concerne uniquement les trous des groupes dans le modèle décrit.
- Pas encore de résolution asynchrone, de comparaison de scénarios ou de purge automatique des propositions expirées. Une grande instance pourra nécessiter ces évolutions.
- Les horaires libres de salles en texte ne constituent pas un calendrier de fermeture structuré. La disponibilité booléenne et le calendrier commun sont exploités.
- Les écrans manuels historiques conservent leurs règles antérieures ; le nouveau validateur peut refuser une séance historique hors calendrier ou sans qualification. Il ne la supprime pas pour rendre le problème artificiellement résoluble.
- Démarrage sur MySQL et état réel de son historique Flyway non vérifiés dans cette session, conformément à l’isolement des tests. La V3 de démonstration avait été déplacée lors de l’intégration précédente : si une base l’a déjà appliquée, il faut examiner son historique et retrouver la migration d’origine avant déploiement ; aucun `repair` ni contournement de validation n’a été exécuté ici.
- PostgreSQL/conteneurs et déploiement de production non vérifiés. Cette migration vise le chemin MySQL demandé.
- Le solveur historique reste disponible pour compatibilité avec le travail existant. Les résultats décrits ici concernent la nouvelle route globale, utilisée par le bouton Planifier.

## Fichiers créés ou modifiés

La liste ci-dessous décrit uniquement cette mission ; les caches, captures et scripts temporaires de contrôle restent sous `.integration/` et ne sont pas destinés à être versionnés.

### Inventaire des changements

- Ajout : `backend-spring/src/main/java/ma/emsi/academic/controller/TimetableSolverController.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/controller/TimetableSolverExceptionHandler.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/domain/solver/TeacherQualification.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/domain/solver/TeachingRequirement.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/domain/solver/TimetableProposal.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/dto/planning/TimetableSolveResult.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/repository/TeacherQualificationRepository.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/repository/TeachingRequirementRepository.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/repository/TimetableProposalRepository.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/solver/global/CpSatTimetableSolver.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/solver/global/TimetableCalendar.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/solver/global/TimetableConflictException.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/solver/global/TimetableProblem.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/solver/global/TimetableProblemBuilder.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/solver/global/TimetableProposalService.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/solver/global/TimetableRequirementService.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/solver/global/TimetableSolutionValidator.java`
- Ajout : `backend-spring/src/main/java/ma/emsi/academic/service/solver/global/TimetableSolverService.java`
- Ajout : `backend-spring/src/main/resources/db/migration/mysql/V4__planning_solver_proposals.sql`
- Ajout : `backend-spring/src/test/java/ma/emsi/academic/service/solver/global/CpSatTimetableSolverTest.java`
- Ajout : `backend-spring/src/test/java/ma/emsi/academic/service/solver/global/TimetableConcurrentApprovalTest.java`
- Ajout : `backend-spring/src/test/java/ma/emsi/academic/service/solver/global/TimetableMigrationTest.java`
- Ajout : `backend-spring/src/test/java/ma/emsi/academic/service/solver/global/TimetableSolverFixture.java`
- Ajout : `backend-spring/src/test/java/ma/emsi/academic/service/solver/global/TimetableSolverIntegrationTest.java`
- Ajout : `docs/analysis/solveur-cpsat-2026-11-11.md`
- Ajout : `docs/architecture/03-architecture-decisions/ADR-007-global-cpsat-java-proposals.md`
- Ajout : `docs/examples/solver/calculated-fixture.json`
- Ajout : `docs/examples/solver/calculated-timetable.csv`
- Ajout : `docs/examples/solver/input-fixture.json`
- Ajout : `frontend/src/components/timetable/CreateFiliereButton.tsx`
- Ajout : `frontend/src/components/timetable/SolverPanel.tsx`
- Ajout : `frontend/src/types/solver.ts`
- Modification : `README.md`
- Modification : `frontend/src/app/globals.css`
- Modification : `frontend/src/app/timetable/constraints/page.tsx`
- Modification : `frontend/src/app/timetable/resources/page.tsx`
- Modification : `frontend/src/components/timetable/ScheduleGrid.tsx`
- Modification : `frontend/src/components/timetable/TimetableShell.tsx`
- Modification : `frontend/src/context/TimetableContext.tsx`
- Modification : `frontend/src/types/timetable.ts`
