# ADR-007 : Solveur CP-SAT global en Java et validation des propositions

## Statut

ACCEPTÉ pour l’implémentation du prototype demandé le 11 novembre 2026. Cette décision précise et remplace, pour ce chemin d’exécution, le choix Python/FastAPI de l’ADR-002. Les documents historiques restent conservés.

## Contexte et problématique

Le backend Spring Boot possède déjà OR-Tools Java 9.8 et les entités académiques. Le responsable doit générer un planning global depuis la base, partager les ressources entre groupes et examiner le résultat avant toute écriture de séances. Les besoins hebdomadaires et qualifications explicites manquent au modèle existant.

## Options évaluées

- Étendre uniquement le payload du solveur historique : conserve les données arbitraires fournies par le navigateur et ne constitue pas une génération depuis MySQL.
- Introduire Python/FastAPI : ajoute un service, un contrat réseau et un déploiement alors que le chargement natif Java fonctionne sur l’environnement testé.
- Ajouter un module Java isolé dans le monolithe : réutilise les dépendances, transactions, autorisations et repositories existants ; exige de borner le calcul synchrone.

## Décision retenue

Le module `service/solver/global/` construit un problème immuable depuis JPA, libère la transaction de lecture puis lance un modèle CP-SAT global. Le contrôleur appelle l’orchestrateur ; ni le modèle ni le validateur indépendant n’accèdent à JPA.

Les besoins et qualifications sont des tables additives. Les séances existantes restent fixes et comptent dans les besoins. L’enseignant reste préaffecté ; aucune charge hebdomadaire n’est inventée à partir des heures semestrielles.

Le modèle minimise exclusivement les trous des groupes. Les contraintes dures restent obligatoires. Le campus fixe du groupe est conservé ; un enseignant ne peut changer de campus dans la journée, conformément à la mission actuelle. Cette règle est plus stricte qu’un délai de transit de 45 minutes.

La solution vérifiée devient une proposition persistée, appartenant à son auteur et expirant après 30 minutes. L’acceptation verrouille les ressources, compare une empreinte et revalide dans une transaction avant d’ajouter les séances. L’acceptation est idempotente ; deux approbations concurrentes ne doivent pas dupliquer les séances.

## Conséquences et compromis

- Pas de nouveau microservice ou de dépendance applicative supplémentaire.
- Java 21, chargement natif, 18 séances calculées et approbations concurrentes vérifiés par les tests.
- Temps de recherche configurable, plafonné à 30 secondes, une résolution simultanée par instance ; pas de verrou SQL conservé pendant la recherche.
- Un statut CP-SAT réel est retourné, avec objectif et borne lorsqu’une solution existe. Aucun fallback ne transforme un échec en succès apparent.
- Les jours/créneaux/pauses sont exposés par une définition de calendrier partagée avec Next.js ; les identifiants historiques de créneaux sont conservés.
- La migration ajoute trois tables sans modifier les séances existantes. Le déploiement MySQL et l’historique Flyway de chaque base restent à contrôler séparément.
- Un traitement asynchrone, une politique de rétention des propositions et un véritable versionnement des semaines seront nécessaires pour un usage plus large.

Voir le [rapport d’implémentation](../../analysis/solveur-cpsat-2026-11-11.md) pour les règles, tests, endpoints et limites.
