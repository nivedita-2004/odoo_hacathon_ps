-- Migration: Adapt existing database to Traveloop Backend
-- Run this if you already have tables created

-- ============================================
-- 1. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add columns to trips table (if missing)
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE AFTER title,
ADD COLUMN IF NOT EXISTS visibility ENUM('private', 'public', 'friends') DEFAULT 'private' AFTER end_date,
ADD COLUMN IF NOT EXISTS total_budget DECIMAL(12, 2) DEFAULT 0 AFTER visibility;

-- Add columns to users table (if missing)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(255) AFTER phone,
ADD COLUMN IF NOT EXISTS bio TEXT AFTER profile_photo,
ADD COLUMN IF NOT EXISTS preferred_currency CHAR(3) DEFAULT 'USD' AFTER bio,
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(20) DEFAULT 'en' AFTER preferred_currency,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE AFTER language_preference,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE AFTER is_verified,
ADD COLUMN IF NOT EXISTS status ENUM('active', 'blocked', 'deleted') DEFAULT 'active' AFTER is_admin;

-- Add columns to cities table (if missing)
ALTER TABLE cities
ADD COLUMN IF NOT EXISTS popularity_score DECIMAL(5, 2) DEFAULT 0 AFTER longitude;

-- ============================================
-- 2. CREATE NEW TABLES (if not exist)
-- ============================================

-- Password Resets Table (for Forgot Password OTP)
CREATE TABLE IF NOT EXISTS password_resets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_resets_email (email),
    INDEX idx_resets_otp (otp),
    INDEX idx_resets_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Refresh Tokens Table (for JWT authentication)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_refresh_user (user_id),
    INDEX idx_refresh_token (token),
    INDEX idx_refresh_expires (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. OPTIONAL: DROP UNUSED TABLES (if you want)
-- ============================================
-- Uncomment if you want to remove tables not used by this backend:
-- DROP TABLE IF EXISTS user_sessions;
-- DROP TABLE IF EXISTS shared_trips;
-- DROP TABLE IF EXISTS saved_destinations;
-- DROP TABLE IF EXISTS app_analytics;
-- DROP TABLE IF EXISTS activity_categories;

-- ============================================
-- 4. INSERT SAMPLE DATA (if tables are empty)
-- ============================================

-- Insert sample countries (if countries table is empty)
INSERT INTO countries (iso_code, name, currency_code) 
SELECT * FROM (SELECT 'US' as iso_code, 'United States' as name, 'USD' as currency_code) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM countries LIMIT 1);

-- Insert sample cities (if cities table is empty)
INSERT INTO cities (country_id, name, latitude, longitude, popularity_score)
SELECT 
    (SELECT id FROM countries WHERE iso_code = 'US' LIMIT 1),
    'New York',
    40.7128,
    -74.0060,
    9.5
WHERE NOT EXISTS (SELECT 1 FROM cities LIMIT 1);

-- ============================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================

-- Check all tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'traveloop';

-- Check trips table structure
-- DESCRIBE trips;

-- Check users table structure  
-- DESCRIBE users;
