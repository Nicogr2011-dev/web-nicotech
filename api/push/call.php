<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_webpush.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

// De momento solo la cuenta admin recibe avisos de "Llamar" desde /contacto.
const ADMIN_EMAIL = 'nicolas.grana.miguez@gmail.com';

respond_and_continue(['success' => true]);

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([ADMIN_EMAIL]);
$adminId = $stmt->fetchColumn();

if ($adminId) {
    $stmt = $pdo->prepare('SELECT id, endpoint FROM push_subscriptions WHERE user_id = ?');
    $stmt->execute([$adminId]);
    $subscriptions = $stmt->fetchAll();

    foreach ($subscriptions as $sub) {
        $status = send_web_push(
            $sub['endpoint'],
            $config['vapid_public_key'],
            $config['vapid_private_key_pem'],
            $config['vapid_subject']
        );
        if ($status === 404 || $status === 410) {
            $del = $pdo->prepare('DELETE FROM push_subscriptions WHERE id = ?');
            $del->execute([$sub['id']]);
        }
    }
}
exit;
