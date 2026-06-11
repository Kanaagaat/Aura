Проект — список сделанных изменений (сводка)

1) Короткое резюме
- Подключил загрузку реальных локаций из `docs/locations.json` и заменил старые mock-данные на кураторский набор (34 места: 10 кофеен, 10 йога-студий, 10 SPA, 4 прочих).
- Настроил поиск и отдачу локальных фото из папки `downloads_photos/` — если файл совпадает по `2gis_id` или нормализованному имени, то `photo_url` у локации указывает на `/downloads_photos/<файл>`; при отсутствии фото поле остаётся пустым.
- Добавил автоматическую синхронизацию (одинарная) из `docs/locations.json` в `LocationViewSet` — если таблица пустая, записи подтягиваются при первом вызове эндпоинта.
- Обновил команду управления `seed_venues` — теперь она читает `docs/locations.json` и создаёт локации по новым правилам.
- Добавил статическую отдачу каталога `downloads_photos/` в `urls.py` (только в DEBUG) по пути `/downloads_photos/<имя>`.
- На фронтенде добавил catch-all роутинг: все неизвестные пути теперь редиректят на `/`.

2) Изменённые файлы
- `backend/aura_backend/core/management/commands/seed_venues.py` — загрузка и нормализация локаций из `docs/locations.json`, сопоставление фото.
- `backend/aura_backend/core/views.py` — добавлены хелперы для нормализации категорий/тегов, поиск фото, автосинхронизация при пустой базе.
- `backend/aura_backend/aura_backend/urls.py` — статическая отдача `downloads_photos/` в DEBUG режиме.
- `frontend/src/App.tsx` — добавлен маршрут `path="*"` → `Navigate to="/"` (редирект на главную для неизвестных endpoint'ов).
- `docs/locations.json` — заменён: теперь кураторский список (34 записи) с аккуратными описаниями и кратким форматом расписания.

3) Как это работает
- При первом вызове `/api/locations/?city=Almaty` бэкенд проверит — пуста ли таблица `Location`. Если пуста, он импортирует записи из `docs/locations.json` и сохранит в БД. Фото будут указывать на `/downloads_photos/<filename>` только если соответствующий файл найден в репо-корне `downloads_photos/`.

4) Что нужно сделать локально для использования
- Положите ваши фотографии в репозиторий в папку `downloads_photos/` (рядом с `backend/`, `frontend/`, `docs/`). Желательные форматы: `jpg`, `jpeg`, `png`. Имена файлов желательно включать `2gis_id` или нормализованное название для автоматического совпадения.
- Чтобы пересоздать локации и заимпортировать новые данные выполните в корне проекта:

```bash
cd backend
source .venv/bin/activate   # если используете виртуальное окружение
python manage.py migrate
python manage.py seed_venues
python manage.py runserver 8000
```

- Запустите фронтенд (в корне `frontend`):

```bash
cd frontend
npm install
npm run dev
```

5) Замечания и текущие ограничения
- Frontend сборка до сих пор падает по независящей от изменений ошибке типизации в `src/pages/AuthPage.tsx` (используется `window.google` без соответствующего объявления типов). Это не связано с импортом локаций и можно исправить отдельным PR (добавить декларацию типа или условную проверку).
- Мы не перезаписываем существующие записи в таблице `Location` при синхронизации — импорт выполняется только если таблица пуста. Если хотите принудительно обновить из `docs/locations.json`, запустите `python manage.py seed_venues`, команда очищает `Location` и `Beacon` перед вставкой.
- Статическая отдача файлов через Django `serve` используется только в DEBUG и предназначена для локальной разработки.

6) Рекомендации дальше
- Если нужно, могу:
	- написать миграцию/скрипт для обновления существующих записей из `docs/locations.json` (merge logic),
	- добавить endpoint для триггера ресинхронизации (админский только),
	- исправить типизацию `window.google` в `AuthPage.tsx` чтобы сборка фронтенда проходила.

Если хотите — впишу более детально, какие именно строки кода были добавлены в каждый файл (diffs), или создам PR с этими изменениями.

Дата: 10 июня 2026

---

Дополнение от 10 июня 2026 — задачи 2, 3, 4, 5 из AGENTS.md

1) Короткое резюме
- Подключил карту к реальному API через `GET /api/v1/locations/`.
- Добавил axios-клиент с JWT interceptor в `frontend/src/api/client.ts` и перевёл основные location/beacon вызовы на `/api/v1/`.
- Доработал `AuraMap`: реальные pill-маркеры Leaflet, CartoDB Light tiles, выбор локации и pulse-маркер для активных beacon.
- Доработал `VibeCard`: mobile bottom sheet + desktop right panel, CTA теперь открывает создание beacon поверх карты.
- Добавил `BeaconCreate`: slide-up modal, 4 activity tiles, горизонтальные time slots 08:00–22:00, textarea 100 символов, submit `Light it 🌿`.
- Добавил Django app `beacons` для v1 beacon API: thin views, serializers, services, urls, management command `deactivate_expired_beacons`.
- Сохранил существующие таблицы `core.Beacon` / `core.BeaconJoin`, чтобы не дублировать уже созданные модели и миграции.

