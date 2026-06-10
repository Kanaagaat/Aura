# backend/aura_backend/beacons/management/commands/deactivate_expired_beacons.py
from typing import Any

from django.core.management.base import BaseCommand

from beacons.services import deactivate_expired_beacons


class Command(BaseCommand):
    help = "Deactivate beacons whose expiry time has passed"

    def handle(self, *args: Any, **options: Any) -> None:
        updated = deactivate_expired_beacons()
        self.stdout.write(self.style.SUCCESS(f"Deactivated {updated} expired beacons"))
