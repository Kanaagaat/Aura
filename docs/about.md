# Aura — Project Blueprint v2

> **Changelog from v1** — every section with a `🔧` marker was changed. Summary at the bottom.

---

## 🗺️ Project Overview

**Aura** is a mobile web-application (PWA) at the intersection of an interactive map and a lightweight social layer, built for urban wellness communities. It serves as a curated city guide and a real-time tool for finding company for joint workouts, matcha runs, and mindful hangouts.

**Starting city: Almaty. Target: any city with an active wellness scene.** 🔧

The MVP is ruthlessly scoped. Complex features — booking engines, native payments, internal messaging — are cut. The core product delivers three things exceptionally well.

---

## ✨ Core Features (Final MVP Scope)

### 1. Interactive Wellness Map (Aura Map)
A **Leaflet.js** interactive map (free, no API key) with **CartoDB Light tiles** — warm beige tones that match Aura's aesthetic. Populated with **30–40 hand-picked, photogenic locations** in Almaty — pilates and yoga studios, specialty coffee shops, spa zones. No noise. No auto-repair shops.

Every location has a **Vibe Card**: aesthetic tags (`#SoftLight`, `#LaptopFriendly`, `#NoLaptops`, `#MorningVibes`), a quality photo, hours, and a short editorial note.

### 2. Social Beacons (The Link-Up)
Users "light a beacon" over any map location in two taps — a public meetup post: *"Heading to yoga Saturday 11:00, matcha after. Who's in?"*

Beacons are time-bound: they auto-expire 2 hours after the event time. This creates **daily fresh content** and a reason to return. 🔧

### 3. In-App Connect via Telegram 🔧
~~Instagram redirect~~ → **Telegram deep link**. When a user taps "Link Up" on someone's beacon, they are sent directly into a Telegram conversation with the organizer — with a pre-filled opening message. No account required beyond Telegram (which 95% of the target audience already has). Users stay in the Aura flow; the redirect is invisible.

> **Why not Instagram?** Instagram redirect loses the user permanently — they leave Aura and never come back. Telegram redirect keeps the interaction traceable, feels native to the CIS market, and the user returns to the map afterwards.

### 4. Viral Story Cards (Share to Stories)
A frontend-only feature using `html2canvas` that generates a branded, downloadable meetup card — ready to post to Instagram or Telegram Stories. Organic zero-cost distribution. No backend required.

---

## 💰 Monetization 🔧

v1 had "B2B integrations" as a vague future plan. v2 has a concrete three-tier model:

| Tier | Who | What they get | Price |
|---|---|---|---|
| **Free listing** | Any venue | Pin on the map, Vibe Card, users can drop beacons | $0 |
| **Featured venue** ⭐ | Premium cafes, studios | Top placement in search, "Featured" badge, weekly push in beacon feed, analytics dashboard | **$49–99/mo** |
| **Aura Pro** (user) | Power users | Unlimited beacons (free = 3/week), beacon analytics, custom vibe tags | **$4.99/mo** |

**Demo-day pitch:** "We already have one venue signed up at $49/month. That's $588 ARR from a single email." Go get one local coffee shop to agree before demo day — even informally. One real commitment beats ten slides.

---

## 🔁 Retention Mechanics 🔧

v1 had no answer to "why come back tomorrow?" v2 fixes this:

- **Beacon expiry** — beacons die after the event. The map is always fresh.
- **"What's happening today"** — a home screen feed of beacons happening in the next 24h. Opens like a morning newspaper.
- **Weekly Featured Beacon** — every Monday, one beacon from the previous week (most joined) gets highlighted. Social proof loop.
- **Venue-driven content** — Featured venues can post "Today's special" as a beacon themselves (e.g., *"Free matcha tasting at our studio, 14:00–16:00"*). Venues become content creators, not just listings.

---

## 🌍 Global Angle 🔧

v1 positioned Aura as "an app for Almaty." That kills the pitch for an incubator asking for global potential.

**Reframe:** Aura is a **city wellness layer** — a protocol for any city with an active wellness and specialty coffee culture. Almaty is city #1 because we know it, we're in it, and we can get 100 real users there in 6 weeks. Cities #2 and #3 are Istanbul, Dubai, or any Central Asian capital with the same demographic.

The product has zero city-specific code. Adding a new city = seeding 30–40 locations in the admin panel. That's an afternoon of work per city.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | Django REST Framework + PostgreSQL | Fast admin panel to seed locations, solid auth, proven at scale |
| Frontend | React + Vite + Tailwind CSS | Mobile-first, deploys to Vercel in seconds, no App Store wait |
| Maps | **Leaflet.js + react-leaflet + CartoDB tiles** 🔧 | Fully free, open source, no API key. CartoDB Light tiles give warm beige aesthetic matching Aura's visual identity. CartoDB Dark available for dark mode variant. |
| Story export | html2canvas | Client-side only, no backend cost |
| Connect | Telegram deep links | Zero infrastructure, universally installed in target market |
| Hosting | Vercel (frontend) + Railway or Render (Django) | Free tiers cover MVP load |

---

## 🗓️ 6-Week Sprint Plan

| Week | Focus |
|---|---|
| 1 | Repo setup, Django models (`Location`, `Beacon`, `UserProfile`), seed 15 locations in admin |
| 2 | Leaflet.js + react-leaflet integration, CartoDB tile style, location pins + Vibe Cards |
| 3 | Beacon logic — create, display on map, auto-expiry, "today's feed" home screen |
| 4 | Telegram deep-link connect flow, html2canvas Story Card generator |
| 5 | Testing, UI polish, Framer Motion micro-animations, Featured venue dashboard (basic) |
| 6 | Production deploy, onboard 1 paying venue, recruit first 100 users, build demo-day QR flow |

---

## 🏁 Demo Day

No slide deck. The jury scans a QR code.

They land on a live warm-toned map of Almaty. They see real beacons from real people planning real meetups. They tap one, get sent to Telegram. They drop their own beacon in 10 seconds. One venue has a ⭐ Featured badge and is paying $49/month.

**The pitch in one sentence:** *"We are the wellness layer for cities — starting Almaty, expanding wherever people care about their health and where they spend their time."*

---

## 📋 Changelog from v1

| # | Section | What changed | Why |
|---|---|---|---|
| 1 | **Overview** | Added "Starting city: Almaty. Target: any city." | Reframes from local app to global product |
| 2 | **Connect flow** | Replaced Instagram redirect with Telegram deep link | Instagram kicks users out of the product permanently |
| 3 | **Monetization** | Replaced vague "B2B integrations" with three concrete tiers + pricing | Jury needs to see a business model, not a hope |
| 4 | **Retention** | Added beacon expiry, daily feed, weekly featured beacon, venue-as-creator | v1 had no answer to why users return |
| 5 | **Global angle** | New section explaining city expansion model | nfactorial requires global market thinking |
| 6 | **Tech stack** | Replaced Mapbox GL JS with Leaflet.js + react-leaflet + CartoDB tiles | Mapbox requires paid API key — Leaflet is fully free with equally good aesthetics via CartoDB |
| 7 | **Sprint plan** | Added specific Django models and milestones per week | v1 was vague; v2 is executable |