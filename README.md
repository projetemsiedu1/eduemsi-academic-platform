# EMSI Univora

Plateforme académique EMSI : connexion, ressources pédagogiques, planification et suivi des absences. Cette copie intègre le module **Responsable planning** dans les dossiers principaux, avec une interface Next.js et une API Spring Boot.

## Organisation

- `frontend/` : Next.js 16, React 19, TypeScript, Tailwind CSS 4.
- `backend-spring/` : Java cible 21, Spring Boot 3.3.4, JPA, Flyway, sécurité JWT et OR-Tools.
- `scripts/` : scripts de développement et contrôle des API.
- `docs/` : documentation et rapports, dont [le rapport d’intégration](docs/analysis/integration-planning-2026-11-11.md).
- `frontend1/`, `backend-spring1/`, `scripts1/` : sources reçues du collaborateur, conservées pour référence. Elles ne sont pas les dossiers à lancer.

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

La proposition automatique appelle le solveur du backend et reste un aperçu non enregistré. Les horaires par groupe et enseignant, les volumes, l’occupation des salles et les anomalies sont calculés depuis les données affichées. Une absence de conflit ne prouve pas l’optimalité d’un planning.

## Docker local

La configuration Compose a été alignée sur MySQL, Spring Boot 8085 et Next.js 3000. Compléter les secrets dans un `.env` non versionné à partir du `.env.example` racine, puis :

```powershell
docker compose up -d --build
```

Docker n’a pas été exécuté dans cette session : ce chemin reste à valider sur une machine équipée. Il s’agit d’une configuration locale, pas d’une certification de déploiement en production. Le profil PostgreSQL historique n’est pas le chemin de lancement retenu.

## Périmètre restant

L’ERP complet du cahier des charges n’est pas entièrement implémenté. Les PFE du contrôleur existant utilisent encore un stockage mémoire. Les paiements, délibérations et autres modules documentaires ne sont pas livrés par cette intégration. Aucun compte Jira, service IA distant ou environnement de production n’a été modifié.
