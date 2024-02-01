from django.db.models.signals import post_migrate
from django.dispatch import receiver
from pong.views import add_game_data, add_tournament_data
from pong.models import GameData, TournamentData
from django.utils import timezone
from datetime import timedelta, datetime
import time
import calendar
import random
# from asgiref.sync import sync_to_async
from asgiref.sync import async_to_sync

@receiver(post_migrate)
def on_post_migrate(sender, **kwargs):
    async_init_database = async_to_sync(initialize_database)
    async_init_database(sender, **kwargs)

async def initialize_database(sender, **kwargs):

    GameData.objects.all().delete()
    TournamentData.objects.all().delete()

    print(f"Database initialization (nbr objects match: {GameData.objects.count()} | nbr objects tournament: {TournamentData.objects.count()})")

    database_end = time.time()
    my_time = (2023, 11, 1, 0, 0, 0, 2, 305, -1)
    database_start = calendar.timegm(time.struct_time(my_time))
    time_diff = database_end - database_start

    # add entries to have 100 matches in database
    size_GameData = GameData.objects.count()
    while size_GameData < 200:
        await add_game_data(*generate_random_match(database_end, time_diff, False, size_GameData))
        size_GameData += 1
        #size_GameData = GameData.objects.count()
    
    
    # add entries to have 10 tournaments in database
    size_TournamentData = TournamentData.objects.count()
    while size_TournamentData < 20:
        await add_tournament_data(*generate_random_tournament(database_end, time_diff, size_TournamentData))
        size_TournamentData += 1
        #size_TournamentData = TournamentData.objects.count()

    print(f"After initialization (match objects: {GameData.objects.count()} | tournament objects: {TournamentData.objects.count()})")



def generate_random_match(database_end, time_diff, is_tournament, size_GameData):
    pts_to_win = 11
    
    p1n = f"Player {random.randint(0, round(size_GameData / 2) + 15)}"
    p2n = f"Player {random.randint(0, round(size_GameData / 2) + 15)}"
    while p1n == p2n:
        p2n = f"Player {random.randint(0, round(size_GameData / 2) + 15)}"
    if random.randint(0, 1) == 0:
        p1s = pts_to_win
        p2s = random.randint(0, pts_to_win - 1)
    else:
        p1s = random.randint(0, pts_to_win - 1)
        p2s = pts_to_win
    gdur = random.randint(4, 1000)  # change to positive skewed distribution
    gend = database_end - random.randint(0, int(time_diff) - gdur)

    if not is_tournament:
        gend = datetime.fromtimestamp(gend)

    return p1n, p1s, p2n, p2s, gend, gdur, is_tournament


def generate_random_tournament(database_end, time_diff, size_TournamentData):
    # generate the matches of the tournament
    finalMatch = match_to_list(*generate_random_match(database_end, time_diff - 1000, True, size_TournamentData))
    semiMatch1 = match_to_list(*generate_random_match(finalMatch['endTime'], 1000, True, size_TournamentData))
    semiMatch2 = match_to_list(*generate_random_match(finalMatch['endTime'], 1000, True, size_TournamentData))
    
    # ensure unique players
    while semiMatch1['players'][0] == semiMatch2['players'][0] or semiMatch1['players'][0] == semiMatch2['players'][1] or semiMatch1['players'][1] == semiMatch2['players'][0] or semiMatch1['players'][1] == semiMatch2['players'][1]:
        semiMatch2 = match_to_list(*generate_random_match(finalMatch['endTime'], 1000, True, size_TournamentData))

    # set the winners of the semi finals as players of the final
    finalMatch['players'][0] = semiMatch1['players'][0] if semiMatch1['score'][0] > semiMatch1['score'][1] else semiMatch1['players'][1]
    finalMatch['players'][1] = semiMatch2['players'][0] if semiMatch2['score'][0] > semiMatch2['score'][1] else semiMatch2['players'][1]
    
    # set the players rank
    playersRank = []
    if finalMatch['score'][0] > finalMatch['score'][1]:
        playersRank.append(finalMatch['players'][0])
        playersRank.append(finalMatch['players'][1])
    else:
        playersRank.append(finalMatch['players'][1])
        playersRank.append(finalMatch['players'][0])
    playersRank.append(semiMatch1['players'][0]) if semiMatch1['score'][1] > semiMatch1['score'][0] else playersRank.append(semiMatch1['players'][1])
    playersRank.append(semiMatch2['players'][0]) if semiMatch2['score'][1] > semiMatch2['score'][0] else playersRank.append(semiMatch2['players'][1])
    
    # set the end time and duration of the tournament
    tdur = finalMatch['endTime'] - min(semiMatch1['startTime'], semiMatch2['startTime'])
    tend = datetime.fromtimestamp(finalMatch['endTime'])

    return semiMatch1, semiMatch2, finalMatch, playersRank, tend, tdur


def match_to_list(p1n, p1s, p2n, p2s, gend, gdur, itg):
    return {'players': [p1n, p2n], 'score': [p1s, p2s], 'endTime': gend, 'startTime': gend - gdur, 'is_tournament_game': itg}

