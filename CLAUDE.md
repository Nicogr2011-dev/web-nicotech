# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Nicotech (nicotech.es) — a web app for organizing existing subscriptions (Netflix, Spotify, etc.): track price, billing date, and optional auto-cancel date. No purchase/payment flow — see "Roadmap" in README.md for what's explicitly out of scope.

## Stack

- **Frontend**: React 19 + TypeScript SPA, built with Vite, styled with Tailwind CSS 4. Client-side routing via `react-router-dom` `HashRouter` (routes are `/#/dashboard`, `/#/cuenta`, etc.).
- **Backend**: framework-less PHP (7.4+) JSON API — native PHP sessions for auth, `password_hash()`/`password_verify()`, PDO for MySQL/MariaDB. No Composer, no dependencies — anything a library would normally provide (JWT verification for social login, SMTP/IMAP over raw sockets, etc.) is hand-rolled in `api/_bootstrap.php` / `api/_mail.php`.
- **Why PHP**: the shared hosting (Dinahosting) has no Node.js runtime. The frontend is compiled locally and the static output is committed/deployed; only PHP + MySQL run on the server.

## Commands

```bash
npm run dev       # Vite dev server (localhost:5173), proxies /api -> localhost:8000 (see vite.config.ts)
npm run build     # tsc -b && vite build -> dist/
npm run lint      # oxlint
npm run preview   # preview the production build locally

php -S localhost:8000 -t api   # run the PHP backend locally (separate terminal)
```

There is no automated test suite. UI verification is done manually or via ad-hoc Playwright runs (see "Testing" below) — there's no persisted Playwright config/spec directory in the repo.

Frontend env: `cp .env.example .env` and fill `VITE_GOOGLE_CLIENT_ID` (same value as `google_client_id` in `api/config.php`). Vite inlines it at build time, so a build without `.env` ships a broken Google button — that happened in `16.08.26.16.8` and went unnoticed until `16.11`; `vite.config.ts` now refuses to `build` without it. `.env` is gitignored.

Sign in with Apple was removed from the UI in `23.10.26.16.11` (button, `loginWithApple`, `signInWithApple`). `api/auth/apple.php` and the `apple_id` column are intentionally kept dormant in case it's reactivated.

Local backend setup: `cp api/config.example.php api/config.php` and fill in real DB/SMTP/IMAP/reCAPTCHA credentials. `api/config.php` is gitignored — never commit it. `db/schema.sql` has the full schema; `db/migrations/` has incremental migrations layered on top (apply both locally and in production when adding one).

## Architecture

**Routing & pages**: all routes are registered in `src/App.tsx` using a `HashRouter`. Route guards are plain wrapper components: `RequireAuth` (any logged-in user), `RequireAdmin` (checks `user.email` against `ADMIN_EMAIL` from `src/lib/admin.ts`), `RedirectIfAuthed` (auth/register pages — only redirects if the user was *already* authed on mount, so a fresh login/register can control its own success-animation timing before navigating).

**Auth**: `src/lib/AuthContext.tsx` holds session state (`user`, `loading`) via a context provider, backed by PHP native sessions (cookie-based, `credentials: "include"` on every fetch). Backend session/auth helpers live in `api/_bootstrap.php`: `require_auth()` (401 if not logged in), `require_admin()` (403 unless the session user's email matches the hardcoded `ADMIN_EMAIL` constant — kept in sync with the frontend's `src/lib/admin.ts`, both must be updated together).

**API client**: `src/lib/api.ts` — thin fetch wrapper (`apiGet`, `apiPost`, `apiUpload`) that always hits `/api/...`, throws `ApiError` on non-OK JSON responses. Backend endpoints are plain PHP files under `api/`, one file per action (e.g. `api/subscriptions/create.php`), each starting with `require __DIR__ . '/../_bootstrap.php'` for session/DB/helpers. `respond_and_continue()` in `_bootstrap.php` lets an endpoint flush the JSON response early (via `fastcgi_finish_request()`) and keep doing slow work after (e.g. sending an email) without making the client wait.

**Payments**: Stripe Checkout in **test mode** (`17.0`). `api/billing/create-checkout.php` creates a subscription-mode Checkout Session with inline `price_data` from `STRIPE_PLAN_PRICES` in `api/_stripe.php` (cents — keep in sync with `src/lib/pricingPlans.ts`), `client_reference_id` = user id. Success URL is `{app_url}/?stripe_session={CHECKOUT_SESSION_ID}#/pago/<slug>` — the query goes *before* the hash because of `HashRouter`. `confirm-checkout.php` re-fetches the session from Stripe and only sets the tier if it's complete/paid and belongs to the session user. No webhook yet: cancelling *in the Stripe dashboard* does not downgrade.

