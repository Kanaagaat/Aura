import json
import re
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import Beacon, BeaconJoin, Location, UserProfile
from .serializers import (
    BeaconJoinCreateSerializer,
    BeaconSerializer,
    LocationSerializer,
    UserProfileSerializer,
    RegisterSerializer,
    GoogleAuthSerializer,
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        profile_serializer = UserProfileSerializer(user.profile)
        return Response({
            "user": profile_serializer.data,
            **tokens
        }, status=status.HTTP_201_CREATED)


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_str = serializer.validated_data["credential"]

        idinfo = None
        # Handle mock bypass for local testing/debugging
        if settings.DEBUG and token_str.startswith("mock_"):
            username = token_str[5:]
            idinfo = {
                "email": f"{username}@example.com",
                "name": username.replace("_", " ").title(),
                "sub": f"mock_sub_{username}",
                "picture": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
            }
        else:
            try:
                idinfo = id_token.verify_oauth2_token(
                    token_str,
                    google_requests.Request(),
                    settings.GOOGLE_CLIENT_ID
                )
            except Exception as e:
                return Response(
                    {"detail": f"Invalid Google token: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if not idinfo:
            return Response(
                {"detail": "Failed to verify token with Google."},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = idinfo.get("email")
        sub = idinfo.get("sub")
        name = idinfo.get("name") or email.split("@")[0]
        picture = idinfo.get("picture", "")

        if not email:
            return Response(
                {"detail": "Email field missing from Google identity token."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lookup or create user by email
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            # Generate a username based on sub or email prefix
            base_username = email.split("@")[0]
            username = base_username
            counter = 1
            while User.objects.filter(username__iexact=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            user = User.objects.create_user(
                username=username,
                email=email,
                password=User.objects.make_random_password()
            )

        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                "display_name": name,
                "avatar_url": picture,
                "telegram_id": sub,
            }
        )

        if not created and not profile.avatar_url and picture:
            profile.avatar_url = picture
            profile.save(update_fields=["avatar_url"])

        tokens = get_tokens_for_user(user)
        profile_serializer = UserProfileSerializer(profile)
        return Response({
            "user": profile_serializer.data,
            **tokens
        }, status=status.HTTP_200_OK)


def _normalize_category(category: str) -> str:
    normalized = category.lower()
    if any(token in normalized for token in ["кофей", "coffee", "кафе"]):
        return Location.CATEGORY_COFFEE
    if any(token in normalized for token in ["йога", "yoga", "studio", "студия", "fitness"]):
        return Location.CATEGORY_YOGA
    if any(token in normalized for token in ["spa", "wellness", "sauna", "баня", "banya", "bathhouse"]):
        return Location.CATEGORY_SPA
    return Location.CATEGORY_OTHER


def _normalize_tags(rubrics: str) -> list[str]:
    if not rubrics:
        return []
    return [f"#{tag.strip().replace(' ', '')}" for tag in rubrics.split(",") if tag.strip()]


def _find_photo_url(two_gis_id: str, name: str) -> str:
    photos_dir = settings.BASE_DIR.parent.parent / "downloads_photos"
    if not photos_dir.exists():
        return ""

    name_norm = re.sub(r"[^a-z0-9]+", "", name.lower())
    for path in photos_dir.iterdir():
        if not path.is_file():
            continue
        file_name = path.name.lower()
        file_stem = path.stem.lower()
        if two_gis_id and two_gis_id in file_name:
            return f"/downloads_photos/{path.name}"
        if name_norm and name_norm in file_stem:
            return f"/downloads_photos/{path.name}"
    return ""


def _sync_locations_from_docs() -> None:
    if Location.objects.exists():
        return

    docs_path = settings.BASE_DIR.parent.parent / "docs" / "locations.json"
    if not docs_path.exists():
        return

    with docs_path.open(encoding="utf-8") as file:
        raw_locations = json.load(file)

    for raw in raw_locations:
        Location.objects.create(
            name=raw.get("name", ""),
            category=_normalize_category(raw.get("category", "")),
            address=raw.get("address", ""),
            city="Almaty",
            latitude=raw.get("lat", 0),
            longitude=raw.get("lon", 0),
            vibe_tags=_normalize_tags(raw.get("rubrics", "")),
            editorial_note=raw.get("schedule", "") or raw.get("rubrics", ""),
            photo_url=_find_photo_url(str(raw.get("2gis_id", "") or ""), raw.get("name", "")),
            operating_hours=raw.get("schedule", ""),
            tier=Location.TIER_FREE,
        )


class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        _sync_locations_from_docs()
        qs = super().get_queryset()
        city = self.request.query_params.get("city", "Almaty")
        category = self.request.query_params.get("category")
        if city:
            qs = qs.filter(city__iexact=city)
        if category and category != "all":
            qs = qs.filter(category=category)
        return qs


class BeaconViewSet(viewsets.ModelViewSet):
    serializer_class = BeaconSerializer
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        now = timezone.now()
        qs = Beacon.objects.select_related("location", "creator").prefetch_related(
            "joins__user"
        )
        if self.action == "list":
            qs = qs.filter(is_active=True, expires_at__gt=now)
        return qs

    def perform_create(self, serializer):
        scheduled = serializer.validated_data.get("scheduled_at")
        expires = scheduled + timedelta(hours=2)
        serializer.save(expires_at=expires, is_active=True)

    def destroy(self, request, *args, **kwargs):
        beacon = self.get_object()
        # Verify ownership
        if not hasattr(request.user, "profile") or beacon.creator != request.user.profile:
            return Response(
                {"detail": "You do not have permission to delete this beacon."},
                status=status.HTTP_403_FORBIDDEN
            )
        beacon.is_active = False
        beacon.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        beacon = self.get_object()
        if beacon.is_expired or not beacon.is_active:
            return Response(
                {"detail": "Beacon has expired."}, status=status.HTTP_400_BAD_REQUEST
            )

        ser = BeaconJoinCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        profile = getattr(request.user, "profile", None)
        if not profile:
            profile = UserProfile.objects.create(
                user=request.user,
                display_name=request.user.username
            )

        handle = ser.validated_data.get("telegram_handle") or profile.telegram_username
        join, created = BeaconJoin.objects.get_or_create(
            beacon=beacon,
            user=profile,
            defaults={"telegram_handle": handle},
        )
        if not created:
            return Response(
                {"detail": "Already joined."}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(BeaconSerializer(beacon).data)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    def get_permissions(self):
        if self.action == "me":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        profile = getattr(request.user, "profile", None)
        if not profile:
            profile = UserProfile.objects.create(
                user=request.user,
                display_name=request.user.username
            )

        if request.method == "PATCH":
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        return Response(UserProfileSerializer(profile).data)

