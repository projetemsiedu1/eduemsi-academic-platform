const email = 'moussaoui9881@gmail.com';
const token = 'ATATT3xFfGF096JkUFHbniyIzaDbspuOZNRX4LhsoISPkEc-8pPJFZY2BsCYVm39Qf9MJMlNagy-ISGvEqBos1VtMPLYG1uUJhL0qBhSjOcK5eBnvt41Cz4OAnCXgHMC6mE4ChsD-HMngb65oE-hfXJ3NLi-Z_Pb-YMOmdQ3b9L7HzFa7amiT8k=93F3C5D8';
const auth = Buffer.from(email + ':' + token).toString('base64');
const moadAccountId = '712020:aaf55393-18d8-46c0-8c49-5067bc16e605';

const h = { 'Authorization': 'Basic ' + auth, 'Accept': 'application/json', 'Content-Type': 'application/json' };

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function planSprint1() {
  console.log("🚀 Planification du Sprint 1 IA : 5 JOURS JUSQU'AU MERCREDI 11 NOVEMBRE 2026 !");

  // 1. Mettre à jour les dates et le nom du Sprint 1
  try {
    const resSprint = await fetch('https://moussaoui9881.atlassian.net/rest/agile/1.0/sprint/1', {
      method: 'PUT',
      headers: h,
      body: JSON.stringify({
        name: 'Sprint 1 : IA Gemini Démo Prof',
        startDate: '2026-11-06T20:00:00.000Z',
        endDate: '2026-11-11T18:00:00.000Z',
        goal: 'Démonstration sans faille de l\'IA devant le professeur le Mercredi 11 Novembre 2026 : Matching PFE Gemini 2.0 Flash, analyse CV RH et basculement automatique sur le fallback heuristique local en cas de coupure réseau.'
      })
    });
    console.log("📅 Sprint 1 mis à jour avec échéance stricte au MERCREDI 11 NOVEMBRE 2026 (Status: " + resSprint.status + ")");
  } catch(e) { console.error("Erreur update sprint 1:", e); }

  // 2. Créer les tickets indispensables manquants pour la démo
  const newTickets = [
    {
      summary: '[US-20] Interface Interactive Angular de Démonstration IA (PFE & CV)',
      desc: `h2. 🎯 Objectif Métier
Concevoir l'écran frontend Angular 18 interactif permettant au professeur de tester en direct lors de la séance du Mercredi 11 Novembre :
1. La sélection d'un sujet PFE et le clic sur "Lancer l'affectation IA (Gemini 2.0 Flash)".
2. L'affichage instantané de la recommandation (Président, Rapporteur, score de pertinence, explications).
3. Le badge vert "Conformité Déontologique Certifiée".
4. L'analyseur de CV interactif avec détection des spécialités manquantes.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Ikram Mellakh (UX/UI Designer)
* *Sprint :* Sprint 1 (IA Gemini Démo Prof)
* *Estimation :* 5 Story Points
* *Échéance :* Mardi 10 Novembre 2026 (veille de la séance)

h3. 🛠️ Ce que la designer doit coder
# Composant Angular 18 Standalone {{PfeAiDemoComponent}}.
# Formulaire dynamique avec liste déroulante des sujets PFE.
# Animation de chargement moderne (loader IA pulsant).
# Cartes des enseignants recommandés avec photos et compétences clés.`,
      epic: 'SCRUM-25'
    },
    {
      summary: '[TK-18] Jeu d Essai PFE Réel & Protocole Démo Coupure Réseau IA',
      desc: `h2. 🎯 Objectif Métier
Préparer les données concrètes de l'EMSI et le protocole de crash-test pour impressionner le professeur :
1. Jeu de 10 mémoires PFE réels (Deep Learning, IoT, BIM, Cybersécurité) avec encadrants rattachés.
2. Profils de 15 professeurs permanents et vacataires avec leurs spécialités.
3. Test de robustesse : simuler la coupure du WiFi pendant la séance pour prouver que le système bascule sur le fallback local Jaccard en 40ms sans aucune erreur 500.

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Ilyass Ait Ouahman (Test and Quality)
* *Sprint :* Sprint 1 (IA Gemini Démo Prof)
* *Estimation :* 3 Story Points
* *Échéance :* Mardi 10 Novembre 2026`,
      epic: 'SCRUM-25'
    },
    {
      summary: '[TK-19] Répétition Générale & Déroulé Chronologique Soutenance Professeur',
      desc: `h2. 🎯 Objectif Métier
Scénariser et chronométrer la démonstration de 10 minutes devant le professeur le Mercredi 11 Novembre 2026 :
- Minute 0 à 2 : Introduction et démarche Scrum du sprint commando de 5 jours (Moad Moussaoui).
- Minute 2 à 5 : Démonstration live du prompt Gemini 2.0 Flash et matching PFE sans conflit (Noussair Benassou).
- Minute 5 à 7 : Test de coupure réseau et validation du fallback heuristique local (Ilyass Ait Ouahman).
- Minute 7 à 9 : Analyse prédictive RH des CV et détection des déficits filières (Amine Bella & Ikram Mellakh).
- Minute 9 à 10 : Questions-réponses et feuille de route Sprint 2 (EDT OR-Tools).

h3. 👤 Membre & Rôle Dédié
* *Responsable :* Moad Moussaoui (Scrum Master)
* *Sprint :* Sprint 1 (IA Gemini Démo Prof)
* *Estimation :* 2 Story Points
* *Échéance :* Mercredi 11 Novembre 2026`,
      epic: 'SCRUM-25',
      assignToMoad: true
    }
  ];

  for (let t of newTickets) {
    try {
      const fields = {
        project: { key: 'SCRUM' },
        summary: t.summary,
        description: t.desc,
        issuetype: { name: 'Story' },
        parent: { key: t.epic }
      };

      if (t.assignToMoad) {
        fields.assignee = { accountId: moadAccountId };
      }

      const res = await fetch('https://moussaoui9881.atlassian.net/rest/api/2/issue', {
        method: 'POST',
        headers: h,
        body: JSON.stringify({ fields })
      });

      if (res.ok) {
        const iss = await res.json();
        // Move to Sprint 1
        await fetch('https://moussaoui9881.atlassian.net/rest/agile/1.0/sprint/1/issue', {
          method: 'POST',
          headers: h,
          body: JSON.stringify({ issues: [iss.key] })
        });
        console.log(`✅ Ticket créé et placé dans Sprint 1 : ${iss.key} - ${t.summary}`);
      }
    } catch(err) {
      console.error("Erreur création ticket:", err);
    }
    await sleep(200);
  }

  console.log("🎉 SPRINT 1 PARFAITEMENT VERROUILLÉ POUR LA SÉANCE DE MERCREDI PROCHAIN !");
}

planSprint1().catch(console.error);
