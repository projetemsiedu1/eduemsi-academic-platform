# 🎓 Plateforme Académique EMSI — Gestion des Emplois du Temps, PFE & Scolarité

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-green.svg)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-18_Standalone-red.svg)](https://angular.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue.svg)](https://tailwindcss.com/)
[![OR-Tools](https://img.shields.io/badge/Google_OR--Tools-9.8-yellow.svg)](https://developers.google.com/optimization)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.0_Flash-purple.svg)](https://ai.google.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Jira Scrum](https://img.shields.io/badge/Jira-Agile_Scrum-0052cc.svg)](https://moussaoui9881.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog)

Application web académique conçue pour l'**École Marocaine des Sciences de l'Ingénieur (EMSI)**. Elle orchestre la planification intelligente des emplois du temps avec contraintes d'or (solveur Google OR-Tools CP-SAT), le matching éthique des jurys de PFE et l'analyse prédictive des recrutements par IA générative (Google Gemini 2.0 Flash Free Tier avec fallback local), l'émargement numérique manuel et le suivi pédagogique post-cours.

---

## 👥 Équipe d'Ingénieurs & Rôles Scrum Dédiés

| Membre | Rôle Scrum | Périmètre de Responsabilité |
| :--- | :--- | :--- |
| **Noussair Benassou** | **Technical Lead** | Architecture Spring Boot 3, Moteur OR-Tools (vacataires, campus, salles TP PC) & briques IA Gemini |
| **Moad Moussaoui** | **Scrum Master** | Pilotage Agile, animation des cérémonies, burndown chart, gouvernance RBAC & soutenance finale |
| **Amine Bella** | **Product Owner** | Règles déontologiques PFE (zéro conflit), cahier de texte post-séance & seuil d'absence éliminatoire 20% |
| **Brahim Abod** | **DevOps Engineer** | Organisation GitHub, Docker Compose multi-stage, persistance PostgreSQL & pipelines CI/CD |
| **Ilyass Ait Ouahman** | **Test and Quality** | Tests unitaires JUnit 5, validation du Fallback Heuristique Local (simulation panne IA) & recette E2E |
| **Ikram Mellakh** | **UX/UI Designer** | Design System Tailwind CSS EMSI, grille hebdomadaire réactive d'EDT & écrans d'émargement |

---

## 📂 Structure du Répertoire (Arborescence Officielle)

```text
eduemsi-academic-platform/
│
├── 📁 backend-spring/              # API REST Spring Boot 3.3 (Java 21)
│   ├── src/main/java/              # Contrôleurs, Services Métier, Moteur OR-Tools, Client Gemini
│   ├── src/main/resources/         # Configuration application.yml & Scripts SQL Flyway
│   ├── pom.xml                     # Dépendances Maven (Spring Data, Security, OR-Tools, Jackson)
│   └── Dockerfile                  # Build multi-stage Maven / Alpine
│
├── 📁 frontend-angular/            # Application Web Angular 18 Standalone
│   ├── src/app/                    # Composants Standalone (Timetable, PfeMatching, Attendance)
│   ├── package.json                # Dépendances npm (Angular 18, Tailwind CSS, Lucide icons)
│   └── Dockerfile                  # Build multi-stage Node / Nginx
│
├── 📁 docs/                        # Documentation d'Ingénierie & Spécifications
│   ├── 📁 architecture-systeme/    # Schémas d'architecture globale, ERD et galeries de flux
│   ├── 📁 cahier-des-charges/      # Cahier des charges officiel, rapports et documentation métier
│   ├── 📁 cadrage-scrum-agile/     # Dossier de cadrage Agile, Product Backlog & Exports Jira CSV
│   ├── 📁 prototypes-et-maquettes/ # Simulations interactives (Matching PFE IA, maquettes Figma)
│   └── 📁 uml/                     # Diagrammes formels OMG UML 2.5.1 (Use Case, Class, Sequence, Activity)
│
├── 📁 scripts/                     # Scripts d'Automatisation & Outillage
│   ├── 📁 jira-automation/         # Scripts Node.js d'alimentation et réorganisation Jira REST API
│   └── 📁 tools/                   # Utilitaires de conversion et d'analyse
│
├── 📄 docker-compose.yml           # Déploiement 1-clic (PostgreSQL 16 + Backend + Frontend)
├── 📄 .gitignore                   # Règles strictes d'exclusion de fichiers
└── 📄 README.md                    # Guide officiel du projet
```

---

## ⚡ Démarrage Rapide en 1 Commande

### Prérequis
* Docker & Docker Compose installés sur votre machine.

```bash
# 1. Cloner le projet
git clone https://github.com/projetemsiedu1/eduemsi-academic-platform.git
cd eduemsi-academic-platform

# 2. Lancer la stack complète en tâche de fond
docker compose up -d --build
```

### URLs d'Accès Local
* 🌐 **Frontend Web Angular :** `http://localhost:4200`
* 🔌 **Backend API Spring Boot :** `http://localhost:8080/api`
* 🗄️ **Base de Données PostgreSQL :** `localhost:5432` (`emsi_academic_db` / `emsi_admin`)

---

## 🧠 Contraintes d'Or Académiques EMSI

1. **Priorité Absolue aux Professeurs Vacataires :** Le solveur OR-Tools affecte d'abord les créneaux stricts des vacataires avant de placer les professeurs permanents (2-pass CP-SAT solver).
2. **Campus Unique par Jour :** Interdiction pour une classe d'étudier sur deux campus différents dans la même journée (zéro déplacement inter-campus).
3. **Pauses Réglementaires :** Pause fixe de 15 min le matin (10h00-10h15) et trou de midi limité à 1h30 maximum.
4. **Affectation Salles TP PC :** Tout TP des filières IIR et Génie Industriel requérant des machines est obligatoirement alloué dans une salle dotée du nombre de postes informatiques adéquat.
5. **Appel Numérique Manuel & Seuil Éliminatoire 20% :** Émargement manuel par l'enseignant (la méthode QR code est bannie). Alerte rouge instantanée dès qu'un étudiant franchit 20% d'absences injustifiées.
6. **IA Gemini 2.0 Flash avec Fallback Local :** Matching sémantique des jurys de PFE avec respect de la déontologie (l'encadrant ne peut être ni Président ni Rapporteur de son propre étudiant). En cas de panne de connexion, le système bascule sur l'algorithme heuristique local sans crash.

---

## 📅 Calendrier des Sprints (Échéance : 24 Décembre 2026)

* **Sprint 0 (06 Nov &rarr; 13 Nov) :** Socle, Gouvernance RBAC, Docker Compose & Organisation GitHub.
* **Sprint 1 (14 Nov &rarr; 24 Nov) :** 🔥 **Briques IA Gemini Free API & Matching Jurys PFE (Priorité Démo Professeur)**.
* **Sprint 2 (25 Nov &rarr; 05 Déc) :** Solveur OR-Tools Contraintes EMSI & Grille EDT Angular Tailwind.
* **Sprint 3 (06 Déc &rarr; 15 Déc) :** Cahier de texte post-séance, Appel Manuel & Alerte rouge 20%.
* **Sprint 4 (16 Déc &rarr; 24 Déc) :** Tests TDD JUnit 5, Validation Fallback Panne IA, Recette & Soutenance Finale le 24/12/2026.

---

## 🔗 Liens Utiles
* 📋 **Jira Backlog :** [https://moussaoui9881.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog](https://moussaoui9881.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog)
* 🐙 **Dépôt GitHub Officiel :** [https://github.com/projetemsiedu1/eduemsi-academic-platform](https://github.com/projetemsiedu1/eduemsi-academic-platform)
* 📐 **Documentation UML :** [`docs/uml/README.md`](docs/uml/README.md)
