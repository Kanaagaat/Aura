# Project Brief: Aura — Urban Wellness Map & Social Beacon

## 1. Project Overview
**Product Name:** Aura  
**Tagline:** Find your people. Find your place.  
**Core Concept:** A mobile-first web application (PWA) that combines a curated urban wellness map with a real-time social layer ("Beacons"). It helps mindful urbanites discover high-vibe locations—studios, specialty coffee shops, and spas—and find company for shared activities.

---

## 2. Target Audience & Market
- **Primary Persona:** The "Mindful Urbanite." Values aesthetics, specialty coffee, and holistic wellness. Primarily uses Telegram and Instagram.
- **Location Focus:** Starting with Almaty, Kazakhstan, with a modular architecture for global expansion.
- **Problem:** Existing maps (Google, 2GIS) are cluttered with low-quality listings. Social apps (Instagram) make it hard to coordinate spontaneous meetups at specific venues.

---

## 3. Core Features (MVP Scope)
- **Interactive Wellness Map:** A custom-styled Mapbox GL JS map populated with ~40 hand-picked venues in Almaty. Each venue features a "Vibe Card" with editorial notes and aesthetic tags.
- **Social Beacons (The Link-Up):** A time-bound (2-hour expiry) social post attached to a map location. Users broadcast intent (e.g., "Matcha at Mono @ 10:00") and others can join.
- **In-App Telegram Connect:** Direct deep-linking to Telegram for instant conversation between the beacon organizer and joiners, removing the friction of account creation.
- **Branded Story Generator:** A tool to generate high-aesthetic social media assets for Instagram/Telegram Stories to drive organic viral growth.

---