2) Изменённые и созданные файлы
- `frontend/src/api/client.ts` — axios instance, `VITE_API_URL`, JWT Authorization header, 401 redirect to `/auth`.
- `frontend/src/lib/api.ts` — location/beacon calls now use `/api/v1/` and unwrap `{ data, error }` responses.
- `frontend/src/components/AuraMap.tsx` — real API locations are rendered as Leaflet markers with venue pills and beacon pulse markers.
- `frontend/src/components/VibeCard.tsx` — `onLightBeacon` callback support, CTA opens beacon creation in-place.
- `frontend/src/components/BeaconCreate.tsx` — new beacon creation modal over the map.
- `frontend/src/pages/MapPage.tsx` — state wiring for selected location, beacon modal, and fresh pulse animation after submit.
- `frontend/package.json` / `frontend/package-lock.json` — added `axios`.
- `backend/aura_backend/aura_backend/settings.py` — registered `beacons` app.
- `backend/aura_backend/core/urls.py` — added `/api/v1/auth/*`, `/api/v1/locations/`, `/api/v1/profiles/`, and `/api/v1/beacons/`.
- `backend/aura_backend/beacons/__init__.py`
- `backend/aura_backend/beacons/models.py`
- `backend/aura_backend/beacons/serializers.py`
- `backend/aura_backend/beacons/services.py`
- `backend/aura_backend/beacons/views.py`
- `backend/aura_backend/beacons/urls.py`
- `backend/aura_backend/beacons/management/__init__.py`
- `backend/aura_backend/beacons/management/commands/__init__.py`
- `backend/aura_backend/beacons/management/commands/deactivate_expired_beacons.py`

3) API endpoints added
- `GET /api/v1/beacons/?location_id=&active=true`
- `POST /api/v1/beacons/`
- `POST /api/v1/beacons/<id>/join/`

Response format for the new beacon endpoints:

```json
{ "data": "...", "error": null }
```

4) Commands / dependency changes

Frontend dependency installed:

```bash
cd frontend
npm install axios
```

No new backend migration was generated because beacon tables already exist in `core/migrations/0001_initial.py`. Verification:

```bash
cd backend/aura_backend
python manage.py makemigrations --check --dry-run
```

Result: `No changes detected`.

5) Verification completed
- `python manage.py check` — passed.
- `python manage.py makemigrations --check --dry-run` — passed, no changes detected.
- `python manage.py test` — passed system check; no tests exist yet.
- `cd frontend && npm run build` — passed. Vite emitted only the existing large chunk warning.
- Browser smoke test at `http://127.0.0.1:5173/map` — passed: 34 Leaflet markers rendered, VibeCard opened from a venue, and BeaconCreate opened with activity tiles, character counter, and submit CTA.

═══════════════════════════════════════════════
ROUND 2 — Bug fixes (Google auth, navbar, beacon detail, join, profile photo)
═══════════════════════════════════════════════

1) Short summary
Fixed the five reported issues. Two were hard bugs (a Django 6 API removal that
500-ed Google sign-in, and a React hooks-order violation that white-screened the
beacon detail page); the rest were missing UI/endpoints.

2) Problem → root cause → fix

A) "Google auth doesn't work"
   - Root cause (backend): `GoogleAuthView` called
     `User.objects.make_random_password()`, which was REMOVED in Django 5.1+.
     The project runs Django 6.0.6, so creating a new OAuth/mock user raised
     `AttributeError` → HTTP 500 on every first-time Google/mock login.
   - Root cause (frontend): the GIS button was initialized with a hardcoded
     dummy client id (`...-dummy.apps.googleusercontent.com`), which never
     renders a working Google button.
   - Fix (backend): `core/views.py` now generates a strong password with
     `secrets.token_urlsafe(32)` (import `secrets`).
   - Fix (frontend): `AuthPage.tsx` only loads/renders the real Google button
     when `VITE_GOOGLE_CLIENT_ID` is a valid `*.apps.googleusercontent.com`
     value. Otherwise it shows a working "Continue with Google" button that uses
     the in-app dev/mock flow, so sign-in always works locally. The mock bypass
     remains available.

