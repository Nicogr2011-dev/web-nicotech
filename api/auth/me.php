<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if (empty($_SESSION['user_id'])) {
    json_response(['user' => null]);
}

$userId = (int) $_SESSION['user_id'];
$stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
$stmt->execute([$userId]);

if (!$stmt->fetch()) {
    json_response(['user' => null]);
}

json_response(['user' => user_response($pdo, $userId)]);
