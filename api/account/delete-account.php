<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_stripe.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$password = (string) ($body['password'] ?? '');

$stmt = $pdo->prepare('SELECT password_hash, avatar_path, stripe_subscription_id FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

// Sin contraseña (cuenta de Google) se confirma escribiendo ELIMINAR.
$confirmed = $user['password_hash'] === null
    ? strtoupper(trim($password)) === 'ELIMINAR'
    : check_password($password, $user['password_hash']);
if (!$confirmed) {
    json_error($user['password_hash'] === null ? 'Escribe ELIMINAR para confirmar' : 'Contraseña incorrecta', 401);
}

// Si no, Stripe seguiría cobrando a una cuenta que ya no existe.
if ($user['stripe_subscription_id'] !== null) {
    if (stripe_request($config, 'DELETE', 'subscriptions/' . $user['stripe_subscription_id']) === null) {
        json_error('No hemos podido cancelar tu plan de pago. Inténtalo de nuevo en un momento.', 502);
    }
}

if (!empty($user['avatar_path'])) {
    $avatarFile = __DIR__ . '/../../uploads/avatars/' . basename(parse_url($user['avatar_path'], PHP_URL_PATH));
    if (is_file($avatarFile)) {
        unlink($avatarFile);
    }
}

$stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
$stmt->execute([$userId]);

$_SESSION = [];
session_destroy();

json_response(['success' => true]);
