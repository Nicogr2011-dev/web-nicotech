<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (empty($_SESSION['user_id'])) {
    json_response(['user' => null]);
}

$stmt = $pdo->prepare('SELECT id, name, email FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    json_response(['user' => null]);
}

json_response(['user' => [
    'id' => (int) $user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
]]);
