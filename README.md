# EMSI Univora

Plateforme académique EMSI : connexion, ressources pédagogiques, planification et suivi des absences. Cette copie intègre le module **Responsable planning** dans les dossiers principaux, avec une interface Next.js et une API Spring Boot.

## Organisation

- `frontend/` : Next.js 16, React 19, TypeScript, Tailwind CSS 4.
- `backend-spring/` : Java cible 21, Spring Boot 3.3.4, JPA, Flyway, sécurité JWT et OR-Tools.
- `scripts/` : scripts de développement et contrôle des API.
- `docs/` : documentation et rapports, dont [le rapport d’intégration](docs/analysis/integration-planning-2026-11-11.md).
- Les anciennes copies `frontend1/`, `backend-spring1/` et `scripts1/` ont été retirées après intégration. Leur version antérieure reste disponible dans l’historique Git ; utilisez les dossiers principaux ci-dessus.

## Lancer en développement sous Windows

Prérequis : JDK 21, Maven, Node.js et MySQL 8. Le terminal doit sélectionner le JDK compatible (`java -version` et `mvn -version`).

Lancement assisté depuis la racine (mot de passe MySQL saisi de façon masquée, sans fichier à modifier) :

```powershell
.\scripts\start-backend-local.ps1
# Autre compte : .\scripts\start-backend-local.ps1 -DatabaseUser mon_utilisateur
```

Le script utilise `JAVA_HOME` ou détecte le JDK 21 Eclipse Adoptium installé. Il démarre toujours `backend-spring/`. Une ancienne instance doit être arrêtée avant de lancer la nouvelle. Si `/api/v1/planning/workspace` renvoie 404 après une mise à jour, redémarrer le backend : Spring Boot ne recharge pas automatiquement les nouvelles routes.

Premier terminal, depuis la racine :

```powershell
$env:SPRING_PROFILES_ACTIVE = 'local'
$env:SPRING_DATASOURCE_USERNAME = '<utilisateur MySQL>'
$env:SPRING_DATASOURCE_PASSWORD = '<mot de passe MySQL>'
cd backend-spring
mvn.cmd "-Dmaven.repo.local=$env:USERPROFILE\.m2\repository" spring-boot:run
```

Le profil local utilise `emsi_academic_db` sur `localhost:3306`. Il applique les migrations MySQL ; utilisez une base de développement dédiée. Les comptes de démonstration historiques ne sont initialisés que sur une base utilisateurs vide et dans les profils `local`, `dev` ou `test`. Consultez `AuthServiceImpl.seedDefaultUsersIfEmpty` pour les comptes de votre copie ; changez leurs mots de passe avant toute exposition réseau.

Deuxième terminal :

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

- Connexion : http://localhost:3000/login (ou le port annoncé).
- Espace planning : `/timetable`, pour `ROLE_RESPONSABLE_PLANNING` et `ROLE_SUPER_ADMIN`.
- API : http://localhost:8085/api/v1.
- Swagger : http://localhost:8085/swagger-ui.html.
- Configuration frontend : `frontend/.env.example`, à recopier dans `.env.local` si nécessaire.

Un responsable planning est redirigé vers son module après connexion. Un administrateur y accède depuis son espace. L’inscription publique crée uniquement des étudiants ; elle n’accorde pas de privilèges administratifs.

## Vérifier

```powershell
cd frontend
npm.cmd run lint
npm.cmd run test:planning
npm.cmd run build
```

Dans `backend-spring/` :

```powershell
mvn.cmd "-Dmaven.repo.local=$env:USERPROFILE\.m2\repository" clean test
```

Les tests d’intégration utilisent H2 en mémoire, sans modifier MySQL. Le script `scripts/test_all_apis.ps1` vérifie les lectures sur un backend lancé, avec les identifiants fournis au moment de son exécution.

## Données réelles et démonstration

Le module charge ses ressources depuis `/api/v1/planning/workspace`. Les créations, modifications et suppressions passent par les API. Le bouton « Explorer la démonstration » utilise des données fictives temporaires et n’écrit pas sur le serveur.

Le bouton **Planifier** dans `/timetable/constraints` appelle le solveur global OR-Tools CP-SAT à partir des besoins et qualifications enregistrés. La proposition reste un aperçu jusqu’à **Accepter et enregistrer** ; cette acceptation ajoute les séances dans une transaction après une nouvelle vérification. Les séances existantes sont conservées. L’optimalité n’est affichée que si CP-SAT l’a prouvée pour son objectif de réduction des trous.

Renseigner les salles et filières ne suffit pas : chaque besoin précise un groupe, un élément de module, un enseignant qualifié et le nombre de séances hebdomadaires. Les disponibilités des vacataires sont obligatoires. Les **Ressources académiques** séparent Filières, Groupes, Modules, Enseignants, Salles et Campus ; le bouton **Créer un groupe** reste visible et les filières disposent d’une liste avec création/modification.

Pour repartir d’un planning vide : **Planifier les cours → Séances enregistrées → Vider le planning**, puis saisir `VIDER`. La route `/api/v1/planning/reset` doit être disponible sur le backend à jour. Une sauvegarde locale est créée avant la suppression transactionnelle ; ressources, qualifications et besoins sont conservés. Si une séance contient des absences, toute la remise à zéro est refusée. Les archives sont dans `backend-spring/.planning-backups/` avec le script de lancement et sont exclues de Git.

Voir le [rapport de réorganisation](docs/analysis/reorganisation-planning-2026-11-11.md) pour l’audit tâche par tâche, les vérifications et les limites. Cette opération n’est jamais exécutée automatiquement au démarrage.

Voir le [rapport du solveur](docs/analysis/solveur-cpsat-2026-11-11.md) pour les contraintes, le calendrier configurable, les endpoints, les tests et un planning fictif réellement calculé. La migration V4 ajoute uniquement les tables du solveur ; elle n’injecte pas ce jeu fictif dans MySQL. Le calendrier affiché est une démonstration à confirmer avec l’établissement.

## Docker local

La configuration Compose a été alignée sur MySQL, Spring Boot 8085 et Next.js 3000. Compléter les secrets dans un `.env` non versionné à partir du `.env.example` racine, puis :

```powershell
docker compose up -d --build
```

Docker n’a pas été exécuté dans cette session : ce chemin reste à valider sur une machine équipée. Il s’agit d’une configuration locale, pas d’une certification de déploiement en production. Le profil PostgreSQL historique n’est pas le chemin de lancement retenu.

## Périmètre restant

L’ERP complet du cahier des charges n’est pas entièrement implémenté. Les PFE du contrôleur existant utilisent encore un stockage mémoire. Les paiements, délibérations et autres modules documentaires ne sont pas livrés par cette intégration. Aucun compte Jira, service IA distant ou environnement de production n’a été modifié.
