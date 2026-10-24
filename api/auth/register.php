<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_mail.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$name = clean_name((string) ($body['name'] ?? ''));
$email = trim((string) ($body['email'] ?? ''));
$password = (string) ($body['password'] ?? '');
$recaptchaToken = $body['recaptchaToken'] ?? null;

// Contra bots: como mucho 5 cuentas por IP y hora.
if (too_many_attempts($pdo, 'register', null, 5, 0, 60)) {
    json_error('Demasiados registros desde tu conexión. Inténtalo más tarde.', 429);
}

if (!verify_recaptcha($recaptchaToken, 'register')) {
    json_error('Verificación de seguridad fallida. Recarga la página e inténtalo de nuevo.', 400);
}

if ($name === '' || strlen($name) > 100) {
    json_error('Introduce tu nombre');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('Introduce un email válido');
}
if (strlen($password) < 8 || strlen($password) > 72) {
    json_error('La contraseña debe tener entre 8 y 72 caracteres');
}

$stmt = $pdo->prepare('SELECT id, email_verified_at, created_at FROM users WHERE email = ?');
$stmt->execute([$email]);
$existing = $stmt->fetch();
if ($existing) {
    // Alguien pudo registrarse con un email ajeno y no confirmarlo nunca: pasados
    // 2 días esa cuenta se libera para el dueño real (sin verificar no pudo
    // guardar suscripciones, así que no se pierde nada).
    $abandoned = $existing['email_verified_at'] === null && strtotime($existing['created_at']) < time() - 2 * 86400;
    if (!$abandoned) {
        json_error('Ya existe una cuenta con ese email');
    }
    $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$existing['id']]);
}

record_attempt($pdo, 'register', $email);

$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
$stmt->execute([$name, $email, $hash]);
$userId = (int) $pdo->lastInsertId();

// El correo (SMTP, lento) va después de responder.
respond_and_continue(['success' => true]);
send_email_verification($pdo, $userId);
exit;
