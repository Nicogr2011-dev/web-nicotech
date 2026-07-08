-- Esquema MySQL/MariaDB para Nicotech — Fase 1

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  google_id VARCHAR(255) NULL UNIQUE,
  apple_id VARCHAR(255) NULL UNIQUE,
  tier ENUM('BASICO','PREMIUM','PREMIUM_LITE') NOT NULL DEFAULT 'BASICO',
  avatar_path VARCHAR(255) NULL,
  reset_token VARCHAR(64) NULL,
  reset_token_expires DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  service_name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  start_date DATE NOT NULL,
  cancel_date DATE NULL,
  status ENUM('ACTIVE','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  cancelled_at DATETIME NULL,
  deleted_at DATETIME NULL,
  verification_code VARCHAR(16) NULL,
  verified_at DATETIME NULL,
  accent_color VARCHAR(7) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_subscriptions_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_push_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_push_subscriptions_user_id (user_id),
  INDEX idx_push_subscriptions_endpoint (endpoint(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS calls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  call_token VARCHAR(32) NOT NULL,
  offer_sdp TEXT NOT NULL,
  answer_sdp TEXT NULL,
  status ENUM('ringing','answered','ended','missed','rejected') NOT NULL DEFAULT 'ringing',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME NULL,
  ended_at DATETIME NULL,
  INDEX idx_calls_token (call_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS call_ice_candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  call_id INT NOT NULL,
  sender ENUM('caller','callee') NOT NULL,
  candidate TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_call_ice_candidates_call FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE,
  INDEX idx_call_ice_candidates_call_sender (call_id, sender)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
