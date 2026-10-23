<?php
declare(strict_types=1);

/**
 * Cliente mínimo de la API de Stripe, sin librerías (el proyecto no usa Composer).
 * Stripe acepta form-encoded y devuelve JSON; la clave secreta va como Bearer.
 *
 * Mientras la clave sea sk_test_... / rk_test_..., todo ocurre en el modo de prueba de Stripe:
 * misma plataforma y misma página de pago, pero ningún cobro mueve dinero.
 */

/** Precios en céntimos — mantener en sync con src/lib/pricingPlans.ts. */
const STRIPE_PLAN_PRICES = [
    'PREMIUM' => ['name' => 'Nicotech Premium', 'year' => 1000, 'month' => 100],
    'PREMIUM_LITE' => ['name' => 'Nicotech Premium Lite', 'year' => 800, 'month' => 70],
];

function stripe_secret_key(array $config): string
{
    $key = (string) ($config['stripe_secret_key'] ?? '');
    return ($key === '' || $key === 'CHANGE_ME') ? '' : $key;
}

function stripe_is_test_mode(array $config): bool
{
    // sk_test_ = clave estándar, rk_test_ = clave restringida (la que crea el panel nuevo).
    $key = stripe_secret_key($config);
    return strpos($key, 'sk_test_') === 0 || strpos($key, 'rk_test_') === 0;
}

/** Llama a la API de Stripe. Devuelve el JSON decodificado o null si falla. */
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
