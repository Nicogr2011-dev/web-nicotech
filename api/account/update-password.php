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

if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
    json_error('Contraseña actual incorrecta', 401);
}

$hash = password_hash($newPassword, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
$stmt->execute([$hash, $userId]);

json_response(['success' => true]);
