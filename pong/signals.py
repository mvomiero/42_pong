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
    #TournamentData.objects.all().delete()

    print(f"Database initialization (nbr objects match: {GameData.objects.count()} | nbr objects tournament: {TournamentData.objects.count()})")

    database_start = timezone.datetime(2023, 11, 1, tzinfo=timezone.utc)
    database_end = timezone.now()
    time_diff = (database_end - database_start).total_seconds()

    # add entries to have 100 matches in database
    size_GameData = GameData.objects.count()
    while size_GameData < 100:
        add_game_data(*generate_random_match(database_end, time_diff, False, size_GameData))
        size_GameData = GameData.objects.count()
    
    
    # add entries to have 10 tournaments in database
    size_TournamentData = TournamentData.objects.count()
    while size_TournamentData < 10:
        add_tournament_data(*generate_random_tournament(database_end, time_diff, size_TournamentData))
        size_TournamentData = TournamentData.objects.count()

    print(f"After initialization (match objects: {GameData.objects.count()} | tournament objects: {TournamentData.objects.count()})")



def generate_random_match(database_end, time_diff, is_tournament, size_GameData):
    pts_to_win = 11
    
    p1n = f"Player {random.randint(0, size_GameData + 9)}"
    p2n = f"Player {random.randint(size_GameData + 10, size_GameData + 40)}"
    if random.randint(0, 1) == 0:
        p1s = pts_to_win
        p2s = random.randint(0, pts_to_win - 1)
    else:
        p1s = random.randint(0, pts_to_win - 1)
        p2s = pts_to_win
    gdur = random.randint(4, 1000)  # change to positive skewed distribution
    gend = database_end - timedelta(seconds=random.uniform(0, time_diff - gdur))

    return p1n, p1s, p2n, p2s, gend, gdur, is_tournament


def generate_random_tournament(database_end, time_diff, size_TournamentData):
    # generate the matches of the tournament
    finalMatch = match_to_list(*generate_random_match(database_end, time_diff - 1000, True, size_TournamentData))
    semiMatch1 = match_to_list(*generate_random_match(finalMatch['endTime'], 1000, True, size_TournamentData))
    semiMatch2 = match_to_list(*generate_random_match(finalMatch['endTime'], 1000, True, size_TournamentData))
    
    # set the winners of the semi finals as players of the final
    finalMatch['players'][0] = semiMatch1['players'][0] if semiMatch1['score'][0] > semiMatch1['score'][1] else semiMatch1['players'][1]
    finalMatch['players'][1] = semiMatch2['players'][0] if semiMatch2['score'][0] > semiMatch2['score'][1] else semiMatch2['players'][1]
    
    # set the players and the end time and duration of the tournament
    players = [semiMatch1['players'][0], semiMatch1['players'][1], semiMatch2['players'][0], semiMatch2['players'][1]]
    tend = finalMatch['endTime']
    print(f"tend: {tend} | semiMatch1['startTime']: {semiMatch1['startTime']} | semiMatch2['startTime']: {semiMatch2['startTime']}")
    print(f"duration: {tend - min(semiMatch1['startTime'], semiMatch2['startTime'])}")
    tdur = (tend - min(semiMatch1['startTime'], semiMatch2['startTime'])).total_seconds()
    print(f"tdur: {tdur}")

    # convert datetime to timestamp (float) for matches
    semiMatch1['endTime'] = semiMatch1['endTime'].timestamp()
    semiMatch1['startTime'] = semiMatch1['startTime'].timestamp()
    semiMatch2['endTime'] = semiMatch2['endTime'].timestamp()
    semiMatch2['startTime'] = semiMatch2['startTime'].timestamp()
    finalMatch['endTime'] = finalMatch['endTime'].timestamp()
    finalMatch['startTime'] = finalMatch['startTime'].timestamp()

    return semiMatch1, semiMatch2, finalMatch, players, tend, tdur


def match_to_list(p1n, p1s, p2n, p2s, gend, gdur, itg):
    return {'players': [p1n, p2n], 'score': [p1s, p2s], 'endTime': gend, 'startTime': gend - timedelta(seconds=gdur), 'is_tournament_game': itg}

