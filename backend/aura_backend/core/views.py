import json
import secrets
from datetime import timedelta

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

from .location_utils import (
    find_local_photo_url,
    normalize_category,
    normalize_tags,
    resolve_photo_url,
)
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
            if not settings.GOOGLE_CLIENT_ID:
                return Response(
                    {
                        "detail": (
                            "Google sign-in is not configured on the server. "
                            "Set GOOGLE_CLIENT_ID in the backend environment."
                        )
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            try:
                idinfo = id_token.verify_oauth2_token(
                    token_str,
                    google_requests.Request(),
                    settings.GOOGLE_CLIENT_ID,
                )
            except Exception as e:
                return Response(
                    {"detail": f"Invalid Google token: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
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

            # NOTE: User.objects.make_random_password() was removed in Django 5.1+.
            # Generate a strong random password for OAuth users instead.
            user = User.objects.create_user(
                username=username,
                email=email,
                password=secrets.token_urlsafe(32),
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


def _sync_locations_from_docs() -> None:
    if Location.objects.exists():
        return

    docs_path = settings.BASE_DIR.parent.parent / "docs" / "locations.json"
    if not docs_path.exists():
        return

    with docs_path.open(encoding="utf-8") as file:
        raw_locations = json.load(file)

    for raw in raw_locations:
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
    queryset = UserProfile.objects.select_related("user").all()
    serializer_class = UserProfileSerializer
    http_method_names = ["get", "patch", "post", "delete", "head", "options"]

    def get_permissions(self):
        if self.action in ("me", "partial_update", "update", "saved", "toggle_saved"):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def partial_update(self, request, *args, **kwargs):
        profile = self.get_object()
        if profile.user_id != request.user.id:
            return Response(
                {"detail": "You can only edit your own profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().partial_update(request, *args, **kwargs)

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

    @action(detail=False, methods=["get"], url_path="saved")
    def saved(self, request):
        """GET /api/v1/profiles/saved/ — list the current user's saved locations."""
        profile = getattr(request.user, "profile", None)
        if not profile:
            return Response({"data": [], "error": None})
        locations = profile.saved_locations.all()
        serializer = LocationSerializer(locations, many=True, context={"request": request})
        return Response({"data": serializer.data, "error": None})

    @action(detail=False, methods=["post"], url_path=r"saved/(?P<location_id>\d+)")
    def toggle_saved(self, request, location_id: str = None):
        """POST /api/v1/profiles/saved/<location_id>/ — toggle save/unsave."""
        profile = getattr(request.user, "profile", None)
        if not profile:
            profile = UserProfile.objects.create(
                user=request.user,
                display_name=request.user.username,
            )
        try:
            location = Location.objects.get(pk=int(location_id))
        except Location.DoesNotExist:
            return Response(
                {"data": None, "error": {"code": "not_found", "message": "Location not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )
        if profile.saved_locations.filter(pk=location.pk).exists():
            profile.saved_locations.remove(location)
            saved = False
        else:
            profile.saved_locations.add(location)
            saved = True
        return Response({"data": {"saved": saved, "location_id": location.pk}, "error": None})

