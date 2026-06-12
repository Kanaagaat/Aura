# Aura — Feature Roadmap & Design Audit

## Table of Contents
1. [Design Audit & Rating](#1-design-audit--rating)
2. [Why the App Feels Empty](#2-why-the-app-feels-empty)
3. [Killer Features to Add](#3-killer-features-to-add)
4. [Implementation Priority](#4-implementation-priority)

---

## 1. Design Audit & Rating

### Current Score: 6.5 / 10

| Dimension | Score | Notes |
|---|---|---|
| Color & Brand | 8/10 | Warm beige palette is on-point. Sage green accent works well. Consistent. |
| Typography | 7/10 | Serif/sans pairing is correct. But font size hierarchy is flat — too many elements at the same visual weight. |
| Spacing & Layout | 6/10 | Cards have good padding but page sections feel too uniform. No breathing room between hero and feed. |
| Map UX | 7/10 | Map itself is clean. Bottom sheet slide-up is good. Cluster markers are functional but generic. |
| Empty States | 5/10 | Empty states exist but are too sparse — the app looks abandoned when no beacons are live. |
| Motion / Micro-animations | 6/10 | Framer Motion is used but only on mounts. No hover states, no tap feedback, no scroll-driven reveals. |
| Mobile Feel | 6/10 | Padding is desktop-biased. Tap targets on some chips are too small (< 44px). No swipe gestures. |
| Visual Density | 4/10 | **This is the biggest issue.** The home feed with 0–2 beacons still feels sparse. Ambient venue content helps, but social proof is thin. |
| Iconography | 6/10 | Emoji categories are charming. But no consistent icon system elsewhere — mixing emoji, SVG, and text links. |

### Should You Upgrade the Design? **Yes — but surgically, not from scratch.**

The foundation is solid (palette, brand, serif tone). What it needs is:

1. **Richer ambient content** when beacons are empty (see Section 2)
2. **More expressive cards** — bigger photos, bolder type, one strong stat per card
3. **Micro-interactions** on every tap: scale-down on press, amber glow on beacon pulse
4. **Bottom nav bar** on mobile instead of the current top layout — wellness apps live in the bottom thumb zone
5. **A "Today" hero section** — time-of-day gradient banner (soft dawn peach in AM, warm amber at dusk)

---

## 2. Why the App Feels Empty

### Root Cause
The home page now has curated venue suggestions and empty-state CTAs, so it is no longer fully blank when there are no live beacons. The remaining cold-start problem is that it still needs richer social proof, daily context, and ambient community activity to feel alive.

### Fixes (no backend changes needed for most)

| Fix | Effort | Impact |
|---|---|---|
| **Community stats bar** — "Curated spots · people active this week · beacons lit today" (computed from DB counts) | Low | Medium |
| **Activity Feed placeholder cards** — soft "invite a friend" nudge cards in the beacon feed when empty | Low | Medium |
| **Recent Joins ticker** — "Aliya joined a yoga beacon at Flow Studio" (from BeaconJoin model) | Medium | High |
| **Trending vibe tags** — horizontal scroll of popular tags like `#matcha`, `#slowmorning`, `#stretchday` | Low | Medium |

---

## 3. Killer Features to Add

### Feature 1: Finish Beacon Audience Visibility ⭐⭐⭐
**Priority: HIGH**

The profile gender field, beacon visibility model field, registration UI, and create-beacon picker already exist. Remaining work:

- Persist `visibility` through the beacon create serializer/service
- Include `visibility` in beacon API responses used by the frontend
- Filter active beacons by the requesting user's gender
- Add small map/feed/detail badges for women-only and men-only beacons

**API filtering** — in `BeaconListCreateView`, filter by requesting user's gender:
```python
def get_queryset(self):
    qs = Beacon.objects.filter(is_active=True)
    user_gender = getattr(request.user.profile, 'gender', None)
    if user_gender:
        qs = qs.filter(models.Q(visibility='all') | models.Q(visibility=user_gender))
    return qs
```

**Map UX:** Beacons with `visibility !== 'all'` show a small gender badge on their pulse marker:
- 🌸 for women-only
- 💙 for men-only

This makes the map feel curated and intentional.

---

### Feature 2: Live Beacon Feed ("Right Now") ⭐⭐⭐
**Priority: HIGH — build this first**

A full-page scrollable live feed of all active beacons, sorted by `expires_at` ASC. Each card shows:
- Venue photo (full bleed, rounded)
- Activity type + emoji
- Creator's first name + vibe_word tag
- "Joining: 2 others" with avatar initials stack
- Countdown timer
- One-tap "Join + open Telegram" button

**Why killer:** Solves the "app feels empty" problem instantly. Replaces the home page horizontal scroll with a social-media-style vertical feed. Creates FOMO. Drives beacon creation.

**Implementation notes:**
- Poll `GET /api/v1/beacons/?active=true` every 30s (no WebSocket needed)
- Page: `frontend/src/pages/FeedPage.tsx`
- Route: `/feed` — make this the default post-login landing instead of `/home`
- Filter tabs at top: All · Coffee · Yoga · Walk · Study · Women-only · Men-only

---

### Feature 3: Vibe Search — AI Mood-to-Map ⭐⭐⭐
**Priority: HIGH for demo day**

A floating search pill on `MapPage`:  
*"I feel like..."* → free-text → Claude Haiku → ranked venues highlighted on map

Backend endpoint: `POST /api/v1/ai/vibe-search/`
```json
// Request
{ "mood": "I want calm, no screens, something warm and quiet" }

// Response
{
  "data": {
    "locations": [
      { "id": 12, "name": "Flow Studio", "reason": "Quiet morning yoga, minimal screens" },
      { "id": 5, "name": "Mono Coffee", "reason": "Warm, editorial feel, good for slow mornings" }
    ],
    "vibe_summary": "You're craving stillness. These spots have that."
  }
}
```

**Frontend:** The floating search bar expands on tap, shows a blinking cursor and placeholder "describe your mood…", then animates the map to highlight matches with a soft amber ring.

**Why killer:** The magic demo moment. Investors, users, and journalists will share this.

---

### Feature 4: Compatibility Score on Beacon Join ⭐⭐
**Priority: MEDIUM**

When a user taps "Join" on a beacon, before they confirm, show:
- A compatibility score (0–100%) with the beacon creator
- A one-line Claude Haiku explanation: "Both value slow mornings and yoga. 87% match."

Computed from: cosine similarity between `UserProfile.embedding` vectors + shared interests.

**Backend:** `GET /api/v1/ai/compatibility/?beacon_id=<id>` (already in AGENTS.md roadmap)

**Why killer:** Makes every join feel intentional. Drives profile completion (users add interests to improve their score).

---

### Feature 5: "Happening Today" Daily Digest Banner ⭐⭐
**Priority: MEDIUM — zero backend changes**

A top-of-home-page hero banner that changes throughout the day:

| Time | Banner |
|---|---|
| 6–11am | "Rise & Reset. 3 yoga beacons this morning." |
| 11am–2pm | "Midday fuel. 5 coffee beacons near you." |
| 2–6pm | "Afternoon flow. 2 spa sessions, 1 walk." |
| 6pm+ | "Wind down. Evening beacons lighting up." |

Rich gradient background (dawn peach → midday cream → dusk amber) based on time of day. No API call needed — computed client-side from beacon counts already in store.

---

### Feature 6: Beacon History / Wellness Journal ⭐⭐
**Priority: MEDIUM**

`BeaconJoin` already records every session. Surface it as a personal log.

- `GET /api/v1/beacons/history/` — all beacons the user joined or created
- `ProfilePage` section: "Your journey" — timeline of past beacons with venue photo, activity, date
- Milestone badges: "First beacon 🕯", "5 meetups ☕", "Yoga streak 🧘"

**Why killer:** Gives Aura a journaling/wellness tracking angle — sticky habit loop.

---

### Feature 7: Waitlist → Referral Loop ⭐
**Priority: LOW but high growth impact**

On the existing waitlist/landing page, after email submit, show:
- A unique referral link: `aura.app/join?ref=elena_r`
- "Invite 2 friends to jump the queue"
- Progress tracker: 0/2 referred

All tracked in Supabase (already in use for waitlist). No auth needed.

---

## 4. Implementation Priority

### This Week (High Impact, Ready to Build)

| # | Feature | Type | Effort |
|---|---|---|---|
| 1 | **Finish beacon audience visibility plumbing** | [FULL] | 0.5 day |
| 2 | **Live Feed page** (replaces home as default) | [FRONTEND] | 1.5 days |
| 3 | **Community stats + recent joins ticker** | [FULL] | 1 day |

### Next Week (Demo-Ready AI)

| # | Feature | Type | Effort |
|---|---|---|---|
| 4 | **Vibe Search** (mood → Claude → map highlights) | [AI + FULL] | 2 days |
| 5 | **Compatibility score on beacon join** | [AI + FULL] | 1.5 days |
| 6 | **Daily Digest banner** (time-of-day hero) | [FRONTEND] | 0.5 day |

### Week After (Polish & Retention)

| # | Feature | Type | Effort |
|---|---|---|---|
| 7 | **Beacon history / wellness journal** | [FULL] | 1 day |
| 8 | **Waitlist referral loop** | [FRONTEND] | 1 day |
| 9 | **Design polish pass** (micro-interactions, density, visual hierarchy) | [FRONTEND] | 1.5 days |

---

## Design Upgrade Checklist

Before demo day, do these in order:

- [ ] **Beacon card redesign** — add creator first name + vibe_word + visibility badge
- [ ] **Tap feedback** — `active:scale-[0.97]` on all interactive cards
- [ ] **Time-of-day gradient** on home page header (dawn/noon/dusk color shift)
- [ ] **Gender/audience badge** on map beacon pulse markers
- [ ] **Profile completion nudge** — % bar on profile page ("Complete your profile to see compatibility scores")
- [ ] **Loading shimmer** — replace spinner with skeleton shimmer on all list views
- [ ] **Onboarding tooltip** — first-time user: "Tap a beacon to join ✨" floating hint

---

*Last updated: June 2026 | Aura — Urban Wellness*
