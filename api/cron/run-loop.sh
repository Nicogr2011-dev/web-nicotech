#!/bin/bash
# Cron solo admite minutos como mínimo, así que este wrapper (llamado una vez por
# minuto) lanza el script PHP 4 veces separadas por 15s, para que el buzón de
# verificación se revise aproximadamente cada 15 segundos en vez de cada minuto.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for i in 1 2 3 4; do
    php "$DIR/process-verification-inbox.php"
    sleep 15
done
