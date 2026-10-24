<?php
declare(strict_types=1);

/**
 * Cliente mínimo de la API de Stripe, sin librerías (el proyecto no usa Composer).
 * Stripe acepta form-encoded y devuelve JSON; la clave secreta va como Bearer.
 *
 * En V1 no se venden planes: queda para dar de baja (cancel.php) y sincronizar
 * (webhook.php) a quien ya pagó en modo de prueba.
 */

function stripe_secret_key(array $config): string
{
    $key = (string) ($config['stripe_secret_key'] ?? '');
    return ($key === '' || $key === 'CHANGE_ME') ? '' : $key;
}

function stripe_request(array $config, string $method, string $path, array $params = []): ?array
{
    $key = stripe_secret_key($config);
    if ($key === '') {
        return null;
    }

    $body = http_build_query($params);
    $url = 'https://api.stripe.com/v1/' . ltrim($path, '/');
    if ($method === 'GET' && $body !== '') {
        $url .= '?' . $body;
    }

    $context = stream_context_create([
        'http' => [
            'method' => $method,
            'header' => "Authorization: Bearer {$key}\r\n"
                . "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $method === 'GET' ? '' : $body,
            'timeout' => 10,
            'ignore_errors' => true,
        ],
    ]);
    $raw = @file_get_contents($url, false, $context);
    $data = $raw !== false ? json_decode($raw, true) : null;

    if (!is_array($data) || isset($data['error'])) {
        error_log('Stripe ' . $method . ' ' . $path . ' falló: ' . ($data['error']['message'] ?? 'sin respuesta'));
        return null;
    }
    return $data;
}

/** Fin del periodo pagado (en las versiones recientes de la API va en cada item). */
function stripe_period_end(array $subscription): ?int
{
    $end = $subscription['items']['data'][0]['current_period_end'] ?? $subscription['current_period_end'] ?? null;
    return $end !== null ? (int) $end : null;
}

/**
 * Comprueba la cabecera Stripe-Signature de un webhook ("t=...,v1=...,v1=..."):
 * HMAC-SHA256 de "{t}.{payload}" con el secreto del endpoint (whsec_...), y que el
 * aviso no tenga más de $tolerance segundos (evita que se reenvíe uno antiguo).
 */
function stripe_verify_signature(string $payload, string $header, string $secret, int $tolerance = 300): bool
{
    $timestamp = null;
    $signatures = [];
    foreach (explode(',', $header) as $part) {
        [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
        if ($key === 't') {
            $timestamp = (int) $value;
        } elseif ($key === 'v1') {
            $signatures[] = $value;
        }
    }
    if ($timestamp === null || !$signatures || abs(time() - $timestamp) > $tolerance) {
        return false;
    }
    $expected = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);
    foreach ($signatures as $signature) {
        if (hash_equals($expected, $signature)) {
            return true;
        }
    }
    return false;
}
