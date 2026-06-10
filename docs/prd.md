# Product Requirements Document (PRD) — Aura MVP

**Project Name:** Aura  
**Version:** 2.0 (MVP Scope)  
**Author:** Antigravity  
**Date:** June 9, 2026  
**Status:** Draft  

---

## 1. User Personas

### 1.1 Sofia (24) — The Wellness Enthusiast (Consumer)
* **Background**: Pilates practitioner, works remotely, active on Instagram, loves specialty coffee.
* **Goals**: Wants to find a workout buddy for weekend reformer classes and share a matcha after.
* **Pain Points**: Hard to coordinate meetups with friends who have different schedules. She dislikes dating apps for finding friends and finds Telegram groups too chaotic.

### 1.2 Mark (28) — The Expat/Newcomer (Consumer)
* **Background**: Software engineer, recently moved to Almaty, values active lifestyle and networking.
* **Goals**: Wants to integrate quickly into the local wellness community and explore the best specialty spots.
* **Pain Points**: Doesn't know which venues are actually good (wants to avoid tourist traps and loud/cramped spots). Has no local friends to join him on runs.

### 1.3 Aidar (32) — The Specialty Café Owner (B2B Partner)
* **Background**: Manages a photogenic specialty coffee shop and clean-eating café.
* **Goals**: Attract high-spending, aesthetic-oriented customers during off-peak morning and afternoon hours.
* **Pain Points**: Saturated Instagram ads have poor conversion. Local food discovery maps (like 2GIS) don't highlight the "vibe" or premium aspect of his venue.

---

## 2. Product Features & User Flows

```
+-----------------------------------------------------------+
|                        USER FLOWS                         |
+-----------------------------------------------------------+
|                                                           |
| 1. Explore Map / Feed  --> View Location Vibe Card        |
|                                                           |
| 2. Choose Location    --> Drop Beacon (Set time/note)     |
|                                                           |
| 3. View Someone's      --> Tap "Link Up" -> Telegram App  |
|    Beacon                                                 |
|                                                           |
| 4. Share meetup       --> Download Branded Story Card     |
|                                                           |
+-----------------------------------------------------------+
```

### 2.1 Feature 1: Interactive Wellness Map (Aura Map)
The primary interface is a custom-styled, dark-theme Mapbox GL JS map populated with a curated selection of 30–40 high-quality locations in Almaty.
* **Venue Types**: Pilates/Yoga/Fitness studios, Specialty cafes, Organic/Juice bars, Spa/Sauna wellness zones.
* **Map Pins**: Pins differ by category. Featured venues have a gold, pulsating pin. Active beacons on a venue show a glowing outline or count badge.
* **Vibe Cards**: Clicking a pin opens a glassmorphic sheet from the bottom:
  * High-quality venue image.
  * Editorial snippet (1–2 sentences summarizing the "vibe").
  * Aesthetic Vibe Tags (e.g., `#SoftLight`, `#LaptopFriendly`, `#NoLaptops`, `#MorningVibes`).
  * Operating hours and address.
  * Button to **"Drop a Beacon Here"**.
  * List of active beacons currently scheduled at this venue.

### 2.2 Feature 2: Social Beacons (The Link-Up)
A simple, temporary meetup coordinator.
* **Creation Flow**:
  1. User clicks "Drop a Beacon" on a venue's Vibe Card.
  2. Form overlay opens asking for:
     * Event Type (e.g., Run, Coffee, Yoga, Spa).
     * Date & Time (restricted to the next 24 hours).
     * Short Message (max 100 characters, e.g., *"Going to reformer class at 11, matcha after! Who is in?"*).
     * Telegram username (saved to user profile).
  3. User clicks "Light Beacon".
* **Beacon Rules**:
  * Beacons are tied to a specific location.
  * Beacons are visible in the "What's Happening Today" home screen feed and directly on the Map as active pins.
  * **Auto-expiry**: Beacons automatically become inactive and disappear from public view 2 hours after their scheduled event time.

### 2.3 Feature 3: In-App Connect via Telegram
Seamless transition from browsing to coordinating.
* **Flow**:
  1. A user views an active beacon and taps the **"Link Up"** button.
  2. The application opens a new tab with a Telegram deep link:  
     `https://t.me/<organizer_username>?text=Hi!%20I%20saw%20your%20Aura%20beacon%20for%20[Venue]%20at%20[Time].%20Mind%20if%20I%20join?`
  3. The user communicates directly with the organizer in Telegram.
  4. When the user returns to the browser, they are back on the Aura Map.

