# Analyse Comparative du Portail EMSI & Spécification Design System

> **Projet :** Plateforme Académique & Décisionnelle EMSI Edu (Univora)  
> **Auteurs :** Équipe d'Ingénieurs EMSI (Moad Moussaoui, Noussair Benassou, Amine Bella, Brahim Abod, Ilyass Ait Ouahman, Ikram Mellakh)  
> **Date d'Audit :** Novembre 2026  
> **Standards appliqués :** Figma Design Tokens (W3C DTCG), Atomic Design, Antigravity Glassmorphism, WCAG 2.2 Niveau AA.

---

## 1. Analyse du Portail EMSI Actuel vs Notre Solution Innovante

### 1.1 Ce qu'a le portail EMSI actuel
1. **Consultation basique des notes & relevés :** Visualisation des modules et semestres après délibération manuelle.
2. **Emploi du temps statique :** Fichiers PDF hebdomadaires mis à jour manuellement par la scolarité.
3. **Justification des absences au guichet :** Dépôt physique de certificats médicaux papier avec files d'attente à l'administration.
4. **Annonces institutionnelles :** Bannières générales pour tous les campus sans ciblage par filière.

### 1.2 Ce qui MANQUE dans le système actuel de l'EMSI (Nos 5 Piliers d'Innovation)
| # | Manque Critique du Portail EMSI Actuel | Solution Apportée par Notre Plateforme Univora | Impact Métier & Déontologique |
|---|---|---|---|
| **1** | **Aucun solveur de contraintes pour l'EDT :** Conflits fréquents de salles, vacataires planifiés sur des créneaux incompatibles, trous de 3h dans les journées étudiantes. | **Moteur Google OR-Tools (CP-SAT) :** Planification automatisée priorisant les disponibilités strictes des vacataires, garantissant la pause méridienne/15m, limitant les trous à max 1h30, et affectant obligatoirement des salles TP PC pour les filières IIR et GI. | **0 conflit d'emploi du temps**, satisfaction maximale des vacataires et rentabilité des salles PC. |
| **2** | **Affectation manuelle et opaque des jurys PFE :** Risque de conflits d'intérêt (encadrant jugeant son propre étudiant), manque d'adéquation entre le sujet et l'expertise du jury. | **Brique IA Gemini 2.0 Flash (Dual-Mode) :** Matching sémantique en langage naturel de la stack technique avec les spécialités des enseignants, bridé par la règle déontologique stricte **BR-PFE-07** (exclusion totale de l'encadrant du jury, président obligatoirement Docteur/HDR). | **Impartialité totale des soutenances**, conformité académique d'excellence. |
| **3** | **Absence de cahier de texte numérique temps réel :** La direction pédagogique ne sait pas précisément quel chapitre a été enseigné lors d'une séance. | **Fiche de Séance Post-Cours Instantanée (< 60s) :** Notification push en fin de cours invitant l'enseignant à enregistrer chapitre, objectifs pédagogiques et devoirs, consultable par les étudiants. | **Traçabilité pédagogique continue**, préparation facilitée aux examens. |
| **4** | **Gestion des absences sur papier ou via QR code frauduleux :** Feuilles papier égarées, signatures illisibles, ou partage de capture de QR code sur WhatsApp entre étudiants absents. | **Émargement Manuel Numérique Sécurisé par l'Enseignant :** Appel direct sur tablette/PC avec calcul instantané du taux d'absence cumulé non justifié. Déclenchement automatique de l'alerte dès **le seuil critique des 20%** menant à la radiation de l'examen. | **Éradication de la triche**, application juste et rigoureuse du règlement intérieur EMSI. |
| **5** | **Aucune visibilité sur les déficits d'enseignants :** Les directeurs de campus découvrent les manques d'heures en cours de semestre. | **Module Prédictif RH & Analyseur de CV IA :** Calcul automatique des heures déficitaires par filière et campus, et scoring instantané des CV reçus pour recrutement ciblé. | **Anticipation des recrutements**, 0 heure de cours non dispensée. |

---

## 2. Spécification Formelle du Design System (Figma Tokens)

### 2.1 Palette Chromatique Institutionnelle & Sémantique
```json
{
  "color": {
    "brand": {
      "emsi-green-primary": { "value": "#00843D", "type": "color", "description": "Vert officiel EMSI" },
      "emsi-green-dark": { "value": "#004D26", "type": "color", "description": "Vert émeraude profond pour sidebar & headers" },
      "emsi-green-light": { "value": "#ECFDF5", "type": "color", "description": "Surfaces actives & badges validés" },
      "emsi-gold": { "value": "#C5A572", "type": "color", "description": "Or académique EMSI d'excellence" },
      "tech-navy": { "value": "#0F172A", "type": "color", "description": "Bleu nuit pour les consoles IA et contrastes forts" }
    },
    "semantic": {
      "success": { "value": "#059669", "type": "color" },
      "warning": { "value": "#D97706", "type": "color" },
      "danger-seuil20": { "value": "#DC2626", "type": "color", "description": "Alerte seuil 20% radiation examen" },
      "info-ai": { "value": "#7C3AED", "type": "color", "description": "Accent violet pour la brique Gemini 2.0 Flash" }
    },
    "surface": {
      "background": { "value": "#F8FAFC", "type": "color" },
      "card": { "value": "#FFFFFF", "type": "color" },
      "glass": { "value": "rgba(255, 255, 255, 0.85)", "type": "color" }
    }
  }
}
```

### 2.2 Échelle Typographique & Élévation (Antigravity Feel)
- **Police Principale :** `Plus Jakarta Sans` (Poids : 400, 500, 600, 700, 800)
- **Police Technique :** `JetBrains Mono` (Pour les identifiants PFE, CNE, codes salles et scores IA)
- **Élévation Antigravité :**
  - Cartes flottantes : `box-shadow: 0 10px 25px -5px rgba(0, 77, 38, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)`
  - Modales & Tiroirs : `box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25)`
  - Flou verrier : `backdrop-filter: blur(12px)`

---

## 3. Matrice de Traçabilité des Rôles & Espaces CRUD

| Rôle Utilisateur | Compte de Démonstration | Espaces Accessibles | Actions CRUD Clés |
|---|---|---|---|
| **Super Administrateur** | `admin@emsi-edu.ma` / `admin123` | Tous les espaces + Gouvernance & RBAC | CRUD Utilisateurs, Affectation des rôles, Consultation des logs d'audit. |
| **Directeur Pédagogique / Chef de Filière** | `direction@emsi-edu.ma` / `dir123` | Planification OR-Tools, PFE IA, RH Prédictif, Délibérations | Lancement solveur EDT, Validation affectation jurys IA, Audit des déficits RH. |
| **Professeur (Permanent / Vacataire)** | `prof.benassou@emsi-edu.ma` / `prof123` | Mon Emploi du Temps, Feuille d'Appel, Cahier de Texte, Mes PFE | Saisie appel manuel (< 2 min), Remplissage fiche de séance (< 60s), Encadrement PFE. |
| **Responsable Scolarité** | `scolarite@emsi-edu.ma` / `scol123` | Gestion Salles/Campus, Alertes Absences 20%, Justificatifs | Traitement des certificats médicaux, Génération de la liste des exclus d'examen. |
| **Étudiant (5A-IIR / 5A-GI)** | `etudiant.bella@emsi-edu.ma` / `etu123` | Mon Emploi du Temps, Mes Absences & Alertes, Mon Sujet PFE | Consultation planning, Visualisation du taux d'absence, Suivi validation jury PFE. |
