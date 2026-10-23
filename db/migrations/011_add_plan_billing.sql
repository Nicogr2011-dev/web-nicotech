-- Plan de Nicotech como suscripción visible en el panel (v23.10.26.18.0):
-- de qué suscripción de Stripe viene, cada cuánto se cobra, cuándo se renueva
-- y, si el usuario se ha dado de baja, hasta cuándo conserva el plan.

ALTER TABLE users
  ADD COLUMN stripe_subscription_id VARCHAR(255) NULL,
  ADD COLUMN plan_interval ENUM('year','month') NULL,
  ADD COLUMN plan_started_at DATETIME NULL,
  ADD COLUMN plan_renews_at DATETIME NULL,
  ADD COLUMN plan_ends_at DATETIME NULL;
