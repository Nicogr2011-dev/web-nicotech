<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_stripe.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$tier = strtoupper(trim((string) ($body['tier'] ?? '')));
$code = (string) ($body['code'] ?? '');
$allowedTiers = ['BASICO', 'PREMIUM', 'PREMIUM_LITE'];

if (!in_array($tier, $allowedTiers, true)) {
    json_error('Plan no válido', 400);
}

$stmt = $pdo->prepare('SELECT id, name, email, tier, stripe_subscription_id FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    json_error('Usuario no encontrado', 404);
}

// La cuenta interna de pruebas siempre puede cambiar de plan gratis. Mientras
// no hay pasarela de pago real, cualquier otra cuenta necesita un código de
// acceso (canjeable, no ligado a una tarjeta) para desbloquear el cambio.
$isPrivileged = strtolower($user['email']) === 'nicolas.grana.miguez@gmail.com';
$isFreeTarget = $tier === 'BASICO';
$codeHash = $config['plan_redeem_code_hash'] ?? '';
$codeValid = $code !== '' && $codeHash !== '' && $codeHash !== 'CHANGE_ME' && password_verify($code, $codeHash);

if (!$isPrivileged && !$isFreeTarget && !$codeValid) {
    if ($code !== '') {
        json_error('Código no válido', 403);
    }
    json_error('Todavía no puedes cambiar de plan. Introduce un código de acceso o espera a que activemos los pagos.', 403);
}

if ($isFreeTarget) {
    // Bajar a Básico con un plan pagado en Stripe tiene que pasar por la baja
    // (api/billing/cancel.php): si no, Stripe seguiría cobrando.
    if ($user['stripe_subscription_id'] !== null) {
        json_error('Para pasar a Básico, date de baja de tu plan desde tu panel.', 409);
    }
    reset_plan_to_basic($pdo, $userId);
} else {
    // Cambio a otro plan de pago sin pasar por Stripe (código o cuenta interna):
    // la suscripción de Stripe que hubiera dejaría de corresponder, se cancela.
    if ($user['stripe_subscription_id'] !== null) {
        stripe_request($config, 'DELETE', 'subscriptions/' . $user['stripe_subscription_id']);
    }
    // Plan activado con código (o por la cuenta interna): no hay cobro detrás.
    $stmt = $pdo->prepare(
        'UPDATE users SET tier = ?, stripe_subscription_id = NULL, plan_interval = NULL,
                plan_started_at = ?, plan_renews_at = NULL, plan_ends_at = NULL
         WHERE id = ?'
    );
    $stmt->execute([$tier, date('Y-m-d H:i:s'), $userId]);
    update_limit_grace($pdo, $userId, $tier);
}

json_response(['user' => user_response($pdo, $userId)]);
