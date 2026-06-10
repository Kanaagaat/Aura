You are a senior full-stack engineer continuing development of "Aura" — 
a mobile-first PWA for urban wellness communities. The project is already 
partially built. Read the CURRENT STATE section carefully before writing 
any code — do not regenerate what already exists.

═══════════════════════════════════════════════
TECH STACK
═══════════════════════════════════════════════

Backend:  Python 3.11 · Django 5.x · DRF · PostgreSQL · pgvector
Frontend: React 18 · Vite · TypeScript · Tailwind CSS · Leaflet.js · react-leaflet · Framer Motion
AI:       Anthropic claude-haiku-4-5-20251001 · OpenAI text-embedding-3-small
Hosting:  Vercel (frontend) · Railway (backend)
No Celery. No Redis. Async tasks via Django management commands + cron.

Map library: Leaflet.js + react-leaflet (NOT Mapbox — no API key needed)
Map tiles:   CartoDB Light (warm beige, free, no key)
             URL: https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
             Attribution: &copy; OpenStreetMap contributors &copy; CARTO
Almaty center: [43.238949, 76.889709], default zoom: 13

Install: npm install leaflet react-leaflet && npm install -D @types/leaflet
CSS:     import 'leaflet/dist/leaflet.css' in main.tsx

Repo layout:
  /backend/aura_backend/   → Django project
  /frontend/src/           → React + Vite + TypeScript
  /docs/locations.json     → 34 curated Almaty venues (source of truth)
  /downloads_photos/       → local venue photos served in DEBUG

═══════════════════════════════════════════════
CURRENT STATE — ALREADY BUILT (do not rewrite)
═══════════════════════════════════════════════

✅ Django project structure + PostgreSQL connected
✅ Location model + seed_venues management command
   - Reads from docs/locations.json (34 locations: 10 coffee, 10 yoga, 10 spa, 4 other)
   - Auto-syncs to DB on first GET /api/locations/?city=Almaty if table is empty
   - Photos matched by 2gis_id or normalized name → /downloads_photos/<file>
✅ Static serving of /downloads_photos/ in DEBUG via urls.py
✅ React + Vite frontend bootstrapped
✅ React Router with catch-all redirect to / for unknown paths
⚠️  AuthPage.tsx exists but has TypeScript error:
    window.google used without type declaration
    FIX: add at top of AuthPage.tsx →
    declare global { interface Window { google: any } }
⚠️  Map renders but location pins not yet connected to API data

═══════════════════════════════════════════════
DATA MODELS (source of truth)
═══════════════════════════════════════════════

# Already exists — do not regenerate migrations for these

class Location(models.Model):
    name        = models.CharField(max_length=120)
    category    = models.CharField(max_length=20)   # yoga|coffee|spa|other
    lat         = models.DecimalField(max_digits=9, decimal_places=6)
    lng         = models.DecimalField(max_digits=9, decimal_places=6)
    vibe_tags   = models.JSONField(default=list)
    editorial   = models.TextField(blank=True)
    photo_url   = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    hours       = models.CharField(max_length=80, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

# Add these next — generate migrations for them

class UserProfile(models.Model):
    user            = models.OneToOneField(User, on_delete=models.CASCADE)
    display_name    = models.CharField(max_length=80)
    bio             = models.TextField(max_length=160, blank=True)
    avatar_url      = models.URLField(blank=True)
    telegram_handle = models.CharField(max_length=64, blank=True)
    interests       = models.JSONField(default=list)
    self_words      = models.JSONField(default=list)   # max 3 items
    preferred_time  = models.CharField(max_length=30)  # mornings|afternoons|evenings|flexible
    embedding       = VectorField(dimensions=1536, null=True, blank=True)
    saved_locations = models.ManyToManyField('Location', blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

class Beacon(models.Model):
    ACTIVITY = [('coffee','Coffee'),('yoga','Yoga'),('walk','Walk'),('study','Study')]
    location      = models.ForeignKey(Location, on_delete=models.CASCADE)
    creator       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='beacons')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY)
    message       = models.CharField(max_length=100)
    scheduled_at  = models.DateTimeField()
    expires_at    = models.DateTimeField()   # always = scheduled_at + 2 hours
    is_active     = models.BooleanField(default=True)
    join_count    = models.PositiveIntegerField(default=0)
    created_at    = models.DateTimeField(auto_now_add=True)

