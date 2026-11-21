-- ====================================================================
-- EMSI ACADEMIC PLATFORM - FLYWAY V6
-- GESTION DE LA PLANIFICATION DES EXAMENS (SESSIONS & SURVEILLANCES)
-- ====================================================================

CREATE TABLE IF NOT EXISTS examens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    module_id BIGINT NOT NULL,
    groupe_id BIGINT NOT NULL,
    salle_id BIGINT NOT NULL,
    surveillant_principal_id BIGINT NOT NULL,
    surveillant_secondaire_id BIGINT NULL,
    date_examen DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    duree_minutes INT NOT NULL DEFAULT 120,
    session_examen VARCHAR(20) NOT NULL DEFAULT 'NORMALE',
    consignes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_examen_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    CONSTRAINT fk_examen_groupe FOREIGN KEY (groupe_id) REFERENCES groupes(id) ON DELETE CASCADE,
    CONSTRAINT fk_examen_salle FOREIGN KEY (salle_id) REFERENCES salles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_examen_surv_princ FOREIGN KEY (surveillant_principal_id) REFERENCES enseignants(id) ON DELETE RESTRICT,
    CONSTRAINT fk_examen_surv_sec FOREIGN KEY (surveillant_secondaire_id) REFERENCES enseignants(id) ON DELETE SET NULL,
    INDEX idx_examen_date (date_examen),
    INDEX idx_examen_groupe (groupe_id),
    INDEX idx_examen_salle (salle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ÉPREUVES D'EXAMEN DE DÉMONSTRATION (SESSION NORMALE S1)
INSERT INTO examens (id, module_id, groupe_id, salle_id, surveillant_principal_id, surveillant_secondaire_id, date_examen, heure_debut, heure_fin, duree_minutes, session_examen, consignes) VALUES
(1, 1, 1, 1, 2, 3, '2026-12-15', '09:00:00', '11:00:00', 120, 'NORMALE', 'Calculatrice non autorisée. Aucun document admis.'),
(2, 2, 1, 2, 4, 1, '2026-12-17', '14:00:00', '16:00:00', 120, 'NORMALE', 'Épreuve sur machine (PC requis). Documents de cours autorisés.')
ON DUPLICATE KEY UPDATE consignes=VALUES(consignes);
