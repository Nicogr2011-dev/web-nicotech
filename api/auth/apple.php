<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$config = require __DIR__ . '/../config.php';
$clientId = $config['apple_client_id'] ?? '';

if ($clientId === '' || $clientId === 'CHANGE_ME') {
    json_error('El inicio de sesión con Apple todavía no está configurado.', 501);
}

$body = read_json_body();
$idToken = (string) ($body['idToken'] ?? '');
$rawUser = $body['user'] ?? null; // Apple solo manda el nombre la primera vez que autorizas.

if ($idToken === '') {
    json_error('Falta el token de Apple', 400);
}

$claims = verify_jwt_rs256($idToken, 'https://appleid.apple.com/auth/keys', 'https://appleid.apple.com', $clientId);

if ($claims === null || empty($claims['sub'])) {
    json_error('No se pudo verificar la cuenta de Apple', 401);
}

$appleId = (string) $claims['sub'];
$email = (string) ($claims['email'] ?? '');
$name = trim((string) ($rawUser['name']['firstName'] ?? '') . ' ' . (string) ($rawUser['name']['lastName'] ?? ''));
if ($name === '') {
    $name = $email !== '' ? $email : 'Usuario de Apple';
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE apple_id = ?');
$stmt->execute([$appleId]);
$user = $stmt->fetch();

if (!$user) {
    // ¿Existe una cuenta con ese email creada por email/contraseña u otro proveedor? La enlazamos.
    $user = null;
    if ($email !== '') {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
    }

    if ($user) {
        $stmt = $pdo->prepare('UPDATE users SET apple_id = ? WHERE id = ?');
        $stmt->execute([$appleId, $user['id']]);
    } elseif ($email !== '') {
        $stmt = $pdo->prepare('INSERT INTO users (name, email, apple_id) VALUES (?, ?, ?)');
        $stmt->execute([$name, $email, $appleId]);
        $user = ['id' => $pdo->lastInsertId()];
    } else {
        // Sin email (no es la primera vez que este usuario autoriza y no lo enlazamos antes).
        json_error('No hemos podido enlazar tu cuenta de Apple. Inicia sesión con Apple la primera vez desde "Crear cuenta".', 401);
    }
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];

json_response(['user' => user_response($pdo, (int) $user['id'])]);
