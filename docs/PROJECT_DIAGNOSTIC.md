# Aura Project Diagnostic

Generated: 2026-06-12

## Scope

This audit covers the current backend, frontend, routes, API client behavior, configuration, documentation drift, and safety/privacy-sensitive logic. It is based on static inspection plus local diagnostic commands.

The worktree was not clean during the audit, so findings describe the current filesystem state, not necessarily committed `main`.

## Commands Run

| Command | Result |
|---|---|
| `cd frontend && npm run build` | Passes. Vite warns that the main JS chunk is larger than 500 kB. |
| `cd frontend && npm run lint` | Fails with 26 errors and 2 warnings. |
| `cd backend/aura_backend && python3 manage.py check` | Fails before URL checks complete. |
| `cd backend/aura_backend && python3 manage.py test` | Fails before running checks; reports 0 tests found before crashing. |
| `python3 -c "..."` in backend | Resolves to `/Library/Frameworks/Python.framework/Versions/3.14/bin/python3`, Django 4.2.30, and cannot import `google.oauth2`. |

## Executive Summary

The frontend production build currently works, but the project is not in a healthy releasable state.

Primary risks:

1. The backend does not start in the current local Python environment.
2. Normal username/password login is logically broken because the frontend expects a user object but SimpleJWT returns only tokens.
3. API response shapes are inconsistent, which has already produced at least one concrete frontend bug in saved-location toggling.
4. Privacy controls for gender-targeted beacons are incomplete, especially for anonymous users and direct beacon detail URLs.
5. The backend exposes dangerous production defaults: hardcoded `SECRET_KEY`, `DEBUG=True`, local-only hosts, SQLite-only config.
6. Lint is failing across the frontend, including real hook and type-safety issues.
7. There are two beacon API implementations with different behavior.
8. There are no backend tests.

## P0 - Blocking / Broken

### 1. Backend cannot start in current environment

Evidence:

- `python3 manage.py check` fails with `ModuleNotFoundError: No module named 'google'`.
- The local `python3` used from `backend/aura_backend` resolves to Python 3.14 with Django 4.2.30.
- Project instructions say Python 3.11 and Django 5.x.
- `backend/requirements.txt` includes `google-auth`, but the active interpreter has not installed it.

Relevant files:

- `backend/requirements.txt`
- `backend/aura_backend/core/views.py:13`
- `backend/aura_backend/manage.py`

Impact:

The backend cannot be checked, tested, or served reliably from the current shell. Dependency behavior differs from the declared stack.

Recommended fix:

- Create and use a project-local virtualenv under `backend/.venv`.
- Pin Python and Django versions intentionally.
- Install `backend/requirements.txt` into that virtualenv.
- Add a backend run/check command to README that uses the venv.

### 2. Username/password login does not return the profile shape expected by frontend

Evidence:

- `frontend/src/lib/api.ts:136` calls `/api/auth/login/`.
- `backend/aura_backend/core/urls.py:26` maps that route directly to `TokenObtainPairView`.
- SimpleJWT login returns tokens, not `{ user, access, refresh }`.
- `frontend/src/store/useAuraStore.ts:119-124` stores `data.user` as the profile.
- `frontend/src/pages/AuthPage.tsx:377-385` waits for both `isAuthenticated` and `profile` before redirecting.

Impact:

Email/password login can authenticate tokens but leave `profile` undefined, causing redirect/onboarding behavior to stall or misbehave.

Recommended fix:

- Replace `TokenObtainPairView` with a custom login view that validates credentials and returns `{ user, access, refresh }`.
- Or update frontend `login()` to fetch `/api/v1/profiles/me/` immediately after receiving tokens.

### 3. Saved-location toggle returns `undefined`

Evidence:

- `frontend/src/api/client.ts:33-42` unwraps `{ data, error }` into raw `data`.
- `frontend/src/lib/api.ts:197-202` expects the unwrapped result to still contain `.data`.
- Backend returns `{"data": {"saved": true, "location_id": ...}, "error": null}` at `backend/aura_backend/core/views.py:315-337`.

Current code:

```ts
const data = await axiosJson<{ data: { saved: boolean; location_id: number } }>(...);
return (data as any).data;
```

After unwrapping, `data` is already `{ saved, location_id }`, so `.data` is undefined.

Impact:

Saving/unsaving venues can crash or silently fail when `useAuraStore.toggleSave()` reads `result.saved`.

Recommended fix:

- Type `axiosJson<{ saved: boolean; location_id: number }>` and return `data` directly.
- Standardize all API unwrap behavior.

### 4. Backend uses production-unsafe settings

Evidence:

- Hardcoded secret: `backend/aura_backend/aura_backend/settings.py:31`
- `DEBUG = True`: `backend/aura_backend/aura_backend/settings.py:34`
- `ALLOWED_HOSTS = ["localhost", "127.0.0.1"]`: `backend/aura_backend/aura_backend/settings.py:36`
- SQLite-only database config: `backend/aura_backend/aura_backend/settings.py:101-106`
- DRF default permission is `AllowAny`: `backend/aura_backend/aura_backend/settings.py:44`

Impact:

Unsafe for Railway/production. Also does not match the declared PostgreSQL/Railway deployment plan.

Recommended fix:

- Read `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DATABASE_URL`, and CORS origins from env.
- Use `dj-database-url` or equivalent for Railway Postgres.
- Make default DRF permission stricter and opt into public access per view.

## P1 - High Priority Functional / Privacy Bugs

### 5. Gender-targeted beacon privacy is incomplete

Evidence:

- List filtering only applies when the requester has a profile gender: `backend/aura_backend/beacons/views.py:41-46`.
- Anonymous users have no gender, so they see all gender-targeted beacons.
- Beacon details do not apply visibility filtering: `backend/aura_backend/beacons/views.py:58-69`.
- The older `/api/beacons/` router path does not apply this filtering either: `backend/aura_backend/core/views.py:211-218`.

Impact:

Women-only/men-only beacons can be exposed to anonymous users or anyone with a direct beacon URL. That undermines a core safety/privacy promise.

Recommended fix:

- For `visibility != "all"`, require authentication and matching `request.user.profile.gender` for both list and detail.
- Decide whether anonymous users should see only `visibility="all"`.
- Remove or align the older `/api/beacons/` implementation.

### 6. Two beacon API implementations have diverged

Evidence:

- Explicit v1 routes: `backend/aura_backend/core/urls.py:33` includes `beacons.urls`.
- Router-backed routes: `backend/aura_backend/core/urls.py:17` and `:38` register `core.views.BeaconViewSet` under `/api/beacons/`.
- `beacons.views.BeaconListCreateView` wraps responses and filters gender visibility.
- `core.views.BeaconViewSet` returns raw DRF serializer responses and lacks visibility filtering.

Impact:

Different routes for the same domain behavior will produce inconsistent API contracts, privacy behavior, and bugs that are hard to reproduce.

Recommended fix:

- Keep one beacon API implementation.
- Prefer the explicit `/api/v1/beacons/` views or a single DRF ViewSet, but not both.
- Update README/docs/frontend to reference only the canonical API.

### 7. Frontend delete beacon endpoint cannot work

Evidence:

- `frontend/src/lib/api.ts:179-180` sends a POST with `{}` to `/api/v1/beacons/${id}/`.
- `backend/aura_backend/beacons/urls.py:11` maps that route to `BeaconDetailView`.
- `BeaconDetailView` only implements `get()`: `backend/aura_backend/beacons/views.py:61`.
- The only delete implementation is on the older router ViewSet: `backend/aura_backend/core/views.py:225-235`.

Impact:

Any frontend delete/inactivate flow calling `api.deleteBeacon()` will fail.

Recommended fix:

- Add `delete()` to the canonical v1 detail view, or update frontend to call the canonical route and HTTP method.
- Do not fake delete with POST.

### 8. Google auth does not check `email_verified`

Evidence:

- Google token fields are read in `backend/aura_backend/core/views.py:103-106`.
- There is no check for `idinfo.get("email_verified")`.

Impact:

Accounts can be linked/created from a Google identity response without explicitly requiring verified email.

Recommended fix:

- Reject non-verified Google emails unless there is a deliberate product reason not to.

### 9. Users can PATCH `is_premium`

Evidence:

- `UserProfileSerializer` includes `is_premium`: `backend/aura_backend/core/serializers.py:26`.
- There is no `read_only_fields` entry for `is_premium`.
- `/api/v1/profiles/me/` PATCH uses this serializer directly: `backend/aura_backend/core/views.py:297-301`.

Impact:

Any authenticated user can likely set their own premium flag by PATCHing their profile.

Recommended fix:

- Mark `is_premium`, `beacons_lit`, `saved_location_ids`, and `username` read-only explicitly.
- Consider separate public/private profile serializers.

### 10. Axios and fetch clients handle auth differently

Evidence:

- `fetchJson()` has refresh-token retry logic: `frontend/src/lib/api.ts:48-90`.
- Axios interceptor clears tokens and redirects immediately on any 401: `frontend/src/api/client.ts:19-30`.
- Many app APIs use `axiosJson()` and therefore axios: locations, beacons, joins, AI, saved locations.

Impact:

Session refresh only works for some requests. Other requests can log the user out immediately even if a valid refresh token exists.

Recommended fix:

- Use one API client.
- Move token refresh into the axios interceptor or stop using axios for authenticated calls.

### 11. Backend response format is inconsistent

Evidence:

