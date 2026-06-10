# backend/aura_backend/beacons/urls.py
from django.urls import path

from .views import BeaconDetailView, BeaconJoinView, BeaconListCreateView

urlpatterns = [
    path("", BeaconListCreateView.as_view(), name="beacon-list-create"),
    path("<int:pk>/join/", BeaconJoinView.as_view(), name="beacon-join"),
    path("<int:pk>/", BeaconDetailView.as_view(), name="beacon-detail"),
]
