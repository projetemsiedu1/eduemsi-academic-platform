# Réorganisation des parcours Responsable planning

Date : 11 novembre 2026. Branche de travail : `feat/solveur-cpsat`. Aucun push ou merge pour ce chantier.

## Résultat et périmètre

Les parcours filières, groupes, modules, enseignants, salles et planification ont été examinés puis corrigés dans les dossiers principaux. L’accueil présente désormais les étapes de préparation. Les ressources sont organisées en six catégories accessibles directement et les actions de création restent visibles.

Le problème des groupes a été précisé par l’utilisateur : il ne trouvait pas de bouton de création. Le code contenait une action conditionnelle uniquement dans l’ancien onglet Groupes ; la page de consultation des emplois du temps des groupes ne donnait pas d’accès direct à cette gestion. Cette confusion a été corrigée et la création complète a été testée.

**Important : les séances réelles de l’utilisateur n’ont pas été effacées pendant cette session.** L’accès automatisé à sa session navigateur a échoué à l’initialisation de l’outil. Le mécanisme d’effacement est implémenté et testé sur H2 isolée ainsi que dans le parcours d’interface avec transport simulé ; il reste à exécuter dans une session authentifiée après redémarrage du backend à jour. Aucun mot de passe n’a été demandé dans le chat ni recherché dans le navigateur.

## 1. Filières

**Constat vérifié :** l’écran proposait un bouton d’ajout mais aucune véritable catégorie permettant de retrouver, modifier et gérer les filières. Leur intitulé pouvait aussi contenir une année, alors que l’année d’étude est une propriété distincte du groupe.

**Corrections :** catégorie Filières, recherche, affichage du code et de l’intitulé, compte des groupes et modules rattachés, liens vers ces listes filtrées, création et modification dans le même formulaire. Aucune filière existante n’est renommée automatiquement : l’utilisateur peut corriger son intitulé sans changer son identifiant ni casser les rattachements.

**Protection :** la suppression d’une filière contenant des modules est maintenant refusée explicitement, même si elle n’a pas de groupes. Cela évite une suppression en cascade du contenu pédagogique. Le refus pour les groupes rattachés reste conservé.

## 2. Groupes

**Constat vérifié :** création difficile à découvrir et possibilité de conserver un filtre d’une catégorie précédente, ce qui donnait l’impression qu’un groupe créé était absent.

**Corrections :** bouton Créer un groupe visible dans les ressources, catégorie Groupes accessible sans défilement horizontal des onglets, lien de gestion depuis la page des emplois du temps. Après enregistrement, la liste des groupes est affichée avec les filtres effacés. Les champs portent des noms explicites : code, filière, année d’étude, effectif et campus fixe.

**Organisation :** filtres filière/campus/année, recherche et tri numérique des codes. Sur mobile, les groupes deviennent des fiches lisibles, avec leurs actions Modifier et Supprimer ; les filtres se déplient à la demande.

**Validation backend :** création, mise à jour, contrôle des années 1–5, limite d’effectif cohérente avec le formulaire et détection des codes déjà utilisés sans tenir compte de la casse. Le groupe apparaît dans le workspace après création. Un groupe utilisé par des étudiants, séances ou besoins ne peut pas être supprimé ; un changement de filière est refusé si des besoins pédagogiques doivent être réaffectés d’abord.

## 3. Enseignants

**Corrections :** liste alphabétique, recherche par nom/matricule/spécialité, filtres de contrat et d’état actif, affichage de la charge contractuelle et des disponibilités. Les modules qualifiés proviennent désormais du référentiel de qualifications au lieu d’une liste toujours vide dans le workspace.

Le formulaire permet de créer et modifier le profil ainsi que son statut actif. Les disponibilités des vacataires sont ouvertes et expliquées. Les créneaux fermés dans le calendrier du solveur ne peuvent plus être sélectionnés par erreur ; une ancienne sélection fermée reste décochable.

**Protection :** supprimer un enseignant encore utilisé par des séances, besoins ou qualifications est refusé avec un message précis. Désactiver son profil ne supprime aucune donnée académique.

## 4. Salles, modules et campus

**Salles :** liste dédiée, campus et équipement visibles, capacité et nombre de postes distincts, état disponible/indisponible filtrable. Création et modification réutilisent les API existantes.

**Modules :** liste par filière, code/intitulé, semestre, volume semestriel et éléments pédagogiques avec le type de salle requis. La création d’un module avec son premier élément reste transactionnelle. Le volume semestriel n’est pas présenté comme un nombre automatique de séances hebdomadaires.

**Campus :** consultation des campus configurés, adresses et ressources rattachées. Ce chantier n’ajoute pas un CRUD de campus qui n’existait pas dans le module. Si aucun campus n’est configuré, le prérequis de création d’une salle ou d’un groupe est affiché explicitement.

## 5. Préparation et génération du planning

L’accueil présente six étapes : filières, groupes, modules, enseignants, salles, puis planification. Les compteurs proviennent des données disponibles, sans pourcentage de préparation inventé.

L’écran Planifier les cours distingue :

1. Les qualifications enseignant/module.
2. Les besoins hebdomadaires de chaque groupe.
3. La génération, l’examen et l’acceptation de la proposition.

Les éléments sont filtrés par filière du groupe. L’enseignant préaffecté est limité aux enseignants actifs réellement qualifiés pour le module choisi. Si aucun profil ne convient, le besoin ne peut pas être envoyé et l’interface renvoie vers l’étape de qualification.