B) "Navbar/menu visible while registering/logging in"
   - Root cause: `AppLayout` always rendered `SidebarNav` + `MobileNav`, including
     on `/auth`.
   - Fix: `components/Layout.tsx` reads the route via `useLocation` and renders
     children only (no chrome) on `/auth` (and any `/auth/*` subpath).

C) "/beacon/:id crashing — white screen, back button leaves everything white"
   - Root cause #1 (crash): `BeaconDetailPage` called
     `useAuraStore((s) => s.isAuthenticated)` AFTER an early `return` (the
     loading guard). Conditional hook calls violate the Rules of Hooks →
     "rendered more hooks than previous render" → the whole React tree threw,
     producing a white screen that survived navigation.
   - Root cause #2 (data): the frontend requested `GET /api/v1/beacons/<id>/`
     but the `beacons` app only exposed list (`""`) and `<id>/join/`. The detail
     URL 404-ed, so the beacon never loaded.
   - Fix: rewrote `pages/BeaconDetailPage.tsx` so ALL hooks are declared
     unconditionally before any return; added null-guards for `location`,
     `creator`, and `joins`; "back" now uses `navigate('/')`.
   - Fix: added `BeaconDetailView` (`beacons/views.py`), `get_beacon`
     (`beacons/services.py`), and route `path("<int:pk>/", ...)`
     (`beacons/urls.py`) returning the standard `{data, error}` envelope.
   - Fix: added `components/ErrorBoundary.tsx` wrapping all routes in `App.tsx`
     so a single broken page shows a recoverable "Back to Home" screen instead
     of blanking the app.

D) "No logic and button to join a beacon"
   - Fix: `BeaconDetailPage` now has a clear primary "I'm in" button with full
     state handling: hidden for the creator ("You lit this beacon"), disabled +
     "✓ You're in" once joined, inline error surfacing (e.g. "Already joined",
     "Beacon has expired"), and it refetches the detail so the attendee stack and
     count update immediately.
   - Fix: `lib/api.ts` `axiosJson` now extracts the backend error message
     (`error.message` / `detail`) so join failures read cleanly in the UI.

E) "Can not edit profile photo"
   - Root cause: `ProfilePage` had no edit affordance; `avatar_url` was a
     `URLField`, which rejects uploaded image data URLs.
   - Fix (backend): `core/models.py` `avatar_url` → `TextField` (+ migration
     `0002_alter_userprofile_avatar_url`) so uploaded photos can be stored as
     data URLs.
   - Fix (frontend): new `components/EditProfileModal.tsx` — upload a photo
     (file → base64 data URL, ≤1.5 MB, with live preview), or paste a URL, plus
     edit display name, bio, Telegram, and Instagram. Saved via a new
     `updateProfile` store action → `PATCH /api/v1/profiles/me/`. `ProfilePage`
     gained a camera button on the avatar and an "Edit Profile" button, with a
     graceful fallback avatar on broken images.

3) AGENTS.md task status
   - Task 1 (AuthPage TS `window.google`): already present, retained.
   - Task 2 (map pins ↔ API): present (`useLocations`, `AuraMap`).
   - Task 3 (VibeCard sheet): present.
   - Task 4 (beacons backend): completed — list/create/join existed; ADDED the
     missing retrieve endpoint. `deactivate_expired_beacons` command present.
   - Task 5 (BeaconCreate UI): present.
   - Weeks 4–6 (Telegram story cards, AI compatibility/vibe/beacon-suggest,
     onboarding, analytics): intentionally NOT built — AGENTS.md marks these
     "do not build yet".

4) Files changed / added
   Backend:
   - `core/views.py` — `secrets`-based password for OAuth users (Django 6 fix).
   - `core/models.py` — `avatar_url` URLField → TextField.
   - `core/migrations/0002_alter_userprofile_avatar_url.py` — new migration.
   - `beacons/views.py` — added `BeaconDetailView`.
   - `beacons/services.py` — added `get_beacon`.
   - `beacons/urls.py` — added `GET /api/v1/beacons/<id>/`.
   Frontend:
   - `pages/BeaconDetailPage.tsx` — rewritten (hook order, guards, join UX).
   - `pages/AuthPage.tsx` — Google client-id handling + dev fallback.
   - `pages/ProfilePage.tsx` — edit button, avatar camera, modal, fallback.
   - `components/Layout.tsx` — hide chrome on `/auth`.
   - `components/ErrorBoundary.tsx` — new.
   - `components/EditProfileModal.tsx` — new.
   - `store/useAuraStore.ts` — added `updateProfile` action.
   - `lib/api.ts` — clean error-message extraction in `axiosJson`.
   - `App.tsx` — wrapped routes in `ErrorBoundary`.

5) Migration / run commands
```bash
cd backend/aura_backend
python manage.py migrate        # applies 0002_alter_userprofile_avatar_url
python manage.py runserver 8000
# optional cron/management task:
python manage.py deactivate_expired_beacons
```
No new packages required (backend or frontend).

