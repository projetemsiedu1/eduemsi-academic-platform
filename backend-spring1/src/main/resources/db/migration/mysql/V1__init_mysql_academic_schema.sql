-- ====================================================================
-- EMSI ACADEMIC PLATFORM (CAMPUS ERP) - FLYWAY V1 MYSQL SCHEMA
-- Moteur de Base de Données Cible : MySQL 8.0+ (InnoDB, UTF-8 MB4)
-- Auteur : Équipe d'Ingénierie EMSI (Moad Moussaoui & Team)
-- ====================================================================

-- 1. INFRASTRUCTURE & CAMPUS
CREATE TABLE IF NOT EXISTS campuses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    adresse VARCHAR(255) NOT NULL,
    ville VARCHAR(100) NOT NULL DEFAULT 'Marrakech',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS salles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    campus_id BIGINT NOT NULL,
    code_salle VARCHAR(50) NOT NULL UNIQUE,
    type_salle VARCHAR(50) NOT NULL, -- LI_PC, LR_RESEAUX, STANDARD, AMPHI
    capacite INT NOT NULL,
    nombre_pc_operationnels INT NOT NULL DEFAULT 0,
    specs_equipements TEXT,
    horaires_ouverture VARCHAR(100) DEFAULT 'Séances S1 à S6 (08h30 - 18h45)',
    est_disponible BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_salles_campus FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE CASCADE,
    INDEX idx_salles_campus (campus_id),
    INDEX idx_salles_type (type_salle),
    INDEX idx_salles_capacite (capacite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. STRUCTURE PÉDAGOGIQUE, FILIÈRES & GROUPES
CREATE TABLE IF NOT EXISTS filieres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE, -- IIR, GI, GC, IFA
    libelle VARCHAR(150) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS groupes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    filiere_id BIGINT NOT NULL,
    campus_fixe_id BIGINT NOT NULL, -- RÈGLE ABSOLUE DU CAMPUS FIXE (1 groupe = 1 campus)
    code_groupe VARCHAR(50) NOT NULL UNIQUE, -- ex: 2DSI G3, 2DSI G1, GL G2
    annee_etude INT NOT NULL CHECK (annee_etude BETWEEN 1 AND 5),
    option_specialite VARCHAR(150),
    effectif INT NOT NULL, -- Effectif réel vérifié vs capacité de salle
    delegue_nom VARCHAR(150),
    laboratoires_requis VARCHAR(100) DEFAULT 'LI_PC',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_groupes_filiere FOREIGN KEY (filiere_id) REFERENCES filieres(id) ON DELETE CASCADE,
    CONSTRAINT fk_groupes_campus_fixe FOREIGN KEY (campus_fixe_id) REFERENCES campuses(id) ON DELETE RESTRICT,
    INDEX idx_groupes_campus_fixe (campus_fixe_id),
    INDEX idx_groupes_filiere (filiere_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CORPS PROFESSORAL (ENSEIGNANTS VACATAIRES VS PERMANENTS)
CREATE TABLE IF NOT EXISTS enseignants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(50),
    specialite VARCHAR(150),
    type_contrat VARCHAR(50) NOT NULL, -- PERMANENT (18h) ou VACATAIRE (Priorité 1)
    heures_contractuelles_semaine INT NOT NULL DEFAULT 18,
    disponibilites_fixes_json TEXT, -- Plages horaires rigides sanctuarisées pour vacataires
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_enseignants_contrat (type_contrat),
    INDEX idx_enseignants_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ÉTUDIANTS
CREATE TABLE IF NOT EXISTS etudiants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(50),
    groupe_id BIGINT NOT NULL,
    total_heures_module_semestre DECIMAL(5,2) NOT NULL DEFAULT 90.00,
    cumul_heures_absence DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    est_radie_examen BOOLEAN NOT NULL DEFAULT FALSE, -- Règle des 20%
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_etudiants_groupe FOREIGN KEY (groupe_id) REFERENCES groupes(id) ON DELETE RESTRICT,
    INDEX idx_etudiants_groupe (groupe_id),
    INDEX idx_etudiants_matricule (matricule)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. MODULES & ÉLÉMENTS DE MODULE
CREATE TABLE IF NOT EXISTS modules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    filiere_id BIGINT NOT NULL,
    code_module VARCHAR(50) NOT NULL UNIQUE,
    intitule VARCHAR(150) NOT NULL,
    semestre VARCHAR(10) NOT NULL DEFAULT 'S1', -- S1, S2
    volume_horaire_total INT NOT NULL DEFAULT 90,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_modules_filiere FOREIGN KEY (filiere_id) REFERENCES filieres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS elements_module (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    module_id BIGINT NOT NULL,
    code_element VARCHAR(50) NOT NULL UNIQUE,
    intitule VARCHAR(150) NOT NULL,
    type_salle_requis VARCHAR(50) NOT NULL DEFAULT 'STANDARD', -- LI_PC, LR_RESEAUX, STANDARD
    volume_horaire INT NOT NULL DEFAULT 45,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_elements_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SÉANCES & EMPLOI DU TEMPS (SOLVEUR CP-SAT OR-TOOLS)
CREATE TABLE IF NOT EXISTS seances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    groupe_id BIGINT NOT NULL,
    salle_id BIGINT NOT NULL,
    enseignant_id BIGINT NOT NULL,
    element_module_id BIGINT NOT NULL,
    jour_semaine VARCHAR(20) NOT NULL, -- LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI
    numero_creneau VARCHAR(20) NOT NULL, -- S1_08H30, S2_10H15, S3_12H00, S4_13H45, S5_15H30, S6_17H15
    span_seances INT NOT NULL DEFAULT 1, -- 1 pour 1h30, 2 pour 3h00 consécutives
    statut_affectation VARCHAR(50) NOT NULL DEFAULT 'OPTIMAL_CPSAT',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_seances_groupe FOREIGN KEY (groupe_id) REFERENCES groupes(id) ON DELETE CASCADE,
    CONSTRAINT fk_seances_salle FOREIGN KEY (salle_id) REFERENCES salles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_seances_enseignant FOREIGN KEY (enseignant_id) REFERENCES enseignants(id) ON DELETE RESTRICT,
    CONSTRAINT fk_seances_element FOREIGN KEY (element_module_id) REFERENCES elements_module(id) ON DELETE CASCADE,
    UNIQUE KEY uk_seance_salle_jour_creneau (salle_id, jour_semaine, numero_creneau),
    UNIQUE KEY uk_seance_groupe_jour_creneau (groupe_id, jour_semaine, numero_creneau),
    UNIQUE KEY uk_seance_enseignant_jour_creneau (enseignant_id, jour_semaine, numero_creneau),
    INDEX idx_seances_groupe_jour (groupe_id, jour_semaine)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ÉMARGEMENT, ABSENCES & RÈGLE DU SEUIL DES 20%
CREATE TABLE IF NOT EXISTS absences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id BIGINT NOT NULL,
    seance_id BIGINT NOT NULL,
    date_seance DATE NOT NULL,
    statut VARCHAR(30) NOT NULL DEFAULT 'ABSENT_NON_JUSTIFIE', -- PRESENT, ABSENT_NON_JUSTIFIE, ABSENT_JUSTIFIE, RETARD
    heures_absence DECIMAL(4,2) NOT NULL DEFAULT 1.50,
    motif_justification TEXT,
    date_justification DATE,
    valide_par_scolarite BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_absences_etudiant FOREIGN KEY (etudiant_id) REFERENCES etudiants(id) ON DELETE CASCADE,
    CONSTRAINT fk_absences_seance FOREIGN KEY (seance_id) REFERENCES seances(id) ON DELETE CASCADE,
    INDEX idx_absences_etudiant (etudiant_id),
    INDEX idx_absences_seance (seance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. PFE & JURYS OFFICIELS À 4 MEMBRES (GEMINI 2.0 FLASH MATCHING)
CREATE TABLE IF NOT EXISTS pfe_projets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    filiere_id BIGINT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    resume TEXT NOT NULL,
    technologies_cles VARCHAR(255),
    binome_etudiants VARCHAR(255) NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'EN_ATTENTE_JURY', -- SOUMIS, EN_ATTENTE_JURY, JURY_AFFECTE, SOUTENU
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pfe_filiere FOREIGN KEY (filiere_id) REFERENCES filieres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pfe_jurys (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pfe_projet_id BIGINT NOT NULL UNIQUE,
    encadrant_id BIGINT NOT NULL,
    rapporteur_id BIGINT NOT NULL,
    examinateur_ia_id BIGINT NOT NULL, -- Recommandé par Gemini 2.0 Flash
    president_hdr_id BIGINT NOT NULL, -- Docteur / HDR obligatoire
    salle_soutenance_id BIGINT,
    date_soutenance DATETIME,
    score_affinite_ia DECIMAL(4,2) DEFAULT 0.95,
    justification_ia TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_jury_pfe FOREIGN KEY (pfe_projet_id) REFERENCES pfe_projets(id) ON DELETE CASCADE,
    CONSTRAINT fk_jury_encadrant FOREIGN KEY (encadrant_id) REFERENCES enseignants(id) ON DELETE RESTRICT,
    CONSTRAINT fk_jury_rapporteur FOREIGN KEY (rapporteur_id) REFERENCES enseignants(id) ON DELETE RESTRICT,
    CONSTRAINT fk_jury_examinateur FOREIGN KEY (examinateur_ia_id) REFERENCES enseignants(id) ON DELETE RESTRICT,
    CONSTRAINT fk_jury_president FOREIGN KEY (president_hdr_id) REFERENCES enseignants(id) ON DELETE RESTRICT,
    CONSTRAINT fk_jury_salle FOREIGN KEY (salle_soutenance_id) REFERENCES salles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SEED DATA RÉALISTE POUR L'EMSI MARRAKECH (TARGA & GUÉLIZ)
-- ====================================================================
INSERT INTO campuses (id, nom, adresse, ville) VALUES 
(1, 'Campus Targa', 'Boulevard Al Qods, Targa', 'Marrakech'),
(2, 'Campus Centre Gueliz', 'Avenue Hassan II, Guéliz', 'Marrakech')
ON DUPLICATE KEY UPDATE nom=VALUES(nom);

INSERT INTO filieres (id, code, libelle) VALUES
(1, '5A-IIR', 'Ingénierie Informatique et Réseaux (5ème Année)'),
(2, '4A-IIR', 'Ingénierie Informatique et Réseaux (4ème Année)'),
(3, '5A-GI', 'Génie Industriel (5ème Année)'),
(4, '5A-IFA', 'Ingénierie des Systèmes Embarqués & Automatique')
ON DUPLICATE KEY UPDATE code=VALUES(code);

INSERT INTO groupes (id, filiere_id, campus_fixe_id, code_groupe, annee_etude, option_specialite, effectif, delegue_nom, laboratoires_requis) VALUES
(1, 1, 1, '2DSI G3', 5, 'Développement Digital & Systèmes d''Information', 32, 'Ilyass Ait Ouahman', 'LI_PC,LR_RESEAUX'),
(2, 1, 1, '2DSI G1', 5, 'Développement Digital & Systèmes d''Information', 35, 'Amine Bella', 'LI_PC,LR_RESEAUX'),
(3, 1, 1, 'GL G2', 5, 'Génie Logiciel & Architecture Cloud', 34, 'Sara El Mansouri', 'LI_PC'),
(4, 3, 2, '5A-GI G1', 5, 'Supply Chain 4.0 & Logistique', 27, 'Ikram Mellakh', 'LI_PC')
ON DUPLICATE KEY UPDATE code_groupe=VALUES(code_groupe);

INSERT INTO salles (id, campus_id, code_salle, type_salle, capacite, nombre_pc_operationnels, specs_equipements) VALUES
(1, 1, 'LI 8', 'LI_PC', 38, 36, '36 PC Dell i7 32GB RAM + GPU RTX 4080 (JEE Microservices, BD)'),
(2, 1, 'LI 3', 'LI_PC', 36, 34, '34 PC Dell i7 32GB RAM + CUDA GPU (Deep Learning, Vision AI)'),
(3, 1, 'LI 4', 'LI_PC', 38, 35, '35 PC HP 16GB RAM SSD 1To (Optimisation Bases de données)'),
(4, 1, 'LR Targa', 'LR_RESEAUX', 36, 32, '32 PC + Baies Cisco Switch 2960 & Routeurs 2901 (DevOps, Big Data, Flutter)'),
(5, 1, 'Salle R', 'STANDARD', 42, 0, 'Salle de cours interactif + Vidéoprojecteur 4K (Soft Skills & Employabilité)'),
(6, 1, 'Salle S', 'STANDARD', 40, 0, 'Salle de cours standard (Gouvernance des SI)'),
(7, 1, 'Salle H1', 'STANDARD', 35, 0, 'Salle Multimédia & Langues (Business English)'),
(8, 1, 'Salle I1', 'STANDARD', 36, 0, 'Salle Collaborative Dev (Projet Collaboratif DevOps)'),
(9, 1, 'Salle M', 'STANDARD', 45, 0, 'Salle de Soutenance & Communication Professionnelle PFE'),
(10, 1, 'Salle F1', 'STANDARD', 40, 0, 'Salle ERP & Gestion des flux d''entreprise'),
(11, 2, 'LR Centre', 'LR_RESEAUX', 35, 30, '30 PC + Baies Cisco Réseaux Campus Centre'),
(12, 2, 'LI 2 Centre', 'LI_PC', 35, 32, '32 PC Stations CAO (Génie Industriel)')
ON DUPLICATE KEY UPDATE code_salle=VALUES(code_salle);

INSERT INTO enseignants (id, matricule, nom, prenom, email, telephone, specialite, type_contrat, heures_contractuelles_semaine, disponibilites_fixes_json) VALUES
(1, 'ENS-VAC-01', 'Alami', 'Karim', 'karim.alami@emsi-edu.ma', '0661000001', 'Cloud, Deep Learning & DevOps', 'VACATAIRE', 12, '{"jours": ["MARDI", "JEUDI"], "plages": ["08h30-11h45"]}'),
(2, 'ENS-PERM-02', 'Benassou', 'Noussair', 'noussair.benassou@emsi-edu.ma', '0661000002', 'Java, Spring Boot, Microservices', 'PERMANENT', 18, NULL),
(3, 'ENS-PERM-03', 'Tazi', 'Kenza', 'kenza.tazi@emsi-edu.ma', '0661000003', 'Recherche Opérationnelle & ERP', 'PERMANENT', 18, NULL),
(4, 'ENS-PERM-04', 'Abod', 'Brahim', 'brahim.abod@emsi-edu.ma', '0661000004', 'Architecture Réseaux & PFE', 'PERMANENT', 18, NULL)
ON DUPLICATE KEY UPDATE matricule=VALUES(matricule);
