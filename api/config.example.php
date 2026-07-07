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
    // Client ID de OAuth de Google (console.cloud.google.com/apis/credentials),
    // tipo "Aplicación web". Mientras quede en 'CHANGE_ME', el botón de Google
    // se muestra pero avisa de que no está listo.
    'google_client_id' => 'CHANGE_ME',
    // No lo usa el flujo actual (solo hace falta el Client ID) — de reserva por si
    // algún día hace falta el intercambio de código servidor a servidor.
    'google_client_secret' => 'CHANGE_ME',
    // Services ID de "Sign in with Apple" (developer.apple.com/account/resources/identifiers).
    // Requiere cuenta de pago de Apple Developer Program. Mientras quede en
    // 'CHANGE_ME', el botón de Apple se muestra pero avisa de que no está listo.
    'apple_client_id' => 'CHANGE_ME',
    // Cuenta de correo usada para enviar (confirmaciones de suscripción, recuperación
    // de contraseña). SMTPS con AUTH LOGIN, sin librerías (proyecto sin Composer).
    'smtp_host' => 'CHANGE_ME',
    'smtp_port' => 465,
    'smtp_user' => 'CHANGE_ME',
    'smtp_pass' => 'CHANGE_ME',
    'smtp_from' => 'CHANGE_ME',
    // Buzón al que los usuarios reenvían el email de confirmación para verificar
    // que de verdad se han suscrito; un cron revisa este buzón por IMAP.
    'imap_host' => 'CHANGE_ME',
    'imap_port' => 993,
    'imap_user' => 'CHANGE_ME',
    'imap_pass' => 'CHANGE_ME',
];
