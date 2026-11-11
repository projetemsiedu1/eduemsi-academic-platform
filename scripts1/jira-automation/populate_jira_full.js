const email = 'moussaoui9881@gmail.com';
const token = 'ATATT3xFfGF096JkUFHbniyIzaDbspuOZNRX4LhsoISPkEc-8pPJFZY2BsCYVm39Qf9MJMlNagy-ISGvEqBos1VtMPLYG1uUJhL0qBhSjOcK5eBnvt41Cz4OAnCXgHMC6mE4ChsD-HMngb65oE-hfXJ3NLi-Z_Pb-YMOmdQ3b9L7HzFa7amiT8k=93F3C5D8';
const auth = Buffer.from(email + ':' + token).toString('base64');
const moadAccountId = '712020:aaf55393-18d8-46c0-8c49-5067bc16e605';

const headers = {
  'Authorization': 'Basic ' + auth,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log("🚀 Initialisation de la configuration Jira...");

  // 1. Get or Create Sprints
  let sprintMap = {
    0: 2, // SCRUM Sprint 0
    1: 1, // SCRUM Sprint 1
    2: 3  // SCRUM Sprint 2
  };

  // Create Sprint 3
  try {
    const s3Res = await fetch('https://moussaoui9881.atlassian.net/rest/agile/1.0/sprint', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'SCRUM Sprint 3 : IA Gemini',
        originBoardId: 1,
        startDate: '2026-12-06T08:00:00.000Z',
        endDate: '2026-12-15T18:00:00.000Z'
      })
    });
    const s3 = await s3Res.json();
    sprintMap[3] = s3.id;
    console.log(`✅ Sprint 3 créé avec ID: ${s3.id}`);
  } catch(e) { console.error("Sprint 3 err", e); }

  // Create Sprint 4
  try {
    const s4Res = await fetch('https://moussaoui9881.atlassian.net/rest/agile/1.0/sprint', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'SCRUM Sprint 4 : Soutenance',
        originBoardId: 1,
        startDate: '2026-12-16T08:00:00.000Z',
        endDate: '2026-12-24T18:00:00.000Z'
      })
    });
    const s4 = await s4Res.json();
    sprintMap[4] = s4.id;
    console.log(`✅ Sprint 4 créé avec ID: ${s4.id}`);
  } catch(e) { console.error("Sprint 4 err", e); }

  // 2. Stories to create (skipping US-04 since it was tested as SCRUM-5)
  const stories = [
    // SPRINT 0
    {
      sprint: 0,
      summary: '[US-09] Configuration Organisation GitHub & Repositories Officiels',
      assigneeName: 'Brahim Abod',
      role: 'DevOps',
      points: 5,
      due: '2026-11-08',
      desc: `En tant que DevOps, je veux configurer l'organisation GitHub eduemsiproject et les règles de protection des branches develop et main.

Rôle responsable : Brahim Abod (DevOps)
Estimation : 5 Story Points
Échéance : 08/11/2026

Critères d'acceptation :
- Dépôt multi-modules créé avec backend-spring et frontend-angular
- Protection des branches main et develop activée
- Permissions attribuées aux 6 membres de l'équipe`
    },
    {
      sprint: 0,
      summary: '[US-10] Conteneurisation Docker Compose (PostgreSQL, Spring, Angular)',
      assigneeName: 'Brahim Abod',
      role: 'DevOps',
      points: 5,
      due: '2026-11-11',
      desc: `En tant que Développeur, je veux démarrer la stack complète (Postgres 16, Spring Boot 3, Angular 18) en une commande docker compose up.

Rôle responsable : Brahim Abod (DevOps)
Estimation : 5 Story Points
Échéance : 11/11/2026

Critères d'acceptation :
- Dockerfile multi-stage pour le backend et le frontend
- docker-compose.yml fonctionnel avec persistance PostgreSQL`
    },
    {
      sprint: 0,
      summary: '[US-05] Pilotage du Backlog Scrum & Cérémonies de Synchronisation',
      assigneeName: 'Moad Moussaoui',
      role: 'Scrum Master',
      points: 3,
      due: '2026-11-13',
      assignToMoad: true,
      desc: `En tant que Scrum Master, je veux cadencer les livrables quotidiens et préparer la démonstration sans échec devant le professeur.

Rôle responsable : Moad Moussaoui (Scrum Master)
Estimation : 3 Story Points
Échéance : 13/11/2026

Critères d'acceptation :
- Burndown chart configuré et suivi quotidien
- Rituels Daily Scrum et revues animés`
    },

    // SPRINT 1
    {
      sprint: 1,
      summary: '[US-01] Solveur OR-Tools avec Priorité Absolue aux Professeurs Vacataires',
      assigneeName: 'Noussair Benassou',
      role: 'Technical Lead',
      points: 8,
      due: '2026-11-20',
      desc: `En tant que Planificateur, je veux que les professeurs vacataires soient placés en priorité stricte sur leurs créneaux stricts avant les permanents.

Rôle responsable : Noussair Benassou (Technical Lead)
Estimation : 8 Story Points
Échéance : 20/11/2026

Critères d'acceptation :
- Modèle CP-SAT Google OR-Tools en Java 21
- Contrainte dure : 0 conflit sur les créneaux vacataires
- Optimisation 2-passes validée`
    },
    {
      sprint: 1,
      summary: '[US-02] Contrainte Campus Unique par Jour et Pauses Réglementaires',
      assigneeName: 'Noussair Benassou',
      role: 'Technical Lead',
      points: 5,
      due: '2026-11-22',
      desc: `En tant qu'Étudiant, je veux étudier sur le même campus toute la journée avec 15m de pause le matin et au maximum 1h30 de trou méridien.

Rôle responsable : Noussair Benassou (Technical Lead)
Estimation : 5 Story Points
Échéance : 22/11/2026

Critères d'acceptation :
- Zéro changement de campus pour une classe sur une même journée
- Pause matin fixe 10h-10h15
- Trou méridien <= 90 minutes`
    },
    {
      sprint: 1,
      summary: '[US-03] Affectation Obligatoire des Salles TP PC (IIR & Industriel)',
      assigneeName: 'Noussair Benassou',
      role: 'Technical Lead',
      points: 5,
      due: '2026-11-24',
      desc: `En tant que Chef de Filière, je veux que tout TP informatique ou industriel soit obligatoirement affecté dans une salle labo avec PC.

Rôle responsable : Noussair Benassou (Technical Lead)
Estimation : 5 Story Points
Échéance : 24/11/2026

Critères d'acceptation :
- Filtrage strict sur attribut salle hasComputers = true
- Rejet automatique des salles de cours magistraux pour les séances TP`
    },
    {
      sprint: 1,
      summary: '[US-14] Design System Tailwind CSS & Thème Visuel EMSI Campus',
      assigneeName: 'Ikram Mellakh',
      role: 'UX/UI Designer',
      points: 5,
      due: '2026-11-16',
      desc: `En tant que Designer UI/UX, je veux définir la charte graphique moderne aux couleurs EMSI (Vert émeraude #059669 et Bleu Marine).

Rôle responsable : Ikram Mellakh (UX/UI Designer)
Estimation : 5 Story Points
Échéance : 16/11/2026

Critères d'acceptation :
- Palette et design tokens Tailwind CSS configurés
- Composants Angular Standalone réutilisables (boutons, modales, badges)`
    },
    {
      sprint: 1,
      summary: '[US-15] Grille Hebdomadaire d Emploi du Temps Interactive & Filtrable',
      assigneeName: 'Ikram Mellakh',
      role: 'UX/UI Designer',
      points: 8,
      due: '2026-11-22',
      desc: `En tant qu'Utilisateur, je veux consulter la grille EDT hebdomadaire avec filtres par filière, campus et affichage clair des salles TP.

Rôle responsable : Ikram Mellakh (UX/UI Designer)
Estimation : 8 Story Points
Échéance : 22/11/2026

Critères d'acceptation :
- Composant responsive Angular 18 avec code couleur par matière
- Badges visuels distinctifs pour les séances TP machines`
    },

    // SPRINT 2
    {
      sprint: 2,
      summary: '[US-07] Cahier de Texte Numérique & Notification Post-Séance',
      assigneeName: 'Amine Bella',
      role: 'Product Owner',
      points: 5,
      due: '2026-12-02',
      desc: `En tant qu'Enseignant, je veux recevoir une alerte dès la fin de mon cours pour renseigner la fiche de séance (objectifs, chapitres, devoirs).

Rôle responsable : Amine Bella (Product Owner)
Estimation : 5 Story Points
Échéance : 02/12/2026

Critères d'acceptation :
- Notification instantanée après la séance
- Fiche de cours horodatée avec champs obligatoires`
    },
    {
      sprint: 2,
      summary: '[US-08] Gestion des Absences & Alerte Automatique Seuil 20%',
      assigneeName: 'Amine Bella',
      role: 'Product Owner',
      points: 5,
      due: '2026-12-05',
      desc: `En tant que Responsable Scolarité, je veux enregistrer les présences par appel numérique et recevoir une alerte rouge dès 20% d'absences.

Rôle responsable : Amine Bella (Product Owner)
Estimation : 5 Story Points
Échéance : 05/12/2026

Critères d'acceptation :
- Appel numérique enseignant (pas de QR code)
- Calcul temps réel du quota et alerte scolarité au seuil de 20%`
    },
    {
      sprint: 2,
      summary: '[US-06] Spécification Déontologique des Jurys de Soutenance PFE',
      assigneeName: 'Amine Bella',
      role: 'Product Owner',
      points: 5,
      due: '2026-11-28',
      desc: `En tant que Product Owner, je veux interdire formellement qu'un encadrant soit président ou rapporteur de son propre étudiant.

Rôle responsable : Amine Bella (Product Owner)
Estimation : 5 Story Points
Échéance : 28/11/2026

Critères d'acceptation :
- Règle d'exclusion mutuelle stricte
- Détection et blocage automatique de conflit d'intérêt`
    },
    {
      sprint: 2,
      summary: '[US-16] Interface d Émargement Numérique & Fiches d Appel Professeurs',
      assigneeName: 'Ikram Mellakh',
      role: 'UX/UI Designer',
      points: 5,
      due: '2026-12-04',
      desc: `En tant qu'Enseignant, je veux une interface mobile-first simple et rapide pour pointer les présences et voir les justificatifs déposés.

Rôle responsable : Ikram Mellakh (UX/UI Designer)
Estimation : 5 Story Points
Échéance : 04/12/2026

Critères d'acceptation :
- Écran ergonomique Présent/Absent/Justifié
- Suivi du dépôt des certificats médicaux`
    },

    // SPRINT 3
    {
      sprint: 3,
      summary: '[US-17] Matching Intelligent Jurys PFE avec Google Gemini 2.0 Flash (Free API)',
      assigneeName: 'Noussair Benassou',
      role: 'Technical Lead',
      points: 8,
      due: '2026-12-10',
      desc: `En tant que Développeur IA, je veux utiliser l'API gratuite Google Gemini 2.0 Flash pour proposer la composition optimale du jury PFE sans conflit.

Rôle responsable : Noussair Benassou (Technical Lead)
Estimation : 8 Story Points
Échéance : 10/12/2026

Critères d'acceptation :
- Prompt structuré avec contraintes déontologiques strictes
- Affectation optimale Président et Rapporteur`
    },
    {
      sprint: 3,
      summary: '[US-18] Analyse Prédictive RH des CV & Détection des Déficits par Filière',
      assigneeName: 'Noussair Benassou',
      role: 'Technical Lead',
      points: 8,
      due: '2026-12-14',
      desc: `En tant que Directeur, je veux une analyse IA des CV pour identifier les manques d'enseignants permanents ou vacataires par branche (IIR, GC, GI, GE).

Rôle responsable : Noussair Benassou (Technical Lead)
Estimation : 8 Story Points
Échéance : 14/12/2026

Critères d'acceptation :
- Extraction automatique des compétences depuis les CV
- Dashboard des déficits de volume horaire par filière`
    },
    {
      sprint: 3,
      summary: '[TK-17] Client REST Java 21 Dual-Mode & Fallback Heuristique Local',
      assigneeName: 'Noussair Benassou',
      role: 'Technical Lead',
      points: 5,
      due: '2026-12-08',
      desc: `En tant que Tech Lead, je veux un fallback local transparent pour que le système continue de fonctionner même en coupure internet.

Rôle responsable : Noussair Benassou (Technical Lead)
Estimation : 5 Story Points
Échéance : 08/12/2026

Critères d'acceptation :
- Bascule automatique vers l'algorithme local sans erreur 500
- Détection des timeouts et quotas dépassés de l'API externe`
    },

    // SPRINT 4
    {
      sprint: 4,
      summary: '[US-12] Suite de Tests Unitaires JUnit 5 pour le Solveur d Emplois du Temps',
      assigneeName: 'Ilyass Ait Ouahman',
      role: 'Test and Quality',
      points: 5,
      due: '2026-12-18',
      desc: `En tant que QA Engineer, je veux tester automatiquement que l'emploi du temps respecte 100% des contraintes académiques.

Rôle responsable : Ilyass Ait Ouahman (Test and Quality)
Estimation : 5 Story Points
Échéance : 18/12/2026

Critères d'acceptation :
- Tests unitaires et d'intégration JUnit 5
- Validation du non-chevauchement des professeurs et des salles`
    },
    {
      sprint: 4,
      summary: '[US-13] Validation du Fallback Heuristique Local en cas de Coupure Réseau IA',
      assigneeName: 'Ilyass Ait Ouahman',
      role: 'Test and Quality',
      points: 5,
      due: '2026-12-21',
      desc: `En tant que QA Engineer, je veux simuler une coupure de l'API IA pour garantir que la soutenance devant le jury se déroule sans crash.

Rôle responsable : Ilyass Ait Ouahman (Test and Quality)
Estimation : 5 Story Points
Échéance : 21/12/2026

Critères d'acceptation :
- Simulation de coupure réseau sans crash de l'interface
- Bascule locale instantanée validée`
    },
    {
      sprint: 4,
      summary: '[TK-14] Recette Fonctionnelle Complète & Rapport de Tests de Non-Régression',
      assigneeName: 'Ilyass Ait Ouahman',
      role: 'Test and Quality',
      points: 3,
      due: '2026-12-23',
      desc: `En tant que QA Engineer, je veux valider les 15 parcours utilisateurs et produire le rapport de recette avant livraison finale.

Rôle responsable : Ilyass Ait Ouahman (Test and Quality)
Estimation : 3 Story Points
Échéance : 23/12/2026

Critères d'acceptation :
- Validation des 15 scénarios utilisateurs clés
- Zéro anomalie bloquante`
    },
    {
      sprint: 4,
      summary: '[US-19] Démonstration Live sans Faille & Soutenance Finale du Projet',
      assigneeName: 'Moad Moussaoui',
      role: 'Scrum Master',
      points: 5,
      due: '2026-12-24',
      assignToMoad: true,
      desc: `En tant que Scrum Master, je veux clôturer le projet le 24 Décembre 2026 et conduire la soutenance avec succès devant le jury professoral.

Rôle responsable : Moad Moussaoui (Scrum Master)
Estimation : 5 Story Points
Échéance : 24/12/2026

Critères d'acceptation :
- Présentation PowerPoint et démonstration live validées
- Clôture réussie du projet le 24 Décembre 2026`
    }
  ];

  console.log(`📋 Création de ${stories.length} User Stories dans Jira...`);

  for (let i = 0; i < stories.length; i++) {
    const s = stories[i];
    const fields = {
      project: { key: 'SCRUM' },
      summary: s.summary,
      description: s.desc,
      issuetype: { name: 'Story' }
    };

    if (s.assignToMoad) {
      fields.assignee = { accountId: moadAccountId };
    }

    try {
      const res = await fetch('https://moussaoui9881.atlassian.net/rest/api/2/issue', {
        method: 'POST',
        headers,
        body: JSON.stringify({ fields })
      });

      if (res.ok) {
        const issue = await res.json();
        const sprintId = sprintMap[s.sprint];
        if (sprintId) {
          await fetch(`https://moussaoui9881.atlassian.net/rest/agile/1.0/sprint/${sprintId}/issue`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ issues: [issue.key] })
          });
        }
        console.log(`✅ [${i+1}/${stories.length}] ${issue.key} -> Sprint ${s.sprint} (${s.assigneeName} - ${s.points} pts)`);
      } else {
        const errText = await res.text();
        console.warn(`⚠️ Erreur création pour ${s.summary}:`, errText);
      }
    } catch(err) {
      console.error(`❌ Erreur sur ${s.summary}:`, err);
    }

    await sleep(200);
  }

  console.log("🎉 TOUTES LES USER STORIES ONT ÉTÉ CRÉÉES ET DÉPLOYÉES DANS LES SPRINTS JIRA !");
}

run().catch(console.error);
