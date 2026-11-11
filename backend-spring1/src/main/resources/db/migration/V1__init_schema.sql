-- ====================================================================
-- EMSI ACADEMIC PLATFORM (UNIVORA) - FLYWAY V1 SCHEMA DEFINITION
-- SGBD Cible : PostgreSQL 15+
-- ====================================================================

-- 1. INFRASTRUCTURE & CAMPUS
CREATE TABLE campuses (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    ville VARCHAR(100) NOT NULL DEFAULT 'Marrakech',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE salles (
    id BIGSERIAL PRIMARY KEY,
    campus_id BIGINT NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    code_salle VARCHAR(50) NOT NULL UNIQUE,
    type_salle VARCHAR(50) NOT NULL, -- COURS_THEORIQUE, TP_INFO_PC, LABO_INDUSTRIEL, AMPHITHEATRE
    capacite INT NOT NULL,
    nombre_pc_operationnels INT NOT NULL DEFAULT 0,
    projecteur_fonctionnel BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 2. STRUCTURE PÉDAGOGIQUE & MAQUETTE
CREATE TABLE filieres (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE, -- IIR, GI, GC, GE, IFA
    libelle VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE groupes (
    id BIGSERIAL PRIMARY KEY,
    filiere_id BIGINT NOT NULL REFERENCES filieres(id) ON DELETE CASCADE,
    code_groupe VARCHAR(50) NOT NULL UNIQUE, -- ex: 5A-IIR-G1
    annee_etude INT NOT NULL CHECK (annee_etude BETWEEN 1 AND 5),
    effectif INT NOT NULL,
    campus_du_jour_id BIGINT REFERENCES campuses(id), -- Règle Campus Unique / Jour
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE modules (
    id BIGSERIAL PRIMARY KEY,
    filiere_id BIGINT NOT NULL REFERENCES filieres(id) ON DELETE CASCADE,
    code_module VARCHAR(50) NOT NULL,
    titre VARCHAR(200) NOT NULL,
    semestre INT NOT NULL CHECK (semestre BETWEEN 1 AND 10),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE elements_module (
    id BIGSERIAL PRIMARY KEY,
    module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    titre VARCHAR(200) NOT NULL,
    coefficient NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    volume_horaire INT NOT NULL DEFAULT 32,
    necessite_salle_pc BOOLEAN NOT NULL DEFAULT FALSE, -- True pour TP IIR / GI
    est_matiere_industrielle BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 3. UTILISATEURS & HIÉRARCHIE DE GOUVERNANCE
CREATE TABLE utilisateurs (
    id BIGSERIAL PRIMARY KEY,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- SUPER_ADMIN, CHEF_FILIERE, RESP_PLANNING, RESP_SCOLARITE, ENSEIGNANT, ETUDIANT
    est_actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_at TIMESTAMP,
    updated_by VARCHAR(100)
);

CREATE TABLE enseignants (
    id BIGINT PRIMARY KEY REFERENCES utilisateurs(id) ON DELETE CASCADE,
    specialite_technique VARCHAR(150) NOT NULL, -- ex: Java/Spring, DevOps, IA/Data, Automatisme
    statut_contrat VARCHAR(50) NOT NULL, -- PERMANENT vs VACATAIRE
    volume_horaire_contractuel_max INT NOT NULL DEFAULT 200,
    volume_horaire_mensuel_effectue INT NOT NULL DEFAULT 0,
    taux_horaire_vacation NUMERIC(6,2) DEFAULT 250.00,
    quota_encadrement_pfe INT NOT NULL DEFAULT 5
);

CREATE TABLE disponibilites_vacataires (
    id BIGSERIAL PRIMARY KEY,
    enseignant_id BIGINT NOT NULL REFERENCES enseignants(id) ON DELETE CASCADE,
    jour_semaine INT NOT NULL CHECK (jour_semaine BETWEEN 1 AND 6), -- 1=Lundi, 6=Samedi
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    est_disponible BOOLEAN NOT NULL DEFAULT TRUE,
    commentaire VARCHAR(255)
);

CREATE TABLE etudiants (
    id BIGINT PRIMARY KEY REFERENCES utilisateurs(id) ON DELETE CASCADE,
    groupe_id BIGINT NOT NULL REFERENCES groupes(id),
    cne_massar VARCHAR(50) NOT NULL UNIQUE,
    total_heures_absence_injustifiee INT NOT NULL DEFAULT 0,
    seuil_critique_atteint BOOLEAN NOT NULL DEFAULT FALSE -- True dès que > 20%
);

-- 4. PLANIFICATION & CRÉNEAUX HORAIRES (CONTRAINTES STRICTES)
CREATE TABLE creneaux_horaires (
    id BIGSERIAL PRIMARY KEY,
    jour_semaine INT NOT NULL CHECK (jour_semaine BETWEEN 1 AND 6),
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    periode VARCHAR(50) NOT NULL -- MATIN_1 (08h30-10h), MATIN_2 (10h15-11h45), APRES_MIDI_1 (13h15-14h45), etc.
);

CREATE TABLE seances_planifiees (
    id BIGSERIAL PRIMARY KEY,
    date_seance DATE NOT NULL,
    creneau_id BIGINT NOT NULL REFERENCES creneaux_horaires(id),
    salle_id BIGINT NOT NULL REFERENCES salles(id),
    groupe_id BIGINT NOT NULL REFERENCES groupes(id),
    element_module_id BIGINT NOT NULL REFERENCES elements_module(id),
    enseignant_id BIGINT NOT NULL REFERENCES enseignants(id),
    statut VARCHAR(50) NOT NULL DEFAULT 'PLANIFIEE', -- PLANIFIEE, EN_COURS, EFFECTUEE_DOCUMENTEE, ANNULEE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 5. FICHES DE SÉANCE, FEUILLES D'ABSENCE & NOTIFICATIONS
CREATE TABLE fiches_seance (
    id BIGSERIAL PRIMARY KEY,
    seance_id BIGINT NOT NULL UNIQUE REFERENCES seances_planifiees(id) ON DELETE CASCADE,
    enseignant_id BIGINT NOT NULL REFERENCES enseignants(id),
    chapitre_traite VARCHAR(255) NOT NULL,
    objectifs_pedagogiques TEXT NOT NULL,
    resume_exercices_tp TEXT,
    devoirs_donnes TEXT,
    date_limite_devoirs DATE,
    date_heure_remplissage TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    validee_par_filiere BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE feuilles_absence (
    id BIGSERIAL PRIMARY KEY,
    seance_id BIGINT NOT NULL UNIQUE REFERENCES seances_planifiees(id) ON DELETE CASCADE,
    date_heure_appel TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nombre_presents INT NOT NULL DEFAULT 0,
    nombre_absents INT NOT NULL DEFAULT 0,
    appel_cloture BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE absences_etudiant (
    id BIGSERIAL PRIMARY KEY,
    feuille_absence_id BIGINT NOT NULL REFERENCES feuilles_absence(id) ON DELETE CASCADE,
    etudiant_id BIGINT NOT NULL REFERENCES etudiants(id) ON DELETE CASCADE,
    statut VARCHAR(50) NOT NULL DEFAULT 'ABSENT_NON_JUSTIFIE', -- ABSENT_NON_JUSTIFIE, ABSENT_JUSTIFIE, RETARD
    motif_declare VARCHAR(255),
    justificatif_medical_url VARCHAR(255),
    justifiee_par_administration BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP
);

CREATE TABLE notifications_professeurs (
    id BIGSERIAL PRIMARY KEY,
    enseignant_id BIGINT NOT NULL REFERENCES enseignants(id) ON DELETE CASCADE,
    type_notification VARCHAR(50) NOT NULL, -- RAPPEL_FIN_COURS_FICHE, ALERTE_SEUIL_ABSENCE, AFFECTATION_JURY
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    date_envoi TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    est_lue BOOLEAN NOT NULL DEFAULT FALSE,
    lien_action_web VARCHAR(255)
);

-- 6. PFE, SOUTENANCES & MATCHING IA GEMINI
CREATE TABLE pfe_topics (
    id BIGSERIAL PRIMARY KEY,
    etudiant_id BIGINT NOT NULL UNIQUE REFERENCES etudiants(id) ON DELETE CASCADE,
    encadrant_id BIGINT REFERENCES enseignants(id),
    titre VARCHAR(255) NOT NULL,
    problematique TEXT NOT NULL,
    technologies_detectees VARCHAR(255),
    score_matching_ia NUMERIC(5,2),
    justification_ia TEXT,
    statut_pfe VARCHAR(50) NOT NULL DEFAULT 'PROPOSE', -- PROPOSE, VALIDE, SOUTENANCE_PLANIFIEE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE soutenances_pfe (
    id BIGSERIAL PRIMARY KEY,
    pfe_topic_id BIGINT NOT NULL UNIQUE REFERENCES pfe_topics(id) ON DELETE CASCADE,
    salle_id BIGINT NOT NULL REFERENCES salles(id),
    date_heure_soutenance TIMESTAMP NOT NULL,
    president_jury_id BIGINT NOT NULL REFERENCES enseignants(id),
    rapporteur_jury_id BIGINT NOT NULL REFERENCES enseignants(id),
    examinateur_jury_id BIGINT NOT NULL REFERENCES enseignants(id),
    note_rapport NUMERIC(4,2),
    note_presentation NUMERIC(4,2),
    note_finale NUMERIC(4,2),
    pv_signe_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_president_not_encadrant CHECK (president_jury_id <> rapporteur_jury_id)
);

-- 7. RECRUTEMENT RH IA & BESOINS EN ENSEIGNANTS PAR BRANCHE
CREATE TABLE besoins_recrutement_filieres (
    id BIGSERIAL PRIMARY KEY,
    filiere_id BIGINT NOT NULL REFERENCES filieres(id) ON DELETE CASCADE,
    element_module_id BIGINT NOT NULL REFERENCES elements_module(id) ON DELETE CASCADE,
    volume_heures_manquantes INT NOT NULL,
    nombre_enseignants_manquants INT NOT NULL DEFAULT 1,
    urgence VARCHAR(50) NOT NULL DEFAULT 'CRITIQUE_BLOCAGE_EDT', -- CRITIQUE_BLOCAGE_EDT, MODERE, EQUILIBRE
    profil_recherche VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE candidatures_enseignants (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telephone VARCHAR(30),
    statut_vise VARCHAR(50) NOT NULL, -- PERMANENT vs VACATAIRE
    cv_document_url VARCHAR(255),
    competences_extraites_ia TEXT,
    score_adequation_besoins NUMERIC(5,2),
    explication_ia_matching TEXT,
    statut_candidature VARCHAR(50) NOT NULL DEFAULT 'DEPOSEE', -- DEPOSEE, EN_COURS_ANALYSE_IA, ACCEPTEE, REJETEE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- SEED DATA RÉEL POUR EMSI MARRAKECH (DÉMONSTRATION IMMÉDIATE)
-- ====================================================================

-- Insertion Campus
INSERT INTO campuses (nom, adresse, ville) VALUES
('Campus Guéliz', 'Avenue Mansour Eddehbi, Guéliz', 'Marrakech'),
('Campus Targa', 'Boulevard Al Massira, Targa', 'Marrakech');

-- Insertion Salles (dont Salles TP PC pour IIR et Industriel)
INSERT INTO salles (campus_id, code_salle, type_salle, capacite, nombre_pc_operationnels, projecteur_fonctionnel) VALUES
(1, 'G-Salle-101', 'COURS_THEORIQUE', 40, 0, TRUE),
(1, 'G-Lab-PC-1', 'TP_INFO_PC', 35, 35, TRUE),
(1, 'G-Lab-PC-2', 'TP_INFO_PC', 30, 30, TRUE),
(2, 'T-Amphi-A', 'AMPHITHEATRE', 120, 0, TRUE),
(2, 'T-Lab-Industriel', 'LABO_INDUSTRIEL', 30, 30, TRUE),
(2, 'T-Salle-202', 'COURS_THEORIQUE', 45, 0, TRUE);

-- Insertion Filières
INSERT INTO filieres (code, libelle) VALUES
('IIR', 'Ingénierie Informatique et Réseaux'),
('GI', 'Génie Industriel'),
('GC', 'Génie Civil'),
('2IA', 'Ingénierie de l Intelligence Artificielle');

-- Insertion Groupes (avec Campus du Jour)
INSERT INTO groupes (filiere_id, code_groupe, annee_etude, effectif, campus_du_jour_id) VALUES
(1, '5A-IIR-G1', 5, 28, 1), -- Guéliz
(1, '5A-IIR-G2', 5, 26, 1), -- Guéliz
(2, '5A-GI-G1', 5, 24, 2);  -- Targa

-- Insertion Modules & Éléments
INSERT INTO modules (filiere_id, code_module, titre, semestre) VALUES
(1, 'MOD-IIR-501', 'Architectures Cloud & Microservices', 9),
(1, 'MOD-IIR-502', 'Intelligence Artificielle Avancée', 9),
(2, 'MOD-GI-501', 'Automatisme & Robotique Industrielle', 9);

INSERT INTO elements_module (module_id, titre, coefficient, volume_horaire, necessite_salle_pc, est_matiere_industrielle) VALUES
(1, 'Spring Cloud & Kubernetes TP', 2.00, 32, TRUE, FALSE), -- TP PC OBLIGATOIRE
(1, 'Microservices Architecture Cours', 1.50, 24, FALSE, FALSE),
(2, 'Deep Learning TP', 2.00, 32, TRUE, FALSE), -- TP PC OBLIGATOIRE
(3, 'Simulation FAO & Robotique TP', 2.00, 32, TRUE, TRUE); -- LABO INDUSTRIEL PC

-- Insertion Utilisateurs & Enseignants (Permanents vs Vacataires)
INSERT INTO utilisateurs (matricule, nom, prenom, email, mot_de_passe_hash, role) VALUES
('ADMIN-01', 'Direction', 'EMSI Marrakech', 'direction.marrakech@emsi.ma', '$2a$12$e8x5...', 'SUPER_ADMIN'),
('CHEF-IIR', 'Moussaoui', 'Moad (Chef)', 'chef.iir@emsi.ma', '$2a$12$e8x5...', 'CHEF_FILIERE'),
('PROF-01', 'Benassou', 'Noussair (Prof)', 'n.benassou@emsi.ma', '$2a$12$e8x5...', 'ENSEIGNANT'),
('PROF-02', 'Alami', 'Karim (Vacataire)', 'k.alami.pro@gmail.com', '$2a$12$e8x5...', 'ENSEIGNANT'),
('ETU-01', 'Bella', 'Amine', 'a.bella@emsi.ma', '$2a$12$e8x5...', 'ETUDIANT');

INSERT INTO enseignants (id, specialite_technique, statut_contrat, volume_horaire_contractuel_max, quota_encadrement_pfe) VALUES
(3, 'Java / Spring Cloud / DevOps', 'PERMANENT', 300, 8),
(4, 'Deep Learning / Vision / Python', 'VACATAIRE', 64, 4);

-- Créneaux Horaires Vacataire (Stricts : vendredis et samedis)
INSERT INTO disponibilites_vacataires (enseignant_id, jour_semaine, heure_debut, heure_fin, est_disponible, commentaire) VALUES
(4, 5, '15:00:00', '18:15:00', TRUE, 'Vendredi après-midi libre'),
(4, 6, '08:30:00', '16:30:00', TRUE, 'Samedi journée complète');

-- Insertion Créneaux Horaires (avec pause 15 min le matin et créneau après-midi)
INSERT INTO creneaux_horaires (jour_semaine, heure_debut, heure_fin, periode) VALUES
(1, '08:30:00', '10:00:00', 'MATIN_1'),
(1, '10:15:00', '11:45:00', 'MATIN_2'), -- 15m pause
(1, '13:15:00', '14:45:00', 'APRES_MIDI_1'), -- 1h30 trou méridien exact
(1, '15:00:00', '16:30:00', 'APRES_MIDI_2');
