# Nicotech

Nicotech es una web para organizar todas tus suscripciones (Netflix, Spotify, iCloud, etc.) en un solo lugar: buscas el servicio, eliges el plan (con precio real de referencia), fijas la fecha de cobro y, si quieres, una fecha en la que se cancele sola.

## Estado actual — Fase 1

Esta fase cubre **organización de suscripciones existentes**, sin compra ni pago de nuevas suscripciones (eso llegará en una fase futura). Incluye:

- Página de bienvenida pública que explica el producto, con el historial de versiones (changelog) visible.
- Cuentas de usuario:
  - Registro e inicio de sesión con email y contraseña, o con **Google**.
  - Opción "Mantener sesión iniciada".
  - Recuperación de contraseña por email (`/#/recuperar` → enlace a `/#/restablecer-contrasena`).
- Área de cliente (`/#/dashboard`) protegida, con:
  - Alta, edición, cancelación y borrado de suscripciones.
  - Buscador de servicios sobre un catálogo curado de ~170 servicios reales (streaming, música, software, gaming, IA, etc.) con sus planes y precios de referencia (`src/lib/serviceCatalog.ts`) — al elegir un plan se prellenan precio y moneda, siempre editables. Si el servicio no está en el catálogo, se puede escribir el nombre a mano.
  - Fecha de cobro única (de ahí se deriva el día del mes) y cálculo automático del próximo cobro.
  - Cancelación programada en una fecha concreta que tú eliges: la víspera el panel te recuerda cancelarla en el servicio (con enlace a su página de gestión) y ese día pasa a "Cancelada" y deja de contar en el gasto.
  - Resumen y gráficas: gasto mensual total, gasto por categoría, próximo cobro y cancelaciones programadas.
  - Comprar desde el formulario: "Comprar" abre la página de planes del servicio (`signupUrl` en el catálogo, o su web) y al volver pregunta si se ha completado la compra — sí (se guarda con fecha de hoy tras revisar el precio), todavía no (queda Pendiente) o no (no se guarda).
  - Verificación por email (reenviar un código a verifica@nicotech.es) retirada en 20.0; el cron sigue activo solo para códigos antiguos.
- Mi cuenta (`/#/cuenta`): cambiar nombre, email, contraseña y foto de perfil, y borrar la cuenta.
- Planes (`/#/precios`): Básico (gratis, hasta 3 suscripciones), Premium Lite (hasta 7) y Premium (ilimitadas), más Enterprise por email.
- Tu plan de Nicotech aparece en el panel como una suscripción más (precio, renovación), sin contar para el límite, con opción de darse de baja (`/#/cancelar-plan`): se deja de cobrar y se conserva el plan hasta el final del periodo pagado.
- Al bajar a un plan con menos hueco del que se usa (p. ej. a Básico con más de 3 suscripciones) hay **3 meses** para volver a un plan superior; el panel avisa de la fecha y de cuáles se cancelarían, y al vencer se cancelan las más recientes hasta quedar en el límite.
- Pago con tarjeta vía **Stripe Checkout** (`/#/pago/:plan`), anual o mensual. Ahora mismo en **modo prueba**: no se cobra nada y se paga con la tarjeta `4242 4242 4242 4242` (cualquier fecha futura y CVC). También se puede activar un plan con un código de acceso.
- Modo claro/oscuro.
- PWA instalable (`/#/instalar`, `public/manifest.webmanifest` + `public/sw.js`).

Explícitamente **fuera de alcance** en esta fase (para fases futuras): cobros reales (Stripe en modo live), compra de nuevas suscripciones, recordatorios por email antes de cada cobro, sincronización de calendario, multi-moneda, cuentas compartidas/equipo.

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
  pages/                   Landing, Login, Register, ForgotPassword, ResetPassword,
                           Dashboard, Account, Pricing, Checkout, InstallApp
  lib/
    api.ts                 Cliente fetch hacia la API PHP
    AuthContext.tsx        Estado de sesión (login/registro/Google/logout/me)
    socialAuth.ts          Inicio de sesión con Google (Google Identity Services)
    changelog.ts           Historial de versiones mostrado en la web
    pricingPlans.ts        Planes Básico / Premium Lite / Premium
    serviceCatalog.ts      Catálogo de ~170 servicios con planes y precios
    subscriptions.ts       Cálculo del próximo cobro
    validation.ts          Constantes/validación compartidas (paleta de colores, etc.)
  components/
    auth/                  Panel lateral y botón de Google de login/registro
    nav/, landing/, dashboard/, ui/   Resto de componentes de UI

