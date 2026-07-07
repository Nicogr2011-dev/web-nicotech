#!/bin/bash
# Cron solo admite minutos como mínimo, así que este wrapper (llamado una vez por
# minuto) lanza el script PHP 4 veces separadas por 15s, para que el buzón de
# verificación se revise aproximadamente cada 15 segundos en vez de cada minuto.
#
# El `php` del PATH en el hosting es la versión por defecto del sistema (7.0, sin
# soporte de tipos "nullable" que usa el resto del proyecto) — hay que apuntar al
# binario explícito de una versión moderna (la misma familia que usa el sitio web).
PHP_BIN="/usr/local/bin/php81"
if [ ! -x "$PHP_BIN" ]; then
    PHP_BIN="php"
fi

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for i in 1 2 3 4; do
    "$PHP_BIN" "$DIR/process-verification-inbox.php"
    sleep 15
done