class BeaconJoin(models.Model):
    beacon          = models.ForeignKey(Beacon, on_delete=models.CASCADE, related_name='joins')
    user            = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at       = models.DateTimeField(auto_now_add=True)
    telegram_handle = models.CharField(max_length=64, blank=True)
    class Meta:
        unique_together = ('beacon', 'user')

═══════════════════════════════════════════════
LEAFLET IMPLEMENTATION RULES
═══════════════════════════════════════════════

Always use react-leaflet components — never raw Leaflet imperative API inside React.

Base map setup:
  import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
  import 'leaflet/dist/leaflet.css'

  const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
  const ALMATY: [number, number] = [43.238949, 76.889709]

Fix Leaflet default icon (required — icons break without this):
  import L from 'leaflet'
  import markerIcon from 'leaflet/dist/images/marker-icon.png'
  import markerShadow from 'leaflet/dist/images/marker-shadow.png'
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow })

Custom pill marker for venues:
  const createVenueIcon = (emoji: string, name: string) =>
    L.divIcon({
      html: `<div style="
        background: white;
        border-radius: 100px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        border: 0.5px solid rgba(0,0,0,0.08);
      ">${emoji} ${name}</div>`,
      className: '',
      iconAnchor: [0, 0],
    })

Category emoji map:
  const EMOJI: Record<string, string> = {
    coffee: '☕', yoga: '🧘', spa: '✨', other: '📍'
  }

Beacon pulse marker (active beacon on a location):
  Use a CSS animation ring via divIcon — warm amber glow, 1.5s pulse loop.

MapContainer must have explicit height:
  <MapContainer style={{ width: '100%', height: '100%' }} ...>
  Parent div must also have a fixed height (e.g. h-screen or h-[calc(100vh-64px)])

═══════════════════════════════════════════════
IMMEDIATE NEXT TASKS (priority order)
═══════════════════════════════════════════════

TASK 1 — Fix TypeScript error in AuthPage.tsx
File: frontend/src/pages/AuthPage.tsx
Add at top: declare global { interface Window { google: any } }
This unblocks the frontend build.

TASK 2 — Connect map pins to real API data
File: frontend/src/hooks/useLocations.ts (create)
- Fetch GET /api/v1/locations/ on mount with axios
- Return { locations, loading, error }

File: frontend/src/components/AuraMap.tsx (create or update)
- MapContainer with CartoDB Light tiles
- Render pill-shaped custom markers per location (emoji + short name)
- On marker click: open VibeCard bottom sheet (pass location id via state)
- Fix Leaflet default icon at module level

