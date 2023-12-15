from django.shortcuts import render, redirect
from .models import GameData, TournamentData
import time
from datetime import datetime

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

# database functions:

def add_game_data(p1n, p1s, p2n, p2s, gend, gdur, itg):
    if p1n is not None and p2n is not None and p1s is not None and p2s is not None:
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

def add_tournament_data(p1=None, p2=None, p3=None, p4=None, matchSemi1=None, matchSemi2=None, matchFinal=None, tend=None, tdur=None):
    # matchIdSemi1 = add_game_data(matchSemi1['p1n'], matchSemi1['p1s'], matchSemi1['p2n'], matchSemi1['p2s'], matchSemi1['gend'], matchSemi1['gdur'], matchSemi1['itg'])
    # matchIdSemi2 = add_game_data(matchSemi2['p1n'], matchSemi2['p1s'], matchSemi2['p2n'], matchSemi2['p2s'], matchSemi2['gend'], matchSemi2['gdur'], matchSemi2['itg'])
    # matchIdFinal = add_game_data(matchFinal['p1n'], matchFinal['p1s'], matchFinal['p2n'], matchFinal['p2s'], matchFinal['gend'], matchFinal['gdur'], matchFinal['itg'])
    # tournament_data = TournamentData(
    #     match_id_semi_1=matchIdSemi1,
    #     match_id_semi_2=matchIdSemi2,
    #     match_id_final=matchIdFinal,
    #     tournament_end_timestamp=tend,
    #     tournament_duration_secs=tdur,
    #)
    tournament_data = TournamentData(
        match_id_semi_1=1,
        match_id_semi_2=2,
        match_id_final=3,
        tournament_end_timestamp=datetime.fromtimestamp(time.time()),
        tournament_duration_secs=30,
    )
    tournament_data.save()