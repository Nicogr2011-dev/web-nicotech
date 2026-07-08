<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

json_response(['publicKey' => $config['vapid_public_key']]);
