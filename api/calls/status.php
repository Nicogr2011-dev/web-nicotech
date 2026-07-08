<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/_call_auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Método no permitido', 405);
}

$callId = (int) ($_GET['callId'] ?? 0);
$callToken = isset($_GET['callToken']) ? (string) $_GET['callToken'] : null;
$call = require_call_access($pdo, $callId, $callToken);

json_response([
    'status' => $call['status'],
    'answerSdp' => $call['answer_sdp'],
]);
