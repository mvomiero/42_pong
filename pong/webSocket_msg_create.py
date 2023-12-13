
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

def tournament_info(mode, matchSemi1=None, matchSemi2=None, matchFinal=None, playerRanking=None):
    list = {
        'command': 'tournament_info',
        'mode': mode, # 'start' || 'update' || 'end',
        'matchSemi1': {},
        'matchSemi2': {},
        'matchFinal': {},
        'playerRanking': {},
    }
    if matchSemi1 is not None:
        list['matchSemi1']['player1'] = matchSemi1[0]
        list['matchSemi1']['player2'] = matchSemi1[1]
    if matchSemi2 is not None:
        list['matchSemi2']['player1'] = matchSemi2[0]
        list['matchSemi2']['player2'] = matchSemi2[1]
    if matchFinal is not None:
        list['matchFinal']['player1'] = matchFinal[0]
        list['matchFinal']['player2'] = matchFinal[1]
    if playerRanking is not None:
        list['playerRanking']['firstPosition'] = playerRanking[0]
        list['playerRanking']['secondPosition'] = playerRanking[1]
        list['playerRanking']['thirdPosition'] = playerRanking[2]
        list['playerRanking']['fourthPosition'] = playerRanking[3]
    return json.dumps(list)


