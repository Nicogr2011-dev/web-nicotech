<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
[$data, $err] = validate_subscription_payload($body);
if ($err !== null) {
    json_error($err);
}

$stmt = $pdo->prepare('SELECT tier FROM users WHERE id = ?');
$stmt->execute([$userId]);
$tier = $stmt->fetchColumn();

if ($tier === 'BASICO') {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM subscriptions WHERE user_id = ? AND status = 'ACTIVE'");
    $stmt->execute([$userId]);
    if ((int) $stmt->fetchColumn() >= 20) {
        json_error('Has alcanzado el límite de 20 suscripciones del plan Básico. Pásate a Premium para añadir más.', 403);
    }
}

$stmt = $pdo->prepare(
    'INSERT INTO subscriptions (user_id, service_name, price, currency, start_date, cancel_date, accent_color)
     VALUES (?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([
    $userId,
    $data['serviceName'],
    $data['price'],
    $data['currency'],
    $data['startDate'],
    $data['cancelDate'],
    $data['accentColor'],
]);

json_response(['success' => true]);
