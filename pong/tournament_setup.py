
import asyncio
from pong.match_setup import Match

class Tournament():
    def __init__(self):
        self.consumer_instances = []
        self.semi1 = None
        self.semi2 = None
        self.final = None
        self.player_quit = False
        self.finished = False
        self.group_name = None
        self.lock = asyncio.Lock()

    def clear_tournament(self):
        self.consumer_instances = []
        self.semi1.clear_match()
        self.semi2.clear_match()
        self.final.clear_match()
        self.semi1 = None
        self.semi2 = None
        self.final = None
        self.group_name = None

    def player_missing(self):
        return len(self.consumer_instances) < 4
    
    def add_player(self, consumer):
        self.consumer_instances.append(consumer)
        
        match = self.get_match_semi()

        # add the player to the match
        match.add_player(consumer.player, consumer)

        # save the match and paddle instance
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
    
    def set_final(self):
        # get the winners of the semi-finals
        winner1_name = self.semi1.get_winner()
        winner2_name = self.semi2.get_winner()
        for consumer in self.consumer_instances:
            if consumer.player == winner1_name:
                player1 = consumer
            elif consumer.player == winner2_name:
                player2 = consumer
            
        # create the final match
        match = Match(self)
        match.group_name = f"match_{id(match)}"
        self.final = match

        # add the players to the match
        match.add_player(player1.player, player1)
        match.add_player(player2.player, player2)

        # save the match and paddle instance
        for consumer in self.consumer_instances:
            consumer.match = match
            if not (consumer.player == winner1_name or consumer.player == winner2_name):
                consumer.paddle = None
        player1.paddle = match.get_paddle(player1.player)
        player2.paddle = match.get_paddle(player2.player)
        

    def get_finalRank(self):
        if self.final is None or self.semi1 is None or self.semi2 is None:
            return []
        
        finalRank = self.final.get_finalRank()
        finalRank.extend(list(set(self.semi1.get_finalRank()) - set(finalRank)))
        finalRank.extend(list(set(self.semi2.get_finalRank()) - set(finalRank)))
        
        return finalRank