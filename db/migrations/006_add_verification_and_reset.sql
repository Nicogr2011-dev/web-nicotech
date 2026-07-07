-- Verificación por email de suscripciones (reenvío a verifica@nicotech.es) y
-- recuperación de contraseña por email.

ALTER TABLE subscriptions
  ADD COLUMN verification_code VARCHAR(16) NULL,
  ADD COLUMN verified_at DATETIME NULL;

ALTER TABLE users
  ADD COLUMN reset_token VARCHAR(64) NULL,
  ADD COLUMN reset_token_expires DATETIME NULL;
