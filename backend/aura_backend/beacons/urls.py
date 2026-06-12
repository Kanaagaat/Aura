# backend/aura_backend/beacons/urls.py
from django.urls import path

from .views import BeaconDetailView, BeaconHistoryView, BeaconJoinView, BeaconListCreateView, RecentJoinsView

urlpatterns = [
    path("", BeaconListCreateView.as_view(), name="beacon-list-create"),
    path("recent-joins/", RecentJoinsView.as_view(), name="beacon-recent-joins"),
    path("history/", BeaconHistoryView.as_view(), name="beacon-history"),
    path("<int:pk>/join/", BeaconJoinView.as_view(), name="beacon-join"),
    path("<int:pk>/", BeaconDetailView.as_view(), name="beacon-detail"),
]
