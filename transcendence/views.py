from .models import GameData

def add_game_data(p1n, p2n, p1s, p2s):
    print(f"Incoming arguments: p1n={p1n}, p2n={p2n}, p1s={p1s}, p2s={p2s}")
    if p1n and p2n and p1s and p2s:
        game_data = GameData(
            player1_name=p1n,
            player2_name=p2n,
            player1_points=p1s,
            player2_points=p2s
        )
        game_data.save()
        saved_data = GameData.objects.get(id=1)
        print("Saved data from the database:")
        print(f"Player 1 Name: {saved_data.player1_name}")
        print(f"Player 2 Name: {saved_data.player2_name}")
        print(f"Player 1 Points: {saved_data.player1_points}")
        print(f"Player 2 Points: {saved_data.player2_points}")