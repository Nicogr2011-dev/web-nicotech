<?php
declare(strict_types=1);

/**
 * Envío de Web Push mínimo (protocolo VAPID, RFC 8292), sin librerías externas.
 * Solo manda notificaciones "vacías" (sin payload cifrado) — el service worker
 * decide qué texto mostrar. Evita implementar el cifrado aes128gcm del payload,
 * que es bastante más código y aquí no hace falta.
 */

function base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function read_der_length(string $der, int &$offset): int
{
    $len = ord($der[$offset]);
    $offset++;
    if ($len & 0x80) {
        $numBytes = $len & 0x7f;
        $len = 0;
        for ($i = 0; $i < $numBytes; $i++) {
            $len = ($len << 8) | ord($der[$offset]);
            $offset++;
        }
    }
    return $len;
}

function pad_der_integer(string $bytes, int $len): string
{
    if (strlen($bytes) > $len && ord($bytes[0]) === 0) {
        $bytes = substr($bytes, 1);
    }
    return str_pad($bytes, $len, "\x00", STR_PAD_LEFT);
}

/** Convierte una firma ECDSA en DER (la que da openssl_sign) al formato "raw r||s" que exige JWS. */
function der_ecdsa_to_raw(string $der, int $keyByteLen = 32): string
{
    $offset = 1; // salta el tag SEQUENCE (0x30)
    read_der_length($der, $offset);

    $offset++; // salta el tag INTEGER (0x02) de r
    $rLen = read_der_length($der, $offset);
    $r = substr($der, $offset, $rLen);
    $offset += $rLen;

    $offset++; // salta el tag INTEGER (0x02) de s
    $sLen = read_der_length($der, $offset);
    $s = substr($der, $offset, $sLen);

    return pad_der_integer($r, $keyByteLen) . pad_der_integer($s, $keyByteLen);
}

function build_vapid_jwt(string $privateKeyPem, string $audience, string $subject): string
{
    $header = base64url_encode(json_encode(['typ' => 'JWT', 'alg' => 'ES256']));
    $payload = base64url_encode(json_encode([
        'aud' => $audience,
        'exp' => time() + 12 * 3600,
        'sub' => $subject,
    ]));
    $signingInput = "{$header}.{$payload}";

    $privateKey = openssl_pkey_get_private($privateKeyPem);
    openssl_sign($signingInput, $derSignature, $privateKey, OPENSSL_ALGO_SHA256);

    return $signingInput . '.' . base64url_encode(der_ecdsa_to_raw($derSignature, 32));
}

/**
 * Manda un aviso vacío (sin payload) a una suscripción Web Push.
 * @return int Código HTTP de respuesta del servicio push (404/410 = suscripción caducada).
 */
function send_web_push(string $endpoint, string $vapidPublicKey, string $vapidPrivateKeyPem, string $subject): int
{
    $parts = parse_url($endpoint);
    if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
        return 0;
    }
    $audience = "{$parts['scheme']}://{$parts['host']}" . (isset($parts['port']) ? ":{$parts['port']}" : '');

    $jwt = build_vapid_jwt($vapidPrivateKeyPem, $audience, $subject);
    $authHeader = "vapid t={$jwt}, k={$vapidPublicKey}";

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Authorization: {$authHeader}\r\nTTL: 60\r\nContent-Length: 0\r\n",
            'ignore_errors' => true,
            'timeout' => 8,
        ],
    ]);

    @file_get_contents($endpoint, false, $context);

    $statusLine = $http_response_header[0] ?? '';
    return preg_match('/\s(\d{3})\s/', $statusLine, $m) ? (int) $m[1] : 0;
}
