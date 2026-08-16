-- Retirada de la función de llamadas de voz (v16.08.26.16.8) y, con ella, del
-- Web Push, que solo existía para avisar al admin de una llamada entrante.
--
-- DESTRUCTIVA: borra el histórico de llamadas y las suscripciones push
-- registradas. Ninguno de esos datos se usa ya en la aplicación.
--
-- call_ice_candidates va primero: tiene una FK hacia calls.
DROP TABLE IF EXISTS call_ice_candidates;
DROP TABLE IF EXISTS calls;
DROP TABLE IF EXISTS push_subscriptions;
