from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import Beacon


class Command(BaseCommand):
    help = "Deactivate beacons past their 2-hour expiry window"

    def handle(self, *args, **options):
        cutoff = timezone.now()
        updated = Beacon.objects.filter(
            is_active=True, expires_at__lt=cutoff
        ).update(is_active=False)
        self.stdout.write(self.style.SUCCESS(f"Deactivated {updated} expired beacons"))
