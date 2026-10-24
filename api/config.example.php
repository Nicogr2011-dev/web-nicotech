<?php
return [
    'db_host' => 'localhost',
    'db_name' => 'nicotech',
    'db_user' => 'nicotech_user',
    'db_pass' => 'CHANGE_ME',
    // Clave secreta de reCAPTCHA v3 (console.cloud.google.com/security/recaptcha).
    // Mientras quede en 'CHANGE_ME', la verificación se salta (no bloquea login/registro).
    'recaptcha_secret' => 'CHANGE_ME',
    // Client ID de OAuth de Google (console.cloud.google.com/apis/credentials),
    // tipo "Aplicación web". Mientras quede en 'CHANGE_ME', el botón de Google
    // se muestra pero avisa de que no está listo.
    'google_client_id' => 'CHANGE_ME',
    // No lo usa el flujo actual (solo hace falta el Client ID) — de reserva por si
    // algún día hace falta el intercambio de código servidor a servidor.
    'google_client_secret' => 'CHANGE_ME',
    // Services ID de "Sign in with Apple" (developer.apple.com/account/resources/identifiers).
    // Sin uso desde 23.10.26.16.11: el botón de Apple se retiró de la web, pero
    // api/auth/apple.php sigue ahí por si se reactiva (requiere Apple Developer Program).
    'apple_client_id' => 'CHANGE_ME',
    // Cuenta de correo usada para enviar (verificación de email, recuperación
    // de contraseña). SMTPS con AUTH LOGIN, sin librerías (proyecto sin Composer).
    'smtp_host' => 'CHANGE_ME',
    'smtp_port' => 465,
    'smtp_user' => 'CHANGE_ME',
    'smtp_pass' => 'CHANGE_ME',
    'smtp_from' => 'CHANGE_ME',
    // URL pública de la web, para los enlaces de los correos (en local: http://localhost:5173).
    'app_url' => 'https://nicotech.es',
    // Clave secreta de Stripe (dashboard.stripe.com → Desarrolladores → Claves de API).
    // En V1 no se venden planes: solo sirve para dar de baja a quien ya pagó en modo de prueba.
    'stripe_secret_key' => 'CHANGE_ME',
    // Secreto del webhook de Stripe (whsec_...), al registrar
    // https://nicotech.es/api/billing/webhook.php en Desarrolladores → Webhooks.
    'stripe_webhook_secret' => 'CHANGE_ME',
];
