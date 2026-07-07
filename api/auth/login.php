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
$remember = !empty($body['remember']);

if (!verify_recaptcha($recaptchaToken, 'login')) {
    json_error('Verificación de seguridad fallida. Recarga la página e inténtalo de nuevo.', 400);
}

$stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !$user['password_hash'] || !password_verify($password, $user['password_hash'])) {
    json_error('Email o contraseña incorrectos', 401);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];

// "Mantener sesión iniciada": la cookie dura 30 días en vez de cerrarse con el navegador.
// La sesión ya está activa a estas alturas (arrancada en _bootstrap.php), así que no se
// puede usar session_set_cookie_params — en su lugar reemplazamos la cookie ya enviada
// por session_regenerate_id() con una nueva de mayor duración.
if ($remember) {
    $cookieSecure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    setcookie(session_name(), session_id(), [
        'expires' => time() + 60 * 60 * 24 * 30,
        'path' => '/',
        'domain' => '',
        'secure' => $cookieSecure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

json_response(['user' => user_response($pdo, (int) $user['id'])]);
