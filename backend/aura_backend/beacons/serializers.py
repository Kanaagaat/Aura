# backend/aura_backend/beacons/serializers.py
from rest_framework import serializers

from core.models import Beacon, BeaconJoin, Location
from core.serializers import BeaconJoinSerializer, LocationSerializer, UserProfileSerializer


class BeaconSerializer(serializers.ModelSerializer):
    creator = UserProfileSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        source="location",
        write_only=True,
    )
    join_count = serializers.IntegerField(read_only=True)
    joins = BeaconJoinSerializer(many=True, read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Beacon
        fields = [
            "id",
            "location",
            "location_id",
            "creator",
            "activity_type",
            "message",
            "scheduled_at",
            "expires_at",
            "is_active",
            "join_count",
            "joins",
            "is_expired",
            "created_at",
        ]
        read_only_fields = ["expires_at", "is_active", "created_at"]


class BeaconCreateSerializer(serializers.Serializer):
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        source="location",
    )
    activity_type = serializers.ChoiceField(choices=Beacon.ACTIVITY_CHOICES)
    message = serializers.CharField(max_length=100)
    scheduled_at = serializers.DateTimeField()


class BeaconJoinCreateSerializer(serializers.ModelSerializer):
    telegram_handle = serializers.CharField(max_length=64, required=False, allow_blank=True)

    class Meta:
        model = BeaconJoin
        fields = ["telegram_handle"]
