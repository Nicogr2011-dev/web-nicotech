<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_stripe.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$stmt = $pdo->prepare('SELECT tier, stripe_subscription_id, plan_renews_at, plan_ends_at FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user || $user['tier'] === 'BASICO') {
    json_error('No tienes ningún plan de pago activo.', 400);
}
if ($user['plan_ends_at'] !== null) {
    json_error('Ya te has dado de baja de este plan.', 400);
}

if ($user['stripe_subscription_id'] === null) {
    // Plan activado con código: no hay nada que dejar de cobrar, se baja ya.
    reset_plan_to_basic($pdo, $userId);
    json_response(['user' => user_response($pdo, $userId)]);
}

// Pagado con Stripe: se cancela al final del periodo ya pagado, para no quitarle
// al usuario lo que ya ha abonado. Stripe deja de cobrar; el plan se baja solo
// en user_response() cuando llega plan_ends_at.
$subscription = stripe_request($config, 'POST', 'subscriptions/' . $user['stripe_subscription_id'], [
    'cancel_at_period_end' => 'true',
]);
if ($subscription === null) {
    json_error('No hemos podido cancelar el cobro en Stripe. Inténtalo de nuevo en un momento.', 502);
}

$periodEnd = $subscription['cancel_at']
    ?? $subscription['items']['data'][0]['current_period_end']
    ?? $subscription['current_period_end']
    ?? null;
$endsAt = $periodEnd !== null ? date('Y-m-d H:i:s', (int) $periodEnd) : ($user['plan_renews_at'] ?? date('Y-m-d H:i:s'));

$stmt = $pdo->prepare('UPDATE users SET plan_ends_at = ? WHERE id = ?');
$stmt->execute([$endsAt, $userId]);

json_response(['user' => user_response($pdo, $userId)]);
