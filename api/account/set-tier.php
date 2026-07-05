<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

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

$stmt = $pdo->prepare('SELECT id, name, email, tier FROM users WHERE id = ?');
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

$stmt = $pdo->prepare('UPDATE users SET tier = ? WHERE id = ?');
$stmt->execute([$tier, $userId]);

json_response(['user' => [
    'id' => (int) $user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'tier' => $tier,
]]);
