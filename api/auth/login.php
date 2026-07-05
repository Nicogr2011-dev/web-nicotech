<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$email = trim((string) ($body['email'] ?? ''));
$password = (string) ($body['password'] ?? '');
$recaptchaToken = $body['recaptchaToken'] ?? null;

if (!verify_recaptcha($recaptchaToken, 'login')) {
    json_error('Verificación de seguridad fallida. Recarga la página e inténtalo de nuevo.', 400);
}

$stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_error('Email o contraseña incorrectos', 401);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];

json_response(['user' => user_response($pdo, (int) $user['id'])]);
