-- ====================================================================
-- EMSI ACADEMIC PLATFORM - FLYWAY V3 SEED DATA
-- Modules, Éléments de module, Séances et Étudiants
-- ====================================================================

-- 1. MODULES (Filière 1 = 5A-IIR)
INSERT INTO modules (id, filiere_id, code_module, intitule, semestre, volume_horaire_total) VALUES
(1, 1, 'MOD-5A-IIR-01', 'Architectures Distribuées & Cloud Computing', 'S1', 90),
(2, 1, 'MOD-5A-IIR-02', 'Intelligence Artificielle & Deep Learning', 'S1', 90)
ON DUPLICATE KEY UPDATE intitule=VALUES(intitule);

-- 2. ÉLÉMENTS DE MODULE
INSERT INTO elements_module (id, module_id, code_element, intitule, type_salle_requis, volume_horaire) VALUES
(1, 1, 'ELEM-JEE-01', 'Microservices Spring Cloud & Kubernetes', 'LI_PC', 45),
(2, 1, 'ELEM-DEVOPS-02', 'CI/CD Docker & Infrastructures Réseaux', 'LR_RESEAUX', 45),
(3, 2, 'ELEM-DL-01', 'Vision par Ordinateur & YOLOv10', 'LI_PC', 45)
ON DUPLICATE KEY UPDATE intitule=VALUES(intitule);

-- 3. SÉANCES PLANIFIÉES
INSERT INTO seances (id, groupe_id, salle_id, enseignant_id, element_module_id, jour_semaine, numero_creneau, span_seances, statut_affectation) VALUES
(1, 1, 1, 2, 1, 'LUNDI', 'S1_08H30', 1, 'OPTIMAL_CPSAT'),
(2, 1, 4, 1, 2, 'MARDI', 'S1_08H30', 1, 'OPTIMAL_CPSAT')
ON DUPLICATE KEY UPDATE statut_affectation=VALUES(statut_affectation);

-- 4. ÉTUDIANTS DE DÉMO
INSERT INTO etudiants (id, matricule, nom, prenom, email, telephone, groupe_id, total_heures_module_semestre, cumul_heures_absence, est_radie_examen) VALUES
(1, 'ETU-2026-001', 'Bella', 'Amine', 'amine.bella@emsi-edu.ma', '0661112233', 1, 90.00, 4.50, FALSE),
(2, 'ETU-2026-002', 'Ait Ouahman', 'Ilyass', 'ilyass.aitouahman@emsi-edu.ma', '0661112244', 1, 90.00, 19.50, TRUE),
(3, 'ETU-2026-003', 'Mellakh', 'Ikram', 'ikram.mellakh@emsi-edu.ma', '0661112255', 4, 90.00, 6.00, FALSE)
ON DUPLICATE KEY UPDATE nom=VALUES(nom);
