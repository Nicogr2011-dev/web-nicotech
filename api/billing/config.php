<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';
require __DIR__ . '/../_stripe.php';

// Le dice a la pantalla de pago si mostrar la tarjeta (Stripe configurado) y si
// avisar de que es modo de prueba. Nunca expone la clave.
json_response([
    'cardEnabled' => stripe_secret_key($config) !== '',
    'testMode' => stripe_is_test_mode($config),
]);
