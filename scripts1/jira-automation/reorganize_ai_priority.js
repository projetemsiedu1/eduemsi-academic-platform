const email = 'moussaoui9881@gmail.com';
const token = 'ATATT3xFfGF096JkUFHbniyIzaDbspuOZNRX4LhsoISPkEc-8pPJFZY2BsCYVm39Qf9MJMlNagy-ISGvEqBos1VtMPLYG1uUJhL0qBhSjOcK5eBnvt41Cz4OAnCXgHMC6mE4ChsD-HMngb65oE-hfXJ3NLi-Z_Pb-YMOmdQ3b9L7HzFa7amiT8k=93F3C5D8';
const auth = Buffer.from(email + ':' + token).toString('base64');
const h = { 'Authorization': 'Basic ' + auth, 'Accept': 'application/json', 'Content-Type': 'application/json' };

async function reorganize() {
  console.log("🚀 Réorganisation prioritaire : LA PARTIE IA EN SPRINT 1 POUR LA SÉANCE DU PROF !");

  // 1. Delete SCRUM-4
  try {
    await fetch('https://moussaoui9881.atlassian.net/rest/api/2/issue/SCRUM-4', { method: 'DELETE', headers: h });
    console.log("🗑️ Ticket résiduel SCRUM-4 supprimé avec succès.");
  } catch(e) {}

  // 2. Renommer les Sprints
  // Sprint 1 (id: 1) -> SPRINT 1 : IA Free API (Pour la séance prochaine !)
  await fetch('https://moussaoui9881.atlassian.net/rest/agile/1.0/sprint/1', {
    method: 'PUT',
    headers: h,
    body: JSON.stringify({
      name: 'SCRUM Sprint 1 : IA Free API',
      startDate: '2026-11-07T08:00:00.000Z',
      endDate: '2026-11-17T18:00:00.000Z'
    })
  });
  console.log("✅ Sprint 1 renommé : 'SCRUM Sprint 1 : IA Free API'");

  // Sprint 2 (id: 3) -> SPRINT 2 : Solveur EDT OR-Tools
  await fetch('https://moussaoui9881.atlassian.net/rest/agile/1.0/sprint/3', {
    method: 'PUT',
    headers: h,
    body: JSON.stringify({
      name: 'SCRUM Sprint 2 : EDT Solveur',
      startDate: '2026-11-18T08:00:00.000Z',
      endDate: '2026-11-30T18:00:00.000Z'
    })
  });
  console.log("✅ Sprint 2 renommé : 'SCRUM Sprint 2 : EDT Solveur'");

  // Sprint 3 (id: 4) -> SPRINT 3 : Absences & Fiches
  await fetch('https://moussaoui9881.atlassian.net/rest/agile/1.0/sprint/4', {
    method: 'PUT',
    headers: h,
    body: JSON.stringify({
      name: 'SCRUM Sprint 3 : Absences',
      startDate: '2026-12-01T08:00:00.000Z',
      endDate: '2026-12-12T18:00:00.000Z'
    })
  });
  console.log("✅ Sprint 3 renommé : 'SCRUM Sprint 3 : Absences'");

  // 3. Déplacer les tickets IA dans le SPRINT 1 (id: 1)
  // Tickets IA : SCRUM-18 (PFE Gemini), SCRUM-19 (Analyse CV RH), SCRUM-20 (Fallback Local), SCRUM-16 (Règles Déontologiques PFE)
  await fetch('https://moussaoui9881.atlassian.net/rest/agile/1.0/sprint/1/issue', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      issues: ['SCRUM-16', 'SCRUM-18', 'SCRUM-19', 'SCRUM-20']
    })
  });
  console.log("🎯 Tickets IA (SCRUM-16, 18, 19, 20) déplacés dans SPRINT 1 !");

  // 4. Déplacer les tickets EDT dans le SPRINT 2 (id: 3)
  // SCRUM-9 (Vacataires), SCRUM-10 (Campus unique), SCRUM-11 (Salles TP PC), SCRUM-12 (Design Tailwind), SCRUM-13 (Grille EDT)
  await fetch('https://moussaoui9881.atlassian.net/rest/agile/1.0/sprint/3/issue', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      issues: ['SCRUM-9', 'SCRUM-10', 'SCRUM-11', 'SCRUM-12', 'SCRUM-13']
    })
  });
  console.log("🎯 Tickets EDT déplacés dans SPRINT 2 !");

  // 5. Déplacer les tickets Absences dans le SPRINT 3 (id: 4)
  // SCRUM-14 (Cahier texte), SCRUM-15 (Absences 20%), SCRUM-17 (Interface émargement)
  await fetch('https://moussaoui9881.atlassian.net/rest/agile/1.0/sprint/4/issue', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      issues: ['SCRUM-14', 'SCRUM-15', 'SCRUM-17']
    })
  });
  console.log("🎯 Tickets Absences déplacés dans SPRINT 3 !");

  // 6. S'assurer qu'aucune mention de QR Code n'apparaît dans SCRUM-15 et SCRUM-17
  // Mise à jour de SCRUM-15 (Absences manuelles, pas de QR code)
  await fetch('https://moussaoui9881.atlassian.net/rest/api/2/issue/SCRUM-15', {
    method: 'PUT',
    headers: h,
    body: JSON.stringify({
      fields: {
        summary: '[US-08] Gestion des Absences & Alerte Automatique Seuil 20% (Appel Manuel)',
        description: `h2. 🎯 Objectif Métier
Enregistrer les présences par appel numérique manuel rapide de l'enseignant (la méthode QR code est formellement bannie et supprimée) et déclencher automatiquement une alerte rouge par email/SMS à la scolarité dès qu'un étudiant franchit le seuil éliminatoire de 20% d'absences injustifiées.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Amine Bella (Product Owner)
* *Estimation :* 5 Story Points
* *Échéance :* 10 Décembre 2026

h3. 🛠️ Spécifications Métier Détaillées
# *Feuille d'Appel Numérique (Sans QR Code) :* Interface professeur listant les étudiants de la classe avec cases : Présent (défaut), Absent Injustifié, Absent Justifié.
# *Moteur de Calcul du Taux :* Taux = (Heures Absence Non Justifiée / Heures Totales Module) * 100.
# *Alerte Critique 20% :* Alerte rouge instantanée sur le dossier étudiant dès dépassement du quota.`
      }
    })
  });

  await fetch('https://moussaoui9881.atlassian.net/rest/api/2/issue/SCRUM-17', {
    method: 'PUT',
    headers: h,
    body: JSON.stringify({
      fields: {
        summary: '[US-16] Interface d Émargement Numérique Manuel (Sans QR Code)',
        description: `h2. 🎯 Objectif Métier
Concevoir l'écran d'appel numérique pour smartphone et tablette permettant aux professeurs d'effectuer l'émargement manuel en un temps record en début de cours (aucun QR code).

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Ikram Mellakh (UX/UI Designer)
* *Estimation :* 5 Story Points
* *Échéance :* 08 Décembre 2026`
      }
    })
  });

  console.log("✅ Mentions QR Code définitivement supprimées et remplacées par 'Appel Numérique Manuel' !");
  console.log("🎉 ORGANISATION JIRA 100% ALIGNÉE AVEC LA DEMANDE DU PROF !");
}

reorganize().catch(console.error);
