-- Plazo para volver a un plan de pago (v23.10.26.19.0): al pasar a Básico con
-- más de 3 suscripciones activas, el usuario tiene 3 meses para renovar; si no,
-- se cancelan las más recientes hasta quedarse en el límite de Básico.

ALTER TABLE users
  ADD COLUMN limit_grace_ends_at DATETIME NULL;
