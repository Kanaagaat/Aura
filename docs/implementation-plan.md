# Aura MVP — Implementation Plan

Based on `docs/design.md` v2.0.

## Phase 1: Foundation
- [x] Monorepo layout: `frontend/` + `backend/`
- [x] Design tokens (Tailwind @theme — Morning Light palette)
- [x] Django models: Location, Beacon, BeaconJoin, UserProfile
- [x] REST API endpoints + seed command (40 Almaty venues)
- [x] React app shell: routing, Zustand store, API client

## Phase 2: Core Screens
| Screen | Route | Status |
|--------|-------|--------|
| Wellness Map | `/map` | Done |
| Home Feed | `/` | Done |
| Beacon Detail | `/beacon/:id` | Done |
| User Profile | `/profile` | Done |
| Light a Beacon | `/beacon/new` | Done |

## Phase 3: Components
- [x] BeaconCard (countdown, expired state, hover lift)
- [x] AuraButton (pill, scale animation)
- [x] VibeCard, FilterChips, BottomSheet, SidebarNav
- [x] AvatarStack, CountdownTimer

## Phase 4: Integrations
- [x] Mapbox GL JS (grid fallback without token)
- [x] Telegram deep links
- [x] html2canvas story export
- [x] Framer Motion bottom sheet springs

## Phase 5: Polish
- [x] PWA manifest
- [x] `.env.example` + README
- [x] `clean_expired_beacons` management command

## Remaining (post-MVP)
- [ ] Telegram WebApp auth validation
- [ ] Aura Pro billing / featured venue tiers UI
- [ ] Production deploy (Vercel + Railway)
- [ ] Custom Mapbox warm-beige tile style
- [ ] Celery scheduled beacon cleanup
