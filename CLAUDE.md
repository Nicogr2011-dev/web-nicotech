# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Nicotech (nicotech.es) — a web app for organizing existing subscriptions (Netflix, Spotify, etc.): track price, billing date, and optional auto-cancel date. This repo is **Nicotech V1**, being closed out; V2 (paid plans etc.) is developed privately elsewhere. In V1 the only plan is Básico — free, unlimited subscriptions — and nothing is sold (`21.0`).

## Stack

- **Frontend**: React 19 + TypeScript SPA, built with Vite, styled with Tailwind CSS 4. Client-side routing via `react-router-dom` `HashRouter` (routes are `/#/dashboard`, `/#/cuenta`, etc.).
- **Backend**: framework-less PHP (7.4+) JSON API — native PHP sessions for auth, `password_hash()`/`password_verify()`, PDO for MySQL/MariaDB. No Composer, no dependencies — anything a library would normally provide (JWT verification for social login, SMTP/IMAP over raw sockets, etc.) is hand-rolled in `api/_bootstrap.php` / `api/_mail.php`.
- **Why PHP**: the shared hosting (Dinahosting) has no Node.js runtime. The frontend is compiled locally and the static output is committed/deployed; only PHP + MySQL run on the server.

## Commands

```bash
npm run dev       # Vite dev server (localhost:5173), proxies /api -> localhost:8000 (see vite.config.ts)
npm run build     # tsc -b && vite build && scripts/prerender.mjs -> dist/ (needs Playwright's Chromium: `npx playwright install chromium`)
npm run lint      # oxlint
npm run preview   # preview the production build locally

php -S localhost:8000 -t api   # run the PHP backend locally (separate terminal)
```

There is no automated test suite. UI verification is done manually or via ad-hoc Playwright runs (see "Testing" below) — there's no persisted Playwright config/spec directory in the repo.

Frontend env: `cp .env.example .env` and fill `VITE_GOOGLE_CLIENT_ID` (same value as `google_client_id` in `api/config.php`). Vite inlines it at build time, so a build without `.env` ships a broken Google button — that happened in `16.08.26.16.8` and went unnoticed until `16.11`; `vite.config.ts` now refuses to `build` without it. `.env` is gitignored.

Sign in with Apple was removed from the UI in `23.10.26.16.11` (button, `loginWithApple`, `signInWithApple`). `api/auth/apple.php` and the `apple_id` column are intentionally kept dormant in case it's reactivated.

Local backend setup: `cp api/config.example.php api/config.php` and fill in real DB/SMTP/IMAP/reCAPTCHA credentials. `api/config.php` is gitignored — never commit it. `db/schema.sql` has the full schema; `db/migrations/` has incremental migrations layered on top (apply both locally and in production when adding one).

## Architecture

**Routing & pages**: all routes are registered in `src/App.tsx` using a `HashRouter`. Route guards are plain wrapper components: `RequireAuth` (logged-in user; an account with an unconfirmed email gets `VerifyEmailGate` instead of the page unless the route passes `allowUnverified`, as `/cuenta` does), `RedirectIfAuthed` (auth/register pages — only redirects if the user was *already* authed on mount, so a fresh login/register can control its own success-animation timing before navigating).

**Auth**: `src/lib/AuthContext.tsx` holds session state (`user`, `loading`) via a context provider, backed by PHP native sessions (cookie-based, `credentials: "include"` on every fetch). Backend session/auth helpers live in `api/_bootstrap.php`: `require_auth()` (401 if not logged in), `require_verified_auth()` (also 403 until the email is confirmed — used by every `api/subscriptions/*` endpoint), `require_admin()` (403 unless `users.is_admin = 1`; currently unused, no admin-only endpoint exists).

**Email verification** (`21.1`, `db/migrations/013`): `users.email_verified_at` (accounts that existed before 013 were marked verified; Google sign-ins and password resets also verify). Register sends a link via `send_email_verification()` → `/#/verificar-email?token=…` → `api/auth/verify-email.php`; only the sha256 of the token is stored (`email_token_hash`, 24 h). Changing a *verified* email sets `pending_email` and only swaps it when the link is opened (the old address gets a notice); an unverified account's email changes immediately. An unverified account older than 2 days is deleted when someone registers with that email again (it can't have saved anything).