api/                      Backend PHP (API JSON, sin dependencias)
  _bootstrap.php           Sesión, conexión PDO, helpers (json_response, require_auth, JWT...)
  _mail.php                Envío SMTP sin librerías
  config.php               Credenciales (NO se sube a git, ver config.example.php)
  auth/                    register, login, logout, me, google, forgot-password, reset-password
  account/                 update-name, update-email, update-password, upload-avatar, set-tier, delete-account
  billing/                 config, create-checkout, confirm-checkout, cancel (Stripe Checkout y bajas)
  _stripe.php              Cliente mínimo de la API de Stripe y precios de los planes
  subscriptions/           list, create, update, delete, toggle
  stats/                   user-count
  cron/                    Revisión por IMAP del buzón de verificación (run-loop.sh)

db/schema.sql             Esquema completo (tablas users y subscriptions)
db/migrations/            Migraciones incrementales sobre el esquema

dist/                     Frontend compilado (se commitea, ver "Despliegue")
deploy.sh                 Copia dist/ y api/ a la carpeta pública del servidor
```

## Diseño

Estética inspirada en [coolors.co](https://coolors.co): tema claro, paleta de colores vivos usados como "swatches" (coral, sunflower, mint, azure, grape, flamingo), tipografía grande en negrita (Inter + Sora), navegación superior minimalista con CTA en píldora, tarjetas redondeadas con sombra suave y pequeñas animaciones de scroll.

## Desarrollo local

Requisitos: Node.js 20+ (solo para compilar el frontend), PHP 7.4+ (con `pdo_mysql` y `mbstring`) y MySQL/MariaDB corriendo localmente.

```bash
# 1. Base de datos (como root de MariaDB)
sudo mariadb -e "CREATE DATABASE nicotech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'nicotech_user'@'localhost' IDENTIFIED BY 'una-contraseña';
  GRANT ALL PRIVILEGES ON nicotech.* TO 'nicotech_user'@'localhost';"
mysql -u nicotech_user -p nicotech < db/schema.sql

# 2. Credenciales del backend
cp api/config.example.php api/config.php   # rellena db_pass; lo demás puede quedar en CHANGE_ME en local

# 3. Variables del frontend
cp .env.example .env                       # rellena VITE_GOOGLE_CLIENT_ID (obligatorio para compilar)

# 4. Backend PHP (sirve la carpeta api/ en el puerto 8000)
php -S localhost:8000 -t api

# 5. Frontend (en otra terminal — proxy /api -> localhost:8000, ver vite.config.ts)
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

En local, mientras las claves de SMTP, reCAPTCHA o IMAP sigan en `CHANGE_ME`, la web funciona igual: simplemente no envía correos y no verifica reCAPTCHA.

### Variables del frontend (`.env`)

Vite las incrusta **al compilar**, así que tienen que estar en tu `.env` cada vez que hagas `npm run build`:

| Variable | Para qué |
| --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de OAuth de Google (el mismo que `google_client_id` en `api/config.php`). **Obligatorio**: `npm run build` falla si falta, para no publicar el botón de Google roto. |
| `VITE_RECAPTCHA_SITE_KEY` | Clave pública de reCAPTCHA v3. Opcional. |

## Despliegue en hosting compartido (Dinahosting o similar, sin Node.js)

