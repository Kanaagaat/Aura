"""Refresh location photos and 2GIS ids from docs/locations.json without deleting beacons."""

import json

from django.conf import settings
from django.core.management.base import BaseCommand

from core.location_utils import find_local_photo_url, normalize_category, resolve_photo_url
from core.models import Location


class Command(BaseCommand):
    help = "Update photo_url and two_gis_id for existing locations from docs/locations.json"

    def handle(self, *args, **options):
        docs_path = settings.BASE_DIR.parent.parent / "docs" / "locations.json"
        if not docs_path.exists():
            self.stderr.write(self.style.ERROR("docs/locations.json not found"))
            return

        with docs_path.open(encoding="utf-8") as file:
            raw_locations = json.load(file)

        updated = 0
        for raw in raw_locations:
            name = raw.get("name", "")
            location = Location.objects.filter(name=name).first()
            if not location:
                continue

            category = normalize_category(raw.get("category", "")) or location.category
            two_gis_id = str(raw.get("2gis_id", "") or "")
            local_photo = find_local_photo_url(two_gis_id, name)
            photo_url = local_photo or resolve_photo_url(location.photo_url, category)
            if not local_photo and not location.photo_url:
                photo_url = resolve_photo_url("", category)

            location.two_gis_id = two_gis_id
            location.photo_url = photo_url
            location.save(update_fields=["two_gis_id", "photo_url"])
            updated += 1

        self.stdout.write(self.style.SUCCESS(f"Refreshed {updated} locations"))
