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

// Borrado lógico, no físico: si se borrara de verdad, el gasto de los meses en los
// que esta suscripción SÍ estuvo activa desaparecería de las gráficas de gasto.
$stmt = $pdo->prepare('UPDATE subscriptions SET deleted_at = NOW() WHERE id = ? AND user_id = ?');
$stmt->execute([$id, $userId]);

json_response(['success' => true]);
