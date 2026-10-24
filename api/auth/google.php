<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$clientId = $config['google_client_id'] ?? '';

if ($clientId === '' || $clientId === 'CHANGE_ME') {
    json_error('El inicio de sesión con Google todavía no está configurado.', 501);
}

$body = read_json_body();
$accessToken = (string) ($body['accessToken'] ?? '');

if ($accessToken === '') {
    json_error('Falta el token de Google', 400);
}

// Primero: ¿este token se emitió para Nicotech? userinfo acepta tokens de cualquier
// app de Google, así que sin esto otra web con "Iniciar sesión con Google" podría
// reutilizar el token de un usuario para entrar como él aquí.
$rawTokenInfo = @file_get_contents(
    'https://oauth2.googleapis.com/tokeninfo?access_token=' . rawurlencode($accessToken),
    false,
    stream_context_create(['http' => ['timeout' => 5, 'ignore_errors' => true]])
);
$tokenInfo = $rawTokenInfo !== false ? json_decode($rawTokenInfo, true) : null;
$audience = is_array($tokenInfo) ? (string) ($tokenInfo['azp'] ?? $tokenInfo['aud'] ?? '') : '';
if ($audience !== $clientId) {
    json_error('No se pudo verificar la cuenta de Google', 401);
}

// Google verifica el token por nosotros: le pedimos los datos del usuario con
// ese access token, y si es válido nos los devuelve. Evita tener que
// implementar la verificación de firma JWT/JWKS a mano en PHP.
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "Authorization: Bearer {$accessToken}\r\n",
        'timeout' => 5,
        'ignore_errors' => true,
    ],
]);
$raw = @file_get_contents('https://www.googleapis.com/oauth2/v3/userinfo', false, $context);
$info = $raw !== false ? json_decode($raw, true) : null;

if (!is_array($info) || empty($info['sub']) || empty($info['email'])) {
    json_error('No se pudo verificar la cuenta de Google', 401);
}

$googleId = (string) $info['sub'];
$email = (string) $info['email'];
$name = clean_name((string) ($info['name'] ?? $email)) ?: $email;

if (empty($info['email_verified'])) {
    json_error('Tu cuenta de Google no tiene el email verificado', 401);
}

// ¿Ya existe una cuenta enlazada a este Google ID?
$stmt = $pdo->prepare('SELECT id FROM users WHERE google_id = ?');
$stmt->execute([$googleId]);
$user = $stmt->fetch();

if (!$user) {
    // ¿Existe una cuenta con ese email creada por email/contraseña? La enlazamos.
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // Google acaba de demostrar que este email es suyo; la cuenta existente
        // pudo crearla otra persona con ese email (no se verifica al registrarse).
        // Se borra la contraseña para que solo entre quien controla el email: si la
        // cuenta era suya, puede crear otra con "¿La olvidaste?".
        $stmt = $pdo->prepare(
            'UPDATE users SET google_id = ?, password_hash = NULL, email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?'
        );
        $stmt->execute([$googleId, date('Y-m-d H:i:s'), $user['id']]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO users (name, email, google_id, email_verified_at) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $email, $googleId, date('Y-m-d H:i:s')]);
        $user = ['id' => $pdo->lastInsertId()];
    }
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];

json_response(['user' => user_response($pdo, (int) $user['id'])]);
