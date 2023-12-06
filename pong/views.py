from django.shortcuts import render, redirect

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
    choice = request.GET.get("choice") # get the choice from the url
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
    return render(request, "pong/play_remote.html")
