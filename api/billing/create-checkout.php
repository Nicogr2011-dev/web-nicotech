<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_stripe.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

if (stripe_secret_key($config) === '') {
    json_error('El pago con tarjeta todavía no está disponible.', 501);
}

$body = read_json_body();
$tier = strtoupper(trim((string) ($body['tier'] ?? '')));
$interval = (string) ($body['interval'] ?? '');
$slug = (string) ($body['slug'] ?? '');

if (!isset(STRIPE_PLAN_PRICES[$tier]) || !in_array($interval, ['year', 'month'], true)) {
    json_error('Plan no válido', 400);
}
if (!preg_match('/^[a-z-]+$/', $slug)) {
    json_error('Plan no válido', 400);
}

$stmt = $pdo->prepare('SELECT email FROM users WHERE id = ?');
$stmt->execute([$userId]);
$email = (string) $stmt->fetchColumn();

$plan = STRIPE_PLAN_PRICES[$tier];
$appUrl = rtrim((string) ($config['app_url'] ?? 'https://nicotech.es'), '/');

// La web usa HashRouter: el session_id va en la query *antes* del #, que es
// donde Stripe lo sustituye y donde la página lo lee (window.location.search).
$session = stripe_request($config, 'POST', 'checkout/sessions', [
    'mode' => 'subscription',
    'client_reference_id' => (string) $userId,
    'customer_email' => $email,
    'locale' => 'es',
    'line_items' => [[
        'quantity' => 1,
        'price_data' => [
            'currency' => 'eur',
            'unit_amount' => $plan[$interval],
            'recurring' => ['interval' => $interval],
            'product_data' => ['name' => $plan['name']],
        ],
    ]],
    'metadata' => ['tier' => $tier, 'interval' => $interval, 'user_id' => (string) $userId],
    'success_url' => "{$appUrl}/?stripe_session={CHECKOUT_SESSION_ID}#/pago/{$slug}",
    'cancel_url' => "{$appUrl}/#/pago/{$slug}",
]);

if ($session === null || empty($session['url'])) {
    json_error('No se pudo iniciar el pago. Inténtalo de nuevo.', 502);
}

json_response(['url' => $session['url']]);
