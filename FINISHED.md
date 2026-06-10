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
