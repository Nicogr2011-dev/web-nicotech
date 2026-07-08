<?php
declare(strict_types=1);

/**
 * Valida el acceso a una llamada y devuelve su fila. El lado "caller" (quien
 * llama desde /contacto, sin sesión) se identifica por el token que recibió
 * al crear la llamada; el lado "callee" (la cuenta admin) por su sesión.
 */
function require_call_access(PDO $pdo, int $callId, ?string $callToken): array
{
    $stmt = $pdo->prepare('SELECT * FROM calls WHERE id = ?');
    $stmt->execute([$callId]);
    $call = $stmt->fetch();
    if (!$call) {
        json_error('Llamada no encontrada', 404);
    }

    if ($callToken !== null) {
        if (!hash_equals((string) $call['call_token'], $callToken)) {
            json_error('No autorizado', 403);
        }
    } else {
        require_admin();
    }

    return $call;
}
