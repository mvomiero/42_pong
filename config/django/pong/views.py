from django.shortcuts import render, redirect
from .models import GameData, TournamentData
import time
import pytz
from datetime import datetime
from django.http import JsonResponse    # NEW FOR CHARTS (http response)
from django.db.models import Avg, Count, CharField, Case, F, FloatField, IntegerField, Max, Q, Sum, Value, When  # NEW FOR CHARTS (database query)
from django.db.models.functions import ExtractWeekDay, TruncHour   # NEW FOR CHARTS (database query)
from itertools import chain
from collections import Counter
import json

from itertools import groupby
from operator import itemgetter
from django.db.models import Subquery, OuterRef

from .deploy_sepo import deploy_sepo
from asgiref.sync import sync_to_async

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
async def add_game_data(p1n, p1s, p2n, p2s, gend, gdur, itg):
    if p1n is not None and p2n is not None and p1s is not None and p2s is not None:
        game_result = p1n + ", " + str(p1s) + ", " + p2n + ", " + str(p2s)
        tx_hash = await deploy_sepo(game_result)
        # tx_hash = "olalal"
        print(f"tx_hash in views.py: {tx_hash} and the game_result is {game_result}!!!!!!!!!!!!!!!!!")
        gend = (pytz.timezone('UTC')).localize(gend)
        game_data = GameData(
            player1_name=p1n,
            player1_points=p1s,
            player2_name=p2n,
            player2_points=p2s,
            game_end_timestamp=gend,
            game_duration_secs=gdur,
            is_tournament_game=itg,
            blockchain_hash=tx_hash,
        )
        try:
            game_data.save()
        except Exception as e:
            print(f"Error saving game data: {e}")
        return game_data.id

# format dates:
#     games (e.g. match['endTime']) = floating point number / POSIX timestamp (e.g. time.time())
#     tournaments (tend) = datetime object (e.g. datetime.fromtimestamp(time.time())
#     durations (e.g. tdur) = number (e.g. 10)
async def add_tournament_data(semiMatch1, semiMatch2, finalMatch, playersRank, tend, tdur):
    gend = datetime.fromtimestamp(semiMatch1['endTime'])
    gdur = semiMatch1['endTime'] - semiMatch1['startTime']
    matchIdSemi1 = await add_game_data(semiMatch1['players'][0], semiMatch1['score'][0], semiMatch1['players'][1], semiMatch1['score'][1], gend, gdur, True)
    gend = datetime.fromtimestamp(semiMatch2['endTime'])
    gdur = semiMatch2['endTime'] - semiMatch2['startTime']
    matchIdSemi2 = await add_game_data(semiMatch2['players'][0], semiMatch2['score'][0], semiMatch2['players'][1], semiMatch2['score'][1], gend, gdur, True)
    gend = datetime.fromtimestamp(finalMatch['endTime'])
    gdur = finalMatch['endTime'] - finalMatch['startTime']
    matchIdFinal = await add_game_data(finalMatch['players'][0], finalMatch['score'][0], finalMatch['players'][1], finalMatch['score'][1], gend, gdur, True)
    tend = (pytz.timezone('UTC')).localize(tend)
    # hash = '#hash'
    tour_result = str(matchIdSemi1) + ", " + str(matchIdSemi2) + ", " + str(matchIdFinal) + ", " + str(playersRank)
    tx_hash = await deploy_sepo(tour_result)
    tournament_data = TournamentData(
        match_id_semi_1=matchIdSemi1,
        match_id_semi_2=matchIdSemi2,
        match_id_final=matchIdFinal,
        tournament_end_timestamp=tend,
        tournament_duration_secs=tdur,
        player_ranking = playersRank,
        # blockchain_hash = "xiixixixixxi"
        blockchain_hash=tx_hash,
    )
    try:
        tournament_data.save()
        await TournamentData.commit()
    except Exception as e:
        print(f"Error saving tournament data: {e}")

# NEW FOR DASHBOARD:
    
# Chart Data: Number of Entries per Day
def chart_entriesPerDay(data, end_timestamp):
    # Aggregate game data by day of the week and count amount
    matches_per_day = data.annotate(
        day_of_week=ExtractWeekDay(end_timestamp)
    ).values('day_of_week').annotate(
        total_games=Count('id')
    ).order_by('day_of_week')

    # Prepare the data for the chart / response
    chart_data = {}
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    for day_name in day_names:
        chart_data[day_name] = 0
    for entry in matches_per_day:
        # Assuming 'day_of_week' is returned as 1 for Monday, 2 for Tuesday, etc.
        day_index = (entry['day_of_week'] + 5) % 7
        day_name = day_names[day_index]  # Adjust index to start from 0
        chart_data[day_name] = entry['total_games']
    
    return chart_data


