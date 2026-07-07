<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$userId = require_auth();

// Se incluyen también las eliminadas (deleted_at): el frontend las usa para que el
// gasto histórico de las gráficas no desaparezca, pero no las muestra como tarjetas.
$stmt = $pdo->prepare(
    'SELECT id, service_name, price, currency, start_date, cancel_date, status, cancelled_at, deleted_at, accent_color
     FROM subscriptions WHERE user_id = ? ORDER BY start_date ASC'
);
$stmt->execute([$userId]);
$rows = $stmt->fetchAll();

$subscriptions = array_map(function ($row) {
    return [
        'id' => (string) $row['id'],
        'serviceName' => $row['service_name'],
        'price' => round((float) $row['price'], 2),
        'currency' => $row['currency'],
        'startDate' => $row['start_date'],
        'cancelDate' => $row['cancel_date'],
        'status' => $row['status'],
        'cancelledAt' => $row['cancelled_at'],
        'deletedAt' => $row['deleted_at'],
        'accentColor' => $row['accent_color'],
    ];
}, $rows);

json_response(['subscriptions' => $subscriptions]);
