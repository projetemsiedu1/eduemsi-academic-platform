-- ====================================================================
-- EMSI ACADEMIC PLATFORM - FLYWAY V8
-- WORKFLOW COMPLET PFE : CATALOGUE, VALIDATION, JURY IA, GRILLE EMSI & PV
-- ====================================================================

-- 1. Grade académique sur les enseignants (requis pour Président HDR du jury)
ALTER TABLE enseignants
    ADD COLUMN grade VARCHAR(80) NULL DEFAULT 'Docteur';

UPDATE enseignants
SET grade = 'Professeur Habilité (HDR)'
WHERE id IN (
    SELECT id FROM (
        SELECT id FROM enseignants WHERE type_contrat = 'PERMANENT' ORDER BY id LIMIT 3
    ) AS tmp_hdr
);

-- 2. Catalogue de sujets PFE proposés par les enseignants
CREATE TABLE IF NOT EXISTS pfe_sujets_catalogue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enseignant_id BIGINT NOT NULL,
    filiere_id BIGINT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    technologies VARCHAR(255),
    places_max INT NOT NULL DEFAULT 1,
    est_disponible BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sujet_cat_enseignant FOREIGN KEY (enseignant_id) REFERENCES enseignants(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sujet_cat_filiere FOREIGN KEY (filiere_id) REFERENCES filieres(id) ON DELETE CASCADE,
    INDEX idx_sujet_cat_filiere (filiere_id),
    INDEX idx_sujet_cat_enseignant (enseignant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Enrichissement de pfe_projets (origine, entreprise, binôme, validation, note & PV)
ALTER TABLE pfe_projets
    ADD COLUMN origine VARCHAR(30) NOT NULL DEFAULT 'STAGE_ENTREPRISE',
    ADD COLUMN sujet_catalogue_id BIGINT NULL,
    ADD COLUMN entreprise_accueil VARCHAR(150) NULL,
    ADD COLUMN etudiant1_id BIGINT NULL,
    ADD COLUMN etudiant2_id BIGINT NULL,
    ADD COLUMN encadrant_souhaite_id BIGINT NULL,
    ADD COLUMN commentaire_validation TEXT NULL,
    ADD COLUMN note_finale DECIMAL(4,2) NULL,
    ADD COLUMN mention VARCHAR(60) NULL,
    ADD COLUMN pv_verrouille BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN date_verrouillage DATETIME NULL,
    ADD CONSTRAINT fk_pfe_sujet_cat FOREIGN KEY (sujet_catalogue_id) REFERENCES pfe_sujets_catalogue(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_pfe_etudiant1 FOREIGN KEY (etudiant1_id) REFERENCES etudiants(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_pfe_etudiant2 FOREIGN KEY (etudiant2_id) REFERENCES etudiants(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_pfe_encadrant_souhaite FOREIGN KEY (encadrant_souhaite_id) REFERENCES enseignants(id) ON DELETE SET NULL;

-- 4. Évaluations individuelles des 4 membres du jury (Grille officielle EMSI /20)
CREATE TABLE IF NOT EXISTS pfe_evaluations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pfe_projet_id BIGINT NOT NULL,
    evaluateur_id BIGINT NOT NULL,
    role_jury VARCHAR(30) NOT NULL,
    note_technique DECIMAL(4,2) NOT NULL,
    note_rapport DECIMAL(4,2) NOT NULL,
    note_demo DECIMAL(4,2) NOT NULL,
    note_reponses DECIMAL(4,2) NOT NULL,
    total DECIMAL(4,2) NOT NULL,
    commentaire TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_eval_pfe FOREIGN KEY (pfe_projet_id) REFERENCES pfe_projets(id) ON DELETE CASCADE,
    CONSTRAINT fk_eval_evaluateur FOREIGN KEY (evaluateur_id) REFERENCES enseignants(id) ON DELETE RESTRICT,
    CONSTRAINT uk_eval_pfe_evaluateur UNIQUE (pfe_projet_id, evaluateur_id),
    INDEX idx_eval_pfe (pfe_projet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Seed du catalogue de sujets proposés par les enseignants
INSERT INTO pfe_sujets_catalogue (enseignant_id, filiere_id, titre, description, technologies, places_max, est_disponible)
SELECT
    (SELECT id FROM enseignants ORDER BY id LIMIT 1),
    (SELECT id FROM filieres ORDER BY id LIMIT 1),
    'Assistant Pédagogique RAG & LLM Local pour Campus EMSI',
    'Conception d''un assistant conversationnel multimodal basé sur RAG et embeddings vectoriels pour accompagner les étudiants sur leurs cours et TP.',
    'Python, FastAPI, LangChain, Qdrant, Next.js',
    2,
    TRUE
WHERE EXISTS (SELECT 1 FROM enseignants) AND EXISTS (SELECT 1 FROM filieres);

INSERT INTO pfe_sujets_catalogue (enseignant_id, filiere_id, titre, description, technologies, places_max, est_disponible)
SELECT
    COALESCE((SELECT id FROM enseignants ORDER BY id LIMIT 1 OFFSET 1), (SELECT id FROM enseignants ORDER BY id LIMIT 1)),
    (SELECT id FROM filieres ORDER BY id LIMIT 1),
    'Architecture Zero-Trust & Observabilité Microservices Kubernetes',
    'Mise en place d''une plateforme Cloud-Native sécurisée par mTLS, OpenTelemetry, Prometheus et Grafana avec déploiement GitOps ArgoCD.',
    'Java, Spring Boot 3, Kubernetes, Istio, Prometheus, Docker',
    1,
    TRUE
WHERE EXISTS (SELECT 1 FROM enseignants) AND EXISTS (SELECT 1 FROM filieres);

INSERT INTO pfe_sujets_catalogue (enseignant_id, filiere_id, titre, description, technologies, places_max, est_disponible)
SELECT
    COALESCE((SELECT id FROM enseignants ORDER BY id LIMIT 1 OFFSET 2), (SELECT id FROM enseignants ORDER BY id LIMIT 1)),
    COALESCE((SELECT id FROM filieres ORDER BY id LIMIT 1 OFFSET 1), (SELECT id FROM filieres ORDER BY id LIMIT 1)),
    'Optimisation Logistique Multi-Dépôts par Solveur CP-SAT & Jumeau 3D',
    'Modélisation mathématique de tournées de véhicules sous contraintes temporelles avec Google OR-Tools et visualisation temps réel.',
    'Java, OR-Tools, React, PostgreSQL, WebSocket',
    1,
    TRUE
WHERE EXISTS (SELECT 1 FROM enseignants) AND EXISTS (SELECT 1 FROM filieres);

-- 6. Seed des 3 projets PFE de démonstration persistés en base
INSERT INTO pfe_projets (filiere_id, titre, resume, technologies_cles, binome_etudiants, statut, origine, entreprise_accueil, etudiant1_id, encadrant_souhaite_id)
SELECT
    (SELECT id FROM filieres ORDER BY id LIMIT 1),
    'Plateforme Microservices & Orchestration Kubernetes',
    'Développement d''un ERP académique conteneurisé sous Kubernetes avec Spring Boot 3, Next.js et OR-Tools.',
    'Java, Spring Cloud, Docker, Kubernetes, Next.js',
    'Amine Bella',
    'EN_ATTENTE_JURY',
    'STAGE_ENTREPRISE',
    'Capgemini Engineering Maroc',
    (SELECT id FROM etudiants WHERE nom = 'Bella' ORDER BY id LIMIT 1),
    COALESCE((SELECT id FROM enseignants ORDER BY id LIMIT 1 OFFSET 1), (SELECT id FROM enseignants ORDER BY id LIMIT 1))
WHERE EXISTS (SELECT 1 FROM filieres);

INSERT INTO pfe_projets (filiere_id, titre, resume, technologies_cles, binome_etudiants, statut, origine, entreprise_accueil, etudiant1_id, encadrant_souhaite_id)
SELECT
    (SELECT id FROM filieres ORDER BY id LIMIT 1),
    'Détection d''Anomalies Vidéo par Vision Artificielle',
    'Système de surveillance temps réel basé sur YOLOv10 et PyTorch pour la détection d''intrusions sur sites sensibles.',
    'Python, PyTorch, YOLOv10, OpenCV, FastAPI',
    'Ilyass Ait Ouahman',
    'EN_ATTENTE_JURY',
    'STAGE_ENTREPRISE',
    'OCP Digital Solutions',
    (SELECT id FROM etudiants WHERE nom = 'Ait Ouahman' ORDER BY id LIMIT 1),
    (SELECT id FROM enseignants ORDER BY id LIMIT 1)
WHERE EXISTS (SELECT 1 FROM filieres);

INSERT INTO pfe_projets (filiere_id, titre, resume, technologies_cles, binome_etudiants, statut, origine, entreprise_accueil, etudiant1_id, encadrant_souhaite_id)
SELECT
    COALESCE((SELECT id FROM filieres ORDER BY id LIMIT 1 OFFSET 1), (SELECT id FROM filieres ORDER BY id LIMIT 1)),
    'Jumeau Numérique & Supervision SCADA Industrielle',
    'Conception d''un jumeau numérique 3D pour la maintenance prédictive d''une chaîne de montage robotisée EMSI.',
    'Three.js, MQTT, Siemens TIA Portal, Python, Docker',
    'Ikram Mellakh',
    'EN_ATTENTE_JURY',
    'CATALOGUE',
    'EMSI Smart Factory Lab',
    (SELECT id FROM etudiants WHERE nom = 'Mellakh' ORDER BY id LIMIT 1),
    COALESCE((SELECT id FROM enseignants ORDER BY id LIMIT 1 OFFSET 2), (SELECT id FROM enseignants ORDER BY id LIMIT 1))
WHERE EXISTS (SELECT 1 FROM filieres);
