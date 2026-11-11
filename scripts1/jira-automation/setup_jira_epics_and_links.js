const email = 'moussaoui9881@gmail.com';
const token = 'ATATT3xFfGF096JkUFHbniyIzaDbspuOZNRX4LhsoISPkEc-8pPJFZY2BsCYVm39Qf9MJMlNagy-ISGvEqBos1VtMPLYG1uUJhL0qBhSjOcK5eBnvt41Cz4OAnCXgHMC6mE4ChsD-HMngb65oE-hfXJ3NLi-Z_Pb-YMOmdQ3b9L7HzFa7amiT8k=93F3C5D8';
const auth = Buffer.from(email + ':' + token).toString('base64');
const h = { 'Authorization': 'Basic ' + auth, 'Accept': 'application/json', 'Content-Type': 'application/json' };

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function setup() {
  console.log("🚀 Structuration des Epics et liaison hiérarchique professionnelle dans Jira...");

  const epicsToCreate = [
    { key: 'SCRUM-25', name: 'EPIC 1 : Briques d Intelligence Artificielle & Jurys PFE' }, // already exists
    { idTag: 'e2', name: 'EPIC 2 : Moteur Solveur d Emploi du Temps OR-Tools', desc: 'Solveur CP-SAT 2-passes, priorité stricte vacataires, campus unique et salles TP PC.' },
    { idTag: 'e3', name: 'EPIC 3 : Émargement Manuel, Cahier de Texte & Gestion des Absences', desc: 'Feuille d appel manuelle sans QR code, fiches post-cours et alerte rouge au seuil de 20%.' },
    { idTag: 'e4', name: 'EPIC 4 : Interface Utilisateur Angular 18 Standalone & Tailwind', desc: 'Design System EMSI, grille hebdomadaire interactive responsive et tableaux de bord.' },
    { idTag: 'e5', name: 'EPIC 5 : Cadrage Agile, Gouvernance RBAC & Traçabilité JPA', desc: 'Matrice des 4 rôles, sécurité Spring Security 6 et logs d audit immuables.' },
    { idTag: 'e6', name: 'EPIC 6 : Ingénierie DevOps, Conteneurisation Docker & CI/CD', desc: 'Organisation GitHub, dépôts protégés, Docker Compose et pipelines d intégration continue.' },
    { idTag: 'e7', name: 'EPIC 7 : Assurance Qualité, Tests TDD & Soutenance Finale', desc: 'Tests unitaires JUnit 5, validation du fallback lors des pannes IA et soutenance du 24/12/2026.' }
  ];

  const epicMap = {
    'e1': 'SCRUM-25'
  };

  for (let e of epicsToCreate) {
    if (e.key) continue;
    try {
      const res = await fetch('https://moussaoui9881.atlassian.net/rest/api/2/issue', {
        method: 'POST',
        headers: h,
        body: JSON.stringify({
          fields: {
            project: { key: 'SCRUM' },
            summary: e.name,
            description: e.desc,
            issuetype: { name: 'Epic' }
          }
        })
      });
      const data = await res.json();
      epicMap[e.idTag] = data.key;
      console.log(`✅ [Epic Créée] ${data.key} : ${e.name}`);
    } catch(err) {
      console.error("Erreur création epic:", err);
    }
    await sleep(200);
  }

  // Association des User Stories à leurs Epics parentes
  const links = [
    // EPIC 1 (IA & Jurys)
    { story: 'SCRUM-16', epic: epicMap['e1'] },
    { story: 'SCRUM-18', epic: epicMap['e1'] },
    { story: 'SCRUM-19', epic: epicMap['e1'] },
    { story: 'SCRUM-20', epic: epicMap['e1'] },

    // EPIC 2 (OR-Tools EDT)
    { story: 'SCRUM-9',  epic: epicMap['e2'] },
    { story: 'SCRUM-10', epic: epicMap['e2'] },
    { story: 'SCRUM-11', epic: epicMap['e2'] },

    // EPIC 3 (Absences & Cahier)
    { story: 'SCRUM-14', epic: epicMap['e3'] },
    { story: 'SCRUM-15', epic: epicMap['e3'] },
    { story: 'SCRUM-17', epic: epicMap['e3'] },

    // EPIC 4 (Angular 18 UI)
    { story: 'SCRUM-12', epic: epicMap['e4'] },
    { story: 'SCRUM-13', epic: epicMap['e4'] },

    // EPIC 5 (Gouvernance & Scrum)
    { story: 'SCRUM-5',  epic: epicMap['e5'] },
    { story: 'SCRUM-8',  epic: epicMap['e5'] },

    // EPIC 6 (DevOps)
    { story: 'SCRUM-6',  epic: epicMap['e6'] },
    { story: 'SCRUM-7',  epic: epicMap['e6'] },

    // EPIC 7 (QA & Soutenance)
    { story: 'SCRUM-21', epic: epicMap['e7'] },
    { story: 'SCRUM-22', epic: epicMap['e7'] },
    { story: 'SCRUM-23', epic: epicMap['e7'] },
    { story: 'SCRUM-24', epic: epicMap['e7'] }
  ];

  for (let l of links) {
    try {
      await fetch(`https://moussaoui9881.atlassian.net/rest/api/2/issue/${l.story}`, {
        method: 'PUT',
        headers: h,
        body: JSON.stringify({
          fields: {
            parent: { key: l.epic }
          }
        })
      });
      console.log(`🔗 ${l.story} rattaché à son Epic ${l.epic}`);
    } catch(err) {
      console.error(`Erreur liaison ${l.story}:`, err);
    }
    await sleep(150);
  }

  console.log("🎉 HIÉRARCHIE SCRUM PRO COMPLÈTEMENT CONFIGURÉE DANS JIRA !");
}

setup().catch(console.error);
