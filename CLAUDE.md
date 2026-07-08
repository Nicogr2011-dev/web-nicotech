# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Nicotech (nicotech.es) — a web app for organizing existing subscriptions (Netflix, Spotify, etc.): track price, billing date, and optional auto-cancel date. No purchase/payment flow — see "Roadmap" in README.md for what's explicitly out of scope.

## Stack

- **Frontend**: React 19 + TypeScript SPA, built with Vite, styled with Tailwind CSS 4. Client-side routing via `react-router-dom` `HashRouter` (routes are `/#/dashboard`, `/#/cuenta`, etc.).
- **Backend**: framework-less PHP (7.4+) JSON API — native PHP sessions for auth, `password_hash()`/`password_verify()`, PDO for MySQL/MariaDB. No Composer, no dependencies — anything a library would normally provide (JWT verification, VAPID/ES256 signing, etc.) is hand-rolled in `api/_bootstrap.php` / `api/_webpush.php`.
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

Local backend setup: `cp api/config.example.php api/config.php` and fill in real DB/SMTP/VAPID/reCAPTCHA credentials. `api/config.php` is gitignored — never commit it. `db/schema.sql` has the full schema; `db/migrations/` has incremental migrations layered on top (apply both locally and in production when adding one).

## Architecture

**Routing & pages**: all routes are registered in `src/App.tsx` using a `HashRouter`. Route guards are plain wrapper components: `RequireAuth` (any logged-in user), `RequireAdmin` (checks `user.email` against `ADMIN_EMAIL` from `src/lib/admin.ts`), `RedirectIfAuthed` (auth/register pages — only redirects if the user was *already* authed on mount, so a fresh login/register can control its own success-animation timing before navigating).

**Auth**: `src/lib/AuthContext.tsx` holds session state (`user`, `loading`) via a context provider, backed by PHP native sessions (cookie-based, `credentials: "include"` on every fetch). Backend session/auth helpers live in `api/_bootstrap.php`: `require_auth()` (401 if not logged in), `require_admin()` (403 unless the session user's email matches the hardcoded `ADMIN_EMAIL` constant — kept in sync with the frontend's `src/lib/admin.ts`, both must be updated together).

**API client**: `src/lib/api.ts` — thin fetch wrapper (`apiGet`, `apiPost`, `apiUpload`) that always hits `/api/...`, throws `ApiError` on non-OK JSON responses. Backend endpoints are plain PHP files under `api/`, one file per action (e.g. `api/subscriptions/create.php`), each starting with `require __DIR__ . '/../_bootstrap.php'` for session/DB/helpers. `respond_and_continue()` in `_bootstrap.php` lets an endpoint flush the JSON response early (via `fastcgi_finish_request()`) and keep doing slow work after (e.g. sending an email/push) without making the client wait.

**Calling feature** (`/contacto` → `/llamadas`, admin-only receiving end): real WebRTC audio calling with no WebSocket server — signaling (offer/answer/ICE candidates) is done by polling PHP REST endpoints under `api/calls/`. Shared client logic lives in `src/lib/webrtcCall.ts`:
- `createPeerConnection()` — STUN + TURN (Open Relay Project free relay) fallback `iceServers` list; STUN alone fails on some restrictive/double-NAT networks.
- `createIceForwarder(pc)` — **must** be attached immediately at `RTCPeerConnection` creation (not after any `await`), because candidates can start firing before the caller/callee role (`callId`/`callToken`) is known; it buffers candidates until `attachRole()` is called, then flushes them. Getting this ordering wrong silently drops candidates and the call goes one-way or silent.
- `pollRemoteIce()` / `monitorCallStatus()` — interval-based polling (not push) for the remote ICE candidates and call status (`ringing`/`answered`/`ended`).
- `describeCallDebugState()` — feeds a live on-screen debug line in both `Contact.tsx` and `Calls.tsx` (ICE/connection state, track state, audio element state), because the admin's real devices aren't remotely debuggable — prefer extending this over guessing when diagnosing call issues.
- Mobile autoplay: `<audio>.play()` can reject on mobile until a real user gesture; both call pages track `needsAudioUnlock` and render a "Toca para activar el audio" button as a fallback.

**Web Push**: `api/_webpush.php` implements VAPID (ES256 JWT signing, DER↔raw ECDSA conversion) from scratch since there's no Composer/library. Used to notify the admin of incoming calls (`notify_admin_of_call()`); `public/sw.js` handles `notificationclick` to open `/#/llamadas`.

**Versioning & changelog**: `src/lib/changelog.ts` is the source of truth, shown in-app. Format is `DD.MM.YY.MAJOR.MINOR`. MAJOR bumps for new features, MINOR resets to 0 on each MAJOR bump. Suffixes: `.c` = confidential/internal change (generic changelog text, red label), `.b` = bugfix to the *current* version (doesn't bump the version number, yellow label + bug emoji). See [[feedback_versioning_discipline]] pattern: essentially every change gets a version bump and changelog entry.

## Deployment

Deploys are SSH-based to Dinahosting shared hosting (no Node.js on the server): build locally (`npm run build`), commit `dist/` (yes, build output is committed — see README.md for why), push, then on the server `git pull && ./deploy.sh` (copies `dist/*` and `api/` into `~/www`, outside of which the repo/`.git` live so source isn't web-exposed). `deploy.sh` takes an optional target dir arg (defaults to `$HOME/www`).

## Testing discipline

Per established project convention: only run local Playwright verification for MAJOR version changes; MINOR changes go straight to build+deploy without a local test pass, unless told otherwise for a specific change.
