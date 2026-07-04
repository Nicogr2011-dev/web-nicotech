# Nicotech

Nicotech es una web para organizar todas tus suscripciones (Netflix, Spotify, iCloud, etc.) en un solo lugar: buscas el servicio, eliges el plan (con precio real de referencia), fijas la fecha de cobro y, si quieres, una fecha en la que se cancele sola.

## Estado actual — Fase 1

Esta fase cubre **organización de suscripciones existentes**, sin compra ni pago de nuevas suscripciones (eso llegará en una fase futura). Incluye:

- Página de bienvenida pública que explica el producto.
- Cuentas de usuario reales (registro e inicio de sesión con email/contraseña).
- Área de cliente (`/#/dashboard`) protegida, con:
  - Alta, edición, cancelación y borrado de suscripciones.
  - Buscador de servicios sobre un catálogo curado de ~170 servicios reales (streaming, música, software, gaming, IA, etc.) con sus planes y precios de referencia (`src/lib/serviceCatalog.ts`) — al elegir un plan se prellenan precio y moneda, siempre editables. Si el servicio no está en el catálogo, se puede escribir el nombre a mano.
  - Fecha de cobro única (de ahí se deriva el día del mes) y cálculo automático del próximo cobro.
  - Cancelación automática en una fecha concreta que tú eliges (no por número de meses).
  - Resumen: gasto mensual total, próximo cobro y número de cancelaciones programadas.

Explícitamente **fuera de alcance** en esta fase (para fases futuras): compra/pago de suscripciones, recordatorios por email, sincronización de calendario, recuperación de contraseña, multi-moneda, cuentas compartidas/equipo.

## Stack técnico

- **Frontend**: SPA con **React 19 + TypeScript**, compilada con **Vite** y estilada con **Tailwind CSS 4**. Enrutado 100% en el cliente con `react-router-dom` (`HashRouter`, rutas tipo `/#/dashboard`).
- **Backend**: **PHP** (compatible con PHP 7.4+) como API JSON sin framework — sesiones nativas de PHP para auth, `password_hash()`/`password_verify()` para contraseñas, PDO para la base de datos.
- **Base de datos**: **MySQL/MariaDB**.

### Por qué este stack

El hosting compartido disponible (Dinahosting, plan básico) **no tiene Node.js**, solo PHP y MySQL. En vez de comprar un plan superior o un VPS, se optó por mantener la misma interfaz y experiencia (misma estética, mismas animaciones, todo sigue siendo instantáneo sin recargas de página) pero moviendo el backend de Node/Prisma a PHP puro, que sí funciona en cualquier hosting compartido barato. El frontend se compila una vez (`npm run build`) a archivos HTML/CSS/JS estáticos — **no hace falta Node.js en el servidor**, solo para compilar en tu propio ordenador antes de subir.

## Estructura del proyecto

```
src/                      Frontend (Vite + React + TS)
  main.tsx, App.tsx        Punto de entrada y rutas (HashRouter)
  pages/                   Landing, Login, Register, Dashboard
  lib/
    api.ts                 Cliente fetch hacia la API PHP
    AuthContext.tsx         Estado de sesión (login/register/logout/me)
    serviceCatalog.ts       Catálogo de ~170 servicios con planes y precios
    subscriptions.ts        Cálculo del próximo cobro
    validation.ts           Constantes/validación compartidas (paleta de colores, etc.)
  components/
    nav/, landing/, dashboard/, ui/   Componentes de UI (idénticos visualmente a antes)

api/                      Backend PHP (API JSON)
  _bootstrap.php           Sesión, conexión PDO, helpers (json_response, require_auth...)
  config.php                Credenciales de BD (NO se sube a git, ver config.example.php)
  auth/{register,login,logout,me}.php
  subscriptions/{list,create,update,delete,toggle}.php

db/schema.sql             Esquema MySQL (tablas users y subscriptions)
```

## Diseño

Estética inspirada en [coolors.co](https://coolors.co): tema claro, paleta de colores vivos usados como "swatches" (coral, sunflower, mint, azure, grape, flamingo), tipografía grande en negrita (Inter + Sora), navegación superior minimalista con CTA en píldora, tarjetas redondeadas con sombra suave y pequeñas animaciones de scroll.

## Desarrollo local

Requisitos: Node.js (solo para compilar el frontend), PHP 7.4+ y MySQL/MariaDB corriendo localmente.

```bash
# 1. Base de datos
mysql -u root -e "CREATE DATABASE nicotech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root nicotech < db/schema.sql

# 2. Configura las credenciales de BD
cp api/config.example.php api/config.php   # edita host/usuario/contraseña/nombre de BD

# 3. Backend PHP (sirve la carpeta api/ en el puerto 8000)
php -S localhost:8000 -t api

# 4. Frontend (en otra terminal — proxy /api -> localhost:8000, ver vite.config.ts)
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Despliegue en hosting compartido (Dinahosting o similar, sin Node.js)

1. **Compila el frontend en tu ordenador**:
   ```bash
   npm install
   npm run build
   ```
   Esto genera la carpeta `dist/` con los archivos estáticos (HTML/CSS/JS).

2. **Sube por FTP/SSH**:
   - El **contenido** de `dist/` (no la carpeta en sí) va a la raíz pública de tu hosting (`www/`, `public_html/`, etc.).
   - La carpeta `api/` completa va también dentro de esa misma raíz pública, como `www/api/`.

3. **Crea la base de datos** desde el panel de tu hosting (sección "Bases de Datos"), tipo MySQL/MariaDB, y anota host, nombre, usuario y contraseña.

4. **Importa el esquema** (`db/schema.sql`) usando phpMyAdmin del panel, o por SSH:
   ```bash
   mysql -u tu_usuario -p tu_base_de_datos < db/schema.sql
   ```

5. **Configura las credenciales**: en el servidor, copia `api/config.example.php` a `api/config.php` (si no lo subiste ya editado) y rellena los datos reales de tu base de datos.

6. Abre tu dominio — ya no hace falta ningún proceso corriendo, PHP se ejecuta bajo demanda como cualquier web PHP normal.

Para desplegar una actualización: repite el paso 1 y vuelve a subir el contenido de `dist/` (y `api/` si cambiaste el backend).

## Roadmap (próximas fases)

- Compra y pago real de nuevas suscripciones
- Recordatorios por email antes de cada cobro o cancelación
- Recuperación de contraseña
- Exportación/sincronización con calendario
- Soporte multi-moneda