TASK 3 — VibeCard bottom sheet component
File: frontend/src/components/VibeCard.tsx (create)
- Slides up from bottom on mobile (Framer Motion: y: '100%' → y: 0)
- Becomes right panel on desktop (≥768px): fixed right side, full height
- Shows: photo (w-full rounded-t-2xl), location name (font-serif text-2xl),
  vibe_tags as soft pills (#F0EDE8 bg), editorial text, hours,
  "Light a Beacon" CTA button (full width, dark pill)
- Close on backdrop tap or swipe down

TASK 4 — Beacon backend (new Django app)
Files to create:
  backend/aura_backend/beacons/__init__.py
  backend/aura_backend/beacons/models.py
  backend/aura_backend/beacons/serializers.py
  backend/aura_backend/beacons/views.py
  backend/aura_backend/beacons/urls.py
  backend/aura_backend/beacons/services.py
  backend/aura_backend/beacons/management/commands/deactivate_expired_beacons.py

- Auto-set expires_at = scheduled_at + timedelta(hours=2) in service
- Management command sets is_active=False where expires_at < now()
- Endpoints:
  GET  /api/v1/beacons/?location_id=&active=true
  POST /api/v1/beacons/
  POST /api/v1/beacons/<id>/join/

TASK 5 — Beacon creation UI
File: frontend/src/components/BeaconCreate.tsx (create)
- Modal that slides up over map (Framer Motion)
- 4 activity tiles (2×2 grid): ☕ Coffee 🧘 Yoga 🚶 Walk 📖 Study
- Time picker: horizontal scroll of time slots (08:00 … 22:00)
- Message textarea (max 100 chars) with char counter
- "Light it 🌿" submit button
- On success: close modal, show pulse animation on map marker

═══════════════════════════════════════════════
UPCOMING TASKS (weeks 4–6, do not build yet)
═══════════════════════════════════════════════

Week 4:
- Telegram deep-link: tg://resolve?domain=<handle>&text=<prefilled>
- Story card generator via html2canvas

Week 5 — AI features:
- Compatibility score: embeddings (OpenAI text-embedding-3-small) +
  cosine similarity (numpy) + explanation (Claude Haiku)
- Vibe curator: free-text mood → Claude Haiku → ranked location_ids
- Smart beacon text: location + activity + user profile → Claude Haiku → suggested message

Week 6:
- User onboarding flow (interests picker, self_words, preferred_time)
- Featured venue dashboard (basic analytics)
- Demo day QR flow + production deploy on Vercel + Railway

═══════════════════════════════════════════════
API CONVENTIONS
═══════════════════════════════════════════════

Base URL: /api/v1/
Auth: JWT via djangorestframework-simplejwt
  POST /api/v1/auth/register/
  POST /api/v1/auth/login/
  POST /api/v1/auth/token/refresh/

Response format:
  Success: { "data": {...}, "error": null }
  Error:   { "data": null, "error": { "code": "...", "message": "..." } }

Existing endpoints (do not recreate):
  GET /api/v1/locations/       → list all locations
  GET /api/v1/locations/<id>/  → single location detail

Endpoints to build:
  GET  /api/v1/users/me/
  PUT  /api/v1/users/me/
  GET  /api/v1/beacons/
  POST /api/v1/beacons/
  POST /api/v1/beacons/<id>/join/
  GET  /api/v1/ai/compatibility/?beacon_id=<id>
  POST /api/v1/ai/vibe-search/
  GET  /api/v1/ai/beacon-suggest/?location_id=<id>&activity=<type>

Frontend API client:
  File: frontend/src/api/client.ts
  - axios instance, baseURL from import.meta.env.VITE_API_URL
  - JWT interceptor: attach Authorization: Bearer <token> from localStorage
  - 401 interceptor: redirect to /auth

═══════════════════════════════════════════════
CODE RULES
═══════════════════════════════════════════════

Python:
- Type hints on all function signatures
- Business logic in services.py, never in views.py
- Views are thin: validate → call service → return response
- select_related / prefetch_related to avoid N+1 queries
- All AI calls wrapped in try/except with graceful fallback
- Never expose raw exceptions to the API response

TypeScript / React:
- Functional components + hooks only, no class components
- All API calls via src/api/client.ts only
- Tailwind only — no inline styles, no CSS modules
- Framer Motion for all transitions (modal slide-up, card expand, beacon pulse)
- Map logic isolated in src/hooks/useLocations.ts and src/components/AuraMap.tsx
- Never use raw Leaflet imperative API inside React components

Environment variables:
  Backend:  OPENAI_API_KEY, ANTHROPIC_API_KEY, DATABASE_URL, SECRET_KEY, DEBUG
  Frontend: VITE_API_URL (e.g. http://localhost:8000)
  Never hardcode these — always use os.environ / settings / import.meta.env

═══════════════════════════════════════════════
TASK FORMAT
═══════════════════════════════════════════════

Give tasks as:
  [FIX]      → fix a specific bug
  [BACKEND]  → Django: models / serializers / views / services
  [FRONTEND] → React component or hook
  [AI]       → AI feature: prompt + service + endpoint
  [FULL]     → complete feature: backend + frontend

For every task response:
  1. List files to create or modify
  2. Full implementation for each file (no placeholders, no "# TODO")
  3. Migration commands if models changed
  4. pip / npm install commands if new packages needed
  5. Start each file with its path: # backend/path/file.py or // frontend/src/path/file.tsx