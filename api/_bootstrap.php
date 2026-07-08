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

/**
 * Envía la respuesta JSON ya mismo y, si el SAPI lo permite (PHP-FPM en producción),
 * cierra la conexión con el cliente ahí — el código que siga ejecutándose (ej. mandar
 * un email por SMTP, que puede tardar varios segundos) ya no le hace esperar.
 */
function respond_and_continue(array $data): void
{
    http_response_code(200);
    echo json_encode($data);
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } else {
        ignore_user_abort(true);
        flush();
    }
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

// De momento solo esta cuenta gestiona el plan Enterprise y contesta llamadas de /contacto.
const ADMIN_EMAIL = 'nicolas.grana.miguez@gmail.com';

function require_admin(): int
{
    global $pdo;
    $userId = require_auth();
    $stmt = $pdo->prepare('SELECT email FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $email = strtolower((string) $stmt->fetchColumn());
    if ($email !== ADMIN_EMAIL) {
        json_error('No autorizado', 403);
    }
    return $userId;
}

/**
 * Carga el usuario y lo formatea para devolverlo en JSON, con los mismos
 * campos siempre (evita repetir el SELECT + mapeo en cada endpoint).
 */
function user_response(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare('SELECT id, name, email, tier, avatar_path FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    return [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'tier' => $user['tier'],
        'avatarUrl' => $user['avatar_path'],
    ];
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

function base64url_decode(string $data): string
{
    return (string) base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

function asn1_length(int $len): string
{
    if ($len < 0x80) {
        return chr($len);
    }
    $bytes = ltrim(pack('N', $len), "\x00");
    return chr(0x80 | strlen($bytes)) . $bytes;
}

function asn1_wrap(string $tag, string $bin): string
{
    return $tag . asn1_length(strlen($bin)) . $bin;
}

/** Convierte los componentes RSA (n, e) de un JWK a una clave pública PEM, para poder
 * usarla con openssl_verify. No hay librería JWT instalada (proyecto sin Composer),
 * así que esto sustituye a esa conversión. */
function jwk_rsa_to_pem(string $n64, string $e64): string
{
    $n = "\x00" . base64url_decode($n64);
    $e = base64url_decode($e64);

    $rsaKey = asn1_wrap("\x30", asn1_wrap("\x02", $n) . asn1_wrap("\x02", $e));
    $rsaOid = pack('H*', '300d06092a864886f70d0101010500');
    $bitString = asn1_wrap("\x03", "\x00" . $rsaKey);
    $spki = asn1_wrap("\x30", $rsaOid . $bitString);

    return "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($spki), 64, "\n") . "-----END PUBLIC KEY-----\n";
}

/**
 * Verifica un JWT RS256 contra el JWKS de una URL (Apple/Google publican ahí sus claves
 * públicas). Comprueba firma, emisor, destinatario y caducidad.
 * @return array|null Los claims del token si es válido, null si no.
 */
function verify_jwt_rs256(string $jwt, string $jwksUrl, string $expectedIss, string $expectedAud): ?array
{
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) {
        return null;
    }
    [$headerB64, $payloadB64, $sigB64] = $parts;

    $header = json_decode(base64url_decode($headerB64), true);
    $payload = json_decode(base64url_decode($payloadB64), true);
    $signature = base64url_decode($sigB64);
    if (!is_array($header) || !is_array($payload) || ($header['alg'] ?? '') !== 'RS256') {
        return null;
    }

    $raw = @file_get_contents($jwksUrl);
    $jwks = $raw !== false ? json_decode($raw, true) : null;
    $keys = is_array($jwks) ? ($jwks['keys'] ?? []) : [];

    $pem = null;
    foreach ($keys as $key) {
        if (($key['kid'] ?? null) === ($header['kid'] ?? null)) {
            $pem = jwk_rsa_to_pem($key['n'], $key['e']);
            break;
        }
    }
    if ($pem === null) {
        return null;
    }

    $verified = openssl_verify("{$headerB64}.{$payloadB64}", $signature, $pem, OPENSSL_ALGO_SHA256);
    if ($verified !== 1) {
        return null;
    }

    if (($payload['iss'] ?? null) !== $expectedIss) {
        return null;
    }
    if (($payload['aud'] ?? null) !== $expectedAud) {
        return null;
    }
    if (($payload['exp'] ?? 0) < time()) {
        return null;
    }

    return $payload;
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
