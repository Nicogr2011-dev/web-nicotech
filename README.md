# Nicotech

Nicotech es una web para organizar todas tus suscripciones (Netflix, Spotify, iCloud, etc.) en un solo lugar: buscas el servicio, eliges el plan (con precio real de referencia), fijas la fecha de cobro y, si quieres, una fecha en la que se cancele sola.

## Estado actual — Fase 1

Esta fase cubre **organización de suscripciones existentes**, sin compra ni pago de nuevas suscripciones (eso llegará en una fase futura). Incluye:

- Página de bienvenida pública que explica el producto.
- Cuentas de usuario reales (registro e inicio de sesión con email/contraseña).
- Área de cliente (`/dashboard`) protegida, con:
  - Alta, edición, cancelación y borrado de suscripciones.
  - Buscador de servicios sobre un catálogo curado de ~170 servicios reales (streaming, música, software, gaming, IA, etc.) con sus planes y precios de referencia (`src/lib/serviceCatalog.ts`) — al elegir un plan se prellenan precio y moneda, siempre editables. Si el servicio no está en el catálogo, se puede escribir el nombre a mano.
  - Fecha de cobro única (de ahí se deriva el día del mes) y cálculo automático del próximo cobro.
  - Cancelación automática en una fecha concreta que tú eliges (no por número de meses).
  - Resumen: gasto mensual total, próximo cobro y número de cancelaciones programadas.

Explícitamente **fuera de alcance** en esta fase (para fases futuras): compra/pago de suscripciones, recordatorios por email, sincronización de calendario, recuperación de contraseña, multi-moneda, cuentas compartidas/equipo.

## Stack técnico

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS 4**
- **PostgreSQL** + **Prisma 7** como ORM, usando el driver adapter `@prisma/adapter-pg` (Prisma 7 ya no acepta la URL de conexión directamente en el `schema.prisma`; hay que pasarla vía un adapter al instanciar `PrismaClient`, ver `src/lib/prisma.ts`)
- **NextAuth.js v4** (proveedor Credentials, contraseñas con `bcryptjs`, sesión JWT)
- **Zod** para validación de formularios y `date-fns` para cálculo de fechas

Se eligió este stack porque permite auto-alojar todo (base de datos y backend) en un VPS propio, sin depender de servicios de terceros como Vercel o Supabase — pensado para desplegarse en un VPS Debian con Node.js, tal como se describe más abajo.

### Nota sobre versiones

Este proyecto usa versiones muy recientes (Next.js 16, Prisma 7, Tailwind 4, Zod 4) que cambiaron bastante respecto a versiones anteriores muy documentadas en internet. Dos cambios importantes a tener en cuenta si tocas este código:

- **Prisma 7**: el cliente se genera en `src/generated/prisma` (no en `node_modules/@prisma/client` como antes) y requiere un *driver adapter* (`@prisma/adapter-pg`) en tiempo de ejecución.
- **NextAuth v4 + Credentials**: solo admite estrategia de sesión `"jwt"`. Las sesiones en base de datos (`strategy: "database"`) no son compatibles con el proveedor Credentials — por eso este proyecto no tiene tablas `Account`/`Session` en Prisma, solo `User` y `Subscription`.

## Estructura del proyecto

```
prisma/schema.prisma              Modelos User y Subscription
src/lib/
  prisma.ts                       Cliente Prisma (con el driver adapter de pg)
  auth.ts                         Configuración de NextAuth (Credentials + JWT)
  password.ts                     Hash/verificación de contraseñas (bcryptjs)
  validation.ts                   Esquemas de Zod (registro y suscripciones)
  subscriptions.ts                Cálculo de próximo cobro y fecha de cancelación
src/app/
  page.tsx                        Landing pública
  (auth)/login, (auth)/register   Páginas de autenticación (grupo con layout propio)
  (dashboard)/dashboard           Área de cliente protegida + Server Actions (actions.ts)
  api/auth/[...nextauth]          Endpoint de NextAuth
src/components/
  nav/                            Barra de navegación y menú de usuario
  landing/                        Secciones de la página de bienvenida
  dashboard/                      Tarjetas, formulario, modal y stats de suscripciones
  ui/                             Botones, inputs, cards, badges reutilizables
ecosystem.config.js               Configuración de PM2 para producción
```

## Diseño

Estética inspirada en [coolors.co](https://coolors.co): tema claro, paleta de colores vivos usados como "swatches" (coral, sunflower, mint, azure, grape, flamingo), tipografía grande en negrita (Inter + Sora), navegación superior minimalista con CTA en píldora, tarjetas redondeadas con sombra suave y pequeñas animaciones de scroll.

## Variables de entorno

Copia `.env.example` a `.env` y rellena:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL, ej. `postgresql://usuario:password@localhost:5432/nicotech` |
| `NEXTAUTH_URL` | URL pública del sitio (`http://localhost:3000` en local) |
| `NEXTAUTH_SECRET` | Secreto para firmar los JWT de sesión — genera uno con `openssl rand -base64 32` |

## Desarrollo local

Requisitos: Node.js LTS y PostgreSQL corriendo localmente.

```bash
cp .env.example .env   # rellena las variables de arriba
npx prisma migrate dev
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Para inspeccionar la base de datos: `npx prisma studio`.

## Despliegue en un VPS Debian (self-hosted)

1. **Node.js**: instala Node.js LTS (por ejemplo con `nvm` o el repositorio de NodeSource).
2. **PostgreSQL**: instala PostgreSQL en el VPS (`apt install postgresql`) y crea la base de datos:
   ```bash
   sudo -u postgres createdb nicotech
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'tu-password-seguro';"
   ```
3. **Clona el proyecto y las dependencias**:
   ```bash
   git clone https://github.com/Nicogr2011-dev/web-nicotech.git nicotech && cd nicotech
   npm ci
   ```
4. **Variables de entorno**: crea `.env` en el servidor con valores de producción:
   ```
   DATABASE_URL="postgresql://postgres:tu-password-seguro@localhost:5432/nicotech"
   NEXTAUTH_URL="https://tudominio.com"
   NEXTAUTH_SECRET="genera-uno-con-openssl-rand--base64-32"
   ```
5. **Migraciones y build**:
   ```bash
   npx prisma migrate deploy
   npm run build
   ```
6. **PM2** (mantiene el proceso vivo y lo reinicia si falla o si reinicia el servidor):
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup   # sigue las instrucciones que imprime para persistir tras reboot
   ```
7. **Nginx como reverse proxy** (`/etc/nginx/sites-available/nicotech`):
   ```nginx
   server {
     listen 80;
     server_name tudominio.com;

     location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```
   Activa el sitio y recarga Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/nicotech /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
8. **HTTPS con Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d tudominio.com
   ```

Para desplegar una actualización: `git pull`, `npm ci`, `npx prisma migrate deploy`, `npm run build`, `pm2 restart nicotech`.

## Roadmap (próximas fases)

- Compra y pago real de nuevas suscripciones
- Recordatorios por email antes de cada cobro o cancelación
- Recuperación de contraseña
- Exportación/sincronización con calendario
- Soporte multi-moneda
