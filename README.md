# Aura — Urban Wellness Map & Social Beacon

Find your people. Find your place.

A mobile-first PWA combining a curated Almaty wellness map with time-bound social "Beacons" for spontaneous link-ups.

## Stack

- **Frontend:** React + Vite + Tailwind CSS + Framer Motion + Mapbox GL JS + Zustand
- **Backend:** Django REST Framework + SQLite (dev) / PostgreSQL (prod)

## Quick Start

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd aura_backend
python manage.py migrate
python manage.py seed_venues
python manage.py runserver
```

API runs at `http://127.0.0.1:8000/api/`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Optional: add VITE_MAPBOX_ACCESS_TOKEN for live map tiles
npm run dev
```

App runs at `http://localhost:5173` (proxies `/api` to Django).

## Features (MVP)

- Interactive wellness map with ~40 curated Almaty venues
- Social Beacons (2-hour expiry) with Telegram deep links
- Home feed: Happening Now + Curated venues + Light a Beacon CTA
- Beacon detail with join flow and story card export (html2canvas)
- User profile with stats and beacon history

## Design

See `docs/design.md` for the full UI/UX spec — Morning Light aesthetic, Playfair Display + DM Sans.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/locations/` | List venues (`?category=coffee`) |
| GET | `/api/beacons/` | Active beacons |
| POST | `/api/beacons/` | Create beacon |
| POST | `/api/beacons/:id/join/` | Join beacon |
| GET | `/api/profiles/me/` | Demo profile |

## Maintenance

```bash
python manage.py clean_expired_beacons  # Deactivate expired beacons
```