- Project convention says success should be `{ "data": ..., "error": null }`.
- v1 beacon views use wrapped responses: `backend/aura_backend/beacons/views.py:19-26`.
- auth views return raw `{ user, access, refresh }`: `backend/aura_backend/core/views.py:50-53`, `:148-151`.
- `profiles/me` returns raw serializer data: `backend/aura_backend/core/views.py:303`.
- `BeaconViewSet.join()` returns raw `BeaconSerializer` data: `backend/aura_backend/core/views.py:266`.

Impact:

Frontend has to guess response shapes, causing bugs like the saved-location toggle issue.

Recommended fix:

- Pick one response format and enforce it across all `/api/v1/` endpoints.
- Keep auth either consistently wrapped or explicitly documented as an exception.

### 12. Backend validation is mostly frontend-only

Examples:

- Past beacon times are rejected in `frontend/src/components/BeaconCreate.tsx`, but `backend/aura_backend/beacons/services.py:47-66` accepts any `scheduled_at`.
- The API allows a creator to join their own beacon; the UI hides the button but `backend/aura_backend/beacons/services.py:69-84` does not block it.
- `RegisterSerializer` does not call Django password validators: `backend/aura_backend/core/serializers.py:156-170`.
- `UserProfileSerializer` allows unrestricted `interests` and `vibe_word` values on PATCH.

Impact:

Direct API calls can create invalid product states even if the frontend prevents them.

Recommended fix:

- Move core validation into serializers/services.
- Validate scheduled time, creator self-join, profile field lengths/options, and password strength on the backend.

## P2 - Medium Priority Bugs / Maintainability Issues

### 13. Frontend lint is failing

Result:

- 26 errors and 2 warnings from `npm run lint`.

Main categories:

- React compiler lint rules objecting to sync `setState` in effects.
- `any` usage in `api.ts`, `AuthPage.tsx`, `useAuraStore.ts`, and `AuraMap.tsx`.
- Impure `Date.now()` during render in `BeaconCard`.
- Conditional hook issue remains in `BeaconDetailPage.backup.tsx`.
- `AuthPage.tsx:399` uses a ternary expression as a statement.

Impact:

CI would fail if lint is required. Some errors are stylistic under newer React lint rules, but others are real maintainability/type-safety risks.

Recommended fix:

- Exclude backup files from lint or remove them.
- Replace `any` with request/response types.
- Resolve the auth Google script expression statement.
- Consider whether the React compiler lint rules are desired for this project now.

### 14. No backend tests

Evidence:

- `python3 manage.py test` reports `Found 0 test(s)` before crashing on imports.

Impact:

Core flows have no automated coverage: registration, Google auth, beacon visibility, joining, saved locations, AI fallback, and profile privacy.

Recommended fix:

- Add API tests for auth, profile update, beacon CRUD/join, visibility filtering, and saved location toggling.

### 15. Location list performs N+1 active beacon count queries

Evidence:

- `LocationSerializer.get_active_beacon_count()` queries per location: `backend/aura_backend/core/serializers.py:68-69`.

Impact:

`GET /api/v1/locations/` can become slow as venue count grows.

Recommended fix:

- Annotate active beacon counts in `LocationViewSet.get_queryset()`.
- Include `expires_at__gt=timezone.now()` so expired-but-active beacons are not counted.

### 16. Stats count expired active beacons

Evidence:

- `StatsView` counts `Beacon.objects.filter(is_active=True)`: `backend/aura_backend/core/views.py:348`.
- Location active count also ignores `expires_at`: `backend/aura_backend/core/serializers.py:68-69`.

Impact:

Stats and map badges can show stale beacons until cleanup commands run.

Recommended fix:

- Filter with `expires_at__gt=timezone.now()` everywhere "active" is displayed.

### 17. GET `/locations/` can mutate the database

Evidence:

- `LocationViewSet.get_queryset()` calls `_sync_locations_from_docs()`: `backend/aura_backend/core/views.py:190-191`.
- `_sync_locations_from_docs()` creates records if none exist: `backend/aura_backend/core/views.py:154-182`.

Impact:

Read requests perform writes. This is risky for production, tests, concurrent first requests, and read-only DB permissions.

Recommended fix:

- Move seeding/import to management commands only.
- Remove mutation from read endpoints.

### 18. AI feature implementation does not match the stated roadmap

Evidence:

- `CompatibilityView` uses Jaccard similarity over interests only: `backend/aura_backend/core/ai_views.py:103-110`.
- It does not use OpenAI embeddings or cosine similarity.
- Business logic lives directly in views, contrary to the project rule.
- `VibeSearchView` sends all venue data inline and falls back to the first five locations: `backend/aura_backend/core/ai_views.py:32-74`.

Impact:

The feature may demo, but it is not the intended AI architecture and can return arbitrary fallback results.

Recommended fix:

