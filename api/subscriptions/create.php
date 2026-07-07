<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_mail.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
[$data, $err] = validate_subscription_payload($body);
if ($err !== null) {
    json_error($err);
}

$stmt = $pdo->prepare('SELECT tier FROM users WHERE id = ?');
$stmt->execute([$userId]);
$tier = $stmt->fetchColumn();

$tierLimits = ['BASICO' => 3, 'PREMIUM_LITE' => 7];

if (isset($tierLimits[$tier])) {
    $limit = $tierLimits[$tier];
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM subscriptions WHERE user_id = ? AND status = 'ACTIVE'");
    $stmt->execute([$userId]);
    if ((int) $stmt->fetchColumn() >= $limit) {
        json_error("Has alcanzado el límite de {$limit} suscripciones de tu plan. Pásate a un plan superior para añadir más.", 403);
    }
}

$verificationCode = 'NCT-' . strtoupper(bin2hex(random_bytes(4)));

$stmt = $pdo->prepare(
    'INSERT INTO subscriptions (user_id, service_name, price, currency, start_date, cancel_date, accent_color, verification_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([
    $userId,
    $data['serviceName'],
    $data['price'],
    $data['currency'],
    $data['startDate'],
    $data['cancelDate'],
    $data['accentColor'],
    $verificationCode,
]);

respond_and_continue(['success' => true]);

// A partir de aquí el cliente ya tiene su respuesta — el email puede tardar sin que se note.
$stmt = $pdo->prepare('SELECT name, email FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

$priceLabel = number_format($data['price'], 2, ',', '.') . ' ' . $data['currency'];
$mailBody = "Hola {$user['name']},\n\n"
    . "Has añadido esta suscripción en Nicotech:\n\n"
    . "Servicio: {$data['serviceName']}\n"
    . "Precio: {$priceLabel}/mes\n"
    . "Código de confirmación: {$verificationCode}\n\n"
    . "Para verificar que de verdad estás suscrito, reenvía este correo tal cual a verifica@nicotech.es.\n\n"
    . "Si no has sido tú, puedes ignorar este correo.";
send_mail($user['email'], $user['name'], "Confirma tu suscripción a {$data['serviceName']}", $mailBody);
exit;
