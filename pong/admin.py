from django.contrib import admin
from .models import GameData
from .models import TournamentData

admin.site.register(GameData)
admin.site.register(TournamentData)