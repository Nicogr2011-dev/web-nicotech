<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$email = trim((string) ($body['email'] ?? ''));
$currentPassword = (string) ($body['currentPassword'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('Introduce un email válido');
}

$stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
    json_error('Contraseña incorrecta', 401);
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
$stmt->execute([$email, $userId]);
if ($stmt->fetch()) {
    json_error('Ya existe una cuenta con ese email');
}

$stmt = $pdo->prepare('UPDATE users SET email = ? WHERE id = ?');
$stmt->execute([$email, $userId]);

json_response(['user' => user_response($pdo, $userId)]);
