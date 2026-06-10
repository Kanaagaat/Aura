# backend/aura_backend/beacons/services.py
from datetime import timedelta
from typing import Any

from django.contrib.auth.models import User
from django.db.models import QuerySet
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from core.models import Beacon, BeaconJoin, Location, UserProfile


def get_or_create_profile(user: User) -> UserProfile:
    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={"display_name": user.username},
    )
    return profile


def list_beacons(location_id: str | None = None, active: str | None = None) -> QuerySet[Beacon]:
    queryset = Beacon.objects.select_related("location", "creator", "creator__user").prefetch_related(
        "joins__user",
        "joins__user__user",
    )

    if location_id:
        queryset = queryset.filter(location_id=location_id)

    if active is not None:
        is_active = active.lower() in {"1", "true", "yes"}
        queryset = queryset.filter(is_active=is_active)
        if is_active:
            queryset = queryset.filter(expires_at__gt=timezone.now())

    return queryset


def get_beacon(beacon_id: int) -> Beacon:
    return (
        Beacon.objects.select_related("location", "creator", "creator__user")
        .prefetch_related("joins__user", "joins__user__user")
        .get(id=beacon_id)
    )


def create_beacon(
    *,
    creator: User,
    location: Location,
    activity_type: str,
    message: str,
    scheduled_at: Any,
) -> Beacon:
    profile = get_or_create_profile(creator)
    return Beacon.objects.create(
        location=location,
        creator=profile,
        activity_type=activity_type,
        message=message,
        scheduled_at=scheduled_at,
        expires_at=scheduled_at + timedelta(hours=2),
        is_active=True,
    )


def join_beacon(*, beacon_id: int, user: User, telegram_handle: str = "") -> BeaconJoin:
    beacon = Beacon.objects.select_related("creator", "location").get(id=beacon_id)
    if beacon.is_expired or not beacon.is_active:
        raise ValidationError({"message": "Beacon has expired."})

    profile = get_or_create_profile(user)
    handle = telegram_handle or profile.telegram_username
    join, created = BeaconJoin.objects.get_or_create(
        beacon=beacon,
        user=profile,
        defaults={"telegram_handle": handle},
    )
    if not created:
        raise ValidationError({"message": "Already joined."})

    return join


def deactivate_expired_beacons() -> int:
    return Beacon.objects.filter(
        is_active=True,
        expires_at__lt=timezone.now(),
    ).update(is_active=False)
