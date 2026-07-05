<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$password = (string) ($body['password'] ?? '');

$stmt = $pdo->prepare('SELECT password_hash, avatar_path FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_error('Contraseña incorrecta', 401);
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
