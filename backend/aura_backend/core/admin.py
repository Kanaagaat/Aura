from django.contrib import admin

from .models import Beacon, BeaconJoin, Location, UserProfile

admin.site.register(Location)
admin.site.register(UserProfile)
admin.site.register(Beacon)
admin.site.register(BeaconJoin)
