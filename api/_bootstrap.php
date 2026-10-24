<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';

// La web es para España y MySQL trabaja en hora de Madrid: PHP igual, para que
// date() y NOW() coincidan y "hoy" sea el día del calendario del usuario (en
// producción ya lo era; en local PHP venía en UTC).
date_default_timezone_set('Europe/Madrid');

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
    global $pdo;
    if (empty($_SESSION['user_id'])) {
        json_error('No autenticado', 401);
    }
    // Una sesión abierta en otro dispositivo puede sobrevivir al borrado de la cuenta.
    $stmt = $pdo->prepare('SELECT 1 FROM users WHERE id = ?');
    $stmt->execute([(int) $_SESSION['user_id']]);
    if (!$stmt->fetchColumn()) {
        $_SESSION = [];
        session_destroy();
        json_error('No autenticado', 401);
    }
    return (int) $_SESSION['user_id'];
}

/** password_verify que tolera cuentas sin contraseña (creadas con Google): nunca coinciden. */
function check_password(string $password, ?string $hash): bool
{
    return $hash !== null && password_verify($password, $hash);
}

/** Nombre visible: sin caracteres de control (un salto de línea acabaría en las cabeceras del email). */
function clean_name(string $name): string
{
    return trim((string) preg_replace('/[\x00-\x1F\x7F]/u', '', $name));
}

/** Las cuentas sin verificar pueden entrar, pero no tocar sus suscripciones hasta confirmar el email. */
function require_verified_auth(): int
{
    global $pdo;
    $userId = require_auth();
    $stmt = $pdo->prepare('SELECT email_verified_at FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    if ($stmt->fetchColumn() === null) {
        json_error('Confirma tu email para continuar.', 403);
    }
    return $userId;
}

// Sin uso por ahora: ningún endpoint es solo de admin. El permiso es la columna
// users.is_admin (db/migrations/013), no el texto del email.
function require_admin(): int
{
    global $pdo;
    $userId = require_auth();
    $stmt = $pdo->prepare('SELECT is_admin FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    if ((int) $stmt->fetchColumn() !== 1) {
        json_error('No autorizado', 403);
    }
    return $userId;
}

