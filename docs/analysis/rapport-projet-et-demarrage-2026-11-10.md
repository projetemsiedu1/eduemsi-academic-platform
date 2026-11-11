# Rapport d’analyse du projet EMSI Univora et guide de lancement

Date : 10 novembre 2026. Analyse du dépôt local fourni, sous Windows.

## 1. Ce qu’est ce projet

**EMSI Univora / EMSI Campus ERP est un projet de plateforme de gestion académique pour l’EMSI.** Il vise à centraliser les emplois du temps, les salles, les groupes, les enseignants, les absences et les projets de fin d’études (PFE). Il comprend un moteur de planification sous contraintes et une assistance au choix des jurys par intelligence artificielle.

Le cahier des charges décrit un ERP plus large : suivi pédagogique, notes et délibérations, stages et soutenances, matériel, paiements et ressources humaines. Le code présent couvre seulement une partie de cette ambition.

**État constaté : prototype applicatif en cours de construction, avec un backend métier, un frontend Next.js minimal, des démonstrations HTML et une documentation très développée. Le dépôt n’est pas actuellement prêt pour un lancement complet en une commande.**

Ce rapport distingue :

- **VERIFIED** : directement constaté dans les sources ou les commandes exécutées.
- **INFERRED** : conséquence probable du code, sans validation par un démarrage complet.
- **UNKNOWN** : information ou fonctionnement non vérifié.
- **PROPOSED** : correction ou procédure proposée.

## 2. Organisation du dépôt

- `backend-spring/` : application Java Spring Boot, API REST, sécurité, entités JPA, migrations SQL et tests.
- `frontend/` : application Next.js / React / TypeScript et client HTTP vers le backend.
- `docs/` : cahiers des charges, exigences, architecture, modèle de données, diagrammes UML, spécifications UI/UX et anciens rapports qualité.
- `assets/` : logo, captures de prototypes et diagrammes exportés.
- `scripts/` : outils de génération de documents et de tableaux de bord, automatisations Jira.
- Fichiers HTML à la racine : maquettes et démonstrations, notamment `maquette_interactive_emsi_campus.html` et `demo-ia-pfe-crud.html`.
- `docker-compose.yml` : configuration de déploiement devenue incohérente avec l’arborescence actuelle.
- `.agents/skills/` : consignes et méthodes de travail pour les agents ; ce dossier ne fait pas partie du logiciel exécuté.

Le dossier `backend-spring/target/` contient des artefacts compilés. Leur présence ne prouve pas que la version actuelle démarre ou que ses tests passent.

## 3. Technologies réellement présentes

### Backend — VERIFIED

Source : `backend-spring/pom.xml`.

- Java cible **21**.
- Spring Boot **3.3.4**.
- Maven pour compiler et exécuter.
- Spring MVC pour les API, Spring Data JPA / Hibernate pour la persistance.
- Spring Security, JWT avec JJWT **0.12.6**, BCrypt pour les mots de passe.
- MySQL pour les profils `local` et `dev`.
- PostgreSQL prévu pour le profil `prod`.
- Flyway pour les migrations.
- Google OR-Tools **9.8.3296** pour la planification.
- Apache POI **5.2.5** pour l’import Excel des salles.
- Springdoc OpenAPI **2.6.0** pour Swagger.
- WebClient pour les appels aux modèles IA par OpenRouter.
- H2 dans les dépendances de test uniquement.

### Frontend — VERIFIED

Sources : `frontend/package.json`, `frontend/src/app/`, `frontend/src/lib/api-client.ts`.

- Next.js **16.4.6**, React / React DOM **19.3.0**, versions déclarées dans le dépôt.
- TypeScript **5**, Tailwind CSS **4.3.3**, ESLint **9**.
- App Router de Next.js.
- Scripts disponibles : `dev`, `build`, `start`, `lint`.

Ces versions sont celles des fichiers fournis. Leur téléchargement et leur compatibilité effective n’ont pas été validés par une installation et une compilation du frontend.

