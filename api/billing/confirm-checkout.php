<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_stripe.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$sessionId = (string) ($body['sessionId'] ?? '');

if (!preg_match('/^cs_[A-Za-z0-9_]+$/', $sessionId)) {
    json_error('Pago no válido', 400);
}

// No nos fiamos de que el usuario haya vuelto a la URL de éxito: le preguntamos
// a Stripe por la sesión y solo cambiamos de plan si está pagada y es suya.
$session = stripe_request($config, 'GET', 'checkout/sessions/' . $sessionId);

if ($session === null) {
    json_error('No se pudo comprobar el pago.', 502);
}
if ((string) ($session['client_reference_id'] ?? '') !== (string) $userId) {
    json_error('Este pago no corresponde a tu cuenta.', 403);
}
if (($session['status'] ?? '') !== 'complete' || !in_array($session['payment_status'] ?? '', ['paid', 'no_payment_required'], true)) {
    json_error('El pago no se ha completado.', 402);
}

$tier = (string) ($session['metadata']['tier'] ?? '');
if (!isset(STRIPE_PLAN_PRICES[$tier])) {
    json_error('Plan no válido', 400);
}

$stmt = $pdo->prepare('UPDATE users SET tier = ? WHERE id = ?');
$stmt->execute([$tier, $userId]);

json_response(['user' => user_response($pdo, $userId)]);
