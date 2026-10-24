<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$token = (string) ($body['token'] ?? '');

if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
    json_error('Enlace no válido');
}

// No hace falta tener la sesión abierta: el enlace se puede abrir en otro dispositivo.
$stmt = $pdo->prepare('SELECT id, pending_email, email_token_expires FROM users WHERE email_token_hash = ?');
$stmt->execute([hash('sha256', $token)]);
$user = $stmt->fetch();

if (!$user || strtotime((string) $user['email_token_expires']) < time()) {
    json_error('El enlace no es válido o ha caducado. Pide uno nuevo desde tu cuenta.');
}

if ($user['pending_email'] !== null) {
    // Entre la petición y la confirmación, otra cuenta pudo quedarse ese email.
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
    $stmt->execute([$user['pending_email'], $user['id']]);
    if ($stmt->fetch()) {
        $pdo->prepare('UPDATE users SET pending_email = NULL, email_token_hash = NULL, email_token_expires = NULL WHERE id = ?')
            ->execute([$user['id']]);
        json_error('Ese email ya lo usa otra cuenta.', 409);
    }
    $stmt = $pdo->prepare(
        'UPDATE users SET email = pending_email, pending_email = NULL, email_verified_at = ?,
                email_token_hash = NULL, email_token_expires = NULL
         WHERE id = ?'
    );
} else {
    $stmt = $pdo->prepare(
        'UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?), email_token_hash = NULL, email_token_expires = NULL
         WHERE id = ?'
    );
}
$stmt->execute([date('Y-m-d H:i:s'), $user['id']]);

json_response(['success' => true]);
