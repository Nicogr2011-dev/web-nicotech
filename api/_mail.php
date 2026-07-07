<?php
declare(strict_types=1);

/**
 * Cliente SMTP mínimo por socket (AUTH LOGIN + SSL implícito), sin librerías
 * externas (el proyecto no usa Composer). Solo cubre lo que necesitamos:
 * un correo de texto plano a un único destinatario.
 */

function smtp_read_response($conn): string
{
    $data = '';
    while (($line = fgets($conn, 515)) !== false) {
        $data .= $line;
        if (isset($line[3]) && $line[3] === ' ') {
            break;
        }
    }
    return $data;
}

function smtp_command($conn, string $command): string
{
    fwrite($conn, $command . "\r\n");
    return smtp_read_response($conn);
}

function send_mail(string $toEmail, string $toName, string $subject, string $textBody): bool
{
    global $config;

    $host = $config['smtp_host'] ?? '';
    $port = (int) ($config['smtp_port'] ?? 465);
    $user = $config['smtp_user'] ?? '';
    $pass = $config['smtp_pass'] ?? '';
    $from = $config['smtp_from'] ?? $user;

    if ($host === '' || $host === 'CHANGE_ME' || $user === '') {
        return false;
    }

    $conn = @stream_socket_client("ssl://{$host}:{$port}", $errno, $errstr, 5);
    if ($conn === false) {
        return false;
    }

    smtp_read_response($conn); // banner
    smtp_command($conn, 'EHLO nicotech.es');
    smtp_command($conn, 'AUTH LOGIN');
    smtp_command($conn, base64_encode($user));
    $authResponse = smtp_command($conn, base64_encode($pass));
    if (substr($authResponse, 0, 3) !== '235') {
        fclose($conn);
        return false;
    }

    smtp_command($conn, "MAIL FROM:<{$from}>");
    smtp_command($conn, "RCPT TO:<{$toEmail}>");
    smtp_command($conn, 'DATA');

    $to = $toName !== '' ? "{$toName} <{$toEmail}>" : $toEmail;
    $headers = "From: Nicotech <{$from}>\r\n"
        . "To: {$to}\r\n"
        . "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n"
        . "MIME-Version: 1.0\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Date: " . date('r') . "\r\n";

    // Un punto solo en una línea termina la DATA en SMTP: se duplica si aparece en el cuerpo.
    $escapedBody = preg_replace('/^\./m', '..', $textBody);
    $dataResponse = smtp_command($conn, $headers . "\r\n" . $escapedBody . "\r\n.");

    smtp_command($conn, 'QUIT');
    fclose($conn);

    return substr($dataResponse, 0, 3) === '250';
}
