# backend/aura_backend/beacons/views.py
from typing import Any

from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Beacon, BeaconJoin

from .serializers import BeaconCreateSerializer, BeaconJoinCreateSerializer, BeaconSerializer
from .services import can_view_beacon, create_beacon, get_beacon, join_beacon, list_beacons, visible_beacon_q


def success_response(data: Any, response_status: int = status.HTTP_200_OK) -> Response:
    return Response({"data": data, "error": None}, status=response_status)


def error_response(code: str, message: str, response_status: int) -> Response:
    return Response(
        {"data": None, "error": {"code": code, "message": message}},
        status=response_status,
    )


class BeaconListCreateView(APIView):
    def get_permissions(self) -> list[permissions.BasePermission]:
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request: Request) -> Response:
        queryset = list_beacons(
            location_id=request.query_params.get("location_id"),
            active=request.query_params.get("active"),
        )
        queryset = queryset.filter(visible_beacon_q(request.user))
        serializer = BeaconSerializer(queryset, many=True, context={"request": request})
        return success_response(serializer.data)

    def post(self, request: Request) -> Response:
        serializer = BeaconCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        beacon = create_beacon(creator=request.user, **serializer.validated_data)
        data = BeaconSerializer(beacon, context={"request": request}).data
        return success_response(data, status.HTTP_201_CREATED)


class BeaconDetailView(APIView):
    def get_permissions(self) -> list[permissions.BasePermission]:
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request: Request, pk: int) -> Response:
        try:
            beacon = get_beacon(pk)
        except Beacon.DoesNotExist:
            return error_response(
                "beacon_not_found", "Beacon not found.", status.HTTP_404_NOT_FOUND
            )
        if not can_view_beacon(request.user, beacon):
            return error_response(
                "beacon_not_found", "Beacon not found.", status.HTTP_404_NOT_FOUND
            )
        serializer = BeaconSerializer(beacon, context={"request": request})
        return success_response(serializer.data)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            beacon = get_beacon(pk)
        except Beacon.DoesNotExist:
            return error_response(
                "beacon_not_found", "Beacon not found.", status.HTTP_404_NOT_FOUND
            )
        try:
            profile = request.user.profile
        except Exception:
            return error_response(
                "forbidden", "Authentication required.", status.HTTP_403_FORBIDDEN
            )
        if beacon.creator != profile:
            return error_response(
                "forbidden", "You can only delete your own beacons.", status.HTTP_403_FORBIDDEN
            )
        beacon.is_active = False
        beacon.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class BeaconJoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request, pk: int) -> Response:
        beacon = get_object_or_404(Beacon, pk=pk)
        if not can_view_beacon(request.user, beacon):
            return error_response(
                "beacon_not_found", "Beacon not found.", status.HTTP_404_NOT_FOUND
            )
        serializer = BeaconJoinCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            join = join_beacon(
                beacon_id=pk,
                user=request.user,
                telegram_handle=serializer.validated_data.get("telegram_handle", ""),
            )
        except ValidationError as exc:
            detail = exc.detail
            message = detail.get("message", detail) if isinstance(detail, dict) else detail
            return error_response("beacon_join_failed", str(message), status.HTTP_400_BAD_REQUEST)

        beacon_data = BeaconSerializer(join.beacon, context={"request": request}).data
        return success_response(beacon_data, status.HTTP_201_CREATED)


class RecentJoinsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request: Request) -> Response:
        joins = (
            BeaconJoin.objects
            .select_related("user__user", "beacon__location")
            .filter(beacon__in=Beacon.objects.filter(visible_beacon_q(request.user)))
            .order_by("-joined_at")[:10]
        )
        data = [
            {
                "user_name": j.user.display_name or j.user.user.username,
                "activity": j.beacon.activity_type,
                "location_name": j.beacon.location.name,
                "joined_at": j.joined_at.isoformat(),
            }
            for j in joins
        ]
        return success_response(data)


class BeaconHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request) -> Response:
        from core.models import UserProfile
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return success_response([])

        created_ids = set(
            Beacon.objects.filter(creator=profile).values_list("id", flat=True)
        )
        joined_ids = set(
            BeaconJoin.objects.filter(user=profile).values_list("beacon_id", flat=True)
        )
        all_ids = created_ids | joined_ids

        beacons = (
            Beacon.objects
            .filter(id__in=all_ids)
            .select_related("location", "creator", "creator__user")
            .prefetch_related("joins__user", "joins__user__user")
            .order_by("-scheduled_at")
        )

        total = len(all_ids)
        yoga_count = sum(1 for b in beacons if b.activity_type == "yoga")
        milestones = []
        if total >= 1:
            milestones.append({"key": "first_beacon", "label": "First Beacon 🕯"})
        if total >= 5:
            milestones.append({"key": "five_meetups", "label": "5 Meetups ☕"})
        if yoga_count >= 3:
            milestones.append({"key": "yoga_streak", "label": "Yoga Streak 🧘"})

        serializer = BeaconSerializer(beacons, many=True, context={"request": request})
        return success_response({"beacons": serializer.data, "milestones": milestones})
