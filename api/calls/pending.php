<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Método no permitido', 405);
}

require_admin();

$stmt = $pdo->prepare("SELECT id, offer_sdp, created_at FROM calls WHERE status = 'ringing' ORDER BY id DESC LIMIT 1");
$stmt->execute();
$call = $stmt->fetch();

if (!$call) {
    json_response(['call' => null]);
}

json_response(['call' => [
    'id' => (int) $call['id'],
    'offerSdp' => $call['offer_sdp'],
    'createdAt' => $call['created_at'],
]]);