function client_ip(): string
{
    return substr((string) ($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45);
}

/**
 * Límite de intentos contra la fuerza bruta (login, registro, correos): cuenta los
 * de $action en los últimos $minutes por IP y, si se pasa $email, por email.
 */
function too_many_attempts(PDO $pdo, string $action, ?string $email, int $maxPerIp, int $maxPerEmail, int $minutes): bool
{
    $since = date('Y-m-d H:i:s', time() - $minutes * 60);
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM auth_attempts WHERE action = ? AND ip = ? AND created_at > ?');
    $stmt->execute([$action, client_ip(), $since]);
    if ((int) $stmt->fetchColumn() >= $maxPerIp) {
        return true;
    }
    if ($email === null) {
        return false;
    }
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM auth_attempts WHERE action = ? AND email = ? AND created_at > ?');
    $stmt->execute([$action, strtolower($email), $since]);
    return (int) $stmt->fetchColumn() >= $maxPerEmail;
}

function record_attempt(PDO $pdo, string $action, ?string $email): void
{
    // Nada se guarda más de un día (son IPs: datos personales).
    $pdo->prepare('DELETE FROM auth_attempts WHERE created_at < ?')->execute([date('Y-m-d H:i:s', time() - 86400)]);
    $stmt = $pdo->prepare('INSERT INTO auth_attempts (action, ip, email, created_at) VALUES (?, ?, ?, ?)');
    $stmt->execute([$action, client_ip(), $email === null ? null : strtolower(substr($email, 0, 190)), date('Y-m-d H:i:s')]);
}

function clear_attempts(PDO $pdo, string $action, string $email): void
{
    $stmt = $pdo->prepare('DELETE FROM auth_attempts WHERE action = ? AND email = ?');
    $stmt->execute([$action, strtolower($email)]);
}

function app_url(): string
{
    global $config;
    return rtrim((string) ($config['app_url'] ?? 'https://nicotech.es'), '/');
}

/**
 * Manda el enlace para confirmar un email: el de la cuenta recién creada o, si hay
 * un cambio pendiente, el nuevo. En la BD solo se guarda el hash del token.
 * Necesita api/_mail.php cargado.
 */
function send_email_verification(PDO $pdo, int $userId): bool
{
    $stmt = $pdo->prepare('SELECT name, email, pending_email FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) {
        return false;
    }

    $token = bin2hex(random_bytes(32));
    $stmt = $pdo->prepare('UPDATE users SET email_token_hash = ?, email_token_expires = ? WHERE id = ?');
    $stmt->execute([hash('sha256', $token), date('Y-m-d H:i:s', time() + 86400), $userId]);

    $link = app_url() . '/#/verificar-email?token=' . $token;
    $isChange = $user['pending_email'] !== null;
    $to = $isChange ? $user['pending_email'] : $user['email'];
    $mailBody = "Hola {$user['name']},\n\n"
        . ($isChange
            ? "Has pedido cambiar el email de tu cuenta de Nicotech a esta dirección. Confírmalo con este enlace (válido 24 horas):\n\n"
            : "Gracias por crear tu cuenta en Nicotech. Confirma tu email con este enlace (válido 24 horas):\n\n")
        . "{$link}\n\n"
        . "Si no has sido tú, puedes ignorar este correo.";
    return send_mail($to, $user['name'], $isChange ? 'Confirma tu nuevo email de Nicotech' : 'Confirma tu email de Nicotech', $mailBody);
}

/**
 * Carga el usuario y lo formatea para devolverlo en JSON, con los mismos
 * campos siempre (evita repetir el SELECT + mapeo en cada endpoint).
 */
function user_response(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare(
        'SELECT id, name, email, tier, avatar_path, password_hash, stripe_subscription_id, plan_interval,
                plan_started_at, plan_renews_at, plan_ends_at, limit_grace_ends_at, email_verified_at, pending_email
         FROM users WHERE id = ?'
    );
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    // Baja programada que ya ha vencido: se pasa a Básico aquí, la próxima vez que
    // el usuario carga la web (no hay webhook de Stripe que lo haga por nosotros).
    if ($user['plan_ends_at'] !== null && strtotime($user['plan_ends_at']) <= time()) {
        reset_plan_to_basic($pdo, $userId);
        return user_response($pdo, $userId);
    }

    // Plazo de 3 meses vencido sin volver a un plan de pago: se aplica el límite.
    if ($user['limit_grace_ends_at'] !== null && strtotime($user['limit_grace_ends_at']) <= time()) {
        enforce_tier_limit($pdo, $userId);
        return user_response($pdo, $userId);
    }

    return [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'tier' => $user['tier'],
        'avatarUrl' => $user['avatar_path'],
        'hasPassword' => $user['password_hash'] !== null,
        'emailVerified' => $user['email_verified_at'] !== null,
        'pendingEmail' => $user['pending_email'],
        'plan' => $user['tier'] === 'BASICO' ? null : [
            'interval' => $user['plan_interval'],
            'viaStripe' => $user['stripe_subscription_id'] !== null,
            'startedAt' => iso_or_null($user['plan_started_at']),
            'renewsAt' => iso_or_null($user['plan_renews_at']),
            'endsAt' => iso_or_null($user['plan_ends_at']),
        ],
    ];
}

function iso_or_null(?string $datetime): ?string
{
    return $datetime === null ? null : date('c', strtotime($datetime));
}

/**
 * Máximo de suscripciones activas por plan; un plan que no aparece no tiene límite.
 * En V1 ninguno lo tiene (Básico es ilimitado). El plazo de 3 meses de abajo queda
 * para cuando vuelva a haber límites.
 */
const TIER_LIMITS = [];

/** Meses que tiene quien baja a un plan con menos hueco del que usa para volver a uno mayor. */
const LIMIT_GRACE_MONTHS = 3;

/**
 * Cancela las suscripciones cuya fecha de cancelación programada ya ha llegado.
 * Se llama antes de leerlas o contarlas (no hay cron que lo haga), y cancelled_at
 * toma la fecha programada para que el gasto histórico corte ese día.
 */
function apply_scheduled_cancellations(PDO $pdo, int $userId): void
{
    $stmt = $pdo->prepare(
        "UPDATE subscriptions SET status = 'CANCELLED', cancelled_at = cancel_date
         WHERE user_id = ? AND status = 'ACTIVE' AND cancel_date IS NOT NULL AND cancel_date <= ?"
    );
    $stmt->execute([$userId, date('Y-m-d')]);
}

/** Suscripciones que cuentan para el límite: activas y no eliminadas (incluye las pendientes de empezar). */
function count_limited_subscriptions(PDO $pdo, int $userId): int
{
    apply_scheduled_cancellations($pdo, $userId);
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM subscriptions WHERE user_id = ? AND status = 'ACTIVE' AND deleted_at IS NULL");
    $stmt->execute([$userId]);
    return (int) $stmt->fetchColumn();
}

/**
 * Tras un cambio de plan: si el usuario tiene más suscripciones de las que permite
 * el plan nuevo, no se cancela nada todavía — tiene LIMIT_GRACE_MONTHS para volver
 * a un plan mayor (se aplica en user_response() al vencer). Si no se pasa, se cierra
 * cualquier plazo abierto. Un plazo ya en marcha no se alarga.
 */
function update_limit_grace(PDO $pdo, int $userId, string $tier): void
{
    $limit = TIER_LIMITS[$tier] ?? null;
    if ($limit === null || count_limited_subscriptions($pdo, $userId) <= $limit) {
        $stmt = $pdo->prepare('UPDATE users SET limit_grace_ends_at = NULL WHERE id = ?');
        $stmt->execute([$userId]);
        return;
    }
    $stmt = $pdo->prepare('UPDATE users SET limit_grace_ends_at = COALESCE(limit_grace_ends_at, ?) WHERE id = ?');
    $stmt->execute([date('Y-m-d H:i:s', strtotime('+' . LIMIT_GRACE_MONTHS . ' months')), $userId]);
}

function reset_plan_to_basic(PDO $pdo, int $userId): void
{
    $stmt = $pdo->prepare(
        "UPDATE users SET tier = 'BASICO', stripe_subscription_id = NULL, plan_interval = NULL,
                plan_started_at = NULL, plan_renews_at = NULL, plan_ends_at = NULL
         WHERE id = ?"
    );
    $stmt->execute([$userId]);
    update_limit_grace($pdo, $userId, 'BASICO');
}

/**
 * Cancela (no elimina) las suscripciones que sobran según el plan actual,
 * empezando por las añadidas más recientemente, y cierra el plazo.
 */
function enforce_tier_limit(PDO $pdo, int $userId): void
{
    $stmt = $pdo->prepare('SELECT tier FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $limit = TIER_LIMITS[(string) $stmt->fetchColumn()] ?? null;

    if ($limit !== null) {
        $stmt = $pdo->prepare(
            "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'ACTIVE' AND deleted_at IS NULL ORDER BY id ASC"
        );
        $stmt->execute([$userId]);
        $excess = array_slice($stmt->fetchAll(PDO::FETCH_COLUMN), $limit);
        if ($excess) {
            $placeholders = implode(',', array_fill(0, count($excess), '?'));
            $stmt = $pdo->prepare(
                "UPDATE subscriptions SET status = 'CANCELLED', cancelled_at = ? WHERE user_id = ? AND id IN ($placeholders)"
            );
            $stmt->execute(array_merge([date('Y-m-d H:i:s'), $userId], $excess));
        }
    }

    $stmt = $pdo->prepare('UPDATE users SET limit_grace_ends_at = NULL WHERE id = ?');
    $stmt->execute([$userId]);
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
/** YYYY-MM-DD que existe de verdad (el regex solo no rechaza 2026-13-45, y MySQL daría un 500). */
function is_valid_date(string $date): bool
{
    return (bool) preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m) && checkdate((int) $m[2], (int) $m[3], (int) $m[1]);
}

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
    if ((float) $price >= 100000000) { // DECIMAL(10,2)
        return [null, 'Precio no válido'];
    }
    if (strlen($currency) !== 3) {
        return [null, 'Moneda no válida'];
    }
    if (!is_valid_date($startDate)) {
        return [null, 'Fecha de cobro no válida'];
    }
    if ($cancelDate !== null && $cancelDate !== '' && !is_valid_date((string) $cancelDate)) {
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
