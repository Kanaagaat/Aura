# backend/aura_backend/beacons/views.py
from typing import Any

from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Beacon

from .serializers import BeaconCreateSerializer, BeaconJoinCreateSerializer, BeaconSerializer
from .services import create_beacon, get_beacon, join_beacon, list_beacons


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
        serializer = BeaconSerializer(queryset, many=True, context={"request": request})
        return success_response(serializer.data)

    def post(self, request: Request) -> Response:
        serializer = BeaconCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        beacon = create_beacon(creator=request.user, **serializer.validated_data)
        data = BeaconSerializer(beacon, context={"request": request}).data
        return success_response(data, status.HTTP_201_CREATED)


class BeaconDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            beacon = get_beacon(pk)
        except Beacon.DoesNotExist:
            return error_response(
                "beacon_not_found", "Beacon not found.", status.HTTP_404_NOT_FOUND
            )
        serializer = BeaconSerializer(beacon, context={"request": request})
        return success_response(serializer.data)


class BeaconJoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request, pk: int) -> Response:
        get_object_or_404(Beacon, pk=pk)
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
