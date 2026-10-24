<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_mail.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$stmt = $pdo->prepare('SELECT email, email_verified_at, pending_email FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if ($user['email_verified_at'] !== null && $user['pending_email'] === null) {
    json_error('Tu email ya está confirmado.', 409);
}
if (too_many_attempts($pdo, 'verify-mail', $user['email'], 20, 5, 60)) {
    json_error('Has pedido demasiados correos. Inténtalo dentro de una hora.', 429);
}
record_attempt($pdo, 'verify-mail', $user['email']);

respond_and_continue(['success' => true]);
send_email_verification($pdo, $userId);
exit;
