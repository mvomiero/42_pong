from django.shortcuts import render, redirect
from .models import GameData, TournamentData
import time
import pytz
from datetime import datetime
from django.http import JsonResponse    # NEW FOR CHARTS (http response)
from django.db.models import Count, CharField, Sum, Max, F, Case, IntegerField, Value, When  # NEW FOR CHARTS (database query)
from django.db.models.functions import ExtractWeekDay   # NEW FOR CHARTS (database query)
from itertools import chain
from collections import Counter
import json

def index(request):
	return render(request, "pong/index.html")

def room(request):
    if request.method == "POST":
        room_code = request.POST.get("room_code")
        char_choice = request.POST.get("character_choice")
        return redirect(
            '/play/%s?&choice=%s' 
            %(room_code, char_choice) # replacing the strings just like printf
        )
    return render(request, "pong/room.html")

def pong(request, room_code):
    choice = request.GET.get("player") # get the choice from the url
    context = {
        "char_choice": choice,
        "room_code": room_code,
    }
    return render(request, "pong/pong.html", context)


def pong_local(request):
    player1 = request.GET.get("player1") # get the choice from the url
    player2 = request.GET.get("player2") # get the choice from the url
    context = {
        "player1": player1,
        "player2": player2,
    }
    return render(request, "pong/pong.html", context)

def dashboard(request):
	return render(request, "pong/dashboard.html")

def play_local(request):
    if request.method == "POST":
        player1 = request.POST.get("player1")
        player2 = request.POST.get("player2")
        return redirect(
            '/pong_local/?&player1=%s&player2=%s' 
            %(player1, player2) # replacing the strings just like printf
        )
    return render(request, "pong/play_local.html")

def play_remote(request):
    if request.method == "POST":
        game_mode = request.POST.get("game_type")
        char_player = request.POST.get("character_choice")
        return redirect(
            '/play/%s?&player=%s'%(game_mode, char_player) # replacing the strings just like printf
        )
    return render(request, "pong/play_remote.html")

def error_full(request):
    return render(request, "pong/error_full.html")

def error_duplicate(request):
    return render(request, "pong_old/error_duplicate.html")

def error_disconnection(request):
    return render(request, "pong/error_disconnection.html")

# database functions:

# format dates:
#     games (gend) = datetime object (e.g. datetime.fromtimestamp(time.time())
#     durations (e.g. gdur) = number (e.g. 10)
def add_game_data(p1n, p1s, p2n, p2s, gend, gdur, itg):
    if p1n is not None and p2n is not None and p1s is not None and p2s is not None:
        gend = (pytz.timezone('UTC')).localize(gend)
        game_data = GameData(
            player1_name=p1n,
            player1_points=p1s,
            player2_name=p2n,
            player2_points=p2s,
            game_end_timestamp=gend,
            game_duration_secs=gdur,
            is_tournament_game=itg,
            blockchain_hash=None
        )
        game_data.save()
        return game_data.id

# format dates:
#     games (e.g. match['endTime']) = floating point number / POSIX timestamp (e.g. time.time())
#     tournaments (tend) = datetime object (e.g. datetime.fromtimestamp(time.time())
#     durations (e.g. tdur) = number (e.g. 10)
def add_tournament_data(semiMatch1, semiMatch2, finalMatch, players, tend, tdur):
    gend = datetime.fromtimestamp(semiMatch1['endTime'])
    gdur = semiMatch1['endTime'] - semiMatch1['startTime']
    matchIdSemi1 = add_game_data(semiMatch1['players'][0], semiMatch1['score'][0], semiMatch1['players'][1], semiMatch1['score'][1], gend, gdur, True)
    gend = datetime.fromtimestamp(semiMatch2['endTime'])
    gdur = semiMatch2['endTime'] - semiMatch2['startTime']
    matchIdSemi2 = add_game_data(semiMatch2['players'][0], semiMatch2['score'][0], semiMatch2['players'][1], semiMatch2['score'][1], gend, gdur, True)
    gend = datetime.fromtimestamp(finalMatch['endTime'])
    gdur = finalMatch['endTime'] - finalMatch['startTime']
    matchIdFinal = add_game_data(finalMatch['players'][0], finalMatch['score'][0], finalMatch['players'][1], finalMatch['score'][1], gend, gdur, True)
    tend = (pytz.timezone('UTC')).localize(tend)
    tournament_data = TournamentData(
        match_id_semi_1=matchIdSemi1,
        match_id_semi_2=matchIdSemi2,
        match_id_final=matchIdFinal,
        tournament_end_timestamp=tend,
        tournament_duration_secs=tdur,
    )
    tournament_data.save()