**Nicotech's own plan in the dashboard** (`18.0`): `NicotechPlanCard` renders from `user.plan` (returned by `user_response()`), *not* from the `subscriptions` table — that's what keeps it out of the 3/7 limit enforced in `api/subscriptions/create.php`. Plan state lives on `users` (`db/migrations/011`): `stripe_subscription_id` (null = activated with a code), `plan_interval`, `plan_started_at`, `plan_renews_at`, `plan_ends_at`. "Darse de baja" → `/#/cancelar-plan` → `api/billing/cancel.php`: Stripe plans get `cancel_at_period_end` and `plan_ends_at`; code plans drop to Básico immediately. The actual downgrade at `plan_ends_at` happens lazily inside `user_response()` (`reset_plan_to_basic()`), so it needs no cron/webhook. Write plan datetimes from PHP (`date()`), never MySQL `NOW()` — PHP is UTC, MySQL is Madrid time, and `user_response()` compares with PHP's `time()`. Paying for a different plan cancels the previous Stripe subscription in `confirm-checkout.php`. Config keys `stripe_secret_key` (a restricted `rk_test_` key from the dashboard) and `app_url`. Stripe's hosted page needs the "Tarjeta" radio clicked before card fields appear (Playwright: click by position).

**Removed in `16.08.26.16.8`** — don't reintroduce without asking: WebRTC voice calling (`/contacto` → `/llamadas`, `src/lib/webrtcCall.ts`, `api/calls/`), the contact page, and the whole Web Push stack (hand-rolled VAPID in `api/_webpush.php`, `api/push/`, `src/lib/webpush.ts`, the `push`/`notificationclick` handlers in `public/sw.js`, the `vapid_*` config keys, and the `calls`/`call_ice_candidates`/`push_subscriptions` tables — dropped by `db/migrations/010`). Push existed *only* to announce incoming calls, so it went with them. `public/sw.js` itself stays: without a service worker the PWA stops being installable.

The admin concept survives this removal — `ADMIN_EMAIL` (`src/lib/admin.ts` + `_bootstrap.php`) still gates plan switching on `/precios`. `require_admin()` in `_bootstrap.php` is currently unused, kept as the counterpart primitive for the next admin-only endpoint.

**Versioning & changelog**: `src/lib/changelog.ts` is the source of truth, shown in-app. Format is `DD.MM.YY.MAJOR.MINOR`. MAJOR bumps for new features, MINOR resets to 0 on each MAJOR bump. Suffixes: `.c` = confidential/internal change (generic changelog text, red label), `.b` = bugfix to the *current* version (yellow label + bug emoji).

**Every entry gets its own version number — suffixed ones included.** A `.b` bumps MINOR just like any other entry (`16.4.b` → `16.5.b`), it does *not* stay on the version it fixes. This changed in `19729a3`: `.b` entries used to keep the previous number, which left five consecutive entries all labelled `16.0.b`, indistinguishable in the UI and duplicate React keys in `Changelog.tsx` (`key={formatVersion(entry)}`). The single pre-`19729a3` leftover is `07.07.26.13.1.b`, which still sits on 13.1 — historical, don't use it as a model.

The `type` field (`MAJOR`/`MINOR`) is only read for entries with *no* suffix: `badgeTone()` in `Changelog.tsx` checks `bugfix` and `confidential` first, so `type` is dead weight on any `.b` or `.c` entry (several v16 `.b` entries carry `type: "MAJOR"` for that reason — harmless, but not a pattern to copy; use `MINOR`).

See [[feedback_versioning_discipline]] pattern: essentially every change gets a version bump and changelog entry.

## Deployment

Deploys are SSH-based to Dinahosting shared hosting (no Node.js on the server): build locally (`npm run build`), commit `dist/` (yes, build output is committed — see README.md for why), push, then on the server `git pull && ./deploy.sh` (copies `dist/*` and `api/` into `~/www`, outside of which the repo/`.git` live so source isn't web-exposed). `deploy.sh` takes an optional target dir arg (defaults to `$HOME/www`).

## Testing discipline

Per established project convention: only run local Playwright verification for MAJOR version changes; MINOR changes go straight to build+deploy without a local test pass, unless told otherwise for a specific change.
