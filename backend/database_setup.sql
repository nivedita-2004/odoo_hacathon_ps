-- Traveloop Database Schema
-- Run this script to set up the database

CREATE DATABASE IF NOT EXISTS traveloop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE traveloop;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_photo VARCHAR(255),
    bio TEXT,
    preferred_currency CHAR(3) DEFAULT 'USD',
    language_preference VARCHAR(20) DEFAULT 'en',
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'blocked', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Countries Table
CREATE TABLE IF NOT EXISTS countries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    iso_code CHAR(2) UNIQUE,
    name VARCHAR(120),
    currency_code CHAR(3),
    INDEX iso_code (iso_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cities Table
CREATE TABLE IF NOT EXISTS cities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    country_id BIGINT UNSIGNED,
    name VARCHAR(120),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    popularity_score DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cities_country (country_id),
    INDEX idx_cities_name (name),
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    start_date DATE,
    end_date DATE,
    visibility ENUM('private', 'public', 'friends') DEFAULT 'private',
    total_budget DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_trips_user (user_id),
    INDEX idx_trips_dates (start_date, end_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trip Stops Table
CREATE TABLE IF NOT EXISTS trip_stops (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id BIGINT UNSIGNED NOT NULL,
    city_id BIGINT UNSIGNED,
    arrival_date DATE,
    departure_date DATE,
    stop_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_trip_stops_trip (trip_id),
    INDEX idx_trip_stops_order (trip_id, stop_order),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    city_id BIGINT UNSIGNED,
    title VARCHAR(255) NOT NULL,
    estimated_cost DECIMAL(10, 2) DEFAULT 0,
    duration_minutes INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activities_city (city_id),
    FULLTEXT INDEX idx_activity_search (title),
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stop Activities Table (Junction)
CREATE TABLE IF NOT EXISTS stop_activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_stop_id BIGINT UNSIGNED NOT NULL,
    activity_id BIGINT UNSIGNED NOT NULL,
    activity_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stop_activities_stop (trip_stop_id),
    FOREIGN KEY (trip_stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id BIGINT UNSIGNED UNIQUE,
    transport_budget DECIMAL(12, 2) DEFAULT 0,
    accommodation_budget DECIMAL(12, 2) DEFAULT 0,
    food_budget DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_budgets_trip (trip_id),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Packing Items Table
CREATE TABLE IF NOT EXISTS packing_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id BIGINT UNSIGNED NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    is_packed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_packing_trip (trip_id),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trip Notes Table
CREATE TABLE IF NOT EXISTS trip_notes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id BIGINT UNSIGNED NOT NULL,
    note TEXT NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notes_trip (trip_id),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Password Resets Table (OTP Storage)
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

-- Refresh Tokens Table
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

-- Insert sample countries
INSERT INTO countries (iso_code, name, currency_code) VALUES
('US', 'United States', 'USD'),
('GB', 'United Kingdom', 'GBP'),
('FR', 'France', 'EUR'),
('DE', 'Germany', 'EUR'),
('IT', 'Italy', 'EUR'),
('ES', 'Spain', 'EUR'),
('JP', 'Japan', 'JPY'),
('CN', 'China', 'CNY'),
('IN', 'India', 'INR'),
('TH', 'Thailand', 'THB'),
('AU', 'Australia', 'AUD'),
('CA', 'Canada', 'CAD'),
('BR', 'Brazil', 'BRL'),
('MX', 'Mexico', 'MXN'),
('AE', 'United Arab Emirates', 'AED'),
('SG', 'Singapore', 'SGD'),
('NL', 'Netherlands', 'EUR'),
('CH', 'Switzerland', 'CHF'),
('KR', 'South Korea', 'KRW'),
('ID', 'Indonesia', 'IDR');

-- Insert sample cities
INSERT INTO cities (country_id, name, latitude, longitude, popularity_score) VALUES
((SELECT id FROM countries WHERE iso_code = 'US'), 'New York', 40.7128, -74.0060, 9.5),
((SELECT id FROM countries WHERE iso_code = 'US'), 'Los Angeles', 34.0522, -118.2437, 8.5),
((SELECT id FROM countries WHERE iso_code = 'US'), 'San Francisco', 37.7749, -122.4194, 8.8),
((SELECT id FROM countries WHERE iso_code = 'GB'), 'London', 51.5074, -0.1278, 9.7),
((SELECT id FROM countries WHERE iso_code = 'FR'), 'Paris', 48.8566, 2.3522, 9.8),
((SELECT id FROM countries WHERE iso_code = 'IT'), 'Rome', 41.9028, 12.4964, 9.2),
((SELECT id FROM countries WHERE iso_code = 'IT'), 'Venice', 45.4408, 12.3155, 8.9),
((SELECT id FROM countries WHERE iso_code = 'ES'), 'Barcelona', 41.3851, 2.1734, 8.7),
((SELECT id FROM countries WHERE iso_code = 'JP'), 'Tokyo', 35.6762, 139.6503, 9.6),
((SELECT id FROM countries WHERE iso_code = 'JP'), 'Kyoto', 35.0116, 135.7681, 9.0),
((SELECT id FROM countries WHERE iso_code = 'TH'), 'Bangkok', 13.7563, 100.5018, 8.8),
((SELECT id FROM countries WHERE iso_code = 'IN'), 'Mumbai', 19.0760, 72.8777, 8.0),
((SELECT id FROM countries WHERE iso_code = 'IN'), 'Delhi', 28.6139, 77.2090, 8.2),
((SELECT id FROM countries WHERE iso_code = 'AU'), 'Sydney', -33.8688, 151.2093, 8.9),
((SELECT id FROM countries WHERE iso_code = 'AE'), 'Dubai', 25.2048, 55.2708, 9.1),
((SELECT id FROM countries WHERE iso_code = 'SG'), 'Singapore', 1.3521, 103.8198, 8.6),
((SELECT id FROM countries WHERE iso_code = 'CH'), 'Zurich', 47.3769, 8.5417, 7.8),
((SELECT id FROM countries WHERE iso_code = 'NL'), 'Amsterdam', 52.3676, 4.9041, 8.5),
((SELECT id FROM countries WHERE iso_code = 'DE'), 'Berlin', 52.5200, 13.4050, 8.3),
((SELECT id FROM countries WHERE iso_code = 'MX'), 'Cancun', 21.1619, -86.8515, 8.4);

-- Insert sample activities for New York
INSERT INTO activities (city_id, title, estimated_cost, duration_minutes) VALUES
((SELECT id FROM cities WHERE name = 'New York'), 'Statue of Liberty Tour', 25.00, 180),
((SELECT id FROM cities WHERE name = 'New York'), 'Central Park Walk', 0.00, 120),
((SELECT id FROM cities WHERE name = 'New York'), 'Empire State Building Observation', 44.00, 90),
((SELECT id FROM cities WHERE name = 'New York'), 'Broadway Show', 150.00, 150),
((SELECT id FROM cities WHERE name = 'New York'), 'Brooklyn Bridge Walk', 0.00, 60),
((SELECT id FROM cities WHERE name = 'New York'), 'Metropolitan Museum of Art', 25.00, 240),
((SELECT id FROM cities WHERE name = 'New York'), 'Times Square Visit', 0.00, 60);

-- Insert sample activities for Paris
INSERT INTO activities (city_id, title, estimated_cost, duration_minutes) VALUES
((SELECT id FROM cities WHERE name = 'Paris'), 'Eiffel Tower Visit', 26.00, 120),
((SELECT id FROM cities WHERE name = 'Paris'), 'Louvre Museum Tour', 17.00, 240),
((SELECT id FROM cities WHERE name = 'Paris'), 'Seine River Cruise', 15.00, 90),
((SELECT id FROM cities WHERE name = 'Paris'), 'Montmartre Walking Tour', 0.00, 180),
((SELECT id FROM cities WHERE name = 'Paris'), 'Notre Dame Cathedral Visit', 0.00, 60),
((SELECT id FROM cities WHERE name = 'Paris'), 'Versailles Day Trip', 27.00, 480);

-- Insert sample activities for Tokyo
INSERT INTO activities (city_id, title, estimated_cost, duration_minutes) VALUES
((SELECT id FROM cities WHERE name = 'Tokyo'), 'Senso-ji Temple Visit', 0.00, 90),
((SELECT id FROM cities WHERE name = 'Tokyo'), 'Tokyo Skytree Observation', 20.00, 120),
((SELECT id FROM cities WHERE name = 'Tokyo'), 'Tsukiji Outer Market Tour', 30.00, 120),
((SELECT id FROM cities WHERE name = 'Tokyo'), 'Meiji Shrine Visit', 0.00, 90),
((SELECT id FROM cities WHERE name = 'Tokyo'), 'Shibuya Crossing Experience', 0.00, 30),
((SELECT id FROM cities WHERE name = 'Tokyo'), 'Sushi Making Class', 80.00, 180);

-- Insert sample activities for London
INSERT INTO activities (city_id, title, estimated_cost, duration_minutes) VALUES
((SELECT id FROM cities WHERE name = 'London'), 'British Museum Visit', 0.00, 180),
((SELECT id FROM cities WHERE name = 'London'), 'Tower of London Tour', 33.00, 180),
((SELECT id FROM cities WHERE name = 'London'), 'London Eye Ride', 32.00, 30),
((SELECT id FROM cities WHERE name = 'London'), 'Westminster Abbey Visit', 24.00, 90),
((SELECT id FROM cities WHERE name = 'London'), 'Buckingham Palace Changing of Guard', 0.00, 45),
((SELECT id FROM cities WHERE name = 'London'), 'Thames River Cruise', 15.00, 60);

-- Create a demo admin user (password: admin123)
INSERT INTO users (full_name, email, password_hash, is_admin, is_verified) VALUES
('Admin User', 'admin@traveloop.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, TRUE);

-- Note: The password_hash above is for 'admin123' - Change this in production!
