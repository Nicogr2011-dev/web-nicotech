<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$endpoint = trim((string) ($body['endpoint'] ?? ''));
$keys = is_array($body['keys'] ?? null) ? $body['keys'] : [];
$p256dh = (string) ($keys['p256dh'] ?? '');
$auth = (string) ($keys['auth'] ?? '');

if ($endpoint === '' || $p256dh === '' || $auth === '') {
    json_error('Suscripción no válida');
}

$stmt = $pdo->prepare('SELECT id FROM push_subscriptions WHERE endpoint = ?');
$stmt->execute([$endpoint]);
$existing = $stmt->fetchColumn();

if ($existing) {
    $stmt = $pdo->prepare('UPDATE push_subscriptions SET user_id = ?, p256dh = ?, auth = ? WHERE id = ?');
    $stmt->execute([$userId, $p256dh, $auth, $existing]);
} else {
    $stmt = $pdo->prepare(
        'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$userId, $endpoint, $p256dh, $auth]);
}

json_response(['success' => true]);
