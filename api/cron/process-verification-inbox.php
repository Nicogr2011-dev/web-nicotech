<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

/**
 * Revisa por IMAP el buzón al que los usuarios reenvían el correo de confirmación
 * de una suscripción, busca el código NCT-XXXXXXXX en el texto (aunque venga citado
 * dentro de un reenvío) y marca esa suscripción como verificada. Pensado para
 * ejecutarse periódicamente por cron, no vía HTTP.
 */

function imap_decode_part(string $raw, int $encoding): string
{
    switch ($encoding) {
        case ENCBASE64:
            return (string) base64_decode($raw);
        case ENCQUOTEDPRINTABLE:
            return quoted_printable_decode($raw);
        default:
            return $raw;
    }
}

/** Busca recursivamente la primera parte text/plain de un mensaje (multipart o no). */
function imap_plain_text($inbox, int $msgNum, object $structure): string
{
    if (empty($structure->parts) || !is_array($structure->parts)) {
        return imap_decode_part(imap_body($inbox, $msgNum), $structure->encoding ?? 0);
    }
    return imap_plain_text_walk($inbox, $msgNum, $structure->parts, '');
}

function imap_plain_text_walk($inbox, int $msgNum, array $parts, string $prefix): string
{
    foreach ($parts as $i => $part) {
        $num = $prefix . (string) ($i + 1);
        if (!empty($part->parts) && is_array($part->parts)) {
            $text = imap_plain_text_walk($inbox, $msgNum, $part->parts, $num . '.');
            if ($text !== '') {
                return $text;
            }
            continue;
        }
        if ((int) ($part->type ?? -1) === TYPETEXT && strtolower($part->subtype ?? '') === 'plain') {
            return imap_decode_part(imap_fetchbody($inbox, $msgNum, $num), $part->encoding ?? 0);
        }
    }
    return '';
}

$imapHost = $config['imap_host'] ?? '';
$imapUser = $config['imap_user'] ?? '';
$imapPass = $config['imap_pass'] ?? '';
$imapPort = (int) ($config['imap_port'] ?? 993);

if ($imapHost === '' || $imapHost === 'CHANGE_ME' || $imapUser === '') {
    exit(0);
}
if (!function_exists('imap_open')) {
    fwrite(STDERR, "La extensión imap de PHP no está disponible en este servidor.\n");
    exit(1);
}

$mailbox = "{{$imapHost}:{$imapPort}/imap/ssl}INBOX";
$inbox = @imap_open($mailbox, $imapUser, $imapPass);
if ($inbox === false) {
    fwrite(STDERR, 'No se pudo conectar al buzón de verificación: ' . imap_last_error() . "\n");
    exit(1);
}

$unseen = imap_search($inbox, 'UNSEEN') ?: [];

foreach ($unseen as $msgNum) {
    $structure = imap_fetchstructure($inbox, $msgNum);
    $text = strtoupper(imap_plain_text($inbox, $msgNum, $structure));

    if (preg_match('/NCT-[A-F0-9]{8}/', $text, $matches)) {
        $stmt = $pdo->prepare(
            'UPDATE subscriptions SET verified_at = NOW() WHERE verification_code = ? AND verified_at IS NULL'
        );
        $stmt->execute([$matches[0]]);
    }

    imap_setflag_full($inbox, (string) $msgNum, '\\Seen');
}

imap_close($inbox);
