# Development Workflow & Sprint Plan — Aura MVP

**Project Name:** Aura  
**Version:** 2.0 (MVP Scope)  
**Author:** Antigravity  
**Date:** June 9, 2026  
**Status:** Draft  

---

## 1. 6-Week Sprint Breakdown

The MVP is developed over 6 weeks. Every week ends with a deployable artifact to verify functionality.

```
+-----------------------------------------------------------+
|                        SPRINT PLAN                        |
+-----------------------------------------------------------+
| Week 1: Backend Setup, Schema, Seeds (DRF + Postgres)     |
| Week 2: Mapbox GL JS, Pins, Vibe Card Sheets (React)      |
| Week 3: Beacon Creation, Today's Feed, Expiry Cron        |
| Week 4: Telegram Deep Links, html2canvas Sharing          |
| Week 5: Polish, Glassmorphic UI, Framer Motion, Analytics |
| Week 6: Production Launch, Venue Onboarding, Demo Prep    |
+-----------------------------------------------------------+
```

### Week 1: Repo Setup & Backend Foundation
* **Objective**: Define data schemas, verify local environment connection, compile seed data.
* **Daily Workflow**:
  * *Mon*: Initialize Django REST Framework project, configure CORS settings, hook up to PostgreSQL database.
  * *Tue*: Implement `UserProfile` and `Location` models. Create basic admin panel configuration.
  * *Wed*: Write a Python seed script (`seed_locations.py`) containing 30–40 hand-picked premium Almaty wellness spots (e.g., *Sora Studio*, *Sensera*, *Bowler Coffee*, *Café Central*).
  * *Thu*: Deploy Django backend to Railway or Render. Verify API response output in production.
  * *Fri*: Run automated tests for Django models and API routing.
  * *Sat/Sun*: Weekly checkpoint review.

### Week 2: Frontend & Mapbox Integration
* **Objective**: Create PWA boilerplate, style dark glassmorphism system, display locations dynamically on Mapbox.
* **Daily Workflow**:
  * *Mon*: Initialize React + Vite + Tailwind CSS project. Configure PWA metadata and service worker setup.
  * *Tue*: Setup Tailwind configuration with customized HSL dark color variables and glassmorphic utility classes.
  * *Wed*: Initialize Mapbox GL JS component. Adjust camera angle, bounding box constraints, and load custom styled tileset.
  * *Thu*: Fetch locations from DRF API, parse coordinates, and render custom visual category markers on the map.
  * *Fri*: Build the animated sliding Vibe Card details sheet (bottom-sheet responsive drawer) that triggers when a location marker is clicked.
  * *Sat/Sun*: Verification on iOS Safari and Android Chrome browsers.

### Week 3: Meetup Beacons Logic
* **Objective**: Build beacon creation engine, render beacon states on map, configure background expiry.
* **Daily Workflow**:
  * *Mon*: Create "Light a Beacon" form page/modal on frontend. Validate inputs (character count limits, dates restricted to 24 hours).
  * *Tue*: Build DRF endpoints `GET /api/beacons/` and `POST /api/beacons/`. Write validation middlewares (e.g., prevent user from creating duplicate active meetups).
  * *Wed*: Link frontend form to backend. Update Mapbox pin styles to visually highlight venues that have active beacons.
  * *Thu*: Build the "What's Happening Today" home screen feed sorting active meetups chronologically.
  * *Fri*: Write the Django management command `clean_expired_beacons` to purge meetups older than their execution time + 2 hours. Set up a cron task.
  * *Sat/Sun*: End-to-end integration test of beacon drop -> display -> auto-archive.

### Week 4: Telegram Connect & Stories Generator
* **Objective**: Establish external communication loops and viral image download utilities.
* **Daily Workflow**:
  * *Mon*: Integrate Telegram deep link constructor (`t.me/<username>?text=<pre-filled-template>`).
  * *Tue*: Test deep link actions on mobile devices (ensuring it launches native Telegram app instead of standard web-views).
  * *Wed*: Setup html2canvas offscreen template container.
  * *Thu*: Code the download execution script to generate clean, high-resolution story image cards.
  * *Fri*: Add a QR-code generator component to the story card layout so scan viewers can open Aura directly.
  * *Sat/Sun*: User acceptance testing on mobile layouts.

### Week 5: UI Polish & Premium Features
* **Objective**: Implement micro-animations, design the premium venue preview metrics screen, fix browser bugs.
* **Daily Workflow**:
  * *Mon*: Integrate Framer Motion for bottom drawer slides, dialog fade-ins, and button hover states.
  * *Tue*: Audit performance metrics (Core Web Vitals - LCP/INP) using Chrome DevTools. Optimize images and bundle loading.
  * *Wed*: Construct the mock B2B analytics portal dashboard for Featured Venues (showing visitor count, beacons dropped, and Telegram taps).
  * *Thu*: Style the subscription upgrade modals (Aura Pro and Featured Venue screens).
  * *Fri*: Accessibility (a11y) review — verify keyboard navigation, contrast ratio compliance, and screen reader labels.
  * *Sat/Sun*: Deploy staging preview for beta review.

### Week 6: Production Launch & Demo Preparation
* **Objective**: Production deployment, first client onboarding, prep for Demo Day pitch.
* **Daily Workflow**:
  * *Mon*: Migrate production database, deploy client to Vercel, setup custom domains.
  * *Tue*: Onboard the first actual paying venue partner (e.g., local coffee shop) to test the Featured Venue dashboard.
  * *Wed*: Recruit 100 beta users through local wellness channels (WhatsApp/Telegram groups) and collect feedback.
  * *Thu*: Optimize landing pages and construct the demo day QR codes.
  * *Fri*: Rehearsal of the live product demo (testing under high simulated traffic load).
  * *Sat/Sun*: Launch Demo.

---

## 2. Git Branching & Code Review Policy

To maintain repository sanity and prevent code regression:

* **Main Branch**: Always deployable production code. Direct push is blocked.
* **Feature Branches**: Named `feature/<name>` (e.g., `feature/mapbox-setup`, `feature/beacon-api`).
* **Pull Request Checklist**:
  * [ ] Verified clean build (`npm run build` succeeds).
  * [ ] Backend models run migrations successfully.
  * [ ] Mobile responsiveness is tested down to 320px width.
  * [ ] No console errors or unresolved warnings are present in frontend logs.
  * [ ] Critical endpoints have manual/automated testing verification.

---

## 3. Continuous Integration / Continuous Deployment (CI/CD)

```
[ Git Push to feature/xyz ]
          │
          ▼
[ Pull Request Created ] ──► [ Automated Build & Lint Check ]
          │
          ▼ (Merged to main)
[ CD Pipeline Triggered ]
   ├──► Vercel Build (Frontend Deployment)
   └──► Render/Railway Container Build (Backend API Deploy + Migrations)
```

* **Frontend Pipeline**: Git commits to the `main` branch trigger Vercel to rebuild and serve assets via CDN with Cache-Control headers.
* **Backend Pipeline**: GitHub trigger sends build logs to Render/Railway, rebuilding the Docker container and running `python manage.py migrate` automatically before swapping active process routing.
