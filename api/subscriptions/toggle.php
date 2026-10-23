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

$stmt = $pdo->prepare('SELECT status FROM subscriptions WHERE id = ? AND user_id = ?');
$stmt->execute([$id, $userId]);
$row = $stmt->fetch();
if (!$row) {
    json_error('No encontrado', 404);
}

$newStatus = $row['status'] === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE';

// Reactivar ocupa hueco igual que crear una nueva: si no, el límite (y el plazo
// de 3 meses al bajar a Básico) se saltaría cancelando y reactivando.
if ($newStatus === 'ACTIVE') {
    $stmt = $pdo->prepare('SELECT tier FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $limit = TIER_LIMITS[(string) $stmt->fetchColumn()] ?? null;
    if ($limit !== null && count_limited_subscriptions($pdo, $userId) >= $limit) {
        json_error("Has alcanzado el límite de {$limit} suscripciones de tu plan. Pásate a un plan superior para reactivarla.", 403);
    }
}
// cancelled_at marca desde cuándo deja de contar en el gasto histórico; se limpia
// si se reactiva (vuelve a contar como si nunca se hubiera cancelado).
$cancelledAt = $newStatus === 'CANCELLED' ? date('Y-m-d H:i:s') : null;
$stmt = $pdo->prepare('UPDATE subscriptions SET status = ?, cancelled_at = ? WHERE id = ? AND user_id = ?');
$stmt->execute([$newStatus, $cancelledAt, $id, $userId]);

json_response(['success' => true]);
