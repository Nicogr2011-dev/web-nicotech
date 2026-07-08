<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_webpush.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

respond_and_continue(['success' => true]);
notify_admin_of_call($pdo, $config);
exit;
