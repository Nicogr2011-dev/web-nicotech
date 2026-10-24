<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_mail.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$email = trim((string) ($body['email'] ?? ''));
$currentPassword = (string) ($body['currentPassword'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
    json_error('Introduce un email válido');
}

$stmt = $pdo->prepare('SELECT name, email, password_hash, email_verified_at FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if ($user['password_hash'] === null) {
    json_error('Tu cuenta entra con Google: crea primero una contraseña para poder cambiar el email.', 409);
}
if (too_many_attempts($pdo, 'password', "user:{$userId}", 30, 10, 15)) {
    json_error('Demasiados intentos. Espera unos minutos y vuelve a probar.', 429);
}
if (!check_password($currentPassword, $user['password_hash'])) {
    record_attempt($pdo, 'password', "user:{$userId}");
    json_error('Contraseña incorrecta', 401);
}

// Volver a poner el email actual anula un cambio pendiente.
if (strcasecmp($email, $user['email']) === 0) {
    $stmt = $pdo->prepare('UPDATE users SET pending_email = NULL, email_token_hash = NULL, email_token_expires = NULL WHERE id = ?');
    $stmt->execute([$userId]);
    json_response(['user' => user_response($pdo, $userId)]);
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
$stmt->execute([$email, $userId]);
if ($stmt->fetch()) {
    json_error('Ya existe una cuenta con ese email');
}
if (too_many_attempts($pdo, 'verify-mail', $user['email'], 20, 5, 60)) {
    json_error('Has pedido demasiados correos. Inténtalo dentro de una hora.', 429);
}
record_attempt($pdo, 'verify-mail', $user['email']);

if ($user['email_verified_at'] === null) {
    // Cuenta aún sin confirmar (ej. se equivocó al escribirlo): se cambia ya y se
    // manda la confirmación a la dirección nueva.
    $stmt = $pdo->prepare('UPDATE users SET email = ?, pending_email = NULL WHERE id = ?');
    $stmt->execute([$email, $userId]);
} else {
    // Cuenta verificada: el email no cambia hasta que se confirme el nuevo desde
    // el enlace (api/auth/verify-email.php).
    $stmt = $pdo->prepare('UPDATE users SET pending_email = ? WHERE id = ?');
    $stmt->execute([$email, $userId]);
}

respond_and_continue(['user' => user_response($pdo, $userId)]);
send_email_verification($pdo, $userId);
if ($user['email_verified_at'] !== null) {
    send_mail(
        $user['email'],
        $user['name'],
        'Cambio de email en tu cuenta de Nicotech',
        "Hola {$user['name']},\n\n"
            . "Se ha pedido cambiar el email de tu cuenta de Nicotech a {$email}. No cambiará hasta que se confirme desde esa dirección.\n\n"
            . "Si no has sido tú, cambia tu contraseña: " . app_url() . "/#/recuperar"
    );
}
exit;