**Rate limiting** (`21.2.c`): `too_many_attempts()` / `record_attempt()` / `clear_attempts()` over table `auth_attempts` (per action, by IP and by email/`user:<id>` key; rows older than a day are purged on each insert). Login: 10 failures per email or 30 per IP in 15 min → 429. Register: 5 per IP/hour. Current-password checks in `/account/*`, forgot-password and verification mails are limited too. reCAPTCHA is wired but has no keys in production.

**`api/.htaccess`** denies web access to `_*.php` and `config*.php` (they're only `require`d). Never name a public endpoint `config.php` or with a leading `_`.

**API client**: `src/lib/api.ts` — thin fetch wrapper (`apiGet`, `apiPost`, `apiUpload`) that always hits `/api/...`, throws `ApiError` on non-OK JSON responses. Backend endpoints are plain PHP files under `api/`, one file per action (e.g. `api/subscriptions/create.php`), each starting with `require __DIR__ . '/../_bootstrap.php'` for session/DB/helpers. `respond_and_continue()` in `_bootstrap.php` lets an endpoint flush the JSON response early (via `fastcgi_finish_request()`) and keep doing slow work after (e.g. sending an email) without making the client wait.

**Payments** — none sold in V1. `21.0` removed `Checkout.tsx`, `/pago/:tier` (now redirects to `/precios`), `create-checkout.php`, `confirm-checkout.php`, `billing/config.php` and `set-tier.php` (git history has them for V2). Premium / Premium Lite stay in `PLANS` with `available: false` only so Pricing can show them as "No disponible" and so test-mode payers still see their plan. What remains serves those earlier test-mode payers: `cancel.php` and the webhook. Stripe → web sync goes through `api/billing/webhook.php` (`20.7`, events `customer.subscription.updated` / `.deleted`, signature checked with `stripe_verify_signature()` against `stripe_webhook_secret`): it copies `plan_renews_at` / `plan_ends_at` from the subscription, and on deleted/canceled/unpaid calls `reset_plan_to_basic()`. `past_due` keeps the plan (Stripe is retrying). Events for subscriptions that aren't any user's current `stripe_subscription_id` are ignored. The lazy `plan_ends_at` downgrade in `user_response()` stays as a fallback.

**Nicotech's own plan in the dashboard** (`18.0`): `NicotechPlanCard` renders from `user.plan` (returned by `user_response()`), not from the `subscriptions` table. Plan state lives on `users` (`db/migrations/011`): `stripe_subscription_id` (null = activated with a code), `plan_interval`, `plan_started_at`, `plan_renews_at`, `plan_ends_at`. "Darse de baja" → `/#/cancelar-plan` → `api/billing/cancel.php`: Stripe plans get `cancel_at_period_end` and `plan_ends_at`; code plans drop to Básico immediately. The actual downgrade at `plan_ends_at` happens lazily inside `user_response()` (`reset_plan_to_basic()`). Write plan datetimes from PHP (`date()`), never MySQL `NOW()`.

**Limits & grace period** (`19.0`, `db/migrations/012`): the machinery is still in `_bootstrap.php` (`TIER_LIMITS`, `count_limited_subscriptions()`, `update_limit_grace()`, `enforce_tier_limit()`, checked by `create.php` and reactivation in `toggle.php`), but in V1 `TIER_LIMITS` is empty, so no plan has a limit and no grace period ever starts (013 cleared any running one). The frontend limit/grace UI was removed in `21.0`.

**Buying from the form** (`20.0`): `SubscriptionForm` opens `getPurchaseUrl()` (`affiliateUrl ?? signupUrl ?? website`) in a popup and, on close or "Ya he terminado", asks whether the purchase was completed (`PurchaseStep`). It never auto-saves on popup close anymore. `signupUrl` exists only for services whose plans page was checked to return 200 and not redirect home — don't add unverified URLs. The old verifica@ forwarding check and its IMAP cron (`api/cron/`) were removed in `21.2.c`; subscriptions verified back then keep `verified_at` and their badge.

**Removed in `16.08.26.16.8`** — don't reintroduce without asking: WebRTC voice calling (`/contacto` → `/llamadas`, `src/lib/webrtcCall.ts`, `api/calls/`), the contact page, and the whole Web Push stack (hand-rolled VAPID in `api/_webpush.php`, `api/push/`, `src/lib/webpush.ts`, the `push`/`notificationclick` handlers in `public/sw.js`, the `vapid_*` config keys, and the `calls`/`call_ice_candidates`/`push_subscriptions` tables — dropped by `db/migrations/010`). Push existed *only* to announce incoming calls, so it went with them. `public/sw.js` itself stays: without a service worker the PWA stops being installable.

Admin is the `users.is_admin` column since `21.2.c` (`ADMIN_EMAIL` and `src/lib/admin.ts` are gone); nothing uses it yet.

**Versioning & changelog**: `src/lib/changelog.ts` is the source of truth, shown in-app. Format is `DD.MM.YY.MAJOR.MINOR`. MAJOR bumps for new features, MINOR resets to 0 on each MAJOR bump. Suffixes: `.c` = confidential/internal change (generic changelog text, red label), `.b` = bugfix to the *current* version (yellow label + bug emoji).

**Every entry gets its own version number — suffixed ones included.** A `.b` bumps MINOR just like any other entry (`16.4.b` → `16.5.b`), it does *not* stay on the version it fixes. This changed in `19729a3`: `.b` entries used to keep the previous number, which left five consecutive entries all labelled `16.0.b`, indistinguishable in the UI and duplicate React keys in `Changelog.tsx` (`key={formatVersion(entry)}`). The single pre-`19729a3` leftover is `07.07.26.13.1.b`, which still sits on 13.1 — historical, don't use it as a model.

The `type` field (`MAJOR`/`MINOR`) is only read for entries with *no* suffix: `badgeTone()` in `Changelog.tsx` checks `bugfix` and `confidential` first, so `type` is dead weight on any `.b` or `.c` entry (several v16 `.b` entries carry `type: "MAJOR"` for that reason — harmless, but not a pattern to copy; use `MINOR`).

See [[feedback_versioning_discipline]] pattern: essentially every change gets a version bump and changelog entry.

**Conventions worth knowing** (from the `20.1`–`20.6` cleanup):
- PHP runs in `Europe/Madrid` (set in `_bootstrap.php`), same as MySQL `NOW()` and production; "today" for date-only columns is `date('Y-m-d')`. Frontend: never `toISOString().slice(0, 10)` (UTC → wrong day after midnight in Spain) — use `localIsoDate()` / `parseLocalDate()` from `src/lib/subscriptions.ts`; MySQL datetimes need `replace(" ", "T")` before `new Date()` (Safari).
- Scheduled cancellations are applied lazily by `apply_scheduled_cancellations()` (called from `list.php` and `count_limited_subscriptions()`); `cancelled_at` = the scheduled date.
- Google-only accounts have `password_hash = NULL` (`user.hasPassword` on the frontend). Always use `check_password()`, never raw `password_verify()` on a user hash. Google login checks the token's `azp/aud` against our client ID via `tokeninfo`, and linking Google to an existing email account clears its password.
- Names go through `clean_name()` (no control chars — they reach mail headers). `require_auth()` also checks the user row still exists.
- Deleting an account cancels its Stripe subscription first.
- Forms use `onSubmit` + `preventDefault`, never `action={...}` (React 19 resets the form even on failure).
- `deploy.sh` replaces `~/www/assets` each time (hashed bundles used to pile up).

**SEO** (`20.11`): `scripts/prerender.mjs` runs after `vite build`, opens the built site in headless Chromium (anonymous, `/api` blocked, cookie banner pre-accepted), forces `.reveal` sections to `in-view`, and injects the landing markup into `<div id="root">` inside `<div data-prerender>`. React replaces it with `createRoot` (not hydrate). An inline script in `index.html` sets `data-app-route` when there's a hash route so the prerendered landing never flashes on `/#/dashboard` etc. Title/description/OG/JSON-LD live in `index.html`; `public/robots.txt`, `public/sitemap.xml` (only `/` — hash routes are one URL to Google) and `public/og-image.png` (1200×630). The Hero `h1` letters are `aria-hidden` with an `sr-only` copy of the sentence, so crawlers read "Organiza todas tus…" and not single letters.

## Deployment

Deploys are SSH-based to Dinahosting shared hosting (no Node.js on the server): build locally (`npm run build`), commit `dist/` (yes, build output is committed — see README.md for why), push, then on the server `git pull && ./deploy.sh` (copies `dist/*` and `api/` into `~/www`, outside of which the repo/`.git` live so source isn't web-exposed). `deploy.sh` takes an optional target dir arg (defaults to `$HOME/www`).

## Testing discipline

Per established project convention: only run local Playwright verification for MAJOR version changes; MINOR changes go straight to build+deploy without a local test pass, unless told otherwise for a specific change.