**Le frontend présent n’est pas Angular.** Le dossier `frontend-angular/` annoncé par le README n’existe pas.

## 4. Fonctionnalités et niveau d’implémentation

### Authentification et utilisateurs

**VERIFIED :** connexion, inscription, consultation du profil connecté, changement de mot de passe et initialisation de comptes de démonstration existent côté API.

Sources : `controller/AuthController.java`, `service/impl/AuthServiceImpl.java`, `security/` sous `backend-spring/src/main/java/ma/emsi/academic/`.

Huit rôles sont définis dans `domain/enums/RoleEnum.java` : super administrateur, responsables de filière, planning, PFE et scolarité, professeur permanent, professeur vacataire et étudiant.

La présence de ces rôles ne prouve pas une application complète des permissions métier. Voir les réserves de la section 8.

### Référentiel pédagogique et salles

**VERIFIED :** API de consultation des enseignants et filières ; consultation, création et suppression des groupes, modification de leur effectif ; gestion des salles avec création, modification, suppression, filtres et import Excel.

Sources : contrôleurs `EnseignantController`, `FiliereController`, `GroupeController`, `SalleController` et services correspondants.

### Absences

**VERIFIED :** consultation des absences, consultation par étudiant, enregistrement d’une absence et calcul d’alertes.

**Limites constatées :** `AbsenceServiceImpl` fixe une absence à 2 heures et calcule le pourcentage sur une base constante de 90 heures. Le calcul d’alerte additionne les absences de l’étudiant sans filtrage explicite des seules absences injustifiées ni regroupement par module. La règle métier décrite par le README n’est donc pas entièrement traduite dans ce calcul.

### Emplois du temps

**VERIFIED :** `OrToolsTimetableSolver` utilise OR-Tools CP-SAT si ses bibliothèques natives sont disponibles, puis un algorithme local de secours si nécessaire.

Le code traite les collisions de salle, professeur et groupe, les créneaux rigides des vacataires, le campus autorisé, les capacités et les types de salles / postes informatiques. Le contrôleur expose notamment `/api/v1/planning/generate`, `/generer` et `/solve`.

**Limites constatées :** l’algorithme de secours place les cours successivement et peut retourner un résultat partiel. Les champs `garantiePause15m` et `respectTrouMax1h30` y sont affectés à `true` sans démontrer un contrôle général de ces deux règles. Les indications « optimal » ou « sans conflit » doivent être évaluées sur des cas métier, pas reprises comme des garanties absolues.

### PFE, jurys et IA

**VERIFIED :** `PfeAiController` fournit un CRUD de PFE et des routes de matching de jury. `OpenRouterAiService` prévoit un modèle principal, un modèle de secours et un fallback heuristique local. `GeminiAiServiceClient` délègue à ce service OpenRouter : son nom ne signifie pas qu’un client direct de l’API Google Gemini est utilisé.

**Limites constatées :** le CRUD du contrôleur stocke les PFE dans une `ConcurrentHashMap` en mémoire. Les créations et modifications de ce chemin sont perdues au redémarrage, même si des entités et repositories PFE existent ailleurs. La liste des enseignants utilisée par ce contrôleur est codée en dur.

Les déficits RH retournés par `/api/v1/pfe/rh/deficits` sont aussi codés en dur. Une route d’analyse de texte de CV est présente ; cela ne constitue pas un module RH complet.

### Interface utilisateur

**VERIFIED :** `frontend/src/app/page.tsx` est une page d’accueil technique avec un lien Swagger et un lien vers `/api/health`. Le client HTTP sait stocker un JWT et appeler l’API, mais cette page ne réalise pas de parcours métier connecté.

**Absents du frontend Next.js inspecté :** écrans de connexion, gestion des salles et groupes, grille de planning, suivi des absences et interface PFE complète.

Les maquettes HTML sont des artefacts distincts du frontend Next.js. Leurs écrans et simulations ne prouvent pas l’intégration des fonctions dans l’application.