Le placement manuel est conservé mais placé dans une section facultative repliable, pour ne pas être confondu avec la saisie des besoins du solveur. Les séances enregistrées et leurs contrôles restent visibles séparément. Le moteur CP-SAT global existant et les limites décrites dans le [rapport du solveur](solveur-cpsat-2026-11-11.md) restent applicables.

## 6. Remise à zéro des séances

Nouvelle route protégée : `POST /api/v1/planning/reset`, pour responsable planning et super administrateur. Le corps contient la liste des identifiants de séances affichées et la confirmation exacte `VIDER`.

Le serveur verrouille les propositions et ressources dans un ordre cohérent avec l’acceptation du solveur. Il vérifie la liste courante, refuse les séances contenant des absences, puis écrit une sauvegarde JSON du workspace avant suppression. Un échec de sauvegarde arrête toute l’opération. La suppression des séances et le rejet des propositions en attente se déroulent dans une seule transaction.

Les filières, groupes, enseignants, salles, modules, qualifications et besoins sont conservés. Une nouvelle planification peut ensuite être calculée à partir des mêmes besoins.

Le dossier par défaut est `.planning-backups/` dans le répertoire de travail du backend — normalement `backend-spring/.planning-backups/` avec le script de lancement. Il est exclu de Git et n’est pas une route publique. Il peut être configuré par `univora.planning-backup-directory`. Cette archive ne remplace pas une sauvegarde complète de la base.

Dans l’interface : Planifier les cours → Séances enregistrées → Vider le planning. Le dialogue annonce le nombre de séances, explique la portée globale et exige `VIDER`. Une route absente sur un backend ancien affiche un message demandant son redémarrage, sans annoncer une suppression.

## 7. Vérifications exécutées

- **56 tests backend réussis**, dont les tests du solveur existants et sept nouveaux tests d’intégration couvrant les ressources et la remise à zéro. Les protections des données liées sont également vérifiées.
- **12 contrôles métier frontend réussis**.
- **35 contrôles navigateur réussis** : visibilité de la création, enregistrement/modification des groupes, filières et enseignants, recherche prénom/nom dans les deux ordres, filtres, disponibilités, salles/modules, qualification et besoin cohérents, confirmation, refus pour absences, backend ancien, remise à zéro et conservation du référentiel, affichage mobile des six catégories.
- **Lint et build frontend réussis**.
- Inspecteur visuel des catégories Groupes et Filières : **aucun échec ni avertissement**, à 1440, 768 et 390 px ; pas de débordement horizontal ni d’exception JavaScript. Captures ordinateur et mobile examinées.

Les scénarios navigateur interceptent le transport HTTP et utilisent des données fictives pour vérifier les interactions. La persistance, les autorisations et la sauvegarde transactionnelle sont testées séparément avec Spring/JPA sur H2. Cela ne prouve pas un démarrage sur le MySQL réel de l’utilisateur.

Un premier test a révélé que le statut actif n’était pas retourné dans le DTO enseignant. Le DTO et son mapping ont été corrigés, puis la suite complète a été relancée. Aucun test n’a été supprimé pour obtenir un résultat vert.

Les résultats et captures de travail se trouvent dans `.integration/organisation-*`, exclus de Git. Une copie des sources concernées avant refonte est conservée dans `.integration/before-organisation/`.

## 8. Mise en service locale

Arrêter l’ancienne instance backend dans son terminal puis, depuis la racine :

```powershell
.\scripts\start-backend-local.ps1
```

Saisir le mot de passe MySQL dans l’invite masquée. Dans un autre terminal si le frontend n’est pas déjà lancé :

```powershell
npm.cmd run dev --prefix frontend
```

Recharger la page après démarrage. Accès directs :

- `/timetable/resources?section=filieres`
- `/timetable/resources?section=groupes`
- `/timetable/resources?section=enseignants`
- `/timetable/resources?section=salles`
- `/timetable/resources?section=modules`
- `/timetable/constraints`

Les anciens plannings réels restent présents tant que l’action Vider le planning n’a pas été exécutée avec succès depuis une session autorisée. Les libellés existants des filières et profils sont conservés ; aucune correction sémantique n’a été devinée à la place de l’équipe.

## 9. Fichiers principaux

- `PlanningResources.tsx` : annuaire par catégorie, filtres, listes adaptatives et actions.
- `ResourceModal.tsx`, `CreateFiliereButton.tsx` : formulaires de groupe, enseignant, salle, module et filière.
- `PlanningSetupGuide.tsx`, `PlanningOverview.tsx` : parcours de préparation.
- `PlanningGroups.tsx`, `PlanningTeachers.tsx`, `TimetableSidebar.tsx` : accès explicites à la gestion et à la planification.
- `SolverPanel.tsx`, `PlanningConstraints.tsx` : qualifications, besoins et placement manuel distingués.
- `ResetPlanningButton.tsx` : remise à zéro explicite et retours d’erreur.
- `globals.css`, `app/timetable/resources/page.tsx` : responsive et frontière Suspense pour les filtres d’URL, avec `instant = false` conservé.
- `PlanningResetController.java`, `PlanningResetService.java` : sauvegarde et suppression transactionnelle.
- `PlanningService.java` : qualifications réelles dans le workspace.
- `GroupeServiceImpl.java`, `FiliereServiceImpl.java`, `EnseignantServiceImpl.java` et repositories associés : cohérence et protection des ressources liées.
- DTO groupe/enseignant, `PlanningIntegrationTest.java`, `.gitignore`, README et documentation.

Ce chantier améliore le module Responsable planning. Les autres modules du cahier des charges, notamment les PFE encore en mémoire, n’ont pas été transformés en un ERP entièrement déployable en production par cette intervention.
