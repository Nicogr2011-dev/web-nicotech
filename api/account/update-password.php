<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$currentPassword = (string) ($body['currentPassword'] ?? '');
$newPassword = (string) ($body['newPassword'] ?? '');

if (strlen($newPassword) < 8 || strlen($newPassword) > 72) {
    json_error('La contraseña debe tener entre 8 y 72 caracteres');
}

$stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

// Las cuentas creadas con Google no tienen contraseña: pueden crear una sin la actual
// (ya están autenticadas por la sesión).
if (too_many_attempts($pdo, 'password', "user:{$userId}", 30, 10, 15)) {
    json_error('Demasiados intentos. Espera unos minutos y vuelve a probar.', 429);
}
if ($user['password_hash'] !== null && !check_password($currentPassword, $user['password_hash'])) {
    record_attempt($pdo, 'password', "user:{$userId}");
    json_error('Contraseña actual incorrecta', 401);
}

$hash = password_hash($newPassword, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
$stmt->execute([$hash, $userId]);

json_response(['user' => user_response($pdo, $userId)]);