### Périmètre documentaire plus large

**UNKNOWN / non retrouvé dans le code applicatif inspecté :** module complet de paiements, délibérations, gestion des pannes, application Flutter, Redis, MinIO, serveur Ollama, notifications et isolation multi-tenant complète. Ces éléments apparaissent dans des documents de conception mais ne doivent pas être présentés comme opérationnels dans ce dépôt.

## 5. Architecture et données

Le backend suit une organisation en couches : contrôleurs REST → services métier → repositories JPA → base relationnelle. Les DTO séparent une partie des échanges API des entités. La sécurité intercepte les requêtes avec un filtre JWT.

Les entités JPA présentes couvrent : `Campus`, `Salle`, `Filiere`, `Groupe`, `Enseignant`, `Etudiant`, `Module`, `ElementModule`, `Seance`, `Absence`, `Utilisateur`, `PfeProject` et `PfeJury`.

Relations principales : salles et groupes associés à un campus ; groupes associés à une filière ; étudiants associés à un groupe ; séances associées à un groupe, une salle, un enseignant et un élément de module ; absences associées aux étudiants et aux séances.

Migrations MySQL présentes :

- `backend-spring/src/main/resources/db/migration/mysql/V1__init_mysql_academic_schema.sql` : schéma métier et données initiales.
- `backend-spring/src/main/resources/db/migration/mysql/V2__create_security_and_rbac_tables.sql` : utilisateurs / sécurité.

Un autre script `db/migration/V1__init_schema.sql` décrit un schéma PostgreSQL différent. Il n’est pas situé à l’emplacement attendu par le profil `prod` et plusieurs noms de tables diffèrent des entités actuelles. Le déplacer seul ne suffirait pas à certifier la compatibilité.

## 6. Configuration réelle et adresses

Sources : `backend-spring/src/main/resources/application*.yml`, `frontend/src/lib/api-client.ts`.

- Profil backend par défaut : **`local`**.
- MySQL local : **`localhost:3306`**, base **`emsi_academic_db`**.
- MySQL `dev` : base **`emsi_academic_dev`**.
- Port backend par défaut : **8085**.
- Préfixe des API métier : **`/api/v1`**.
- Swagger attendu après démarrage réussi : **http://localhost:8085/swagger-ui.html**.
- Document OpenAPI : **http://localhost:8085/v3/api-docs**.
- Frontend avec `npm run dev` : **http://localhost:3000** par défaut si ce port est libre.
- URL API du client frontend : **http://localhost:8085/api/v1**, surchargeable par **`NEXT_PUBLIC_API_URL`**.
- Statut frontend : **http://localhost:3000/api/health**.

La route `/api/health` du frontend fait une sonde HTTP vers le backend ; elle ne remplace pas une vérification métier ou un test de la base de données.

Les ports 4200 et 8080 du README appartiennent à une configuration antérieure.

## 7. Blocages du lancement

### A. Deux méthodes déclarent la même route PFE

**VERIFIED dans les sources ; blocage Spring attendu par analyse statique (INFERRED).**

Dans `backend-spring/src/main/java/ma/emsi/academic/web/controller/PfeAiController.java` :

- `matchJuryQuatreMembres`, vers la ligne 113 : `@PostMapping("/match-jury")`.
- `matcherJuryDirect`, vers la ligne 224 : `@PostMapping({"/match-jury", "/match-jury-direct"})`.

Les deux déclarent `POST /api/v1/pfe/match-jury` sans condition permettant de les différencier. Spring MVC devrait refuser l’enregistrement avec un message de type `Ambiguous mapping`.

**PROPOSED :** conserver `/match-jury` sur la première méthode et déclarer seulement `@PostMapping("/match-jury-direct")` sur la seconde. Cette correction n’a pas été appliquée pendant l’analyse.

### B. Java sélectionné par défaut trop ancien

