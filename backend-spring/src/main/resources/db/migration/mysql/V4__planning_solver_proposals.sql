-- Additive planning metadata only. Does not seed, update or delete academic data.
CREATE TABLE planning_requirements (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    version BIGINT,
    groupe_id BIGINT NOT NULL,
    element_id BIGINT NOT NULL,
    enseignant_id BIGINT NOT NULL,
    weekly_sessions INT NOT NULL,
    CONSTRAINT uk_planning_requirement UNIQUE (groupe_id, element_id),
    CONSTRAINT fk_requirement_group FOREIGN KEY (groupe_id) REFERENCES groupes(id),
    CONSTRAINT fk_requirement_element FOREIGN KEY (element_id) REFERENCES elements_module(id),
    CONSTRAINT fk_requirement_teacher FOREIGN KEY (enseignant_id) REFERENCES enseignants(id),
    CONSTRAINT ck_requirement_count CHECK (weekly_sessions BETWEEN 1 AND 36)
);
CREATE TABLE planning_qualifications (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    enseignant_id BIGINT NOT NULL,
    module_id BIGINT NOT NULL,
    CONSTRAINT uk_planning_qualification UNIQUE (enseignant_id, module_id),
    CONSTRAINT fk_qualification_teacher FOREIGN KEY (enseignant_id) REFERENCES enseignants(id),
    CONSTRAINT fk_qualification_module FOREIGN KEY (module_id) REFERENCES modules(id)
);
CREATE TABLE planning_proposals (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    version BIGINT,
    owner VARCHAR(255) NOT NULL,
    state VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    fingerprint VARCHAR(64) NOT NULL,
    solution_json LONGTEXT NOT NULL
);
