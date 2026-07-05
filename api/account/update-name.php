<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$name = trim((string) ($body['name'] ?? ''));

if ($name === '' || strlen($name) > 100) {
    json_error('Introduce tu nombre');
}

$stmt = $pdo->prepare('UPDATE users SET name = ? WHERE id = ?');
$stmt->execute([$name, $userId]);

json_response(['user' => user_response($pdo, $userId)]);
