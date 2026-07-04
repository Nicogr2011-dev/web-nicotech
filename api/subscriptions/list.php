<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$userId = require_auth();

$stmt = $pdo->prepare(
    'SELECT id, service_name, price, currency, start_date, cancel_date, status, accent_color
     FROM subscriptions WHERE user_id = ? ORDER BY start_date ASC'
);
$stmt->execute([$userId]);
$rows = $stmt->fetchAll();

$subscriptions = array_map(function ($row) {
    return [
        'id' => (string) $row['id'],
        'serviceName' => $row['service_name'],
        'price' => (float) $row['price'],
        'currency' => $row['currency'],
        'startDate' => $row['start_date'],
        'cancelDate' => $row['cancel_date'],
        'status' => $row['status'],
        'accentColor' => $row['accent_color'],
    ];
}, $rows);

json_response(['subscriptions' => $subscriptions]);
