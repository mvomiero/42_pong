
import json


def set_player(player_name):        # send after accepting the WebSocket connection
    list = {
        'command': 'set_player',
        'player': player_name,      # player name
    }
    return json.dumps(list)

# tournament:
    # -semi-finals: broadcast to the players in the match
    # -final: broadcast to all players in the tournament
def match_start(players):       # send in match-making method (if two players are assigned to a match)
    list = {
        'command': 'match_start',
        'player1': players[0],
        'player2': players[1],
    }
    return json.dumps(list)

# def match_end(self, mode, event):         # Frontend->Backend: send when a match ends (Backend still broadcasts this message)
#     list = {
#         'command': 'match_info',
#         'mode': mode, # 'update' || 'end',
#         'score': {
#             'player1': 3,
#             'player2': 0,
#         },
#         'winner': player_alias,
#     }
#     return JsonResponse(list)

def tournament_info(self, mode, matchSemi1, matchSemi2, matchFinal, playerRanking):
    list = {
        'command': 'tournament_info',
        'mode': mode, # 'start' || 'update' || 'end',
        'matchSemi1': {
            'player1': self.set_matches[self.match_id]['players'][0],
            'player2': self.set_matches[self.match_id]['players'][1],
        },
        'matchSemi2': {
            'player1': self.set_matches[self.match_id]['players'][2],
            'player2': self.set_matches[self.match_id]['players'][3],
        },
        'matchFinal': {
            'player1': None,    # at beginning of tournament, no players have won any matches
            'player2': None,
        },
        'playerRanking': {
            'firstPosition': None,
            'secondPosition': None,
            'thirdPosition': None,
            'fourthPosition': None,
        },
    }
    return json.dumps(list)