## 4. Visual Identity & Brand
- **Aesthetic:** "Morning Light" — Warm, airy, organic, and editorial.
- **Reference Style:** Calm app meets Kinfolk Magazine.
- **Primary Palette:** Warm White (#FAFAF7), Sage Green (#7A9E7E), and Dark Near-Black (#1C1C1A) for typography.
- **Typography:** Serif (Playfair Display) for headlines; Sans-serif (DM Sans) for functional UI.

---

## 5. Monetization Model
1. **Tier 1 (Free):** Basic listing for venues.
2. **Tier 2 (Featured Venue):** $49–99/mo for top placement, "Featured" badge, and analytics.
3. **Tier 3 (Aura Pro User):** $4.99/mo for unlimited beacons and custom vibe tags.

---

## 6. Success Metrics (KPIs)
- **Retention:** Weekly Active Users (WAU) returning for the "Today's Beacons" feed.
- **Social Connection:** Number of successful "Link Up" clicks leading to Telegram.
- **Organic Growth:** Volume of Story Cards shared on social platforms.
- **Venue Onboarding:** Conversion of free listings to "Featured" subscriptions.

---

## 7. Technical Stack
- **Frontend:** React + Vite + Tailwind CSS.
- **Backend:** Django REST Framework + PostgreSQL.
- **Authentication:** JWT (via djangorestframework-simplejwt) and Google OAuth 2.0 (via Google Identity Services).
- **Maps:** Mapbox GL JS (Custom Warm-Beige style).
- **Interactions:** Framer Motion for micro-animations.
- **Hosting:** Vercel (Frontend) + Railway (Backend).


## 8. Data Architecture (Core Models)

**Location**
- id, name, category (yoga/coffee/spa/other)
- coordinates (lat, lng)
- vibe_tags: string[]
- editorial_note: text
- photo_url: string
- is_featured: boolean
- tier: free | featured

**Beacon**
- id, location_id (FK), creator_id (FK)
- activity_type: coffee | yoga | walk | study
- message: text (max 100 chars)
- scheduled_at: datetime
- expires_at: datetime (scheduled_at + 2h)
- is_active: boolean (auto-set by Celery or cron)
- join_count: integer

**BeaconJoin**
- id, beacon_id (FK), user_id (FK)
- joined_at: datetime
- telegram_handle: string (for deep link generation)

**UserProfile**
- id, telegram_id (optional), display_name
- bio: text
- beacons_lit: integer (computed)
- saved_locations: M2M → Location
- avatar_url: string

**StoryCard** (ephemeral, no persistence needed)
- Generated client-side via html2canvas
- No backend model required


# Aura UI/UX Specification & Technical Handoff Document
**Version:** 2.0 (Dual-Mode Edition)
**Product:** Aura — Urban Wellness Map & Social Beacon PWA
**Target Audience:** Urban wellness enthusiasts, mindful urbanites, specialty coffee lovers.




---

## 1. DESIGN SYSTEM ARCHITECTURE

### A. Color Palette (Design Tokens)
Aura uses two distinct theme modes. The Light Mode ("Morning Light") is the primary aesthetic for the Almaty MVP.

#### Light Mode (Primary)
- **Background:** `#FAFAF7` (Warm White)
- **Surface:** `#FFFFFF`
- **Primary Text:** `#1C1C1A` (Near Black, warm undertone)
- **Secondary Text:** `#8A8880`
- **Primary Accent (Sage):** `#7A9E7E`
- **Secondary Accent (Rose):** `#C4978A`
- **Tertiary Accent (Amber):** `#D4A96A`
- **Border:** `#EEECE8`
- **Shadow:** `0 2px 16px rgba(0,0,0,0.06)`

#### Dark Mode (Legacy/Alternative)
- **Surface:** `#131313`
- **Surface Bright:** `#3A3939`
- **Primary:** `#769471` (Wellness Green)
- **On-Surface:** `#E1E3DF`
- **Outline:** `#8B9389`

### B. Typography System
- **Serif (Editorial/Display):** *Playfair Display* (Light 300, Regular 400). Used for H1, H2, Venue Names, User Names.
- **Sans-Serif (Functional/UI):** *DM Sans* or *Inter* (Regular 400, Medium 500). Used for Body, Labels, Navigation, Buttons.
- **Type Scale:**
  - **Display:** 42px / 1.2 line-height (Playfair)
  - **Headline Lg:** 32px / 1.2 line-height (Playfair)
  - **Headline Md:** 24px / 1.3 line-height (Playfair)
  - **Label Md:** 14px / 1.4 line-height / 0.04em spacing (DM Sans Medium)
  - **Body Md:** 15px / 1.5 line-height (DM Sans Regular)

### C. Layout & Spacing
- **Grid:** 12-column desktop (1280px+), 4-column mobile (390px).
- **Margins:** 24px mobile, 48px-64px desktop.
- **Border Radius:**
  - **Pills/Tags:** 100px
  - **Modals/Sheets:** 28px
  - **Cards:** 20px
  - **Inputs:** 14px

---

## 2. SCREEN SPECIFICATIONS

### Screen 1: Interactive Wellness Map (Core)
- **Purpose:** Discovery and spatial awareness of wellness hubs.
- **Layout:** Full-bleed map (Mapbox custom warm-beige style).
- **Floating UI:** 
  - **Top:** Search bar (pill shape) + Horizontal Filter Chips ("All", "Yoga", "Coffee").
  - **Bottom:** Collapsible bottom sheet (Mobile) / Persistent sidebar (Desktop).
- **Interactions:** Tapping a pin centers the map and expands the Vibe Card preview.

### Screen 2: Home Feed (Discovery)
- **Purpose:** Editorial-style "Morning Newspaper" for today's events.
- **Structure:**
  - **Section 1 (Happening Now):** Horizontal scroll of active Beacon Cards.
  - **Section 2 (Curated for Today):** Vertical list of venue recommendations.
  - **Section 3 (CTA):** Large amber-tinted card for lighting a new beacon.

### Screen 3: Beacon Detail (Event Page)
- **Purpose:** Conversion to social action (Telegram connect).
- **Components:**
  - Hero image of venue.
  - "Who's Coming" avatar stack.
  - "Link Up on Telegram" Primary CTA (Blue/Black pill).
  - Mini-map showing exact pin location.

### Screen 4: User Profile (Public & Private)
- **Purpose:** Social proof and personal history.
- **Public Stats:** Beacons Lit, People Met, Places Visited.
- **Social Links:** Direct buttons for Telegram and Instagram.
- **Feed:** Toggle between "Active Beacons" and "Past Beacons".

---

## 3. COMPONENT INVENTORY

### Beacon Card
- **States:** Default, Hover (lifts 2px, shadow deepens), Expired (grayscale overlay).
- **Logic:** Must show countdown timer if expiring within 1 hour.

### Aura Button (Primary)
- **Style:** Pill-shaped, `#1C1C1A` bg, white text.
- **Animation:** Scale 0.98 on click.

---

## 4. DESIGN TOKENS (JSON)
```json
{
  "colors": {
    "primary": "#7A9E7E",
    "background": "#FAFAF7",
    "surface": "#FFFFFF",
    "text": {
      "main": "#1C1C1A",
      "muted": "#8A8880"
    },
    "accents": {
      "rose": "#C4978A",
      "amber": "#D4A96A"
    }
  },
  "spacing": {
    "unit": 4,
    "container": 24,
    "gutter": 16
  },
  "borderRadius": {
    "card": 20,
    "modal": 28,
    "pill": 100
  }
}
```

---

## 5. USER FLOWS
1. **The Link-Up:** Map -> Tap Pin -> View Beacon Detail -> Tap "Link Up" -> Deep link to Telegram.
2. **Light a Beacon:** Home -> Tap "Light it" -> Search Venue -> Select Vibe -> Set Time -> Confirm -> Share to Stories.
3. **Authentication:** Map/Feed -> Trigger protected action (e.g. drop/join beacon) -> Redirect to /auth page -> Sign up/in via email/password or Google Login -> Success -> Return to target view.

---

## 6. FRONTEND IMPLEMENTATION NOTES
- **State Management:** Use Zustand for map filters and active session data (including JWT auth state: access_token, user_profile).
- **Animations:** Framer Motion for bottom sheet transitions (spring: { damping: 20, stiffness: 300 }).
- **Map:** Mapbox GL JS with custom tile JSON for beige/warm wellness styling.
- **Share Feature:** html2canvas for serverless story card generation.
- **Auth Pipeline:** Axio/Fetch requests intercept 401 Unauthorized responses to attempt token refresh via `/api/auth/token/refresh/` endpoint, falling back to login screen on failure.



