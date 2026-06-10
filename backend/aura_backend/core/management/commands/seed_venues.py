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
from core.models import Beacon, Location, UserProfile


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
            category = normalize_category(raw.get("category", ""))
            two_gis_id = str(raw.get("2gis_id", "") or "")
            local_photo = find_local_photo_url(two_gis_id, raw.get("name", ""))
            Location.objects.create(
                name=raw.get("name", ""),
                category=category,
                address=raw.get("address", ""),
                city="Almaty",
                latitude=raw.get("lat", 0),
                longitude=raw.get("lon", 0),
                vibe_tags=normalize_tags(raw.get("rubrics", "")),
                editorial_note=raw.get("schedule", "") or raw.get("rubrics", ""),
                photo_url=local_photo or resolve_photo_url("", category),
                two_gis_id=two_gis_id,
                operating_hours=raw.get("schedule", ""),
                tier=Location.TIER_FREE,
            )

        self.stdout.write(self.style.SUCCESS(f"Created {len(locations)} locations"))

        demo_users = [
            ("sofia_v", "Sofia V.", "sofia_vibe", "Morning person. Matcha > coffee."),
            ("elena_aura", "Elena R.", "elena_aura", "Matcha enthusiast. Morning yoga devotee."),
            ("alex_well", "Alex K.", "alex_wellness", "Trail runner. Sauna Sundays."),
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

        mono = Location.objects.filter(name="Mono Coffee").first()
        yoga = Location.objects.filter(name="Yoga Space Almaty").first()
        arasan = Location.objects.filter(name="Arasan Wellness").first()

        now = timezone.now()
        if mono and profiles:
            Beacon.objects.create(
                location=mono,
                creator=profiles[0],
                activity_type="coffee",
                message="Matcha at Mono @ 10:00 — who's in?",
                scheduled_at=now + timedelta(hours=1),
                expires_at=now + timedelta(hours=3),
            )
        if yoga and len(profiles) > 1:
            Beacon.objects.create(
                location=yoga,
                creator=profiles[1],
                activity_type="yoga",
                message="Sunrise flow then coffee?",
                scheduled_at=now + timedelta(hours=2),
                expires_at=now + timedelta(hours=4),
            )
        if arasan and len(profiles) > 2:
            Beacon.objects.create(
                location=arasan,
                creator=profiles[2],
                activity_type="walk",
                message="Banya session this evening 🧖",
                scheduled_at=now + timedelta(hours=5),
                expires_at=now + timedelta(hours=7),
            )

        self.stdout.write(self.style.SUCCESS("Demo beacons created"))
