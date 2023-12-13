from django.shortcuts import render, redirect
from .models import GameData
from datetime import datetime
import time

# Create your views here.

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

# database...
def add_game_data(p1n, p2n, p1s, p2s):
    print(f"Incoming arguments: p1n={p1n}, p2n={p2n}, p1s={p1s}, p2s={p2s}")
    start_time = time.time() - 20 # where to place this in code?
    end_time = time.time()
    if p1n and p2n and p1s and p2s:
        game_data = GameData(
            player1_name=p1n,
            player2_name=p2n,
            player1_points=p1s,
            player2_points=p2s,
            game_end_timestamp=datetime.fromtimestamp(time.time()),
            game_duration_secs=end_time - start_time,
            is_tournament_game=True
        )
        game_data.save()
        # saved_data = GameData.objects.get(id=1)
        # print("Saved data from the database:")
        # print(f"Player 1 Name: {saved_data.player1_name}")
        # print(f"Player 2 Name: {saved_data.player2_name}")
        # print(f"Player 1 Points: {saved_data.player1_points}")
        # print(f"Player 2 Points: {saved_data.player2_points}")