from datetime import timedelta

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    telegram_id = models.CharField(max_length=64, blank=True, null=True, unique=True)
    telegram_username = models.CharField(max_length=32, blank=True, default="")
    display_name = models.CharField(max_length=100, blank=True, default="")
    bio = models.TextField(blank=True, default="")
    avatar_url = models.URLField(blank=True, default="")
    instagram_handle = models.CharField(max_length=64, blank=True, default="")
    is_premium = models.BooleanField(default=False)
    saved_locations = models.ManyToManyField(
        "Location", blank=True, related_name="saved_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def beacons_lit(self) -> int:
        return self.beacons.count()

    def __str__(self) -> str:
        return self.display_name or self.user.username


class Location(models.Model):
    TIER_FREE = "free"
    TIER_FEATURED = "featured"
    TIER_CHOICES = [(TIER_FREE, "Free"), (TIER_FEATURED, "Featured")]

    CATEGORY_YOGA = "yoga"
    CATEGORY_COFFEE = "coffee"
    CATEGORY_SPA = "spa"
    CATEGORY_OTHER = "other"
    CATEGORY_CHOICES = [
        (CATEGORY_YOGA, "Yoga & Studio"),
        (CATEGORY_COFFEE, "Specialty Coffee"),
        (CATEGORY_SPA, "Spa & Wellness"),
        (CATEGORY_OTHER, "Other"),
    ]

    name = models.CharField(max_length=120)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    address = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=64, default="Almaty")
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    vibe_tags = models.JSONField(default=list)
    editorial_note = models.TextField(max_length=500, blank=True, default="")
    photo_url = models.URLField(blank=True, default="")
    operating_hours = models.CharField(max_length=100, blank=True, default="")
    tier = models.CharField(max_length=10, choices=TIER_CHOICES, default=TIER_FREE)
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        self.is_featured = self.tier == self.TIER_FEATURED
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Beacon(models.Model):
    ACTIVITY_COFFEE = "coffee"
    ACTIVITY_YOGA = "yoga"
    ACTIVITY_WALK = "walk"
    ACTIVITY_STUDY = "study"
    ACTIVITY_CHOICES = [
        (ACTIVITY_COFFEE, "Coffee"),
        (ACTIVITY_YOGA, "Yoga"),
        (ACTIVITY_WALK, "Walk"),
        (ACTIVITY_STUDY, "Study"),
    ]

    location = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name="beacons"
    )
    creator = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="beacons"
    )
    activity_type = models.CharField(max_length=15, choices=ACTIVITY_CHOICES)
    message = models.CharField(max_length=100)
    scheduled_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["scheduled_at"]

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = self.scheduled_at + timedelta(hours=2)
        super().save(*args, **kwargs)

    @property
    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at

    @property
    def join_count(self) -> int:
        return self.joins.count()

    def __str__(self) -> str:
        return f"{self.message} @ {self.location.name}"


class BeaconJoin(models.Model):
    beacon = models.ForeignKey(Beacon, on_delete=models.CASCADE, related_name="joins")
    user = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="beacon_joins"
    )
    telegram_handle = models.CharField(max_length=32, blank=True, default="")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("beacon", "user")

    def __str__(self) -> str:
        return f"{self.user} joined {self.beacon}"
