-- Nicotech V1: Básico sin límite de suscripciones, verificación de email,
-- admin por permiso (no por el texto del email) y límite de intentos de login.

-- Ya no hay límites: ningún plazo de 3 meses tiene sentido.
UPDATE users SET limit_grace_ends_at = NULL;

ALTER TABLE users
  ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN email_verified_at DATETIME NULL,
  ADD COLUMN pending_email VARCHAR(190) NULL,
  ADD COLUMN email_token_hash CHAR(64) NULL,
  ADD COLUMN email_token_expires DATETIME NULL;

-- Las cuentas que ya existían no se bloquean: se dan por verificadas.
UPDATE users SET email_verified_at = created_at;
UPDATE users SET is_admin = 1 WHERE email = 'nicolas.grana.miguez@gmail.com';

-- Intentos de login/registro/correos por IP y email, para cortar la fuerza bruta.
-- Se borran solos al día (record_attempt() en api/_bootstrap.php).
CREATE TABLE IF NOT EXISTS auth_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(20) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  email VARCHAR(190) NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_auth_attempts_ip (action, ip, created_at),
  INDEX idx_auth_attempts_email (action, email, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
