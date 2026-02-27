-- ============================================================
-- Portfolio Website Database Schema
-- Converted from Firebase Firestore to MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS `my_portfolio` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `my_portfolio`;

-- ============================================================
-- Table: admins
-- Firebase Collection: admins (Document: mainAdmin)
-- Stores admin login credentials for dashboard access
-- ============================================================

CREATE TABLE IF NOT EXISTS `admins` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `doc_key` VARCHAR(50) NOT NULL DEFAULT 'mainAdmin' COMMENT 'Firestore document ID equivalent',
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_doc_key` (`doc_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin user (username: admin, password: 9489318959@123!)
INSERT INTO `admins` (`doc_key`, `username`, `password`) VALUES
('mainAdmin', 'admin', '9489318959@123!');

-- ============================================================
-- Table: contact_submissions
-- Firebase Collection: contact_submissions
-- Stores enquiries submitted via the contact form
-- ============================================================

CREATE TABLE IF NOT EXISTS `contact_submissions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `mobile` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0 = unread (NEW), 1 = read',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
