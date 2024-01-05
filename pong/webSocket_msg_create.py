
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
# Remote Match:
    # -broadcast to the players in the match
def match_info(mode, players, score=None, winner=None):
    list = {
        'command': 'match_info',
        'mode': mode, # 'start' || 'update' || 'end',
        'player1': players[0],
        'player2': players[1],
        'score': {
            'player1': 0,
            'player2': 0,
        },
        'winner': None,
    }
    if score is not None:
        list['score']['player1'] = score[0]
        list['score']['player2'] = score[1]
    if winner is not None:
        list['winner'] = winner

    return json.dumps(list)

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
        list['matchSemi1']['player1'] = matchSemi1[0] if len(matchSemi1) > 0 else None
        list['matchSemi1']['player2'] = matchSemi1[1] if len(matchSemi1) > 0 else None
    if matchSemi2 is not None:
        list['matchSemi2']['player1'] = matchSemi2[0] if len(matchSemi2) > 0 else None
        list['matchSemi2']['player2'] = matchSemi2[1] if len(matchSemi2) > 0 else None
    if matchFinal is not None:
        list['matchFinal']['player1'] = matchFinal[0] if len(matchFinal) > 0 else None
        list['matchFinal']['player2'] = matchFinal[1] if len(matchFinal) > 1 else None
    if playerRanking is not None and len(playerRanking) >= 4:
        list['playerRanking']['firstPosition'] = playerRanking[0]
        list['playerRanking']['secondPosition'] = playerRanking[1]
        list['playerRanking']['thirdPosition'] = playerRanking[2]
        list['playerRanking']['fourthPosition'] = playerRanking[3]
    return json.dumps(list)


