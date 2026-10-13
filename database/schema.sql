-- ==============================================================================
-- FoodShare Lanka - Database Schema
-- Focus: Jaffna District, Northern Province, Sri Lanka
-- Engine: MySQL 8.0+ / MariaDB 10.4+ (Compatible with XAMPP Linux/Windows)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `foodshare_lanka` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `foodshare_lanka`;

-- 1. Users Table (Core Authentication & Role Management)
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `role` ENUM('donor', 'institution', 'admin') NOT NULL DEFAULT 'donor',
  `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `remember_token` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_is_verified` (`is_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Donor Profiles Table (Wedding halls, caterers, hotels, individuals)
CREATE TABLE IF NOT EXISTS `donor_profiles` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `organization_type` ENUM('Wedding Hall', 'Hotel/Restaurant', 'Catering Service', 'Individual Host', 'Bakery') NOT NULL,
  `venue_name` VARCHAR(191) NOT NULL,
  `address` TEXT NOT NULL,
  `area` VARCHAR(100) NOT NULL COMMENT 'GN Division or Jaffna Area (e.g. Nallur, Chavakachcheri)',
  `district` VARCHAR(50) NOT NULL DEFAULT 'Jaffna',
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `contact_person` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_donor_area` (`area`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Institutions Table (Children's homes, Elders' homes, Care centres in Jaffna)
CREATE TABLE IF NOT EXISTS `institutions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `institution_type` ENUM("Children's Home", "Elders' Home", "Care Centre") NOT NULL,
  `registration_number` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Government / Department of Social Welfare Registration Code',
  `name` VARCHAR(191) NOT NULL,
  `address` TEXT NOT NULL,
  `area` VARCHAR(100) NOT NULL COMMENT 'e.g. Nallur, Kopay, Point Pedro, Chavakachcheri',
  `district` VARCHAR(50) NOT NULL DEFAULT 'Jaffna',
  `resident_count` INT UNSIGNED NOT NULL DEFAULT 10,
  `operating_hours` VARCHAR(100) NOT NULL DEFAULT '08:00 AM - 08:00 PM',
  `latitude` DECIMAL(10, 8) NOT NULL DEFAULT 9.661500,
  `longitude` DECIMAL(11, 8) NOT NULL DEFAULT 80.025500,
  `needs_delivery` BOOLEAN NOT NULL DEFAULT FALSE,
  `contact_person` VARCHAR(150) NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_institution_area` (`area`),
  INDEX `idx_institution_type` (`institution_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Institution Dietary Requirements Table
CREATE TABLE IF NOT EXISTS `institution_dietary_requirements` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `requirement` VARCHAR(150) NOT NULL COMMENT 'e.g. Pure Vegetarian, Soft Foods for Seniors, Low Spice',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE,
  INDEX `idx_dietary_inst` (`institution_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Food Donations Table (Surplus listings with full 21 field metadata)
CREATE TABLE IF NOT EXISTS `food_donations` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `donor_id` BIGINT UNSIGNED NOT NULL,
  `food_name` VARCHAR(191) NOT NULL,
  `category` ENUM('Rice and Curry', 'Vegetarian Meals', 'Chicken Meals', 'Snacks', 'Fruits', 'Bakery Items', 'Other') NOT NULL,
  `description` TEXT NOT NULL,
  `total_quantity` INT UNSIGNED NOT NULL,
  `remaining_quantity` INT UNSIGNED NOT NULL,
  `unit` ENUM('portions', 'meal boxes', 'kilograms') NOT NULL DEFAULT 'portions',
  `serves_count` INT UNSIGNED NOT NULL,
  `event_name` VARCHAR(191) NOT NULL,
  `venue_name` VARCHAR(191) NOT NULL,
  `pickup_address` TEXT NOT NULL,
  `area` VARCHAR(100) NOT NULL,
  `district` VARCHAR(50) NOT NULL DEFAULT 'Jaffna',
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `prepared_at` TIMESTAMP NOT NULL,
  `safe_collection_deadline` TIMESTAMP NOT NULL,
  `storage_condition` ENUM(
    'Properly Hot-Held (>60°C)',
    'Refrigerated (<5°C)',
    'Ambient Covered / Freshly Prepared',
    'Insulated Food Carrier'
  ) NOT NULL,
  `is_vegetarian` BOOLEAN NOT NULL DEFAULT TRUE,
  `allergen_info` TEXT NULL,
  `contact_person` VARCHAR(150) NOT NULL,
  `contact_number` VARCHAR(30) NOT NULL,
  `logistics_preference` ENUM('Pickup Only', 'Delivery Available', 'Flexible') NOT NULL DEFAULT 'Pickup Only',
  `special_instructions` TEXT NULL,
  `status` ENUM(
    'Draft',
    'Pending Approval',
    'Available',
    'Request Received',
    'Approved',
    'Ready for Collection',
    'Collected',
    'Delivered',
    'Expired',
    'Cancelled'
  ) NOT NULL DEFAULT 'Available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`donor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_donations_status` (`status`),
  INDEX `idx_donations_area` (`area`),
  INDEX `idx_donations_deadline` (`safe_collection_deadline`),
  INDEX `idx_donations_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Donation Photos Table
CREATE TABLE IF NOT EXISTS `donation_photos` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `donation_id` BIGINT UNSIGNED NOT NULL,
  `photo_url` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`donation_id`) REFERENCES `food_donations`(`id`) ON DELETE CASCADE,
  INDEX `idx_photo_donation` (`donation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Food Requests Table (Care home requests with portion bounds)
CREATE TABLE IF NOT EXISTS `food_requests` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `donation_id` BIGINT UNSIGNED NOT NULL,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `requested_portions` INT UNSIGNED NOT NULL,
  `people_to_feed` INT UNSIGNED NOT NULL,
  `preferred_collection_time` VARCHAR(50) NOT NULL,
  `logistics_type` ENUM('Self Pickup', 'Request Delivery') NOT NULL DEFAULT 'Self Pickup',
  `dietary_requirements` TEXT NULL,
  `additional_notes` TEXT NULL,
  `status` ENUM(
    'Pending',
    'Approved',
    'Rejected',
    'Ready for Collection',
    'Collected',
    'Delivered',
    'Cancelled'
  ) NOT NULL DEFAULT 'Pending',
  `rejection_reason` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`donation_id`) REFERENCES `food_donations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE CASCADE,
  INDEX `idx_requests_status` (`status`),
  INDEX `idx_requests_institution` (`institution_id`),
  INDEX `idx_requests_donation` (`donation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Donation Status History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS `donation_status_history` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `donation_id` BIGINT UNSIGNED NOT NULL,
  `previous_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `changed_by_user_id` BIGINT UNSIGNED NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`donation_id`) REFERENCES `food_donations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`changed_by_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_history_donation` (`donation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. In-App Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `recipient_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info', 'request', 'approval', 'rejection', 'safety', 'completed') NOT NULL DEFAULT 'info',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_notif_recipient` (`recipient_id`),
  INDEX `idx_notif_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Complaints and Safety Reports Table
CREATE TABLE IF NOT EXISTS `complaints` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `reporter_user_id` BIGINT UNSIGNED NOT NULL,
  `target_type` ENUM('Donation', 'Institution', 'Donor') NOT NULL,
  `target_id` BIGINT UNSIGNED NOT NULL,
  `reason` ENUM(
    'Unsafe Food Concern',
    'Inaccurate Listing Details',
    'Missed Collection',
    'Inappropriate Conduct',
    'Other'
  ) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('Investigating', 'Resolved', 'Dismissed') NOT NULL DEFAULT 'Investigating',
  `admin_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`reporter_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_complaints_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Collection Records Table (Physical Verification & Receipt)
CREATE TABLE IF NOT EXISTS `collection_records` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `request_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `collector_name` VARCHAR(150) NOT NULL,
  `collector_phone` VARCHAR(30) NOT NULL,
  `temperature_verified_celsius` DECIMAL(4, 1) NULL,
  `hygiene_checklist_passed` BOOLEAN NOT NULL DEFAULT TRUE,
  `confirmed_portions_received` INT UNSIGNED NOT NULL,
  `recipient_feedback` TEXT NULL,
  `collected_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`request_id`) REFERENCES `food_requests`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
