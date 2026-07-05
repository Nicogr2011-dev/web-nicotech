<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';

$cookieSecure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => $cookieSecure,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

header('Content-Type: application/json; charset=utf-8');

function json_response($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function json_error(string $message, int $status = 400): void
{
    json_response(['error' => $message], $status);
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function require_auth(): int
{
    if (empty($_SESSION['user_id'])) {
        json_error('No autenticado', 401);
    }
    return (int) $_SESSION['user_id'];
}

/**
 * Verifica un token de reCAPTCHA v3 contra la API de Google.
 * Si no hay secreto configurado todavía (CHANGE_ME / vacío), no bloquea nada
 * — permite desplegar el código antes de tener las claves reales.
 */
function verify_recaptcha(?string $token, string $expectedAction): bool
{
    global $config;
    $secret = $config['recaptcha_secret'] ?? '';

    if ($secret === '' || $secret === 'CHANGE_ME') {
        return true;
    }
    if (!$token) {
        return false;
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => http_build_query(['secret' => $secret, 'response' => $token]),
            'timeout' => 5,
            'ignore_errors' => true,
        ],
    ]);
    $raw = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
    if ($raw === false) {
        return false;
    }

    $data = json_decode($raw, true);
    if (!is_array($data) || empty($data['success'])) {
        return false;
    }
    if (($data['action'] ?? '') !== $expectedAction) {
        return false;
    }

    return (float) ($data['score'] ?? 0) >= 0.5;
}

/**
 * @return array{0: array|null, 1: string|null}
 */
function validate_subscription_payload(array $body): array
{
    $serviceName = trim((string) ($body['serviceName'] ?? ''));
    $price = $body['price'] ?? null;
    $currency = strtoupper(trim((string) ($body['currency'] ?? 'EUR')));
    $startDate = (string) ($body['startDate'] ?? '');
    $cancelDate = $body['cancelDate'] ?? null;
    $accentColor = (string) ($body['accentColor'] ?? '');

    if ($serviceName === '' || strlen($serviceName) > 150) {
        return [null, 'Introduce el nombre del servicio'];
    }
    if (!is_numeric($price) || (float) $price <= 0) {
        return [null, 'El precio debe ser mayor que 0'];
    }
    if (strlen($currency) !== 3) {
        return [null, 'Moneda no válida'];
    }
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate)) {
        return [null, 'Fecha de cobro no válida'];
    }
    if ($cancelDate !== null && $cancelDate !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $cancelDate)) {
        return [null, 'Fecha de cancelación no válida'];
    }
    if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $accentColor)) {
        return [null, 'Color no válido'];
    }

    return [[
        'serviceName' => $serviceName,
        'price' => (float) $price,
        'currency' => $currency,
        'startDate' => $startDate,
        'cancelDate' => ($cancelDate === '' || $cancelDate === null) ? null : $cancelDate,
        'accentColor' => $accentColor,
    ], null];
}

try {
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $config['db_host'], $config['db_name']);
    $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    json_error('Error de conexión a la base de datos', 500);
}
