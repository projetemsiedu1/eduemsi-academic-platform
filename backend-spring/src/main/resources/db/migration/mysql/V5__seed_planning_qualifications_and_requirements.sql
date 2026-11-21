-- ====================================================================
-- EMSI ACADEMIC PLATFORM - FLYWAY V5 SEED DATA
-- Qualifications Enseignants et Exigences Hebdomadaires de Planification
-- ====================================================================

-- 1. QUALIFICATIONS DES ENSEIGNANTS POUR LES MODULES
-- Enseignant 1 (Karim Alami) -> Module 1 (Architectures Distribuées)
-- Enseignant 2 (Noussair Benassou) -> Module 1 & Module 2
-- Enseignant 3 (Kenza Tazi) -> Module 2 (Intelligence Artificielle)
-- Enseignant 4 (Brahim Abod) -> Module 2 (Intelligence Artificielle)
INSERT INTO planning_qualifications (id, enseignant_id, module_id) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 2, 2),
(4, 3, 2),
(5, 4, 2)
ON DUPLICATE KEY UPDATE module_id=VALUES(module_id);

-- 2. EXIGENCES HEBDOMADAIRES (BESOINS EN COURS PAR GROUPE)
-- Groupe 1 (2DSI G3) :
--   - Element 1 (Microservices JEE) par Enseignant 2 : 2 séances hebdo
--   - Element 2 (CI/CD DevOps) par Enseignant 1 : 2 séances hebdo
-- Groupe 2 (2DSI G1) :
--   - Element 1 (Microservices JEE) par Enseignant 2 : 2 séances hebdo
--   - Element 3 (Vision IA) par Enseignant 3 : 2 séances hebdo
-- Groupe 3 (GL G2) :
--   - Element 3 (Vision IA) par Enseignant 4 : 2 séances hebdo
INSERT INTO planning_requirements (id, version, groupe_id, element_id, enseignant_id, weekly_sessions) VALUES
(1, 0, 1, 1, 2, 2),
(2, 0, 1, 2, 1, 2),
(3, 0, 2, 1, 2, 2),
(4, 0, 2, 3, 3, 2),
(5, 0, 3, 3, 4, 2)
ON DUPLICATE KEY UPDATE weekly_sessions=VALUES(weekly_sessions);