- Move AI logic into `services.py`.
- Add deterministic non-AI ranking fallback based on category/tags/editorial text.
- Add embedding fields only when the backend stack is ready for pgvector/PostgreSQL.

### 19. Public profile serializer exposes sensitive fields

Evidence:

- `UserProfileViewSet` allows public retrieve by default: `backend/aura_backend/core/views.py:274-277`.
- `UserProfileSerializer` includes `telegram_username`, `instagram_handle`, `gender`, `interests`, and saved location IDs: `backend/aura_backend/core/serializers.py:15-29`.

Impact:

Public user profile pages can expose contact handles and profile metadata more broadly than intended.

Recommended fix:

- Split serializers into public profile and private `/me` profile.
- Hide Telegram by default unless users explicitly opt in or have joined the same beacon.

### 20. Telegram deep links expose creator handle before/without reciprocal consent

Evidence:

- Feed join opens Telegram creator link if present: `frontend/src/pages/FeedPage.tsx:100-105`.
- Beacon detail always shows "Link Up on Telegram" when creator has a handle: `frontend/src/pages/BeaconDetailPage.tsx:232-242`.

Impact:

Users' Telegram handles become public beacon metadata. This should be a product/privacy decision, not an accidental default.

Recommended fix:

- Add `telegram_share_mode` or equivalent privacy setting.
- Show Telegram only after join, mutual connection, or explicit beacon-level opt-in.

### 21. Dependency/config drift from project instructions

Evidence:

- Project instructions say React 18; `frontend/package.json:20-21` uses React 19.
- Project instructions say Django 5.x; installed local packages show Django 4.2 in the active backend command, while migrations/settings were generated by Django 6.0.6.
- README says Mapbox GL JS: `README.md:9`, but the app uses Leaflet.
- `mapbox-gl` remains installed: `frontend/package.json:19`.
- Backend settings use SQLite only despite the product stack saying PostgreSQL/pgvector.

Impact:

New developers and deploy environments will diverge quickly.

Recommended fix:

- Decide actual versions and update package constraints/docs.
- Remove unused `mapbox-gl`.
- Align README, AGENTS, docs, and production settings.

## P3 - Lower Priority / Cleanup

### 22. Root and docs contain stale or conflicting documentation

Examples:

- README and several docs still reference Mapbox.
- API endpoint table in README uses old `/api/...` paths, while frontend mostly uses `/api/v1/...`.
- `docs/supabase_waitlist.sql` intentionally drops the waitlist table.

Recommended fix:

- Refresh README after API consolidation.
- Label destructive SQL files clearly or provide an additive migration variant.

### 23. Supabase waitlist duplicate email path is not user-friendly

Evidence:

- `docs/supabase_waitlist.sql:11` makes `email` unique.
- `frontend/src/lib/waitlist.ts` does not handle duplicate-key errors specially.

Impact:

Returning users may see a raw Supabase error instead of a friendly "You're already on the list."

Recommended fix:

- Catch duplicate key error code `23505`.
- Or use `upsert` with a controlled conflict target.

### 24. Large frontend bundle

Evidence:

- `npm run build` passes but Vite warns the main chunk is around 953 kB minified, 279 kB gzip.

Impact:

Mobile-first PWA load time can suffer on slower networks.

Recommended fix:

- Lazy-load map, story-card export, AI/search, and route pages.
- Remove unused dependencies.

## Suggested Fix Order

1. Fix backend environment and version pinning so `manage.py check` runs.
2. Fix username/password login response or frontend post-login profile fetch.
3. Fix saved-location toggle unwrap bug.
4. Consolidate beacon APIs and enforce visibility on list and detail.
5. Lock down production settings and profile serializer write permissions.
6. Make token refresh consistent across all API calls.
7. Add backend tests for auth, profile, beacons, and privacy rules.
8. Clean lint errors or tune lint rules intentionally.
9. Update README/docs to match Leaflet, `/api/v1`, and current stack.
10. Optimize bundle splitting after functional correctness is stable.

## Minimal Test Plan To Add

Backend:

- Register returns user + tokens and stores gender/interests/vibe word.
- Login returns user + tokens or frontend fetches profile after login.
- Google auth rejects unverified email and creates incomplete profiles.
- Incomplete Google user can PATCH profile completion.
- Women-only beacons are hidden from anonymous and non-female users on list and detail.
- Creator cannot join own beacon.
- Past scheduled beacon creation is rejected.
- Saved-location toggle returns `{ saved, location_id }`.
- Public profile response does not expose private contact fields.

Frontend:

- Auth login redirects correctly after username/password login.
- Google login redirects incomplete users to onboarding.
- Saved-location heart toggles without runtime error.
- Expired token refresh works for axios-backed and fetch-backed requests.
- Beacon feed does not expose hidden gender-targeted beacons.
- Map and feed render correctly on mobile viewports.

