# Review S1 — independent model pass

**Reviewer model:** GPT-5.2
**Review date:** 2026-11-14
**Author (spec):** Composer (Cursor)
**Verdict:** request changes

## Findings

### Must

- **Fix the “Auth.js + SQLite” assumption**: the current implementation is **custom HS256 JWT** via `jose` in `lib/auth.ts` and a **JSON file store** in `lib/db.ts` (seed written to `data/db.json`). The spec currently instructs a different stack and will mislead future work/review.
- **Align demo accounts with reality**: the code seeds **three** accounts in `lib/db.ts` (mentor + mentee A + mentee B). S1 says “seed two demo users”, which is inaccurate and conflicts with Q4 (needs two mentees).
- **Define the actual auth/session contract** (so other specs can rely on it):
  - **Cookie name**: `aitl_session` (exported as `COOKIE` from `lib/auth.ts`).
  - **Session contents**: `{ id, email, name, role }` (JWT claims).
  - **Session lifetime**: 7 days (`setExpirationTime("7d")`).
  - **Login/logout endpoints**: `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, and `app/api/auth/me/route.ts`.
- **Clarify route protection expectations**: `/tasks` is protected **client-side** today (`app/tasks/page.tsx` calls `/api/auth/me` and then `router.replace("/login")`). If the spec requires a *server redirect* (middleware / server component), state it explicitly; otherwise accept “client redirect after `/api/auth/me` 401” as meeting AC1.
- **Do not allow a production-unsafe default secret to be treated as acceptable**: `lib/auth.ts` falls back to `"dev-only-aitl-secret-change-me"` when `AUTH_SECRET` is missing. S1 must explicitly require setting `AUTH_SECRET` in non-dev (or at minimum document the risk and constraints).

### Should

- **Explicitly state what “passwords” mean in MVP**: the current DB stores demo passwords in plaintext (`lib/db.ts`). S1 should call this out as *demo-only* and non-production, matching `security-notes.md` follow-up about hashing.
- **Be precise about authorization vs authentication**: S1 should describe “session present + role readable server-side” and defer *resource authorization rules* to S4, but also state that **every API route** must do server-side checks (not UI-only).

### Nice

- **Add a tiny “error semantics” note**: current auth endpoints return JSON errors with `401`/`400`; `/api/auth/me` returns `401 { user: null }`. Documenting this helps UI and tests stay consistent.

## Alignment with implementation

### What matches

- **Credentials-based demo login** exists (`app/api/auth/login/route.ts`).
- **HTTP-only cookie session** exists (`aitl_session` cookie set on login; cleared on logout).
- **Role is readable server-side** (decoded from JWT in `readSession()` in `lib/auth.ts` and used in API routes).

### What drifts / is missing

- **Spec stack mismatch**: Auth.js/SQLite is not implemented; current code is custom JWT + JSON file DB.
- **“Seed two demo users” is wrong**: code uses 1 mentor + 2 mentees (and the UI advertises those credentials in `app/login/page.tsx`).
- **Redirect semantics are not server-enforced**: no middleware/server redirect is present; access control for `/tasks` is effectively client-managed plus API 401s.

## Author response

**Author model:** Composer and GPT-5.6 Sol (Cursor sessions; models were switched — corrected 2026-11-14) · **Date:** 2026-11-14

- Applied all Musts in `S1-auth-roles.md`: custom JWT + JSON DB, 3 seed users, client redirect semantics, required `AUTH_SECRET`.
- Should: plaintext demo passwords called out as non-production.
- Implementation follow-up in same PR: remove JWT fallback secret; require env in CI/Playwright.