# Chart Data: Accumulated Playing Time per timestamp/day
def chart_accumulatedPlayingTime(data, end_timestamp, duration_secs):
    # Calculate the total duration for each day
    daily_playing_time = data.values(end_timestamp + '__date').annotate(
        total_duration=Sum(duration_secs)
    )

    # Create a dictionary with date as key and total duration as value
    chart_data = {entry[end_timestamp + '__date'].strftime('%d.%m.%Y'): entry['total_duration'] / 60.0 for entry in daily_playing_time}
    
    return chart_data


# Chart Data: Number of Entries per Hour (0-24)
def chart_EntriesPerHour(data, end_timestamp):
    chart_data = {}
    for hour in range(0, 24):
        chart_data[f'{hour:02d}:00'] = 0
    for entry in data:
        timestamp_value = getattr(entry, end_timestamp).strftime('%H:00')
        chart_data[timestamp_value] += 1

    return chart_data


# Chart Data: All Durations for Scatter Chart
def chart_allDurations(data, end_timestamp, duration_secs):
    # Query to get individual game durations for a specific date
    games_by_day = (
        data
        .values(end_timestamp + '__date', duration_secs)
    )
    
    # Convert queryset to dictionary with date as key and list of durations as value
    chart_data = []
    for entry in games_by_day:
        date_key = entry[end_timestamp + '__date'].strftime('%d.%m.%Y')
        duration_value = entry[duration_secs]
        chart_data.append({'x': date_key, 'y': duration_value})
    
    return chart_data


# Chart Data: Average Duration per timestamp/day
def chart_avgDuration(data, end_timestamp, duration_secs):
    # Query to get individual game durations for a specific date
    games_by_day = (
        data
        .values(end_timestamp + '__date', duration_secs)
    )

    # Annotate average game duration for each day
    average_duration_by_day = games_by_day.values(end_timestamp + '__date').annotate(avg_duration=Avg(duration_secs))

    # Store into a dictionary
    chart_data = {entry[end_timestamp + '__date'].strftime('%d.%m.%Y'): entry['avg_duration'] for entry in list(average_duration_by_day)}

    return chart_data


