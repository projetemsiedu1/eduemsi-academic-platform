// Script de création automatique des User Stories pour Jira Cloud
// À coller directement dans la Console (F12) sur https://moussaoui9881.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog

(async function createAllJiraStories() {
    console.log("🚀 Démarrage de la création des User Stories EMSI dans Jira...");

    const stories = [
        // SPRINT 0
        {
            summary: "[US-04] Gouvernance Hiérarchique à 4 Niveaux & Matrice RBAC",
            desc: "En tant que SuperAdmin, je veux créer les comptes Directeurs, Responsables de filière et Planificateurs avec traçabilité complète JPA (AuditLog).\n\nCritères d'acceptation :\n- 4 niveaux d'accès configurés (SuperAdmin, Directeur, Responsable Filière, Planificateur)\n- Traçabilité immuable dans PostgreSQL\n- Échéance : 10 Nov 2026\n- Assigné : Moad Moussaoui (Scrum Master)\n- Estimation : 5 Story Points"
        },
        {
            summary: "[US-09] Configuration Organisation GitHub & Repositories Officiels",
            desc: "En tant que DevOps, je veux configurer l'organisation GitHub eduemsiproject et les règles de protection des branches main/develop.\n\nCritères d'acceptation :\n- Organisation GitHub opérationnelle\n- Protection de la branche main activée\n- Échéance : 08 Nov 2026\n- Assigné : Brahim Abod (DevOps)\n- Estimation : 5 Story Points"
        },
        {
            summary: "[US-10] Conteneurisation Docker Compose (PostgreSQL, Spring, Angular)",
            desc: "En tant que Développeur, je veux démarrer tout l'environnement (Postgres 16, Spring Boot 3, Angular 18) en une commande.\n\nCritères d'acceptation :\n- docker compose up lance tous les services sans conflit de ports\n- Échéance : 11 Nov 2026\n- Assigné : Brahim Abod (DevOps)\n- Estimation : 5 Story Points"
        },
        {
            summary: "[US-05] Pilotage du Backlog Scrum & Cérémonies de Synchronisation",
            desc: "En tant que Scrum Master, je veux piloter la vélocité et l'avancement de l'équipe de 6 jusqu'au 24 Décembre 2026.\n\nCritères d'acceptation :\n- Burndown chart configuré\n- Rituels Daily Scrum et revues planifiés\n- Échéance : 13 Nov 2026\n- Assigné : Moad Moussaoui (Scrum Master)\n- Estimation : 3 Story Points"
        },

        // SPRINT 1
        {
            summary: "[US-01] Solveur OR-Tools avec Priorité Absolue aux Vacataires",
            desc: "En tant que Planificateur, je veux que les professeurs vacataires soient placés en priorité stricte sur leurs créneaux stricts avant les permanents.\n\nCritères d'acceptation :\n- Modèle CP-SAT Google OR-Tools en Java 21\n- Zéro conflit sur les créneaux vacataires\n- Échéance : 20 Nov 2026\n- Assigné : Noussair Benassou (Technical Lead)\n- Estimation : 8 Story Points"
        },
        {
            summary: "[US-02] Contrainte Campus Unique par Jour et Pauses Réglementaires",
            desc: "En tant qu'Étudiant, je veux étudier sur le même campus toute la journée avec 15m de pause le matin et 1h30 max de trou méridien.\n\nCritères d'acceptation :\n- Interdiction de déplacement inter-campus le même jour\n- Pause fixe 10h-10h15\n- Trou de midi <= 90 minutes\n- Échéance : 22 Nov 2026\n- Assigné : Noussair Benassou (Technical Lead)\n- Estimation : 5 Story Points"
        },
        {
            summary: "[US-03] Affectation Obligatoire des Salles TP PC (IIR & Industriel)",
            desc: "En tant que Chef de Filière, je veux que tout TP informatique ou industriel soit obligatoirement affecté dans une salle labo avec PC.\n\nCritères d'acceptation :\n- Vérification de l'attribut hasComputers de la salle\n- Bloquer l'affectation en salle classique\n- Échéance : 24 Nov 2026\n- Assigné : Noussair Benassou (Technical Lead)\n- Estimation : 5 Story Points"
        },
        {
            summary: "[US-14] Design System Tailwind CSS & Thème Visuel EMSI Campus",
            desc: "En tant que Designer UI/UX, je veux définir la charte graphique EMSI (Vert émeraude #059669 et Bleu Marine) et les tokens Tailwind.\n\nCritères d'acceptation :\n- Palette conforme à l'EMSI\n- Composants Angular Standalone réutilisables\n- Échéance : 16 Nov 2026\n- Assigné : Ikram Mellakh (UX/UI Designer)\n- Estimation : 5 Story Points"
        },
        {
            summary: "[US-15] Grille Hebdomadaire d'Emploi du Temps Interactive & Filtrable",
            desc: "En tant qu'Utilisateur, je veux consulter la grille EDT par classe, filière et campus avec mise en valeur des séances TP PC.\n\nCritères d'acceptation :\n- Composant responsive Angular 18\n- Badges visuels pour les laboratoires TP\n- Échéance : 22 Nov 2026\n- Assigné : Ikram Mellakh (UX/UI Designer)\n- Estimation : 8 Story Points"
        },

        // SPRINT 2
        {
            summary: "[US-07] Cahier de Texte Numérique & Notification Post-Séance",
            desc: "En tant qu'Enseignant, je veux recevoir une alerte dès la fin de mon cours pour renseigner la fiche de séance (objectifs, chapitres, devoirs).\n\nCritères d'acceptation :\n- Notification automatique en fin de créneau\n- Formulaire de fiche de séance horodaté\n- Échéance : 02 Déc 2026\n- Assigné : Amine Bella (Product Owner)\n- Estimation : 5 Story Points"
        },
        {
            summary: "[US-08] Gestion des Absences & Alerte Automatique Seuil 20%",
            desc: "En tant que Responsable Scolarité, je veux enregistrer les présences par appel numérique et recevoir une alerte rouge dès 20% d'absences.\n\nCritères d'acceptation :\n- Appel numérique enseignant par séance\n- Calcul temps réel du taux d'absence\n- Alerte scolarité au seuil 20%\n- Échéance : 05 Déc 2026\n- Assigné : Amine Bella (Product Owner)\n- Estimation : 5 Story Points"
        },
        {
            summary: "[US-06] Spécification Déontologique des Jurys de Soutenance PFE",
            desc: "En tant que Product Owner, je veux interdire formellement qu'un encadrant soit président ou rapporteur de son propre étudiant.\n\nCritères d'acceptation :\n- Règle d'exclusion mutuelle stricte\n- Détection automatique de conflit d'intérêt\n- Échéance : 28 Nov 2026\n- Assigné : Amine Bella (Product Owner)\n- Estimation : 5 Story Points"
        },
        {
            summary: "[US-16] Interface d'Émargement Numérique & Fiches d'Appel",
            desc: "En tant qu'Enseignant, je veux une interface mobile-first simple et ergonomique pour pointer les présences et vérifier les justificatifs.\n\nCritères d'acceptation :\n- Écran rapide avec cases Présent/Absent/Justifié\n- Échéance : 04 Déc 2026\n- Assigné : Ikram Mellakh (UX/UI Designer)\n- Estimation : 5 Story Points"
        },

        // SPRINT 3
        {
            summary: "[US-17] Intégration Google Gemini 2.0 Flash API (Free Tier) pour Jurys PFE",
            desc: "En tant que Développeur IA, je veux que l'IA propose la composition optimale du jury PFE (Président, Rapporteur) selon les compétences.\n\nCritères d'acceptation :\n- Appel API Gemini 2.0 Flash avec prompt contraint\n- Vérification stricte des conflits d'intérêt\n- Échéance : 10 Déc 2026\n- Assigné : Noussair Benassou (Technical Lead)\n- Estimation : 8 Story Points"
        },
        {
            summary: "[US-18] Analyse Prédictive RH des CV & Détection des Déficits Filières",
            desc: "En tant que Directeur, je veux une analyse IA des CV pour identifier les manques d'enseignants permanents ou vacataires par branche.\n\nCritères d'acceptation :\n- Extraction sémantique des compétences\n- Tableau de bord des déficits par filière (IIR, GC, GI, GE)\n- Échéance : 14 Déc 2026\n- Assigné : Noussair Benassou (Technical Lead)\n- Estimation : 8 Story Points"
        },
        {
            summary: "[TK-17] Client REST Java 21 avec Dual-Mode & Fallback Heuristique Local",
            desc: "En tant que Tech Lead, je veux un fallback local transparent pour que le système continue de fonctionner même en coupure internet.\n\nCritères d'acceptation :\n- Bascule automatique vers le moteur local sans erreur 500\n- Échéance : 08 Déc 2026\n- Assigné : Noussair Benassou (Technical Lead)\n- Estimation : 5 Story Points"
        },

        // SPRINT 4
        {
            summary: "[US-12] Suite de Tests Unitaires JUnit 5 pour le Solveur EDT",
            desc: "En tant que QA Engineer, je veux tester automatiquement que l'emploi du temps respecte 100% des contraintes académiques.\n\nCritères d'acceptation :\n- Tests du non-chevauchement des professeurs et salles\n- Validation de la priorité vacataires\n- Échéance : 18 Déc 2026\n- Assigné : Ilyass Ait Ouahman (Test & Quality)\n- Estimation : 5 Story Points"
        },
        {
            summary: "[US-13] Protocole de Validation du Fallback Heuristique en Démo",
            desc: "En tant que QA Engineer, je veux simuler une coupure de l'API IA pour garantir que la soutenance devant le jury se déroule sans crash.\n\nCritères d'acceptation :\n- Test de coupure réseau réussi\n- Algorithme de secours opérationnel\n- Échéance : 21 Déc 2026\n- Assigné : Ilyass Ait Ouahman (Test & Quality)\n- Estimation : 5 Story Points"
        },
        {
            summary: "[TK-14] Recette Fonctionnelle Complète & Rapport de Tests Globaux",
            desc: "En tant que QA Engineer, je veux valider les 15 parcours utilisateurs et produire le rapport de recette avant livraison finale.\n\nCritères d'acceptation :\n- Zéro anomalie bloquante\n- Rapport de test formalisé\n- Échéance : 23 Déc 2026\n- Assigné : Ilyass Ait Ouahman (Test & Quality)\n- Estimation : 3 Story Points"
        },
        {
            summary: "[US-19] Bilan Final, Démonstration Live & Soutenance Réussie",
            desc: "En tant que Scrum Master, je veux clôturer le projet le 24 Décembre 2026 et conduire la soutenance avec succès devant le professeur.\n\nCritères d'acceptation :\n- Présentation finale prête\n- Démonstration complète sans faille\n- Échéance : 24 Déc 2026\n- Assigné : Moad Moussaoui (Scrum Master)\n- Estimation : 5 Story Points"
        }
    ];

    let created = 0;
    for (let item of stories) {
        try {
            const res = await fetch("/rest/api/2/issue", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Atlassian-Token": "no-check"
                },
                body: JSON.stringify({
                    fields: {
                        project: { key: "SCRUM" },
                        summary: item.summary,
                        description: item.desc,
                        issuetype: { name: "Story" }
                    }
                })
            });

            if (res.ok) {
                const data = await res.json();
                created++;
                console.log(`✅ [${created}/${stories.length}] Créé avec succès : ${data.key} - ${item.summary}`);
            } else {
                console.warn(`⚠️ Erreur création (${res.status}) pour : ${item.summary}`);
            }
        } catch (e) {
            console.error("Erreur réseau :", e);
        }
        // Petite pause de 250ms pour fluidité
        await new Promise(r => setTimeout(r, 250));
    }

    console.log(`🎉 Terminé ! ${created} User Stories ont été créées dans votre projet Jira SCRUM !`);
    console.log("Rafraîchissement du backlog dans 2 secondes...");
    setTimeout(() => window.location.reload(), 2000);
})();
