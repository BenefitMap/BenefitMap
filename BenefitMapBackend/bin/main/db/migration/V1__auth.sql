-- ============================================================
-- BenefitMap Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS benefitmap
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE benefitmap;
SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- 1) USERS (회원 기본정보)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
                                     id             BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                     provider       VARCHAR(20)  NOT NULL,                           -- ex) google
    provider_id    VARCHAR(128) NOT NULL,                           -- ex) Google sub
    email          VARCHAR(120) NOT NULL,
    name           VARCHAR(60)       NULL,
    image_url      VARCHAR(255)      NULL,
    role           ENUM('ROLE_USER','ROLE_ADMIN') NOT NULL DEFAULT 'ROLE_USER',
    status         ENUM('PENDING','ACTIVE','SUSPENDED') NOT NULL DEFAULT 'PENDING',
    last_login_at  TIMESTAMP         NULL,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email    UNIQUE (email),
    CONSTRAINT uk_users_provider UNIQUE (provider, provider_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- 2) USER_PROFILE (회원 상세정보)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profile (
                                            user_id     BIGINT      NOT NULL PRIMARY KEY,
                                            gender      ENUM('MALE','FEMALE','OTHER') NOT NULL,
    birth_date  DATE        NOT NULL,
    region_do   VARCHAR(30) NOT NULL,
    region_si   VARCHAR(30) NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- 3) TAG MASTER (생애주기 / 가구상황 / 관심주제)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lifecycle_tag (
                                             id            SMALLINT     NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                             code          VARCHAR(40)  NOT NULL UNIQUE,
    name_ko       VARCHAR(40)  NOT NULL UNIQUE,
    display_order SMALLINT     NOT NULL DEFAULT 0,
    active        BIT(1)       NOT NULL DEFAULT b'1'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS household_tag (
                                             id            SMALLINT     NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                             code          VARCHAR(40)  NOT NULL UNIQUE,
    name_ko       VARCHAR(40)  NOT NULL UNIQUE,
    display_order SMALLINT     NOT NULL DEFAULT 0,
    active        BIT(1)       NOT NULL DEFAULT b'1'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS interest_tag (
                                            id            SMALLINT     NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                            code          VARCHAR(40)  NOT NULL UNIQUE,
    name_ko       VARCHAR(40)  NOT NULL UNIQUE,
    display_order SMALLINT     NOT NULL DEFAULT 0,
    active        BIT(1)       NOT NULL DEFAULT b'1'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- 4) USER-TAG MAPPING (회원별 태그)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_lifecycle_tag (
                                                  user_id BIGINT   NOT NULL,
                                                  tag_id  SMALLINT NOT NULL,
                                                  PRIMARY KEY (user_id, tag_id),
    KEY idx_ult_tag_id (tag_id),
    CONSTRAINT fk_ult_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ult_tag  FOREIGN KEY (tag_id)  REFERENCES lifecycle_tag(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS user_household_tag (
                                                  user_id BIGINT   NOT NULL,
                                                  tag_id  SMALLINT NOT NULL,
                                                  PRIMARY KEY (user_id, tag_id),
    KEY idx_uht_tag_id (tag_id),
    CONSTRAINT fk_uht_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_uht_tag  FOREIGN KEY (tag_id)  REFERENCES household_tag(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS user_interest_tag (
                                                 user_id BIGINT   NOT NULL,
                                                 tag_id  SMALLINT NOT NULL,
                                                 PRIMARY KEY (user_id, tag_id),
    KEY idx_uit_tag_id (tag_id),
    CONSTRAINT fk_uit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_uit_tag  FOREIGN KEY (tag_id)  REFERENCES interest_tag(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- 5) REFRESH TOKEN
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_token (
                                             id          BIGINT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                             user_id     BIGINT      NOT NULL,
                                             token_hash  VARCHAR(64) NOT NULL UNIQUE,   -- SHA-256 hex(64)
    user_agent  VARCHAR(200)    NULL,
    ip_address  VARCHAR(45)     NULL,
    issued_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP   NOT NULL,
    revoked_at  TIMESTAMP       NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_rt_user_id (user_id),
    KEY idx_rt_expires_at (expires_at),
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- 6) TAG SEED DATA (초기 태그 삽입)
-- ------------------------------------------------------------
INSERT IGNORE INTO lifecycle_tag(code,name_ko,display_order) VALUES
('PREGNANCY_BIRTH','임신·출산',1),('INFANT','영유아',2),('CHILD','아동',3),
('TEEN','청소년',4),('YOUTH','청년',5),('MIDDLE_AGED','중장년',6),('SENIOR','노년',7);

INSERT IGNORE INTO household_tag(code,name_ko,display_order) VALUES
('LOW_INCOME','저소득',1),('DISABLED','장애인',2),('SINGLE_PARENT','한부모·조손',3),
('MULTI_CHILDREN','다자녀',4),('MULTICULTURAL_NK','다문화·탈북민',5),
('PROTECTED','보호대상자',6),('NONE','해당사항 없음',7);

INSERT IGNORE INTO interest_tag(code,name_ko,display_order) VALUES
('PHYSICAL_HEALTH','신체건강',1),('MENTAL_HEALTH','정신건강',2),('LIVING_SUPPORT','생활지원',3),
('HOUSING','주거',4),('JOBS','일자리',5),('CULTURE_LEISURE','문화·여가',6),
('SAFETY_CRISIS','안전·위기',7),('PREGNANCY_BIRTH','임신·출산',8),('CHILDCARE','보육',9),
('EDUCATION','교육',10),('ADOPTION_TRUST','입양·위탁',11),('CARE_PROTECT','보호·돌봄',12),
('MICRO_FINANCE','서민금융',13),('LAW','법률',14),('ENERGY','에너지',15);