# NEW FOR DASHBOARD:
def get_dashboard_data(request):
    # Data for NON tournament games
    game_data = GameData.objects.filter(is_tournament_game=False)

    """ Data for the Chart """
    # Aggregate game data by day of the week and count total games
    matches_per_day = game_data.annotate(
        day_of_week=ExtractWeekDay('game_end_timestamp')
    ).values('day_of_week').annotate(
        total_games=Count('id')
    ).order_by('day_of_week')

    # Prepare the data in the format expected by the frontend chart
    chart_data = {}
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    for day_name in day_names:
        chart_data[day_name] = 0
    for entry in matches_per_day:
        # Assuming 'day_of_week' is returned as 1 for Monday, 2 for Tuesday, etc.
        day_index = (entry['day_of_week'] + 5) % 7
        day_name = day_names[day_index]  # Adjust index to start from 0
        chart_data[day_name] = entry['total_games']

    print(f'chart_data={chart_data}')

    """ Data for the Cards (Matches) """
    player1_names = game_data.values_list('player1_name', flat=True).distinct()
    player2_names = game_data.values_list('player2_name', flat=True).distinct()
    nbr_unique_players = len(list(set(chain(player1_names, player2_names))))
    print(f'nbr_unique_players={nbr_unique_players}')
    
    nbr_matches = game_data.count()
    print(f'nbr_matches={nbr_matches}')

    match_time = game_data.aggregate(total_match_time=Sum('game_duration_secs')).get('total_match_time', 0)
    total_match_time = {
        'hours': match_time // 3600,
        'minutes': (match_time % 3600) // 60,
        'seconds': (match_time % 3600) % 60
    }

    single_match_time = game_data.aggregate(longest_match_time=Max('game_duration_secs')).get('longest_match_time', 0)
    longest_match_time = {
        'minutes': single_match_time // 60,
        'seconds': single_match_time % 60
    }

    """ Player with most wins """
    winner_names = game_data.annotate(
        winner_name=Case(
            When(player1_points=11, then=F('player1_name')),
            When(player2_points=11, then=F('player2_name')),
            output_field=CharField(),
        )
    ).values_list('winner_name', flat=True)
    succ_player = Counter(winner_names).most_common(1)
    bestPlayer = {
        'alias': succ_player[0][0],
        'wins': succ_player[0][1]
    }

    """ Player with highest play time """
    # Aggregate the total playing time for player1_name and player2_name and combine the datasets
    player1_total_time = (
        GameData.objects
        .values('player1_name')
        .annotate(total_time=Sum('game_duration_secs'))
    )
    player2_total_time = (
        GameData.objects
        .values('player2_name')
        .annotate(total_time=Sum('game_duration_secs'))
    )
    combined_data = list(player1_total_time) + list(player2_total_time)
    
    # Merge the durations for each player
    player_durations = {}
    for data in combined_data:
        player_name = data['player1_name'] if 'player1_name' in data else data['player2_name']
        player_durations[player_name] = player_durations.get(player_name, 0) + data['total_time']
    highest_time_player = {
        'alias': max(player_durations, key=player_durations.get),
        'time': {
            'minutes': player_durations[max(player_durations, key=player_durations.get)] // 60,
            'seconds': player_durations[max(player_durations, key=player_durations.get)] % 60
        }
    }

    """ Create a list of all players """
    allPlayers = list(set(chain(game_data.values_list('player1_name', flat=True).distinct(), 
                                game_data.values_list('player2_name', flat=True).distinct())))
    print(f'allPlayers={allPlayers}')

    # Prepare the response and return it as JSON
    response_data = {
        'chart1': chart_data,
        'cards': {
            'uniquePlayers': nbr_unique_players,
            'nbrMatches': nbr_matches,
            'totalMatchTime': total_match_time,
            'longestMatchTime': longest_match_time,
            'bestPlayer': bestPlayer,
            'highestTimePlayer': highest_time_player
        },
        'playerList': allPlayers
    }
    return JsonResponse(response_data)

def get_dashboard_data_player(request):
    playerAlias = json.loads(request.body.decode('utf-8')).get('playerAlias')
    print(f'request: {playerAlias}')
    # data_player = GameData.objects.filter(is_tournament_game=False)
    return JsonResponse({"message": "Data received successfully"})