<?php
return [
    'db_host' => 'localhost',
    'db_name' => 'nicotech',
    'db_user' => 'nicotech_user',
    'db_pass' => 'CHANGE_ME',
    // Clave secreta de reCAPTCHA v3 (console.cloud.google.com/security/recaptcha).
    // Mientras quede en 'CHANGE_ME', la verificación se salta (no bloquea login/registro).
    'recaptcha_secret' => 'CHANGE_ME',
    // Hash (password_hash) del código de acceso que permite cambiar de plan de
    // pago mientras no hay pasarela real. Generarlo con:
    // php -r 'echo password_hash("EL_CODIGO", PASSWORD_DEFAULT), PHP_EOL;'
    'plan_redeem_code_hash' => 'CHANGE_ME',
];