6) Verification completed
   - `python manage.py check` — passed (0 issues).
   - `python manage.py makemigrations` — produced only the intended avatar_url
     migration; `migrate` applied OK.
   - Backend integration tests (Django test Client):
       * `GET /api/v1/beacons/<id>/` — 200 (was 404).
       * Google mock auth for a NEW user — 200 (was 500).
       * register → create beacon → join → 201; detail shows joins=1,
         join_count=1; duplicate join returns a clean 400 "Already joined".
       * `PATCH /api/v1/profiles/me/` with an image data URL — 200, avatar stored.
   - `cd frontend && npx tsc -b` — passed.
   - `cd frontend && npm run build` — passed (only the pre-existing large-chunk
     warning).

7) Local note
   To enable REAL Google OAuth (instead of the dev fallback), set
   `VITE_GOOGLE_CLIENT_ID=<your-id>.apps.googleusercontent.com` in
   `frontend/.env.local` and `GOOGLE_CLIENT_ID=<same>` in the backend env.

═══════════════════════════════════════════════
ROUND 3 — Location photos, Google OAuth, public profiles, 2GIS links
═══════════════════════════════════════════════

1) Short summary
Fixed four reported issues: venue photos now resolve with category fallbacks,
Google sign-in uses a mounted GIS button (or dev mock when unconfigured),
other users’ profiles are viewable at `/users/:id`, and location panels include
an “Open in 2GIS” button.

2) Problem → root cause → fix

A) "Photo of location is not visible"
   - Root cause: relative `/downloads_photos/...` URLs were not proxied from the
     Vite dev server; empty `photo_url` values had no client-side fallback.
   - Fix: `core/location_utils.py` + `LocationSerializer.get_photo_url` return
     absolute URLs with Unsplash fallbacks per category; `refresh_locations`
     command updates existing rows; Vite proxies `/downloads_photos` → `:8000`;
     new `LocationImage` component retries on error.

B) "Google auth doesn't work — implement fully"
   - Fix (backend): returns HTTP 503 with a clear message when `GOOGLE_CLIENT_ID`
     is unset (non-mock tokens); mock flow still works in `DEBUG`.
   - Fix (frontend): `AuthPage` mounts the GIS button via `useRef` after the
     script loads (fixes blank/broken button); dev "Continue with Google" mock
     when no client id; `frontend/.env.example` documents `VITE_GOOGLE_CLIENT_ID`.

C) "Can not check other user profiles"
   - Fix: `UserProfileViewSet` allows public `GET /api/v1/profiles/<id>/`;
     new `UserProfilePage` at `/users/:id`; creator avatars/names link to profiles
     from `BeaconCard`, `BeaconDetailPage`, and `AvatarStack`.

D) "Button to location that redirects to 2GIS"
   - Fix: `Location.two_gis_id` field + `two_gis_url` in API; `TwoGisButton` on
     `VibeCard` and `BeaconDetailPage` opens `https://2gis.kz/almaty/firm/{id}`.

3) Files changed / added
   Backend:
   - `core/location_utils.py` — photo resolution, 2GIS URL helpers.
   - `core/models.py` — `two_gis_id` on `Location`.
   - `core/migrations/0003_location_two_gis_id.py`.
   - `core/serializers.py` — computed `photo_url`, `two_gis_url`, `username`.
   - `core/views.py` — public profile retrieve; Google 503 when unconfigured.
   - `core/management/commands/refresh_locations.py` — update photos + 2GIS ids.
   Frontend:
   - `lib/media.ts`, `components/LocationImage.tsx`, `components/TwoGisButton.tsx`.
   - `pages/UserProfilePage.tsx`, route `/users/:id` in `App.tsx`.
   - `VibeCard.tsx`, `BeaconDetailPage.tsx`, `BeaconCard.tsx`, `AvatarStack.tsx`.
   - `pages/AuthPage.tsx` — ref-based GIS button mount.
   - `vite.config.ts` — `/downloads_photos` proxy.
   - `frontend/.env.example` — Google client id docs.

4) Run commands
```bash
cd backend/aura_backend
python manage.py migrate
python manage.py refresh_locations   # sync photo_url + two_gis_id from docs/locations.json
python manage.py runserver 8000

cd frontend
npm run dev
```

5) Google OAuth setup (production)
   - Create a Web client in Google Cloud Console.
   - Authorized JavaScript origins: `http://localhost:5173` (and your prod URL).
   - Set the same client id in both places:
     `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend `.env.local`).

6) Verification
   - `python manage.py refresh_locations` — Refreshed 34 locations.
   - `cd frontend && npm run build` — passed.
