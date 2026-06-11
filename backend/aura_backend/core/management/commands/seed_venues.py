import json
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.location_utils import (
    find_local_photo_url,
    normalize_category,
    normalize_tags,
    resolve_photo_url,
)
from core.models import Beacon, BeaconJoin, Location, UserProfile

FEATURED_NAMES = {
    "Mono Coffee",
    "Raf Coffee",
    "Yoga Space Almaty",
    "Zen Studio",
    "Arasan Wellness",
    "Flow House",
}

EDITORIAL_OVERRIDES = {
    "Mono Coffee": "Best for solo focus before noon. Quiet corners, serious matcha.",
    "Raf Coffee": "The city's signature raf — cozy, social, always buzzing.",
    "Yoga Space Almaty": "Morning flows with natural light. Beginners welcome.",
    "Arasan Wellness": "Classic Almaty banya energy. Perfect for a slow Sunday.",
    "Zen Studio": "Soft lighting, small classes, deeply restorative.",
    "Traveler's Coffee": "Laptop-friendly with a calm upstairs nook.",
    "Pilates Lab": "Precision reformer sessions in a bright, minimal space.",
}


def _load_doc_locations() -> list[dict]:
    docs_path = settings.BASE_DIR.parent.parent / "docs" / "locations.json"
    if not docs_path.exists():
        return []

    with docs_path.open(encoding="utf-8") as file:
        return json.load(file)


class Command(BaseCommand):
    help = "Seed Almaty venues, demo users, and sample beacons"

    def handle(self, *args, **options):
        Location.objects.all().delete()
        Beacon.objects.all().delete()

        locations = _load_doc_locations()
        for raw in locations:
            name = raw.get("name", "")
            category = normalize_category(raw.get("category", ""))
            two_gis_id = str(raw.get("2gis_id", "") or "")
            local_photo = find_local_photo_url(two_gis_id, name)
            is_featured = name in FEATURED_NAMES
            editorial = EDITORIAL_OVERRIDES.get(
                name,
                raw.get("schedule", "") or raw.get("rubrics", ""),
            )
            Location.objects.create(
                name=name,
                category=category,
                address=raw.get("address", ""),
                city="Almaty",
                latitude=raw.get("lat", 0),
                longitude=raw.get("lon", 0),
                vibe_tags=normalize_tags(raw.get("rubrics", "")),
                editorial_note=editorial,
                photo_url=local_photo or resolve_photo_url("", category),
                two_gis_id=two_gis_id,
                operating_hours=raw.get("schedule", ""),
                tier=Location.TIER_FEATURED if is_featured else Location.TIER_FREE,
            )

        self.stdout.write(self.style.SUCCESS(f"Created {len(locations)} locations"))

        demo_users = [
            ("sofia_v", "Sofia V.", "sofia_vibe", "Morning person. Matcha > coffee."),
            ("elena_aura", "Elena R.", "elena_aura", "Matcha enthusiast. Morning yoga devotee."),
            ("alex_well", "Alex K.", "alex_wellness", "Trail runner. Sauna Sundays."),
            ("aigerim_fit", "Aigerim T.", "aigerim_fit", "Yoga & coffee. Almaty local."),
            ("nomad_kz", "Daniyar M.", "nomad_kz", "Remote worker. Always hunting good raf."),
            ("sara_almaty", "Sara N.", "sara_almaty", "Spa days & slow walks."),
            ("marina_yoga", "Marina L.", "marina_yoga", "Pilates mornings, tea afternoons."),
            ("timur_walk", "Timur B.", "timur_walk", "Evening walks & deep talks."),
        ]

        profiles = []
        for username, display, telegram, bio in demo_users:
            user, _ = User.objects.get_or_create(username=username)
            profile, _ = UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    "display_name": display,
                    "telegram_username": telegram,
                    "bio": bio,
                    "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
                },
            )
            profiles.append(profile)

        loc_by_name = {loc.name: loc for loc in Location.objects.all()}
        now = timezone.now()

        beacon_specs = [
            ("Mono Coffee", 0, "coffee", "Matcha at Mono @ 10:00 — who's in?", 1),
            ("Raf Coffee", 3, "coffee", "Slow raf and a reset?", 2),
            ("Yoga Space Almaty", 1, "yoga", "Sunrise flow then coffee?", 2),
            ("Zen Studio", 4, "yoga", "Gentle stretch & tea after", 3),
            ("Arasan Wellness", 2, "walk", "Banya session this evening 🧖", 5),
            ("Flow House", 5, "yoga", "Power flow — all levels welcome", 2),
            ("Traveler's Coffee", 6, "study", "Quiet co-work hour upstairs", 1),
            ("Pilates Lab", 7, "yoga", "Reformer intro class — join me", 4),
            ("Green Market Café", 4, "coffee", "Market stroll + coffee?", 3),
            ("Lotus Meditation", 5, "yoga", "Meditation circle tonight", 6),
        ]

        created_beacons = []
        for venue_name, creator_idx, activity, message, hours_offset in beacon_specs:
            location = loc_by_name.get(venue_name)
            if not location or creator_idx >= len(profiles):
                continue
            beacon = Beacon.objects.create(
                location=location,
                creator=profiles[creator_idx],
                activity_type=activity,
                message=message,
                scheduled_at=now + timedelta(hours=hours_offset),
                expires_at=now + timedelta(hours=hours_offset + 2),
            )
            created_beacons.append(beacon)

        join_pairs = [
            (0, 3),
            (0, 4),
            (1, 5),
            (2, 0),
            (2, 6),
            (3, 1),
            (4, 2),
            (4, 7),
            (5, 3),
            (6, 4),
            (7, 5),
            (8, 6),
        ]
        for beacon_idx, joiner_idx in join_pairs:
            if beacon_idx >= len(created_beacons) or joiner_idx >= len(profiles):
                continue
            beacon = created_beacons[beacon_idx]
            joiner = profiles[joiner_idx]
            if joiner.id == beacon.creator_id:
                continue
            BeaconJoin.objects.get_or_create(
                beacon=beacon,
                user=joiner,
                defaults={"telegram_handle": joiner.telegram_username},
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {len(created_beacons)} beacons with demo joiners"
            )
        )
