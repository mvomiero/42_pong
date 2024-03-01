from pong.logger import logger
import json

logger = logger()

def match_data(ball, score, paddleLeft, paddleRight):
    list = {
        'command': 'match_data',
        'ball': {
            'x': ball.x,
            'y': ball.y,
            'z': ball.z,
        },
        'score': {
            'player1': score[0],
            'player2': score[1],
        },
        'paddleLeft': paddleLeft.y,
        'paddleRight': paddleRight.y,
    }
    return json.dumps(list)

def set_player(player_name):        # send after accepting the WebSocket connection
    logger.info(f"Setting player name {player_name}")
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
    if mode == 'start':
        logger.warn(f'Match start for players {players[0]}, {players[1]}')
    elif mode == 'end':
        logger.info(f'Match end for players {players[0]}, {players[1]}')
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
        logger.info(f'Score updated to {players[0]}, {score[0]} - {players[1]}, {score[1]}')
        list['score']['player1'] = score[0]
        list['score']['player2'] = score[1]
    if winner is not None:
        logger.warn(f'Player {winner} won the game')
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
        list['matchSemi1']['player1'] = matchSemi1.player1_name
        list['matchSemi1']['player2'] = matchSemi1.player2_name
    if matchSemi2 is not None:
        list['matchSemi2']['player1'] = matchSemi2.player1_name
        list['matchSemi2']['player2'] = matchSemi2.player2_name
    if matchFinal is not None:
        list['matchFinal']['player1'] = matchFinal.player1_name
        list['matchFinal']['player2'] = matchFinal.player2_name
    if playerRanking is not None and len(playerRanking) >= 4:
        list['playerRanking']['firstPosition'] = playerRanking[0]
        list['playerRanking']['secondPosition'] = playerRanking[1]
        list['playerRanking']['thirdPosition'] = playerRanking[2]
        list['playerRanking']['fourthPosition'] = playerRanking[3]
    return json.dumps(list)