**VERIFIED sur cette machine :** `java -version` et Maven utilisent Java **8**, alors que le projet cible Java **21**.

Des JDK 17, 23 et 25 ont aussi été trouvés. Aucun JDK 21 n’a été trouvé dans les emplacements habituels inspectés. Ce constat ne constitue pas une recherche exhaustive de tous les disques.

### C. Docker Compose obsolète

**VERIFIED :**

- Le service frontend utilise `./frontend-angular`, absent.
- Aucun Dockerfile frontend n’est fourni dans `frontend/`.
- Le mapping backend est `8080:8080`, mais le serveur configure 8085 sans surcharge `SERVER_PORT` dans Compose.
- Le profil `prod` recherche `classpath:db/migration/postgresql`, dossier absent.
- Le script PostgreSQL racine ne correspond pas entièrement au modèle JPA actuel ; `ddl-auto: validate` peut faire échouer le démarrage.
- Docker n’a pas été trouvé dans le PATH de la session inspectée.

**La commande `docker compose up -d --build` du README n’est donc pas une procédure de lancement valide en l’état.**

### D. Ancien serveur statique inadapté

`dev-frontend-server.js` sert le dossier `frontend` comme des fichiers statiques sur 4200 et attend un `index.html`, absent. Ce script n’exécute pas Next.js. Utiliser les scripts npm du dossier `frontend`.

### E. Chemins des générateurs et ports des démonstrations

`scripts/build_acadex_dashboard.js` attend `docs/prototypes-et-maquettes/`, absent dans cette copie. Certaines démonstrations HTML appellent une API sur 8080. Il faut aligner leurs URL ou exécuter le backend sur 8080 pour les tester ; elles ne sont pas automatiquement raccordées au frontend Next.js.

## 8. Réserves importantes avant un déploiement

Il s’agit de constats de lecture du code, sans pentest ni exploitation.

- **Inscription et privilèges :** `/api/v1/auth/register` est publique ; `RegisterRequest` accepte un `RoleEnum` et `AuthServiceImpl.register` reprend le rôle envoyé sans restriction explicite. Cela ouvre un risque majeur de création de comptes privilégiés. Le serveur doit imposer le rôle étudiant pour une inscription publique et réserver l’attribution des autres rôles à un administrateur autorisé.
- **Permissions métier :** la configuration exige un JWT pour les routes non publiques, mais aucune annotation `@PreAuthorize`, `@Secured` ou `@RolesAllowed` n’a été retrouvée dans les sources Java inspectées. Les contrôleurs métier examinés ne montrent pas une restriction générale par rôle. La matrice RBAC documentée reste à appliquer et à tester.
- **Secrets :** une valeur de clé OpenRouter encodée en Base64 est incluse dans le code, ainsi que dans un générateur JavaScript. Base64 est réversible. La validité de cette clé n’a pas été testée. Elle doit être retirée et remplacée si elle a été utilisée. Les valeurs sensibles ne sont pas reproduites ici.
- **Comptes de démonstration :** des identifiants et mots de passe de développement sont prédéfinis et initialisés si la table des utilisateurs est vide, sans restriction de profil visible. Ne pas exposer cette configuration telle quelle.
- **Configuration IA incohérente :** le YAML utilise `app.openrouter.*`, tandis que les injections du service attendent `openrouter.api.*`. Plusieurs propriétés YAML ne pilotent donc pas les champs visés. La variable `OPENROUTER_API_KEY` est explicitement lue ; `GEMINI_API_KEY` de Compose n’est pas utilisée par ce chemin.
- **CORS :** les origines sont largement autorisées ; les limiter aux interfaces réellement utilisées avant publication.
- **Persistance :** le CRUD PFE en mémoire doit être raccordé aux repositories avant une utilisation réelle.
- **Documentation vieillissante :** l’ancien audit `docs/analysis/01-project-audit.md` affirme l’absence de code applicatif et décrit une autre machine. Il ne reflète plus l’état de cette copie.

## 9. Comment lancer le projet sous Windows

