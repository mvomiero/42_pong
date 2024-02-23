
import asyncio
from pong.match_setup import Match

class Tournament():
    def __init__(self):
        self.consumer_instances = []
        self.semi1 = None
        self.semi2 = None
        self.final = None
        self.player_quit = False
        self.group_name = None
        self.lock = asyncio.Lock()

    def player_missing(self):
        return len(self.consumer_instances) < 4
    
    def add_player(self, consumer):
        self.consumer_instances.append(consumer)
        
        match = self.get_match_semi()

        # add the player to the match
        match.add_player(consumer.player, consumer)

        # save the match and paddle (of self) instance
        consumer.match = match
        consumer.paddle = match.get_paddle(consumer.player)
    
    def get_match_semi(self):
        if self.semi1 is None:
            match = Match(self)
            match.group_name = f"match_{id(match)}"
            self.semi1 = match
        elif self.semi1.player_missing():
            match = self.semi1
        elif self.semi2 is None:
            match = Match(self)
            match.group_name = f"match_{id(match)}"
            self.semi2 = match
        elif self.semi2.player_missing():
            match = self.semi2
        
        return match

    def get_finalRank(self):
        if self.final is None or self.semi1 is None or self.semi2 is None:
            return []
        
        finalRank = self.final.get_finalRank()
        finalRank.extend(list(set(self.semi1.get_finalRank) - set(finalRank)))
        finalRank.extend(list(set(self.semi2.get_finalRank) - set(finalRank)))