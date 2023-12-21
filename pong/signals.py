from django.db.models.signals import post_migrate
from django.dispatch import receiver
from pong.views import add_game_data, add_tournament_data
from pong.models import GameData, TournamentData
from django.utils import timezone
from datetime import timedelta
import random

@receiver(post_migrate)
def initialize_database(sender, **kwargs):

    #GameData.objects.all().delete()

    print(f"Database initialization (nbr objects: {GameData.objects.count()})")

    pts_to_win = 11
    database_start = timezone.datetime(2023, 11, 1, tzinfo=timezone.utc)
    database_end = timezone.now()
    time_diff = (database_end - database_start).total_seconds()
    size_GameData = GameData.objects.count()
    size_TournamentData = TournamentData.objects.count()
    
    # add entries to have 10 entries in database
    while size_GameData < 100:
        p1n = f"Player {random.randint(0, size_GameData + 9)}"
        p2n = f"Player {random.randint(size_GameData + 10, size_GameData + 40)}"
        if random.randint(0, 1) == 0:
            p1s = pts_to_win
            p2s = random.randint(0, pts_to_win - 1)
        else:
            p1s = random.randint(0, pts_to_win - 1)
            p2s = pts_to_win
        gdur = random.randint(0, 1000)  # change to positive skewed distribution
        gend = database_end - timedelta(seconds=random.uniform(0, time_diff - gdur))
        add_game_data(p1n, p1s, p2n, p2s, gend, gdur, False)
        size_GameData = GameData.objects.count()

