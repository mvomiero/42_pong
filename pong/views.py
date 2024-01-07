from django.shortcuts import render, redirect
from .models import GameData, TournamentData
import time
import pytz
from datetime import datetime
from django.http import JsonResponse    # NEW FOR CHARTS (http response)
from django.db.models import Count                      # NEW FOR CHARTS (database query)
from django.db.models.functions import ExtractWeekDay   # NEW FOR CHARTS (database query)

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


# NEW FOR CHARTS:
def get_dashboard_data(request):
    # Aggregate game data by day of the week and count total games
    game_data = GameData.objects.annotate(
        day_of_week=ExtractWeekDay('game_end_timestamp')
    ).values('day_of_week').annotate(
        total_games=Count('id')
    ).order_by('day_of_week')

    print(f'game_data={game_data}')

    # Prepare the data in the format expected by the frontend chart
    chart_data = {}
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    for day_name in day_names:
        chart_data[day_name] = 0
    for entry in game_data:
        # Assuming 'day_of_week' is returned as 1 for Monday, 2 for Tuesday, etc.
        day_index = (entry['day_of_week'] + 5) % 7
        day_name = day_names[day_index]  # Adjust index to start from 0
        chart_data[day_name] = entry['total_games']

    print(f'chart_data={chart_data}')

    # Prepare the response and return it as JSON
    response_data = {'chart1': chart_data}
    return JsonResponse(response_data)

