-- ============================================
-- MERI GULLAK - COMPLETE DATABASE SCHEMA
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS merigullak_db;
USE merigullak_db;

-- ============================================
-- TABLE 1: USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
);

-- ============================================
-- INSERT TEST DATA
-- ============================================

-- Test User (Password: password123)
-- BCrypt Hash: $2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KnzzVgXXbVxzy2QGLM
INSERT INTO users (email, full_name, password, is_active) VALUES
('test@example.com', 'Test User', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KnzzVgXXbVxzy2QGLM', true)
ON DUPLICATE KEY UPDATE is_active = true;

-- Additional Test Users
INSERT INTO users (email, full_name, password, is_active) VALUES
('demo@example.com', 'Demo User', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KnzzVgXXbVxzy2QGLM', true),
('user@example.com', 'Regular User', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KnzzVgXXbVxzy2QGLM', true)
ON DUPLICATE KEY UPDATE is_active = true;

-- ============================================
-- VERIFY TABLES
-- ============================================
SHOW TABLES;

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT * FROM users;

-- ============================================
-- NOTE: Day 2, 3, 4, 5, 6 Tables will be added later
-- Current Schema (Day 1):
--   - users (Authentication & User Management)
-- ============================================
