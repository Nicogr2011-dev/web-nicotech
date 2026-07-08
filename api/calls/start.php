<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_webpush.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$offerSdp = (string) ($body['offerSdp'] ?? '');
if ($offerSdp === '') {
    json_error('Falta la oferta de la llamada');
}

$callToken = bin2hex(random_bytes(16));
$stmt = $pdo->prepare('INSERT INTO calls (call_token, offer_sdp) VALUES (?, ?)');
$stmt->execute([$callToken, $offerSdp]);
$callId = (int) $pdo->lastInsertId();

respond_and_continue(['callId' => $callId, 'callToken' => $callToken]);

notify_admin_of_call($pdo, $config);
exit;
