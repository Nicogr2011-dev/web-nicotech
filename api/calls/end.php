<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/_call_auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$callId = (int) ($body['callId'] ?? 0);
$callToken = isset($body['callToken']) ? (string) $body['callToken'] : null;
require_call_access($pdo, $callId, $callToken);

$stmt = $pdo->prepare("UPDATE calls SET status = 'ended', ended_at = NOW() WHERE id = ? AND status != 'ended'");
$stmt->execute([$callId]);

json_response(['success' => true]);
