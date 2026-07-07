<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_mail.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$email = trim((string) ($body['email'] ?? ''));

// Respuesta siempre genérica e inmediata: no revela si el email existe en el
// sistema, ni su tiempo de respuesta (el envío del email, más lento, va después).
respond_and_continue(['success' => true]);

if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $stmt = $pdo->prepare('SELECT id, name FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + 3600);
        $stmt = $pdo->prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?');
        $stmt->execute([$token, $expires, $user['id']]);

        $link = 'https://nicotech.es/#/restablecer-contrasena?token=' . $token;
        $mailBody = "Hola {$user['name']},\n\n"
            . "Has pedido restablecer tu contraseña en Nicotech. Este enlace es válido durante 1 hora:\n\n"
            . "{$link}\n\n"
            . "Si no has sido tú, puedes ignorar este correo.";
        send_mail($email, $user['name'], 'Restablece tu contraseña de Nicotech', $mailBody);
    }
}
exit;
