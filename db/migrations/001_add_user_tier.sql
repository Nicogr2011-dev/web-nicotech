-- Añade el nivel de cuenta (Básico / Premium) a los usuarios ya existentes.
-- Ejecutar una sola vez en cada base de datos (local y producción).
ALTER TABLE users
  ADD COLUMN tier ENUM('BASICO','PREMIUM') NOT NULL DEFAULT 'BASICO' AFTER password_hash;