# GET request for dashboard 'Match' data
def get_dashboardMatch_data(request):
    # Data for NON tournament games
    game_data = GameData.objects.filter(is_tournament_game=False)

    """ Chart data: Matches per Day """
    bar_chart_data = chart_entriesPerDay(game_data, 'game_end_timestamp')
    

    """ Chart Data: Accumulated Playing Time per timestamp/day """
    area_chart_data = chart_accumulatedPlayingTime(game_data, 'game_end_timestamp', 'game_duration_secs')
    

    """ Chart Data: Number of Matches per Hour """
    line_chart_data = chart_EntriesPerHour(game_data, 'game_end_timestamp')
    

    """ Chart Data: listing of all matches and their duration """
    scattered_chart_data = chart_allDurations(game_data, 'game_end_timestamp', 'game_duration_secs')
    

    """ Chart Data: Average Duration of matches per day) """
    line_chart_data2 = chart_avgDuration(game_data, 'game_end_timestamp', 'game_duration_secs')
    

    """ Data for the Cards (Matches) """
    player1_names = game_data.values_list('player1_name', flat=True).distinct()
    player2_names = game_data.values_list('player2_name', flat=True).distinct()
    nbr_unique_players = len(list(set(chain(player1_names, player2_names))))
    
    nbr_matches = game_data.count()

    # match_time = game_data.aggregate(total_match_time=Sum('game_duration_secs')).get('total_match_time', 0)
    match_time_aggregate = game_data.aggregate(total_match_time=Sum('game_duration_secs'))
    match_time = match_time_aggregate.get('total_match_time', 0) if match_time_aggregate is not None else 0
    # match_time = match_time_aggregate['total_match_time'] if match_time_aggregate['total_match_time'] is not None else 0
    total_match_time = {
        'hours': match_time // 3600 if match_time is not None else 0,
        # 'minutes': (match_time % 3600) // 60,
        # 'seconds': (match_time % 3600) % 60
        'minutes': divmod(match_time % 3600, 60) if match_time is not None else 0,
        'seconds': match_time % 60 if match_time is not None else 0,
    }
    # total_match_time = {
    #     'hours': 2,
    #     'minutes': 2,
    #     'seconds': 15,
    # }
    single_match_time = game_data.aggregate(longest_match_time=Max('game_duration_secs')).get('longest_match_time', 0)
    longest_match_time = {
        'minutes': single_match_time // 60 if single_match_time is not None else 0,
        'seconds': single_match_time % 60 if single_match_time is not None else 0,
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
    if succ_player:
        bestPlayer = {
            'alias': succ_player[0][0],
            'wins': succ_player[0][1]
        }
    else:
        bestPlayer = {
            'alias': "Unknown",
            'wins': 0  # You can choose an appropriate default value
        }
    # bestPlayer = {
    #     'alias': succ_player[0][0],
    #     'wins': succ_player[0][1]
    # }

    """ Player with highest play time """
    # Aggregate the total playing time for player1_name and player2_name and combine the datasets
    player1_total_time = (
        game_data
        .values('player1_name')
        .annotate(total_time=Sum('game_duration_secs'))
    )
    player2_total_time = (
        game_data
        .values('player2_name')
        .annotate(total_time=Sum('game_duration_secs'))
    )
    combined_data = list(player1_total_time) + list(player2_total_time)
    
    # Merge the durations for each player
    player_durations = {}
    for data in combined_data:
        player_name = data['player1_name'] if 'player1_name' in data else data['player2_name']
        player_durations[player_name] = player_durations.get(player_name, 0) + data['total_time']
    if player_durations:
        highest_time_player = {
            'alias': max(player_durations, key=player_durations.get),
            'time': {
                'minutes': player_durations[max(player_durations, key=player_durations.get)] // 60,
                'seconds': player_durations[max(player_durations, key=player_durations.get)] % 60
            }
    }

    # Prepare the response and return it as JSON
    highest_time_player = {}
    response_data = {
        'barChart1': bar_chart_data,
        'areaChart1': area_chart_data,
        'lineChart1': line_chart_data,
        'scatteredChart1': scattered_chart_data,
        'lineChart2': line_chart_data2,
        'cards': {
            'uniquePlayers': nbr_unique_players,
            'nbrMatches': nbr_matches,
            'totalMatchTime': total_match_time,
            'longestMatchTime': longest_match_time,
            'bestPlayer': bestPlayer,
            'highestTimePlayer': highest_time_player
        },
    }
    return JsonResponse(response_data)


# GET request for dashboard 'Tournament' data
def get_dashboardTournament_data(request):
    # Data for tournament games
    game_data = GameData.objects.all().filter(is_tournament_game=True)
    tournament_data = TournamentData.objects.all()


    """ Chart data: Tournaments per Day """
    chart_TournamentsPerDay = chart_entriesPerDay(tournament_data, 'tournament_end_timestamp')


    """ Chart Data: Accumulated Playing Time per timestamp/day """
    chart_AccPlayingTime = chart_accumulatedPlayingTime(tournament_data, 'tournament_end_timestamp', 'tournament_duration_secs')
    

    """ Chart Data: Number of Tournaments per Hour """
    chart_TournamentsPerHour = chart_EntriesPerHour(tournament_data, 'tournament_end_timestamp')


    """ Chart Data: listing of all tournaments and their duration """
    chart_allTournamentDurations = chart_allDurations(tournament_data, 'tournament_end_timestamp', 'tournament_duration_secs')


    """ Chart Data: average duration of tournaments per day """
    chart_avgTournamentDurations = chart_avgDuration(tournament_data, 'tournament_end_timestamp', 'tournament_duration_secs')


    """ Data for the Cards (Tournaments) """
    # "different Players participated"
    players_query = tournament_data.values_list('player_ranking', flat=True)
    all_players = [player for sublist in players_query for player in sublist]
    # print(f'all_players={all_players}')
    nbr_unique_players = len(list(set(all_players)))

    # "Tournaments played"
    nbr_tournaments = tournament_data.count()
    print(f'nbr_tournaments={nbr_tournaments}')

    # match_time = tournament_data.aggregate(total_match_time=Sum('tournament_duration_secs')).get('total_match_time', 0)
    match_time_aggregate = tournament_data.aggregate(total_tournament_time=Sum('tournament_duration_secs'))
    match_time = match_time_aggregate.get('total_match_time', 0) if match_time_aggregate is not None else 0
    # match_time = match_time_aggregate['total_match_time'] if match_time_aggregate['total_match_time'] is not None else 0
    total_tournament_time = {
        'hours': match_time // 3600,
        'minutes': divmod(match_time % 3600, 60) if match_time is not None else 0,
        'seconds': match_time % 60,
        # 'minutes': (match_time % 3600) // 60,
        # 'seconds': (match_time % 3600) % 60
    }
    # total_tournament_time = {
    #     'hours': 2,
    #     'minutes': 2,
    #     'seconds': 15,
    # }

    # "Longest Tournament"
    single_match_time = tournament_data.aggregate(longest_match_time=Max('tournament_duration_secs')).get('longest_match_time', 0)
    longest_tournament_time = {
        'minutes': single_match_time // 60 if single_match_time is not None else 0,
        'seconds': single_match_time % 60 if single_match_time is not None else 0,
    }

    # "Player with most wins"
    first_players = [players[0] for players in tournament_data.values_list('player_ranking', flat=True)]
    if first_players:
        player_counts = Counter(first_players).most_common(1)[0]
        if player_counts:
            bestPlayer = {
            'alias': player_counts[0],
            'wins': player_counts[1]
            }
        else:
            bestPlayer = {
            'alias': "Unknown",
            'wins': 0             
            }
    # bestPlayer = {
    #     'alias': player_counts[0],
    #     'wins': player_counts[1]
    # }

    # "Player with highest play time"
    aggreagted_duration = (
        tournament_data
        .values('player_ranking')
        .annotate(total_time=F('tournament_duration_secs'))
    )
    player_duration = {}
    for data in aggreagted_duration:
        for player in data['player_ranking']:
            player_duration[player] = player_duration.get(player, 0) + data['total_time']
    if player_duration:
        max_player = max(player_duration, key=player_duration.get)
        if max_player:
            print(f'max_player={max_player}')

    highest_time_player = {}
    if player_duration:
        max_player_alias = max(player_duration, key=player_duration.get)
        max_player_time_minutes = player_duration[max_player_alias] // 60
        max_player_time_seconds = player_duration[max_player_alias] % 60
        highest_time_player = {
            'alias': max_player_alias,
            'time': {
                'minutes': max_player_time_minutes,
                'seconds': max_player_time_seconds,
            }
        }
    else:
        highest_time_player = {
            'alias': "Unknown",
            'time':{
                'minutes': 0,
                'seconds': 0
            }
        }
    # highest_time_player = {
    #     'alias': max(player_duration, key=player_duration.get),
    #     'time': {
    #         'minutes': player_duration[max(player_duration, key=player_duration.get)] // 60,
    #         'seconds': player_duration[max(player_duration, key=player_duration.get)] % 60
    #     }
    # }

    bestPlayer = {
        'alias': "Unknown",
        'wins': 0
    }
    # Prepare the response and return it as JSON
    response_data = {
        'barChart1': chart_TournamentsPerDay,
        'areaChart1': chart_AccPlayingTime,
        'lineChart1': chart_TournamentsPerHour,
        'scatteredChart1': chart_allTournamentDurations,
        'lineChart2': chart_avgTournamentDurations,
        'allAndHash': TournamentData.get_all_blockchain_data(),
        'cards': {
            'uniquePlayers': nbr_unique_players,
            'nbrMatches': nbr_tournaments,
            'totalMatchTime': total_tournament_time,
            'longestMatchTime': longest_tournament_time,
            'bestPlayer': bestPlayer,
            'highestTimePlayer': highest_time_player
        },
    }
    return JsonResponse(response_data)


# GET request for list of all players
def get_dashboardPlayer_list(request):
    # Data for NON tournament games
    db_data = GameData.objects

    # Create a list of all players
    allPlayers = list(set(chain(db_data.values_list('player1_name', flat=True).distinct(), 
                                db_data.values_list('player2_name', flat=True).distinct())))
    
    # Prepare the response and return it as JSON
    response_data = {
        'playerList': allPlayers
    }
    return JsonResponse(response_data)


# POST request for player specific dashboard
def get_dashboard_data_player(request):
    # Retrieve player alias from POST request
    playerAlias = json.loads(request.body.decode('utf-8')).get('playerAlias')
    print(f'\n\nplayerAlias={playerAlias}')

    # Data for player
    player_matches = GameData.objects.filter(Q(player1_name=playerAlias) | Q(player2_name=playerAlias))
    print(f'player_matches={player_matches}')
    player_tournaments = TournamentData.objects.filter(Q(player_ranking__icontains=playerAlias))
    print(f'player_tournaments={player_tournaments}')
    

    """ Data for the Chart """
    player_wins = player_matches.annotate(
        winner_name=Case(
            When(player1_points=11, then=F('player1_name')),
            When(player2_points=11, then=F('player2_name')),
            output_field=CharField(),
        )
    ).values_list('winner_name', flat=True)
    nbr_wins = player_wins.filter(winner_name=playerAlias).count()
    nbr_losses = player_wins.exclude(winner_name=playerAlias).count()

    percentage_wins = nbr_wins / player_matches.count() * 100
    percentage_losses = nbr_losses / player_matches.count() * 100

    chart_pieWin = {
        'Wins': percentage_wins, 
        'Losses': percentage_losses,
    }
    chart_pieLoss = {
        'Losses': percentage_losses, 
        'Wins': percentage_wins,
    }

    """ Data for Tournament Ranks """
    chart_pieRanks = {}
    if player_tournaments.count() > 0:
        wins = player_tournaments.filter(player_ranking__0=playerAlias).count() / player_tournaments.count() * 100
        finals = player_tournaments.filter(player_ranking__1=playerAlias).count() / player_tournaments.count() * 100
        other = player_tournaments.filter(Q(player_ranking__2=playerAlias) | Q(player_ranking__3=playerAlias)).count() / player_tournaments.count() * 100
        chart_pieRanks = {
            'Wins': wins,
            'Finals': finals,
            'Other': other,
        }

    """ Data for number of matches """
    nbr_matches = player_matches.count()

    """ Data for average points """
    totalPoints = (
        player_matches
        .aggregate(
            total_points=Sum(
                Case(
                    When(player1_name=playerAlias, then=F('player1_points')),
                    When(player2_name=playerAlias, then=F('player2_points')),
                    default=0,
                    output_field=IntegerField()
                )
            )
        )
    )['total_points']
    avg_points = totalPoints / player_matches.count()

    """ Data for number of perfect matches """
    nbr_perfect_matches = player_matches.filter(
        Q(player1_points=11, player2_points=0, player1_name=playerAlias) | Q(player1_points=0, player2_points=11, player2_name=playerAlias)
    ).count()

    """ Data for number of tournaments """
    nbr_tournaments = player_tournaments.count()

    """ Data for longest match """
    longest_game = GameData.objects.order_by('-game_duration_secs').first()
    longest_match = {}
    if longest_game:
        longest_match = {
            'oponent': longest_game.player1_name if longest_game.player1_name != playerAlias else longest_game.player2_name,
            'duration': {
                'minutes': longest_game.game_duration_secs // 60,
                'seconds': longest_game.game_duration_secs % 60
            },
            'score': {
                'player': longest_game.player1_points if longest_game.player1_name == playerAlias else longest_game.player2_points,
                'oponent': longest_game.player2_points if longest_game.player1_name == playerAlias else longest_game.player1_points,
            }
        }

    """ Data for shortest match """
    shortest_game = GameData.objects.order_by('-game_duration_secs').last()
    shortest_match = {}
    if shortest_game:
        shortest_match = {
            'oponent': shortest_game.player1_name if shortest_game.player1_name != playerAlias else shortest_game.player2_name,
            'duration': {
                'minutes': shortest_game.game_duration_secs // 60,
                'seconds': shortest_game.game_duration_secs % 60
            },
            'score': {
                'player': shortest_game.player1_points if shortest_game.player1_name == playerAlias else shortest_game.player2_points,
                'oponent': shortest_game.player2_points if shortest_game.player1_name == playerAlias else shortest_game.player1_points,
            }
        }

    # Prepare the response and return it as JSON
    response_data = {
        'pieWin': chart_pieWin,
        'pieLoss': chart_pieLoss,
        'pieTournamentRank': chart_pieRanks,
        'cards': {
            'nbrWins': nbr_wins,
            'nbrMatches': nbr_matches,
            'avgPoints': avg_points,
            'nbrPerfectMatches': nbr_perfect_matches,
            'nbrTournaments': nbr_tournaments,
            'longestMatch': longest_match,
            'shortestMatch': shortest_match,
        },
    }
    print(f'response_data={response_data}')
    return JsonResponse(response_data)
