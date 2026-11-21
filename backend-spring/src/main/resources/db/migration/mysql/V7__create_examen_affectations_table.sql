-- ====================================================================
-- EMSI ACADEMIC PLATFORM - FLYWAY V7
-- AFFECTATION DES PLACES D'EXAMENS & DISTRIBUTION HÉTÉROGÈNE ANTI-TRICHE
-- ====================================================================

CREATE TABLE IF NOT EXISTS examen_affectations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    examen_id BIGINT NOT NULL,
    etudiant_id BIGINT NOT NULL,
    salle_id BIGINT NOT NULL,
    numero_place INT NOT NULL,
    code_place VARCHAR(50) NOT NULL,
    statut_presence VARCHAR(30) NOT NULL DEFAULT 'CONVOQUE',
    notifie BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_aff_examen FOREIGN KEY (examen_id) REFERENCES examens(id) ON DELETE CASCADE,
    CONSTRAINT fk_aff_etudiant FOREIGN KEY (etudiant_id) REFERENCES etudiants(id) ON DELETE CASCADE,
    CONSTRAINT fk_aff_salle FOREIGN KEY (salle_id) REFERENCES salles(id) ON DELETE RESTRICT,
    CONSTRAINT uk_aff_examen_place UNIQUE (examen_id, salle_id, numero_place),
    CONSTRAINT uk_aff_examen_etudiant UNIQUE (examen_id, etudiant_id),
    INDEX idx_aff_examen (examen_id),
    INDEX idx_aff_etudiant (etudiant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1. INSCRIPTION DE L'UTILISATEUR ÉTUDIANT DANS LA TABLE DES ÉTUDIANTS
INSERT INTO etudiants (id, matricule, nom, prenom, email, telephone, groupe_id, total_heures_module_semestre, cumul_heures_absence, est_radie_examen) VALUES
(4, 'ETU-2026-004', 'Benjelloun', 'Anas', 'anas.benjelloun@emsi.ma', '0661112266', 1, 90.00, 3.00, FALSE),
(5, 'ETU-2026-005', 'Tazi', 'Khadija', 'khadija.tazi@emsi-edu.ma', '0661112277', 2, 90.00, 2.00, FALSE),
(6, 'ETU-2026-006', 'El Amrani', 'Othmane', 'othmane.elamrani@emsi-edu.ma', '0661112288', 2, 90.00, 4.00, FALSE),
(7, 'ETU-2026-007', 'Chraibi', 'Salma', 'salma.chraibi@emsi-edu.ma', '0661112299', 3, 90.00, 1.50, FALSE),
(8, 'ETU-2026-008', 'Alami', 'Mehdi', 'mehdi.alami@emsi-edu.ma', '0661112300', 3, 90.00, 22.00, TRUE)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 2. EXEMPLES D'AFFECTATIONS INITIALES (DISTRIBUTION DES TABLES POUR L'EXAMEN 1)
INSERT INTO examen_affectations (id, examen_id, etudiant_id, salle_id, numero_place, code_place, statut_presence, notifie) VALUES
(1, 1, 1, 1, 1, 'Table N° 1 (Rangée A)', 'CONVOQUE', TRUE),
(2, 1, 4, 1, 3, 'Table N° 3 (Rangée A)', 'CONVOQUE', TRUE)
ON DUPLICATE KEY UPDATE code_place=VALUES(code_place);
