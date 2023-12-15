from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import GameData
from datetime import datetime
import time

def add_game_data(request, p1n, p1s, p2n, p2s):
    print(f"Incoming arguments: p1n={p1n}, p2n={p2n}, p1s={p1s}, p2s={p2s}")
    start_time = time.time() - 20
    end_time = time.time()
    if p1n and p2n and p1s and p2s:
        game_data = GameData(
            player1_name=p1n,
            player1_points=p1s,
            player2_name=p2n,
            player2_points=p2s,
            game_end_timestamp=datetime.fromtimestamp(time.time()),
            game_duration_secs=end_time - start_time,
            is_tournament_game=False,
            blockchain_hash=None
        )
        game_data.save()
        return HttpResponse(f"Record ID: {game_data.id}")