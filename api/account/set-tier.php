<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$tier = strtoupper(trim((string) ($body['tier'] ?? '')));
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

// De momento el cambio de plan está reservado a la cuenta interna de pruebas,
// mientras se prepara el sistema de pagos para el resto de usuarios.
if (strtolower($user['email']) !== 'nicolas.grana.miguez@gmail.com') {
    json_error('Todavía no puedes cambiar de plan. Espera a que activemos los pagos.', 403);
}

$stmt = $pdo->prepare('UPDATE users SET tier = ? WHERE id = ?');
$stmt->execute([$tier, $userId]);

json_response(['user' => [
    'id' => (int) $user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'tier' => $tier,
]]);
