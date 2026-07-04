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

$stmt = $pdo->prepare('DELETE FROM subscriptions WHERE id = ? AND user_id = ?');
$stmt->execute([$id, $userId]);

json_response(['success' => true]);
