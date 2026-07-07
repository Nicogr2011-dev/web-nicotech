<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$token = (string) ($body['token'] ?? '');
$password = (string) ($body['password'] ?? '');

if ($token === '') {
    json_error('Enlace no válido');
}
if (strlen($password) < 8 || strlen($password) > 72) {
    json_error('La contraseña debe tener entre 8 y 72 caracteres');
}

$stmt = $pdo->prepare('SELECT id, reset_token_expires FROM users WHERE reset_token = ?');
$stmt->execute([$token]);
$user = $stmt->fetch();

if (!$user || strtotime((string) $user['reset_token_expires']) < time()) {
    json_error('El enlace no es válido o ha caducado. Pide uno nuevo.');
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?');
$stmt->execute([$hash, $user['id']]);

json_response(['success' => true]);
