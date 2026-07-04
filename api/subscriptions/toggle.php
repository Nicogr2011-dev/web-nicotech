<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$id = (int) ($body['id'] ?? 0);
if ($id <= 0) {
    json_error('ID no válido');
}

$stmt = $pdo->prepare('SELECT status FROM subscriptions WHERE id = ? AND user_id = ?');
$stmt->execute([$id, $userId]);
$row = $stmt->fetch();
if (!$row) {
    json_error('No encontrado', 404);
}

$newStatus = $row['status'] === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE';
$stmt = $pdo->prepare('UPDATE subscriptions SET status = ? WHERE id = ? AND user_id = ?');
$stmt->execute([$newStatus, $id, $userId]);

json_response(['success' => true]);
