<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$config = require __DIR__ . '/../config.php';
$clientId = $config['google_client_id'] ?? '';

if ($clientId === '' || $clientId === 'CHANGE_ME') {
    json_error('El inicio de sesión con Google todavía no está configurado.', 501);
}

$body = read_json_body();
$accessToken = (string) ($body['accessToken'] ?? '');

if ($accessToken === '') {
    json_error('Falta el token de Google', 400);
}

// Google verifica el token por nosotros: le pedimos los datos del usuario con
// ese access token, y si es válido nos los devuelve. Evita tener que
// implementar la verificación de firma JWT/JWKS a mano en PHP.
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "Authorization: Bearer {$accessToken}\r\n",
        'timeout' => 5,
        'ignore_errors' => true,
    ],
]);
$raw = @file_get_contents('https://www.googleapis.com/oauth2/v3/userinfo', false, $context);
$info = $raw !== false ? json_decode($raw, true) : null;

if (!is_array($info) || empty($info['sub']) || empty($info['email'])) {
    json_error('No se pudo verificar la cuenta de Google', 401);
}

$googleId = (string) $info['sub'];
$email = (string) $info['email'];
$name = (string) ($info['name'] ?? $email);

if (empty($info['email_verified'])) {
    json_error('Tu cuenta de Google no tiene el email verificado', 401);
}

// ¿Ya existe una cuenta enlazada a este Google ID?
$stmt = $pdo->prepare('SELECT id FROM users WHERE google_id = ?');
$stmt->execute([$googleId]);
$user = $stmt->fetch();

if (!$user) {
    // ¿Existe una cuenta con ese email creada por email/contraseña? La enlazamos.
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        $stmt = $pdo->prepare('UPDATE users SET google_id = ? WHERE id = ?');
        $stmt->execute([$googleId, $user['id']]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO users (name, email, google_id) VALUES (?, ?, ?)');
        $stmt->execute([$name, $email, $googleId]);
        $user = ['id' => $pdo->lastInsertId()];
    }
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];

json_response(['user' => user_response($pdo, (int) $user['id'])]);
