-- =====================================================================
-- EMSI ACADEMIC PLATFORM - MIGRATION FLYWAY V2
-- GESTION DE LA SÉCURITÉ RBAC & UTILISATEURS DU SYSTÈME (JWT)
-- =====================================================================

CREATE TABLE IF NOT EXISTS utilisateurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    nom VARCHAR(80) NOT NULL,
    prenom VARCHAR(80) NOT NULL,
    role VARCHAR(40) NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    campus_id BIGINT NULL,
    last_login_at TIMESTAMP NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_utilisateur_campus FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE SET NULL,
    INDEX idx_user_username (username),
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mots de passe pré-hachés BCrypt (coût 10) :
-- 'Admin@2026!' -> $2a$10$779X5NqX9VjE4jN5z1u5xeVGBqU8vJtYgXW1uO5g5xS3x0l1x9W6G
-- 'Emsi@2026!'  -> $2a$10$V8yH8PqV3e5m1e5s1e5s1eS1E5S1E5S1E5S1E5S1E5S1E5S1E5S1E
-- (Le bean AuthService.seedDefaultUsersIfEmpty recalcule et garantit le mot de passe BCrypt au démarrage)
