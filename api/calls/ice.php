<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/_call_auth.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $body = read_json_body();
    $callId = (int) ($body['callId'] ?? 0);
    $callToken = isset($body['callToken']) ? (string) $body['callToken'] : null;
    require_call_access($pdo, $callId, $callToken);

    $candidate = (string) ($body['candidate'] ?? '');
    if ($candidate === '') {
        json_error('Falta el candidato ICE');
    }

    $sender = $callToken !== null ? 'caller' : 'callee';
    $stmt = $pdo->prepare('INSERT INTO call_ice_candidates (call_id, sender, candidate) VALUES (?, ?, ?)');
    $stmt->execute([$callId, $sender, $candidate]);
    json_response(['success' => true]);
}

if ($method === 'GET') {
    $callId = (int) ($_GET['callId'] ?? 0);
    $callToken = isset($_GET['callToken']) ? (string) $_GET['callToken'] : null;
    require_call_access($pdo, $callId, $callToken);

    // Cada lado quiere los candidatos que mandó el OTRO lado.
    $wantSender = $callToken !== null ? 'callee' : 'caller';
    $sinceId = (int) ($_GET['sinceId'] ?? 0);

    $stmt = $pdo->prepare(
        'SELECT id, candidate FROM call_ice_candidates WHERE call_id = ? AND sender = ? AND id > ? ORDER BY id ASC'
    );
    $stmt->execute([$callId, $wantSender, $sinceId]);

    $candidates = array_map(function ($row) {
        return ['id' => (int) $row['id'], 'candidate' => $row['candidate']];
    }, $stmt->fetchAll());

    json_response(['candidates' => $candidates]);
}

json_error('Método no permitido', 405);
