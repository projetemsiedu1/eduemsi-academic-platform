const email = 'moussaoui9881@gmail.com';
const token = 'ATATT3xFfGF096JkUFHbniyIzaDbspuOZNRX4LhsoISPkEc-8pPJFZY2BsCYVm39Qf9MJMlNagy-ISGvEqBos1VtMPLYG1uUJhL0qBhSjOcK5eBnvt41Cz4OAnCXgHMC6mE4ChsD-HMngb65oE-hfXJ3NLi-Z_Pb-YMOmdQ3b9L7HzFa7amiT8k=93F3C5D8';
const auth = Buffer.from(email + ':' + token).toString('base64');

const headers = {
  'Authorization': 'Basic ' + auth,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Nettoyage des tickets tests par défaut (Tâche 1, Tâche 2, Tâche 3)
async function cleanDummyIssues() {
  const dummyKeys = ['SCRUM-1', 'SCRUM-2', 'SCRUM-3'];
  for (let k of dummyKeys) {
    try {
      const res = await fetch(`https://moussaoui9881.atlassian.net/rest/api/2/issue/${k}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok || res.status === 204) {
        console.log(`🗑️ Ticket test ${k} supprimé.`);
      }
    } catch(e) {}
  }
}

// Mappage des descriptions ultra-détaillées avec mise en forme Jira
const richDescriptions = {
  'SCRUM-5': {
    title: '[US-04] Gouvernance Hiérarchique à 4 Niveaux & Matrice RBAC',
    assignee: 'Moad Moussaoui',
    role: 'Scrum Master & Architecte',
    points: 5,
    sprint: 'Sprint 0',
    deadline: '10/11/2026',
    desc: `h2. 🎯 Objectif Métier
Permettre au SuperAdmin de créer et gérer la hiérarchie académique à 4 niveaux (SuperAdmin > Directeur > Responsable Filière > Planificateur) avec traçabilité immuable de chaque action pour répondre aux exigences d'audit de l'école.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Moad Moussaoui (Scrum Master)
* *Estimation :* 5 Story Points
* *Échéance :* 10 Novembre 2026

h3. 🛠️ Ce que le développeur doit implémenter (Pas-à-Pas)
# *Modélisation JPA :* Créer les entités {{User}}, {{Role}}, {{Permission}} et {{AuditLog}} dans {{backend-spring}}.
# *Traçabilité Immuable :* Implémenter un {{AuditEntityListener}} JPA qui horodate chaque opération (INSERT/UPDATE/DELETE) avec l'auteur, l'adresse IP et l'ancienne/nouvelle valeur en JSON.
# *Sécurité RBAC :* Configurer Spring Security 6 avec filtres JWT et annotations {{@PreAuthorize("hasRole('SUPERADMIN')")}}.
# *Validation des Règles de Gestion :*
** Un Responsable de Filière ne peut administrer que sa propre filière (ex: IIR ou GI).
** Un Planificateur ne peut créer des emplois du temps que sur son campus rattaché.

h3. ✅ Critères d'Acceptation (Formulation Gherkin)
* *Scénario 1 : Création d'un responsable de filière par le SuperAdmin*
** *Étant donné* un utilisateur authentifié avec le rôle SuperAdmin
** *Quand* il soumet le formulaire de création d'un Responsable de Filière pour l'IIR
** *Alors* le compte est activé et une entrée est insérée dans la table {{audit_logs}} avec la signature de l'auteur.
* *Scénario 2 : Refus d'accès non autorisé*
** *Étant donné* un utilisateur avec le rôle Planificateur
** *Quand* il tente d'accéder au endpoint {{/api/admin/users}}
** *Alors* le système renvoie une erreur HTTP 403 Forbidden.`
  },

  'SCRUM-6': {
    title: '[US-09] Configuration Organisation GitHub & Repositories Officiels',
    assignee: 'Brahim Abod',
    role: 'DevOps Engineer',
    points: 5,
    sprint: 'Sprint 0',
    deadline: '08/11/2026',
    desc: `h2. 🎯 Objectif Métier
Structurer l'espace de travail collaboratif GitHub pour l'équipe des 6 ingénieurs, protéger les branches de production et automatiser la validation du code à chaque Pull Request.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Brahim Abod (DevOps)
* *Estimation :* 5 Story Points
* *Échéance :* 08 Novembre 2026

h3. 🛠️ Ce que le développeur doit implémenter (Pas-à-Pas)
# *Organisation & Dépôt :* Dépôt officiel {{eduemsi-academic-platform}} configuré.
# *Protection des Branches :*
** Branche {{main}} : Verrouillée contre les push directs, revue obligatoire (1 approbation minimum).
** Branche {{develop}} : Branche d'intégration active de l'équipe.
# *Gestion des Accès :* Inviter les 6 membres de l'équipe avec des rôles adaptés (Write/Maintain).
# *Hygiène du Code :* Fichier {{.gitignore}} strict pour Java (target/), Angular (dist/, node_modules/) et secrets.

h3. ✅ Critères d'Acceptation
* Aucun membre ne peut pousser du code directement sur {{main}} sans PR validée.
* Le dépôt est accessible à toute l'équipe avec les modules backend et frontend prêts.`
  },

  'SCRUM-7': {
    title: '[US-10] Conteneurisation Docker Compose (PostgreSQL, Spring, Angular)',
    assignee: 'Brahim Abod',
    role: 'DevOps Engineer',
    points: 5,
    sprint: 'Sprint 0',
    deadline: '11/11/2026',
    desc: `h2. 🎯 Objectif Métier
Permettre à chaque développeur de lancer en une seule commande l'ensemble de l'écosystème EMSI (Base PostgreSQL 16, API Spring Boot 3, Frontend Angular 18) avec seed data complet.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Brahim Abod (DevOps)
* *Estimation :* 5 Story Points
* *Échéance :* 11 Novembre 2026

h3. 🛠️ Ce que le développeur doit implémenter (Pas-à-Pas)
# *Dockerfile Backend :* Build multi-stage Maven (OpenJDK 21 Eclipse Temurin) pour produire une image Alpine légère.
# *Dockerfile Frontend :* Build Node.js 20 puis déploiement sur Nginx Alpine avec proxy inverse vers {{/api/}}.
# *docker-compose.yml :*
** Service {{postgres}} : Port 5432, volume persistent {{pgdata}}, script d'initialisation {{V1__init_schema.sql}}.
** Service {{backend}} : Dépendance sur {{postgres}} avec healthcheck.
** Service {{frontend}} : Port 4200 (ou 80).
# *Fichier d'environnement :* Créer un fichier {{.env.example}} documenté.

h3. ✅ Critères d'Acceptation
* La commande {{docker compose up --build}} démarre les 3 conteneurs sans crash.
* PostgreSQL contient les tables et les campus Marrakech pré-chargés.`
  },

  'SCRUM-8': {
    title: '[US-05] Pilotage du Backlog Scrum & Cérémonies de Synchronisation',
    assignee: 'Moad Moussaoui',
    role: 'Scrum Master',
    points: 3,
    sprint: 'Sprint 0',
    deadline: '13/11/2026',
    desc: `h2. 🎯 Objectif Métier
Garantir la vélocité et l'alignement de l'équipe de 6 ingénieurs à travers la cadence Scrum, le suivi du burndown chart et le respect strict du calendrier jusqu'au 24 Décembre 2026.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Moad Moussaoui (Scrum Master)
* *Estimation :* 3 Story Points
* *Échéance :* 13 Novembre 2026

h3. 🛠️ Actions et Rituels à Conduire
# *Daily Scrum :* Standup quotidien de 15 minutes (Ce qui a été fait, les blocages, ce qui est prévu).
# *Sprint Planning :* Attribution formelle des tâches et validation des Story Points de l'équipe.
# *Tableau Jira :* Mettre à jour l'état des tickets (À faire -> En cours -> En revue -> Terminé).
# *Burndown & Velocity :* Suivi des courbes d'avancement pour détecter tout risque de retard.

h3. ✅ Critères d'Acceptation
* 100% des membres de l'équipe ont leurs tâches claires pour chaque journée.
* Aucune dépendance technique ne reste bloquée plus de 24h.`
  },

  'SCRUM-9': {
    title: '[US-01] Solveur OR-Tools avec Priorité Absolue aux Professeurs Vacataires',
    assignee: 'Noussair Benassou',
    role: 'Technical Lead',
    points: 8,
    sprint: 'Sprint 1',
    deadline: '20/11/2026',
    desc: `h2. 🎯 Objectif Métier
Résoudre le casse-tête de la planification académique en affectant en priorité absolue les professeurs vacataires sur leurs créneaux stricts de disponibilité avant d'affecter les permanents (qui ont des plages flexibles).

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Noussair Benassou (Technical Lead)
* *Estimation :* 8 Story Points
* *Échéance :* 20 Novembre 2026

h3. 🛠️ Ce que le développeur doit implémenter (Pas-à-Pas)
# *Intégration OR-Tools :* Ajouter la dépendance {{com.google.ortools:ortools-java:9.8+}} dans {{pom.xml}}.
# *Algorithme 2-Passes dans OrToolsTimetableSolver.java :*
** *Passe 1 (Vacataires Stricts) :* Variables binaires X[c, p, s, t]. Contrainte dure : Les vacataires ne peuvent enseigner QUE sur leurs créneaux déclarés disponibles. Pénalité maximale si un créneau vacataire n'est pas honoré.
** *Passe 2 (Permanents & Salles) :* Remplissage des créneaux restants avec les professeurs permanents et optimisation de l'équilibrage horaire.
# *Contraintes Dures :*
** Pas de professeur en double réservation sur le même créneau.
** Pas de classe sur deux créneaux simultanés.

h3. ✅ Critères d'Acceptation
* Le solveur renvoie le statut OPTIMAL ou FEASIBLE en moins de 3 secondes pour 10 classes et 20 professeurs.
* 100% des professeurs vacataires sont positionnés sur leurs créneaux choisis.`
  },

  'SCRUM-10': {
    title: '[US-02] Contrainte Campus Unique par Jour et Pauses Réglementaires',
    assignee: 'Noussair Benassou',
    role: 'Technical Lead',
    points: 5,
    sprint: 'Sprint 1',
    deadline: '22/11/2026',
    desc: `h2. 🎯 Objectif Métier
Interdire formellement qu'un étudiant ou un groupe change de campus le même jour (temps de trajet interdit entre campus de Marrakech), imposer 15 min de pause le matin et limiter le trou du midi à 1h30 max.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Noussair Benassou (Technical Lead)
* *Estimation :* 5 Story Points
* *Échéance :* 22 Novembre 2026

h3. 🛠️ Ce que le développeur doit implémenter
# *Contrainte Campus Unique :*
** Soit Campus(salle). Pour une classe C et un jour J : {{count(distinct Campus(salle)) == 1}}.
# *Créneaux & Pauses Horaires :*
** Créneau 1 : 08h30 - 10h00
** *PAUSE FIXE :* 10h00 - 10h15 (15 minutes de récréation matinale)
** Créneau 2 : 10h15 - 11h45
** *PAUSE MÉRIDIENNE :* Maximum 90 minutes (pas de séance l'après-midi au-delà de 1h30 d'attente).
** Créneaux Après-midi : 12h00-13h30 / 14h00-15h30 / 15h45-17h15.

h3. ✅ Critères d'Acceptation
* Zéro conflit d'étudiant changeant de campus dans la même journée.
* Tout emploi du temps généré contient la pause de 15 min à 10h00.`
  },

  'SCRUM-11': {
    title: '[US-03] Affectation Obligatoire des Salles TP PC (IIR & Industriel)',
    assignee: 'Noussair Benassou',
    role: 'Technical Lead',
    points: 5,
    sprint: 'Sprint 1',
    deadline: '24/11/2026',
    desc: `h2. 🎯 Objectif Métier
Affecter automatiquement les séances pratiques (TP Dev, TP Réseaux, Automatisme, CAO) dans des salles spécialisées disposant de postes informatiques (PC).

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Noussair Benassou (Technical Lead)
* *Estimation :* 5 Story Points
* *Échéance :* 24 Novembre 2026

h3. 🛠️ Ce que le développeur doit implémenter
# *Métadonnées Salle :* Attributs {{has_computers}} (booléen) et {{pc_count}} (entier).
# *Métadonnées Module :* Attribut {{requires_computers}} (booléen) sur l'entité Module.
# *Clause OR-Tools :* Si {{module.requiresComputers == true}}, alors {{salle.hasComputers == true && salle.pcCount >= classe.effectif}}.

h3. ✅ Critères d'Acceptation
* Aucun cours de TP IIR ou Industriel n'est affecté dans une salle de cours magistral sans PC.
* Alerte explicite si le nombre de machines est inférieur à la capacité de la classe.`
  },

  'SCRUM-12': {
    title: '[US-14] Design System Tailwind CSS & Thème Visuel EMSI Campus',
    assignee: 'Ikram Mellakh',
    role: 'UX/UI Designer',
    points: 5,
    sprint: 'Sprint 1',
    deadline: '16/11/2026',
    desc: `h2. 🎯 Objectif Métier
Développer une interface utilisateur élégante, moderne et responsive respectant l'identité visuelle de l'EMSI (Vert Émeraude, Bleu Nuit et Ardoise) avec composants accessibles.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Ikram Mellakh (UX/UI Designer)
* *Estimation :* 5 Story Points
* *Échéance :* 16 Novembre 2026

h3. 🛠️ Ce que la designer doit implémenter
# *Palette Officielle Tailwind :*
** emsi-primary : #059669 (Émeraude)
** emsi-dark : #0f172a (Bleu Profond)
** emsi-slate : #1e293b (Gris Ardoise)
# *Composants Angular Standalone :*
** {{Navbar}} avec badge de notification et profil utilisateur.
** {{Badge}} (Vacataire / Permanent, TP PC / Cours, Présent / Absent).
** {{Modal}} accessible pour la saisie et les alertes de conflits.

h3. ✅ Critères d'Acceptation
* Navigation fluide sur écran mobile, tablette et desktop (Mobile-First).
* Conformité WCAG 2.2 niveau AA pour le contraste des textes.`
  },

  'SCRUM-13': {
    title: '[US-15] Grille Hebdomadaire d Emploi du Temps Interactive & Filtrable',
    assignee: 'Ikram Mellakh',
    role: 'UX/UI Designer',
    points: 8,
    sprint: 'Sprint 1',
    deadline: '22/11/2026',
    desc: `h2. 🎯 Objectif Métier
Offrir aux étudiants, enseignants et chefs de filière un composant d'emploi du temps interactif, avec filtres instantanés par classe, professeur et campus.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Ikram Mellakh (UX/UI Designer)
* *Estimation :* 8 Story Points
* *Échéance :* 22 Novembre 2026

h3. 🛠️ Ce que la designer doit implémenter
# *Composant TimetableGrid :* Grille hebdomadaire (Lundi à Samedi) découpée selon les 5 créneaux EMSI.
# *Indicateurs Visuels :*
** Badge Vert "Salle TP PC" avec icône ordinateur.
** Badge Jaune pour les séances assurées par les professeurs vacataires.
** Séparateur visuel pour la pause de 15 min de 10h00.
# *Filtres Dynamiques :* Sélecteur de filière (IIR, GC, GI, GE) et de campus (Gueliz, Centre).

h3. ✅ Critères d'Acceptation
* La grille s'actualise instantanément au changement de filtre sans rechargement de page.
* Les créneaux vides sont clairement identifiables.`
  },

  'SCRUM-14': {
    title: '[US-07] Cahier de Texte Numérique & Notification Post-Séance',
    assignee: 'Amine Bella',
    role: 'Product Owner',
    points: 5,
    sprint: 'Sprint 2',
    deadline: '02/12/2026',
    desc: `h2. 🎯 Objectif Métier
Garantir le suivi pédagogique des cours en envoyant une notification automatique au professeur dès la fin de son cours pour qu'il renseigne sa fiche de séance (objectifs, chapitres traités, travail à faire).

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Amine Bella (Product Owner)
* *Estimation :* 5 Story Points
* *Échéance :* 02 Décembre 2026

h3. 🛠️ Spécifications Métier Détaillées
# *Entité FicheSeance :* Champs obligatoires (seanceId, professeurId, dateRemplissage, chapitresTraites, travailAFaire, observations).
# *Déclencheur Notification :* Cron Spring @Scheduled ou WebSocket vérifiant la fin de chaque séance pour déclencher un toast / push notif.
# *Tableau de Bord Pédagogique :* Vue pour le Chef de Filière affichant les fiches remplies et le taux de remplissage par professeur.

h3. ✅ Critères d'Acceptation
* Dès qu'une séance se termine, le professeur voit une bannière de rappel.
* La fiche validée est immuable et consultable par la direction des études.`
  },

  'SCRUM-15': {
    title: '[US-08] Gestion des Absences & Alerte Automatique Seuil 20%',
    assignee: 'Amine Bella',
    role: 'Product Owner',
    points: 5,
    sprint: 'Sprint 2',
    deadline: '05/12/2026',
    desc: `h2. 🎯 Objectif Métier
Enregistrer les présences par appel numérique manuel rapide (pas de QR code) et déclencher automatiquement une alerte rouge par email/SMS à la scolarité et aux parents dès qu'un étudiant franchit le seuil éliminatoire de 20% d'absences injustifiées.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Amine Bella (Product Owner)
* *Estimation :* 5 Story Points
* *Échéance :* 05 Décembre 2026

h3. 🛠️ Spécifications Métier Détaillées
# *Feuille d'Appel Numérique :* Interface professeur listant les étudiants avec 3 boutons : Présent (défaut), Absent Injustifié, Absent Justifié.
# *Moteur de Calcul du Taux :* Taux = (Heures Absence Non Justifiée / Heures Totales Module) * 100.
# *Alerte Critique 20% :*
** Drapeau Rouge automatique sur le dossier de l'étudiant.
** Notification envoyée au Responsable de Scolarité.
** Suspension de l'accès aux examens finaux si non régularisé.

h3. ✅ Critères d'Acceptation
* L'appel pour 30 étudiants est bouclé en moins de 45 secondes par l'enseignant.
* À la 4ème absence sur un module de 30h (20%), l'alerte rouge se déclenche immédiatement.`
  },

  'SCRUM-16': {
    title: '[US-06] Spécification Déontologique des Jurys de Soutenance PFE',
    assignee: 'Amine Bella',
    role: 'Product Owner',
    points: 5,
    sprint: 'Sprint 2',
    deadline: '28/11/2026',
    desc: `h2. 🎯 Objectif Métier
Garantir l'intégrité et la déontologie académique lors des soutenances de PFE en interdisant formellement qu'un professeur encadrant soit président ou rapporteur de son propre étudiant.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Amine Bella (Product Owner)
* *Estimation :* 5 Story Points
* *Échéance :* 28 Novembre 2026

h3. 🛠️ Spécifications Métier Détaillées
# *Règles du Jury PFE :*
** 1 Président de Jury (obligatoirement un enseignant permanent expérimenté).
** 1 Rapporteur (expert du domaine technique du sujet).
** 1 Encadrant pédagogique (interdit d'être Président ou Rapporteur).
# *Règle d'Exclusion :* {{jury.presidentId != pfe.encadrantId && jury.rapporteurId != pfe.encadrantId}}.
# *Validation Automatique :* Blocage immédiat avec message explicite si l'utilisateur tente de forcer l'encadrant en jury évaluateur.

h3. ✅ Critères d'Acceptation
* Le système rejette toute composition où l'encadrant est évaluateur de son élève.
* Les fiches de notation distinctes sont éditées pour chaque membre.`
  },

  'SCRUM-17': {
    title: '[US-16] Interface d Émargement Numérique & Fiches d Appel Professeurs',
    assignee: 'Ikram Mellakh',
    role: 'UX/UI Designer',
    points: 5,
    sprint: 'Sprint 2',
    deadline: '04/12/2026',
    desc: `h2. 🎯 Objectif Métier
Concevoir l'écran d'appel numérique pour smartphone et tablette permettant aux professeurs d'effectuer l'émargement en un temps record en début de cours.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Ikram Mellakh (UX/UI Designer)
* *Estimation :* 5 Story Points
* *Échéance :* 04 Décembre 2026

h3. 🛠️ Ce que la designer doit implémenter
# *Bouton "Marquer Tous Présents" :* Pour un appel rapide par exception (clic unique).
# *Badges Visuels :* Vert (Présent), Rouge (Absent), Bleu (Justificatif en attente).
# *Modal de Dépôt de Justificatif :* Interface pour charger un certificat médical scanné.

h3. ✅ Critères d'Acceptation
* L'interface s'adapte parfaitement aux smartphones des professeurs.
* Confirmation visuelle haptique lors de la validation de l'appel.`
  },

  'SCRUM-18': {
    title: '[US-17] Matching Intelligent Jurys PFE avec Google Gemini 2.0 Flash (Free API)',
    assignee: 'Noussair Benassou',
    role: 'Technical Lead',
    points: 8,
    sprint: 'Sprint 3',
    deadline: '10/12/2026',
    desc: `h2. 🎯 Objectif Métier
Exploiter l'API gratuite Google Gemini 2.0 Flash pour analyser sémantiquement les thématiques des mémoires de PFE et proposer la composition idéale du jury (Président + Rapporteur) selon les spécialités des professeurs sans aucun conflit d'intérêt.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Noussair Benassou (Technical Lead)
* *Estimation :* 8 Story Points
* *Échéance :* 10 Décembre 2026

h3. 🛠️ Ce que le développeur doit implémenter
# *Prompt Engineering Gemini :* Construire un prompt JSON structuré comprenant le résumé du PFE, la liste des professeurs avec leurs spécialités et les règles d'exclusion.
# *Client HTTP Java 21 :* Appel REST vers {{https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=API_KEY}}.
# *Parsing JSON Strict :* Extraire {{"president_recommande": "...", "rapporteur_recommande": "...", "score_pertinence": 95, "justification": "..."}}.

h3. ✅ Critères d'Acceptation
* L'IA répond en moins de 2,5 secondes avec une proposition argumentée.
* Zéro conflit d'intérêt retourné dans les propositions du modèle.`
  },

  'SCRUM-19': {
    title: '[US-18] Analyse Prédictive RH des CV & Détection des Déficits par Filière',
    assignee: 'Noussair Benassou',
    role: 'Technical Lead',
    points: 8,
    sprint: 'Sprint 3',
    deadline: '14/12/2026',
    desc: `h2. 🎯 Objectif Métier
Fournir à la direction un outil d'aide à la décision RH alimenté par l'IA pour analyser les CV des candidats vacataires et permanents, évaluer leur adéquation avec les modules orphelins et détecter les pénuries de professeurs par branche.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Noussair Benassou (Technical Lead)
* *Estimation :* 8 Story Points
* *Échéance :* 14 Décembre 2026

h3. 🛠️ Ce que le développeur doit implémenter
# *Parser de CV IA :* Extraction des compétences techniques, années d'expérience et disponibilité horaire.
# *Matching Module / Profil :* Score de correspondance entre les besoins de la maquette pédagogique (ex: 60h de Java/Spring en 4IIR) et les profils recrutés.
# *Tableau de Bord des Déficits :* Alerte visuelle pour les filières en sous-effectif (ex: -120h en Génie Industriel).

h3. ✅ Critères d'Acceptation
* Extraction des compétences depuis un texte de CV en moins de 2 secondes.
* Affichage clair des filières en déficit horaire.`
  },

  'SCRUM-20': {
    title: '[TK-17] Client REST Java 21 Dual-Mode & Fallback Heuristique Local',
    assignee: 'Noussair Benassou',
    role: 'Technical Lead',
    points: 5,
    sprint: 'Sprint 3',
    deadline: '08/12/2026',
    desc: `h2. 🎯 Objectif Métier
Garantir une robustesse absolue du système : si l'API externe Google Gemini est inaccessible (quota dépassé ou absence de connexion internet), le système bascule automatiquement et de façon totalement invisible sur l'algorithme local.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Noussair Benassou (Technical Lead)
* *Estimation :* 5 Story Points
* *Échéance :* 08 Décembre 2026

h3. 🛠️ Ce que le développeur doit implémenter
# *Classe GeminiAiServiceClient.java :*
** Méthode {{matchPfeJuryWithFallback(pfe, profList)}}.
** Bloc try/catch surveillant les timeouts et les codes HTTP 429 (quota) ou 5xx.
# *Algorithme Local Heuristique :* Calcul de similarité de Jaccard sur les mots-clés du sujet et les tags de spécialité des enseignants.
# *Bannière Discrète :* Champ JSON {{"source": "LOCAL_HEURISTIC_FALLBACK"}} pour informer le frontend sans afficher d'erreur critique à l'utilisateur.

h3. ✅ Critères d'Acceptation
* En débranchant le câble réseau, le matching de jury continue de fonctionner en 50ms sans erreur 500.`
  },

  'SCRUM-21': {
    title: '[US-12] Suite de Tests Unitaires JUnit 5 pour le Solveur d Emplois du Temps',
    assignee: 'Ilyass Ait Ouahman',
    role: 'Test and Quality',
    points: 5,
    sprint: 'Sprint 4',
    deadline: '18/12/2026',
    desc: `h2. 🎯 Objectif Métier
Valider par des tests automatisés stricts que le moteur d'emploi du temps respecte 100% des contraintes académiques de l'école sans aucune régression.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Ilyass Ait Ouahman (Test and Quality)
* *Estimation :* 5 Story Points
* *Échéance :* 18 Décembre 2026

h3. 🛠️ Ce que l'ingénieur QA doit implémenter
# *Tests Solveur :*
** {{testPrioriteVacatairesRespectee()}} : Vérifier que 100% des vacataires sont placés sur leurs disponibilités déclarées.
** {{testZeroDoubleReservationProfesseur()}} : Zéro chevauchement pour chaque enseignant.
** {{testCampusUniqueParJour()}} : Vérifier qu'aucune classe n'a deux campus le même jour.
** {{testPause15MinutesMatin()}} : Vérifier la présence du créneau de pause à 10h.
# *Rapport de Couverture :* Rapport Jacoco avec couverture des règles de gestion > 85%.

h3. ✅ Critères d'Acceptation
* La commande {{mvn test}} réussit avec 0 échec et 0 erreur sur toute la suite.`
  },

  'SCRUM-22': {
    title: '[US-13] Validation du Fallback Heuristique Local en cas de Coupure Réseau IA',
    assignee: 'Ilyass Ait Ouahman',
    role: 'Test and Quality',
    points: 5,
    sprint: 'Sprint 4',
    deadline: '21/12/2026',
    desc: `h2. 🎯 Objectif Métier
Conduire un protocole de test de robustesse simulant une panne totale de l'API Google Gemini lors de la soutenance devant le professeur pour prouver la résilience du système.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Ilyass Ait Ouahman (Test and Quality)
* *Estimation :* 5 Story Points
* *Échéance :* 21 Décembre 2026

h3. 🛠️ Protocole de Test à Exécuter
# *Test de Coupure :* Passer une clé API invalide ou couper le réseau.
# *Vérification du Comportement :*
** Le système ne renvoie AUCUNE exception non gérée.
** Le temps de réponse reste inférieur à 100ms.
** Les propositions de jury respectent strictement la règle déontologique.

h3. ✅ Critères d'Acceptation
* Rapport de test formel validant le basculement transparent vers le moteur local.`
  },

  'SCRUM-23': {
    title: '[TK-14] Recette Fonctionnelle Complète & Rapport de Tests de Non-Régression',
    assignee: 'Ilyass Ait Ouahman',
    role: 'Test and Quality',
    points: 3,
    sprint: 'Sprint 4',
    deadline: '23/12/2026',
    desc: `h2. 🎯 Objectif Métier
Réaliser la recette fonctionnelle de bout en bout couvrant les 15 parcours utilisateurs de la plateforme et certifier l'absence d'anomalie bloquante avant livraison finale.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Ilyass Ait Ouahman (Test and Quality)
* *Estimation :* 3 Story Points
* *Échéance :* 23 Décembre 2026

h3. 🛠️ Périmètre de Recette
# *Parcours 1 :* Connexion SuperAdmin et création d'un responsable de filière IIR.
# *Parcours 2 :* Lancement de la génération de l'EDT et vérification des contraintes.
# *Parcours 3 :* Émargement d'une séance et alerte de dépassement du seuil de 20%.
# *Parcours 4 :* Saisie de la fiche de séance après notification.
# *Parcours 5 :* Proposition de jury PFE par IA et vérification du zéro conflit.

h3. ✅ Critères d'Acceptation
* Matrice de traçabilité des exigences validée à 100%.
* Feu vert officiel pour la soutenance finale.`
  },

  'SCRUM-24': {
    title: '[US-19] Démonstration Live sans Faille & Soutenance Finale du Projet',
    assignee: 'Moad Moussaoui',
    role: 'Scrum Master',
    points: 5,
    sprint: 'Sprint 4',
    deadline: '24/12/2026',
    desc: `h2. 🎯 Objectif Métier
Clôturer officiellement le projet le 24 Décembre 2026 par une présentation percutante, une démonstration live sans accroc et la remise des livrables académiques complets.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Moad Moussaoui (Scrum Master)
* *Estimation :* 5 Story Points
* *Échéance :* 24 Décembre 2026

h3. 🛠️ Livrables et Préparation
# *Présentation :* Support de soutenance mettant en valeur l'architecture Spring Boot 3, Angular 18, Google OR-Tools et les briques IA Gemini Flash.
# *Démonstration Scénarisée :* Déroulé chronologique de 10 minutes démontrant la valeur ajoutée métier.
# *Documentation Finale :* Dépôt GitHub propre avec README, guide de déploiement Docker et diagrammes UML à jour.

h3. ✅ Critères d'Acceptation
* Soutenance réussie avec validation du jury professoral le 24/12/2026.`
  }
};

async function updateAll() {
  await cleanDummyIssues();

  console.log("📝 Mise à jour des User Stories avec descriptions ultra-détaillées...");
  const keys = Object.keys(richDescriptions);
  for (let key of keys) {
    const item = richDescriptions[key];
    try {
      const res = await fetch(`https://moussaoui9881.atlassian.net/rest/api/2/issue/${key}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          fields: {
            description: item.desc
          }
        })
      });
      if (res.ok || res.status === 204) {
        console.log(`✨ [${key}] Mis à jour avec succès : ${item.title}`);
      } else {
        const t = await res.text();
        console.warn(`⚠️ [${key}] Erreur maj:`, t);
      }
    } catch(err) {
      console.error(`❌ [${key}] Erreur:`, err);
    }
    await sleep(250);
  }
  console.log("🎉 TOUTES LES USER STORIES SONT MAINTENANT RICHES, DÉTAILLÉES ET STRUCTURÉES !");
}

updateAll().catch(console.error);
