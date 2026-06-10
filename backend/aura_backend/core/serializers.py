from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Beacon, BeaconJoin, Location, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    beacons_lit = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "display_name",
            "bio",
            "telegram_username",
            "instagram_handle",
            "avatar_url",
            "is_premium",
            "beacons_lit",
        ]


class LocationSerializer(serializers.ModelSerializer):
    active_beacon_count = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = [
            "id",
            "name",
            "category",
            "address",
            "city",
            "latitude",
            "longitude",
            "vibe_tags",
            "editorial_note",
            "photo_url",
            "operating_hours",
            "tier",
            "is_featured",
            "active_beacon_count",
        ]

    def get_active_beacon_count(self, obj: Location) -> int:
        return obj.beacons.filter(is_active=True).count()


class BeaconJoinSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = BeaconJoin
        fields = ["id", "user", "telegram_handle", "joined_at"]


class BeaconSerializer(serializers.ModelSerializer):
    creator = UserProfileSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source="location", write_only=True
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

    def create(self, validated_data):
        request = self.context.get("request")
        if not request or not request.user or request.user.is_anonymous:
            raise serializers.ValidationError("Authentication required.")
        profile = getattr(request.user, "profile", None)
        if profile is None:
            # Fallback if profile doesn't exist for some reason
            profile = UserProfile.objects.create(
                user=request.user,
                display_name=request.user.username,
            )
        validated_data["creator"] = profile
        return super().create(validated_data)


class BeaconJoinCreateSerializer(serializers.Serializer):
    telegram_handle = serializers.CharField(max_length=32, required=False, default="")


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    display_name = serializers.CharField(max_length=100, required=False, default="")
    telegram_username = serializers.CharField(max_length=32, required=False, default="")

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email is already registered.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )
        UserProfile.objects.create(
            user=user,
            display_name=validated_data.get("display_name") or validated_data["username"],
            telegram_username=validated_data.get("telegram_username", "")
        )
        return user


class GoogleAuthSerializer(serializers.Serializer):
    credential = serializers.CharField()