### 2.4 Feature 4: Story Card Generator
A visual sharing utility to drive viral loop growth.
* **Flow**:
  1. After lighting a beacon, the user is presented with a success screen containing a "Share to Stories" button.
  2. The frontend uses `html2canvas` to render a styled layout off-screen.
     * Elements: Aura logo, location photo (blurred background), venue name, beacon description, time/date, and a QR code pointing to the app.
  3. The rendered image is downloaded to the user's mobile device or copied to the clipboard.
  4. The user posts the card to their Instagram/Telegram Stories, prompting their friends to scan the QR code to join.

### 2.5 Feature 5: Authentication (JWT & Google OAuth 2.0)
Secure, token-based session management.
* **Registration & Login Flows**:
  * **Email/Password Credentials**: Users can sign up with their email, username, password, display name, and optional Telegram handle. Users can log in with their email/username and password.
  * **Google OAuth 2.0 Social Auth**: A "Sign In with Google" button is integrated. Upon approval, Google returns a credential token (ID token) to the client, which is verified on the backend.
  * **JWT Lifecycle**: Successful login returns an Access Token and Refresh Token. The client attaches the Access Token to subsequent backend requests.
* **Authorization Levels**:
  * **Guest Users (Anonymous)**: Can browse the Map, view locations, click Vibe Cards, and read the active meetups feed.
  * **Authenticated Users**: Can create beacons, join beacons, and manage their personal profile. When a guest attempts a protected action, they are redirected to `/auth` with a redirect query parameter to return to their destination after authenticating.

---

## 3. UI/UX Design System Guidelines

Aura must look like a premium, high-aesthetic web product.
* **Color Palette**: Ultra-dark theme. Deep greys and blacks (`#0B0D17`, `#161925`), glowing neon accents (mint green `#A7F3D0` or warm peach `#FFD6B9`), and frosted glass elements.
* **Typography**: Modern, readable sans-serif font (e.g., *Outfit* or *Inter* from Google Fonts).
* **Glassmorphism**: Headers, cards, and modal sheets must use:
  ```css
  background: rgba(22, 25, 37, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  ```
* **Micro-animations**: Tap states must have subtle shrink transitions. Dialogs must scale up from 95% opacity using smooth timing.

---

## 4. Scope and Exclusions (Out of Scope for MVP)

To ensure launch speed, the following features are strictly excluded from the MVP:
* **Internal Chat**: Excluded. Handled entirely via Telegram deep linking.
* **Booking Engine / Scheduling API**: Excluded. Aura does not reserve spots at studios or coffee tables.
* **In-app Payments**: Excluded. Subscriptions are checked manually or simulated in the first version, or handled externally.
* **User Reviews & Ratings**: Excluded. Aura is a curated directory, not an open review platform like Yelp.
* **Multi-City Database Automatic Routing**: Excluded. The MVP will default to Almaty coordinates; coordinates for other cities will be loaded statically based on query parameters or toggles.

---

## 5. Edge Cases & Error Handling

| Case | Scenario | UI/UX Handling |
|---|---|---|
| **No Geolocation Permission** | User blocks location access on browser. | Map defaults to central Almaty (`43.2389, 76.8897`). An unobtrusive banner suggests enabling GPS for a better experience. |
| **Invalid Telegram Username** | User enters username with `@` or invalid characters. | Form validation strips the `@` symbol and verifies username structure before saving profile. |
| **Telegram App Not Installed** | User taps "Link Up" on a device without Telegram. | Browser opens the Telegram Web URL interface (`https://web.telegram.org`) as a fallback. |
| **Multiple Beacons at One Spot** | 5 users drop beacons at the same coffee shop. | The Vibe Card displays a scrolling accordion or list of all active meetups under that location. |
| **User Drops >3 Beacons** | Free user tries to drop a 4th beacon in a week. | A popup suggests upgrading to **Aura Pro** with an option to see details of the subscription tiers. |
| **Google Sign-In Canceled / Fails** | User closes Google authentication popup before completion. | Show a gentle, user-friendly toast/alert: *"Google authentication was canceled. Please try again or use email sign-in."* |
| **Auth Token Expiration** | The JWT access token expires during an active session. | The frontend client automatically calls the token refresh endpoint. If refresh token is also expired, the session is cleared and the user is redirected to `/auth` with a toast message. |
| **Email Already Registered** | User tries to sign up with an existing email address. | Standard form error highlights the email field: *"This email is already registered. Did you mean to log in?"* |

