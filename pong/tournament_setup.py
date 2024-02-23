
import asyncio
from pong.match_setup import Match

class Tournament():
    def __init__(self):
        self.consumer_instances = []
        self.semi1 = None
        self.semi2 = None
        self.final = None
        self.finalRank = None
        self.player_quit = False
        self.group_name = None
        self.lock = asyncio.Lock()
    
    def add_player(self, consumer):
        self.consumer_instances.append(consumer)