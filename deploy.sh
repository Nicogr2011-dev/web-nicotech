#!/bin/bash
# Ejecutar en el servidor, dentro de la copia del repo (NO dentro de www/),
# después de un `git pull`. Copia el frontend compilado y la API a la
# carpeta pública (~/www), sin exponer el código fuente ni el .git.
set -e

TARGET="${1:-$HOME/www}"

# assets/ lleva un hash en cada nombre: sin borrarla se acumulan todas las
# compilaciones anteriores. La app es un único bundle y sw.js no cachea, así que
# sustituirla entera no rompe a nadie.
rm -rf "$TARGET/assets"
cp -r dist/. "$TARGET/"
rm -rf "$TARGET/api"
cp -r api "$TARGET/api"

echo "Desplegado en $TARGET"