1. **Compila el frontend en tu ordenador** (con el `.env` relleno, ver "Variables del frontend", y el Chromium de Playwright instalado — `npx playwright install chromium` — porque al final se prerenderiza la portada para los buscadores):
   ```bash
   npm install
   npm run build
   ```
   Esto genera la carpeta `dist/` con los archivos estáticos (HTML/CSS/JS). **`dist/` se commitea al repositorio** (no es lo habitual, pero aquí no hay Node.js en el servidor para compilarlo allí, así que es la forma más simple de que `git pull` en el servidor deje la web lista sin pasos extra).

2. **Clona el repositorio en el servidor, fuera de la carpeta pública** (importante: nunca dentro de `~/www`, para no exponer el código fuente ni el `.git` por web):
   ```bash
   cd ~
   git clone https://github.com/Nicogr2011-dev/web-nicotech.git nicotech-repo
   ```

3. **Crea la base de datos** desde el panel de tu hosting (sección "Bases de Datos"), tipo MySQL/MariaDB, y anota host, nombre, usuario y contraseña.

4. **Importa el esquema**:
   ```bash
   mysql -u tu_usuario -p tu_base_de_datos < ~/nicotech-repo/db/schema.sql
   ```

5. **Configura las credenciales**: dentro de `~/nicotech-repo`, copia `api/config.example.php` a `api/config.php` y rellena los datos reales de tu base de datos. Este archivo no está en git (ver `.gitignore`), así que sobrevive a futuros `git pull`.

6. **Despliega** el frontend compilado y la API a la carpeta pública con el script incluido:
   ```bash
   cd ~/nicotech-repo
   ./deploy.sh
   ```
   Esto copia `dist/*` y `api/` a `~/www`. Ábrelo — ya no hace falta ningún proceso corriendo, PHP se ejecuta bajo demanda como cualquier web PHP normal.

**Para desplegar una actualización** (tras hacer cambios y `git push` desde tu ordenador):
```bash
cd ~/nicotech-repo
git pull
./deploy.sh
```

## Pagos (Stripe)

La pantalla de pago crea una sesión de **Stripe Checkout** (`api/billing/create-checkout.php`) y redirige a la página de pago de Stripe. Al volver, `api/billing/confirm-checkout.php` le pregunta a Stripe por esa sesión y solo cambia el plan si está pagada y pertenece al usuario que la confirma.

- Clave: `stripe_secret_key` en `api/config.php` (dashboard.stripe.com → Desarrolladores → Claves de API). Con una clave `sk_test_…`/`rk_test_…` todo es modo prueba y la web lo avisa; mientras quede en `CHANGE_ME`, la tarjeta sale como "Próximamente".
- `app_url` en `api/config.php`: adónde vuelve Stripe tras pagar (`http://localhost:5173` en local).
- Los precios que se cobran están en `STRIPE_PLAN_PRICES` (`api/_stripe.php`), en céntimos — hay que mantenerlos en sync con `src/lib/pricingPlans.ts`.
- Darse de baja desde la web cancela la suscripción en Stripe al final del periodo y la web baja a Básico sola al llegar esa fecha.
- **Webhook** (`api/billing/webhook.php`, secreto `stripe_webhook_secret`): Stripe avisa de renovaciones, bajas o reactivaciones hechas en su panel y suscripciones canceladas por impago, y la web actualiza el plan. Registrado en Stripe para `customer.subscription.updated` y `customer.subscription.deleted`.
- **Pendiente para cobrar de verdad**: activar la cuenta de Stripe, cambiar a la clave live y registrar el webhook también en modo live (tiene su propio secreto).

## Versiones

Cada cambio lleva su entrada en `src/lib/changelog.ts`, que es lo que se ve en la web. Formato `DD.MM.YY.MAJOR.MINOR`: MAJOR sube con funciones nuevas y MINOR con ajustes (se reinicia a 0 en cada MAJOR). Sufijos: `.b` = arreglo de un fallo, `.c` = cambio interno (se muestra con un texto genérico).

## Roadmap (próximas fases)

- Pasarela de pago real para los planes y compra de nuevas suscripciones
- Recordatorios por email antes de cada cobro o cancelación
- Exportación/sincronización con calendario
- Soporte multi-moneda
