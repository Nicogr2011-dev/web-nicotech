<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

require_admin();

$body = read_json_body();
$callId = (int) ($body['callId'] ?? 0);
$answerSdp = (string) ($body['answerSdp'] ?? '');
if ($answerSdp === '') {
    json_error('Falta la respuesta de la llamada');
}

$stmt = $pdo->prepare(
    "UPDATE calls SET answer_sdp = ?, status = 'answered', answered_at = NOW() WHERE id = ? AND status = 'ringing'"
);
$stmt->execute([$answerSdp, $callId]);

if ($stmt->rowCount() === 0) {
    json_error('Esta llamada ya no está disponible', 409);
}

json_response(['success' => true]);
