from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.views import (
    BeaconViewSet,
    LocationViewSet,
    UserProfileViewSet,
    RegisterView,
    GoogleAuthView,
)

router = DefaultRouter()
router.register("locations", LocationViewSet, basename="location")
router.register("beacons", BeaconViewSet, basename="beacon")
router.register("profiles", UserProfileViewSet, basename="profile")

v1_router = DefaultRouter()
v1_router.register("locations", LocationViewSet, basename="v1-location")
v1_router.register("profiles", UserProfileViewSet, basename="v1-profile")

urlpatterns = [
    path("api/auth/register/", RegisterView.as_view(), name="auth_register"),
    path("api/auth/login/", TokenObtainPairView.as_view(), name="auth_login"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="auth_token_refresh"),
    path("api/auth/google/", GoogleAuthView.as_view(), name="auth_google"),
    path("api/v1/auth/register/", RegisterView.as_view(), name="v1_auth_register"),
    path("api/v1/auth/login/", TokenObtainPairView.as_view(), name="v1_auth_login"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="v1_auth_token_refresh"),
    path("api/v1/auth/google/", GoogleAuthView.as_view(), name="v1_auth_google"),
    path("api/v1/beacons/", include("beacons.urls")),
    path("api/v1/", include(v1_router.urls)),
    path("api/", include(router.urls)),
]