### Option 1 — Voir les maquettes immédiatement

Depuis la racine du dépôt, dans PowerShell :

```powershell
Start-Process .\maquette_interactive_emsi_campus.html
Start-Process .\demo-ia-pfe-crud.html
```

Cela ouvre les démonstrations dans le navigateur. Certaines actions nécessitent un backend ou des ressources réseau et peuvent échouer ; ouvrir une maquette ne signifie pas que l’ERP est opérationnel.

### Option 2 — Démarrer le frontend Next.js seul

Node.js et npm sont présents sur la machine. Dans un terminal ouvert à la racine :

```powershell
cd .\frontend
npm.cmd ci
$env:NEXT_PUBLIC_API_URL = "http://localhost:8085/api/v1"
npm.cmd run dev
```

Ouvrir **http://localhost:3000**, ou l’adresse affichée par Next.js si le port est occupé. Le résultat attendu est la page d’accueil technique actuelle. Le frontend peut s’afficher sans backend ; la sonde signalera alors que celui-ci est injoignable.

L’installation nécessite l’accès au registre npm et aux versions verrouillées. Le layout utilise `next/font/google` pour les polices Geist ; leur récupération peut également nécessiter le réseau.

En cas d’erreur npm de version introuvable, conserver le message exact et vérifier les dépendances déclarées et le lockfile ensemble. Ne pas remplacer arbitrairement les versions.

### Option 3 — Démarrer le backend local avec MySQL

**Préalables :** corriger la route PFE en doublon décrite en section 7 ; utiliser Java 21 ; disposer d’un compte MySQL et de ses droits sur une base de développement dédiée. Le profil `local` applique Flyway et `ddl-auto: update` : ne pas le pointer vers une base importante existante.

**1. Choisir le JDK dans le terminal.** Exemple avec un JDK 21 installé à l’emplacement indiqué ; adapter le chemin réel :

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java -version
mvn.cmd -version
```

Les deux commandes doivent indiquer Java 21. Ces variables valent pour le terminal courant.

**2. Vérifier MySQL et fournir les paramètres locaux.** Le service `MySQL80` était en cours d’exécution lors de l’analyse ; ses identifiants n’ont pas été validés.

```powershell
Get-Service MySQL80
$env:SPRING_PROFILES_ACTIVE = "local"
$env:SPRING_DATASOURCE_USERNAME = "<utilisateur MySQL local>"
$env:SPRING_DATASOURCE_PASSWORD = "<mot de passe MySQL local>"
```

Remplacer les valeurs entre chevrons par celles de votre installation. La configuration essaie de créer `emsi_academic_db` si elle n’existe pas ; le compte doit en avoir le droit, ou la base doit être préparée par un administrateur MySQL.

**3. Exécuter les vérifications puis démarrer.** Depuis la racine, dans ce même terminal :

```powershell
cd .\backend-spring
mvn.cmd "-Dmaven.repo.local=$env:USERPROFILE\.m2\repository" test
mvn.cmd "-Dmaven.repo.local=$env:USERPROFILE\.m2\repository" spring-boot:run
```

La surcharge du cache Maven évite le chemin `C:\.m2\repository` rencontré dans cette session. Elle ne résout pas un refus d’accès à un fichier précis du cache : dans ce cas, il faut corriger les droits ou choisir un nouveau cache accessible, puis retélécharger les dépendances avec le réseau disponible.

**4. Vérifier le démarrage réussi :**

```powershell
Invoke-WebRequest http://localhost:8085/v3/api-docs
```

Puis ouvrir **http://localhost:8085/swagger-ui.html**. Les routes métier protégées nécessitent d’abord une connexion via `POST /api/v1/auth/login`, puis le JWT dans le bouton `Authorize` de Swagger. Le corps de connexion utilise `username` et `password`.

Les comptes de démonstration sont définis dans `AuthServiceImpl.seedDefaultUsersIfEmpty`. Aucun mot de passe n’est reproduit dans ce rapport. Ils ne sont créés automatiquement que si aucun utilisateur n’existe.

**5. Démarrer le frontend dans un deuxième terminal**, selon l’option 2. Garder les deux processus ouverts. `Ctrl+C` arrête chaque serveur dans son terminal.

L’IA distante nécessite une clé personnelle fournie par `OPENROUTER_API_KEY`. Le code prévoit un fallback local en cas d’échec. La disponibilité actuelle des modèles et du service distant n’a pas été vérifiée ; elle n’est pas nécessaire pour expliquer la structure du projet.

### Vérifications frontend supplémentaires

Après une installation npm réussie :

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run start
```

