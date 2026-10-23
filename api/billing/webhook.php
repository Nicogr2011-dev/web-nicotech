<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_stripe.php';

/**
 * Webhook de Stripe: mantiene el plan del usuario al día con lo que pasa en Stripe
 * fuera de la web — renovaciones (nueva fecha), bajas o reactivaciones hechas desde
 * el panel de Stripe, y suscripciones canceladas por impago. Sin esto la web solo se
 * enteraba de lo que el usuario hacía en ella.
 *
 * Stripe reintenta los avisos que no reciben un 2xx, así que todo es idempotente:
 * cada aviso trae la suscripción completa y simplemente se copia su estado.
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$secret = (string) ($config['stripe_webhook_secret'] ?? '');
if ($secret === '' || $secret === 'CHANGE_ME') {
    json_error('Webhook no configurado', 501);
}

$payload = (string) file_get_contents('php://input');
if (!stripe_verify_signature($payload, (string) ($_SERVER['HTTP_STRIPE_SIGNATURE'] ?? ''), $secret)) {
    json_error('Firma no válida', 400);
}

$event = json_decode($payload, true);
$type = (string) ($event['type'] ?? '');
$subscription = $event['data']['object'] ?? null;

$handled = ['customer.subscription.updated', 'customer.subscription.deleted'];
if (!in_array($type, $handled, true) || !is_array($subscription) || empty($subscription['id'])) {
    json_response(['received' => true]); // otros eventos: no nos interesan
}

// Solo cuenta la suscripción vigente del usuario: las antiguas (de un cambio de
// plan) ya no corresponden a nadie y sus avisos se ignoran.
$stmt = $pdo->prepare('SELECT id FROM users WHERE stripe_subscription_id = ?');
$stmt->execute([(string) $subscription['id']]);
$userId = $stmt->fetchColumn();
if ($userId === false) {
    json_response(['received' => true]);
}
$userId = (int) $userId;

$status = (string) ($subscription['status'] ?? '');

// Cancelada del todo (al final del periodo, desde el panel de Stripe o por impago
// tras los reintentos): pasa a Básico, con el plazo de 3 meses si le sobran.
// past_due no baja el plan: Stripe sigue reintentando el cobro.
if ($type === 'customer.subscription.deleted' || in_array($status, ['canceled', 'unpaid', 'incomplete_expired'], true)) {
    reset_plan_to_basic($pdo, $userId);
    json_response(['received' => true]);
}

$periodEnd = stripe_period_end($subscription);
$cancelAt = $subscription['cancel_at'] ?? null;
// Baja programada (desde la web o desde Stripe) o reactivada en Stripe (null).
$endsAt = !empty($subscription['cancel_at_period_end']) || $cancelAt !== null
    ? date('Y-m-d H:i:s', (int) ($cancelAt ?? $periodEnd ?? time()))
    : null;

$stmt = $pdo->prepare('UPDATE users SET plan_renews_at = ?, plan_ends_at = ? WHERE id = ?');
$stmt->execute([$periodEnd !== null ? date('Y-m-d H:i:s', $periodEnd) : null, $endsAt, $userId]);

json_response(['received' => true]);
