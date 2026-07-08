-- Llamadas de voz web-a-web (WebRTC) desde /contacto hacia la cuenta admin,
-- con señalización por polling (sin websockets, el hosting no tiene Node.js).

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
