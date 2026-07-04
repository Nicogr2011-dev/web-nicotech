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

[$data, $err] = validate_subscription_payload($body);
if ($err !== null) {
    json_error($err);
}

$stmt = $pdo->prepare(
    'UPDATE subscriptions
     SET service_name = ?, price = ?, currency = ?, start_date = ?, cancel_date = ?, accent_color = ?
     WHERE id = ? AND user_id = ?'
);
$stmt->execute([
    $data['serviceName'],
    $data['price'],
    $data['currency'],
    $data['startDate'],
    $data['cancelDate'],
    $data['accentColor'],
    $id,
    $userId,
]);

json_response(['success' => true]);
