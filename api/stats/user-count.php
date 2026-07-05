<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$count = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();

json_response(['count' => $count]);