Exécuter ces commandes dans `frontend/`. `start` nécessite un `build` réussi et un port disponible. Aucun script de test frontend n’est défini dans le manifeste actuel.

## 10. Vérifications réellement effectuées et limites

- **VERIFIED :** inventaire des dossiers, manifestes, sources Java et TypeScript, configurations, migrations, routes et tests ; confrontation avec les principaux documents de cadrage et d’architecture. Les PDF et images n’ont pas tous été relus ou rendus individuellement.
- **VERIFIED :** 86 fichiers Java sous `src/main/java`, 6 classes de test et 11 méthodes annotées `@Test` retrouvées.
- **VERIFIED :** Node.js **24.14.1**, npm **11.0.0**, Maven **3.9.12** ; Java par défaut **1.8.0_442** ; service `MySQL80` en état `Running`.
- **VERIFIED :** première tentative `mvn -o test` avec sélection du JDK 23 bloquée par le cache Maven dirigé vers `C:\.m2\repository`.
- **VERIFIED :** nouvelle tentative avec le cache `C:\Users\pc\.m2\repository` en échec. Le diagnostic détaillé indique `java.nio.file.AccessDeniedException` sur le JAR `com/fasterxml/classmate/1.7.0/classmate-1.7.0.jar`.
- **UNKNOWN :** résultat des tests unitaires ; aucun succès global ne peut être annoncé à partir de ces tentatives.
- **UNKNOWN :** démarrage complet Spring, connexion SQL, validation des migrations et des permissions en conditions réelles.
- **UNKNOWN :** installation, lint, compilation et démarrage Next.js ; `frontend/node_modules` était absent à l’inventaire. Le cache npm consulté ne constitue pas une installation.
- Aucun appel IA, aucune automatisation Jira et aucune modification de base n’ont été déclenchés volontairement pendant l’analyse. Les commandes Maven ont pu régénérer des artefacts sous `target/`.
- Aucun code applicatif ou fichier de configuration source n’a été corrigé. Ce rapport est un nouveau fichier ; l’ancien audit a été conservé.

Les tests présents portent sur l’authentification, JWT, enseignants, absences, fallback de jury et solveur. Aucune annotation de test de contexte complet `@SpringBootTest` ou `@WebMvcTest` n’a été retrouvée ; ces tests ne démontrent donc pas à eux seuls que les routes Spring s’enregistrent correctement.

## 11. Ordre de travail proposé

1. Sélectionner un JDK 21 et rendre le cache Maven accessible.
2. Corriger le doublon de route PFE.
3. Vérifier la compilation, les tests, puis le démarrage sur une base MySQL de développement.
4. Installer et valider le frontend Next.js.
5. Vérifier une connexion JWT et quelques lectures métier dans Swagger.
6. Restreindre l’inscription publique et appliquer les permissions métier ; retirer les secrets et isoler les comptes de démonstration.
7. Remplacer le stockage PFE en mémoire par la persistance JPA et compléter les règles métier simplifiées.
8. Construire les écrans métier du frontend.
9. Aligner Docker, PostgreSQL, les démonstrations et le README sur le code retenu.

Le point d’entrée le plus réaliste pour cette copie est **MySQL local + backend Spring sur 8085 + frontend Next.js sur 3000**, après résolution des blocages identifiés.
