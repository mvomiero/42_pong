#pong/consumers.py

import json
import time
from .webSocket_msg_create import *
# from .webSocket_msg_transmit import *
from channels.generic.websocket import AsyncJsonWebsocketConsumer

# 1) 1. player joins -> create group_tournament && send message to player1 with player ID
# 2) 2. & 3. player join -> add to group_tournament
# 3) 4. player join -> add to group_tournament && broadcast message to all players in group_tournament
# 4) make match-plan (create group_match1 with p1 & p2 & group_match2 with p3 & p4) -> broadcast message with tournament plan
# 5) [Frontend] start playing matches -> broadcast message with match current status 
# 6) [Frontend] match finished -> broadcast message with match result
# 7) delete group_match -> [Frontend] broadcast message with tournament result (semi-final results)
# 8) create group_matchFinal -> broadcast message with final match
# 9) [Frontend] start playing matches -> broadcast message with match current status 
# 10) [Frontend] match finished -> broadcast message with match result
# 11) delete group_match -> [Frontend] broadcast message with tournament result (semi-final results)
# 12) delete group_tournament -> [Frontend] broadcast message with tournament result (semi-final results)
# 13) [Frontend] disconnect player
# check at all times, that no players left (still 4 players in the group_tournament) -> if left: close tournament
# check at connect that we don't have duplicates in alias (player name)
class PongConsumer(AsyncJsonWebsocketConsumer):

    connected_users = {}  # Dictionary to store connected users and their connections
                # connected_users = {
                    # 'player1': {
                    #     'channel_name':       ['specific..inmemory!lwBXeBBUxaub'],
                    #     'match_id':           [0]
                    #     'tournament_id':      [None]
                    # },
                    # 'player2': {
                    #     'channel_name':       ['specific..inmemory!qGPfepkBTNdx'],
                    #     'match_id':           [2]
                    #     'tournament_id':      [0]
                    # },
                # }
    set_matches = {}  # Dictionary to store matches and their players
                # set_matches = {
                    # 'id1': {
                    #     'players':    ['player1', 'player2'],
                    #     'tournament': ['tournament_id'],
                    #     'score':      [0, 0],
                    #     'group_name': ['match_1'],
                    #     'startTime':  None,           # None if not started yet
                    #     'endTime':    None,
                    #     'finished':   [False]
                    # },
                    # 'id2': {
                    #     'players':    ['player3', 'player4'],
                    #     'tournament': ['None'],       # "None" if not part of a tournament
                    #     'score':      [0, 3],
                    #     'group_name': ['match_2'],
                    #     'startTime':  <timestamp>,
                    #     'endTime':    <timestamp>,
                    #     'finished':   [True]
                    # },

    set_tournaments = {}  # Dictionary to store tournaments and their matches
                # set_tournaments = {
                    # 'id1': {
                    #     'players':     ['player1', 'player2', 'player3', 'player4'],
                    #     'matchesSemi': ['match1', 'match2'],
                    #     'matchFinal':  ['match3'],
                    #     'group_name':  ['tournament_1'],
                    #     'startTime':   <timestamp>,
                    #     'endTime':     None,          # None if not started yet
                    # },
                    # 'id2': {
                    #     'players':     ['player5', 'player6'],
                    #     'matchesSemi': [None, None],
                    #     'matchFinal':  [None],
                    #     'group_name':  ['tournament_2'],
                    #     'startTime':   <timestamp>,
                    #     'endTime':     <timestamp>,
                    # },


    # ************************************************************ #
    # *********** ESTABLISH NEW WEBSOCKET CONNECTION ************* #
    # ************************************************************ #
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['game_mode']
        self.player = self.scope['url_route']['kwargs']['player']
        self.group_name_match = None
        self.group_name_tournament = None
        self.tournament_id = None
        self.match_id = None

        print(f"room_code: {self.room_code}")
        print(f"player: {self.player}")
        
        await self.accept()
        await self.send_to_self(set_player(self.player))

        # Reject connection if player already exists
        if self.player in self.connected_users:
            print(f"Player {self.player} already exists.")
            await self.reject_connection(3000)
            return

        # Add the player to a match or tournament
        if self.room_code == "match":
            if not await self.add_playerRemoteMatch(self.room_code):
                return
        elif self.room_code == "tournament":
            if not await self.add_player_to_tournament(self.room_code):
                self.reject_connection(3001)
                return

        # print("Closing connection.")
        # await self.disconnect(500)
        # await self.close(code=2)

        # group_size = len(self.channel_layer.groups.get(self.group_name_match, {}).items())
        # print(f"The size of group '{self.group_name_match}' is: {group_size}")



    # ************************************************************ #
    # ***************** LOGIC PLAYER MATCHMAKING ***************** #
    # ************************************************************ #
    async def add_playerRemoteMatch(self, room_code):

        # Find the first match ID with only one player
        match_id = None
        for id, data in self.set_matches.items():
            if len(data['players']) == 1 and data['tournament'] is None:
                match_id = id
                break

        # Reject if set_matches is full
        if match_id is None and await self.is_setMatchFull():
            print("set_matches is full.")
            self.reject_connection(507)
            return False

        if match_id is None:  # create a new match
            match_id = await self.get_newMatchID()
            group_name_match = await self.create_newMatch(match_id)
            print(f"Created new match ({match_id}): {self.set_matches[match_id]}")
        else:
            group_name_match = self.set_matches[match_id]['group_name']
        await self.add_playerToMatch(match_id)
        print(f"Added player to match ({match_id}): {self.set_matches[match_id]}")

        # Add player to the dictionary
        await self.add_playerToConnectedUsers(self.match_id, None)
        print(f"Added player to connected_users: {self.connected_users}")
        
        # Add player to the group
        await self.add_playerToGroup(self.set_matches[match_id]['group_name'])
        self.group_name_match = group_name_match

        # Broadcast 'match start' info to all players if match is full
        if len(self.set_matches[match_id]['players']) == 2:
            print(f"Broadcast message match start to group {self.set_matches[match_id]['group_name']}")
            self.set_matches[match_id]['startTime'] = self.get_currentTimestamp()
            print(f"self.set_matches: {self.set_matches}")
            await self.send_to_group(match_info('start', self.set_matches[match_id]['players']), self.set_matches[match_id]['group_name'])

        return True



    # ************************************************************ #
    # *************** LOGIC TOURNAMENT MATCHMAKING *************** #
    # ************************************************************ #
    async def add_player_to_tournament(self, room_code):
        max_nbr_tournaments = 1000   # important to avoid overflow and undefined behavior with set_tournaments
        players_per_tournament = 4

        # Find the first tournament ID with less than <players_per_tournament> players
        open_tournament = None
        for id, data in self.set_tournaments.items():
            print(f"tournament_id: {id} | players: {data['players']} | len(players): {len(data['players'])}")
            if len(data['players']) < players_per_tournament:
                open_tournament = id
                break
        
        # Reject if set_tournaments is full
        if open_tournament is None and len(self.set_tournaments) >= max_nbr_tournaments:
            print("set_tournament is full.")
            self.reject_connection(507)
            return False

        id = open_tournament
        if id is None:  # create a new tournament
            # Find the smallest available ID for the new tournament
            id = 0
            while id in self.set_tournaments:
                id += 1
            self.set_tournaments[id] = {'players': [], 'matchesSemi': [], 'matchFinal': [], 'group_name': []}
            self.set_tournaments[id]['group_name'] = f'tournament_{id}'  # generate group name
            print(f"Created new tournament ({id}): {self.set_tournaments[id]}")
        self.set_tournaments[id]['players'].append(self.player)
        self.tournament_id = id
        print(f"Added player to tournament ({id}): {self.set_tournaments[id]}")

        # Store group_name of tournament for self
        self.group_name_tournament = self.set_tournaments[id]['group_name']
        print(f"group_name_tournament: {self.group_name_tournament}")

        # Add player to the dictionary connected_users
        await self.add_playerToConnectedUsers(None, self.tournament_id)
        print(f"Added player to connected_users: {self.connected_users}")

        # Add player to the group
        await self.add_playerToGroup(self.group_name_tournament)
        
        # Create new match for tournament or add user to existing match
        if len(self.set_tournaments[id]['players']) % 2 == 1:
            if await self.is_setMatchFull():
                return False    # TODO: behaviour if match is full
            match_id = await self.get_newMatchID()
            group_name_match = await self.create_newMatch(match_id, self.tournament_id)
            self.set_tournaments[id]['matchesSemi'].append(match_id)
            print(f"Created new match semifinal ({match_id}): {self.set_matches[match_id]}")
        else:
            match_id = self.set_tournaments[id]['matchesSemi'][-1]
            group_name_match = self.set_matches[match_id]['group_name']
        await self.add_playerToMatch(self.set_tournaments[id]['matchesSemi'][-1])
        print(f"Added player to match ({match_id}): {self.set_matches[match_id]}")
        await self.add_playerToConnectedUsers(match_id, None)
        print(f"Added player to connected_users: {self.connected_users}")
        await self.add_playerToGroup(group_name_match)
        self.group_name_match = group_name_match
        self.match_id = match_id

        # Broadcast tournament info to all players if tournament is full and start matches
        if len(self.set_tournaments[id]['players']) == players_per_tournament:
            # Create empty match for the final
            if await self.is_setMatchFull():
                return False    # TODO: behaviour if match is full
            match_id = await self.get_newMatchID()
            await self.create_newMatch(match_id, self.tournament_id)
            self.set_tournaments[id]['matchFinal'] = match_id
            print(f"Created new match final ({match_id}): {self.set_matches[match_id]}")
            print("Broadcasting messages to tournament and matches.")
            # Broadcast tournament info to all players
            id_semi1 = self.set_tournaments[id]['matchesSemi'][0]
            id_semi2 = self.set_tournaments[id]['matchesSemi'][1]
            await self.send_to_group(tournament_info('start', self.set_matches[id_semi1]['players'], self.set_matches[id_semi2]['players']), self.group_name_tournament)
            # Start match
            print(f"semi-final 1: {self.set_matches[id_semi1]}")
            print(f"semi-final 2: {self.set_matches[id_semi2]}")
            await self.send_to_group(match_info('start', self.set_matches[id_semi1]['players']), self.set_matches[id_semi1]['group_name'])
            await self.send_to_group(match_info('start', self.set_matches[id_semi2]['players']), self.set_matches[id_semi2]['group_name'])

        return True


    """ Check if a set_match is full """
    async def is_setMatchFull(self):
        max_nbr_games = 1000   # important to avoid overflow and undefined behavior with set_matches
        if len(self.set_matches) >= max_nbr_games:
            print("set_matches is full.")
            return True
        return False

    """ Get the smallest available ID for a new match """
    async def get_newMatchID(self):
        id = 0
        while id in self.set_matches:
            id += 1
        return id

    """ Create a new match (without players & group_name) """
    async def create_newMatch(self, match_id, tournament_id=None):
        self.set_matches[match_id] = {'players': [], 'tournament': [], 'score': [], 'group_name': [], 'finished': False}
        self.set_matches[match_id]['tournament'] = tournament_id
        self.set_matches[match_id]['score'] = [-1, -1]
        group_name_match = f'match_{match_id}'  # generate new group name
        self.set_matches[match_id]['group_name'] = group_name_match
        self.set_matches[match_id]['startTime'] = None
        self.set_matches[match_id]['endTime'] = None
        return group_name_match
    
    """ Append a player to a match """
    async def add_playerToMatch(self, match_id):
        self.set_matches[match_id]['players'].append(self.player)
        self.match_id = match_id

    """ Add a player to connected_users (if it doesn't exist)
        and update match_id and tournament_id """
    async def add_playerToConnectedUsers(self, match_id, tournament_id):
        if self.player not in self.connected_users:
            self.connected_users[self.player] = {'channel_name': [], 'match_id': [], 'tournament_id': []}
        self.connected_users[self.player]['channel_name'] = self.channel_name
        if match_id is not None:
            self.connected_users[self.player]['match_id'] = match_id
        if tournament_id is not None:
            self.connected_users[self.player]['tournament_id'] = tournament_id

    """ Add a player to a group / room """
    async def add_playerToGroup(self, group_name):
        if group_name is not None:
            await self.channel_layer.group_add(
                group_name,
                self.channel_name,
            )
    
    """ Discard a player from a group / room """
    async def discard_playerFromGroup(self, group_name):
        if group_name is not None:
            await self.channel_layer.group_discard(
                group_name,
                self.channel_name,
            )

    """ Get the current timestamp """
    def get_currentTimestamp(self):
        return time.time()

    """ Store the result of a match """
    def storeMatchScore(self, match_id, score):
        self.set_matches[match_id]['score'][0] = score['player1']
        self.set_matches[match_id]['score'][1] = score['player2']


    # ************************************************************ #
    # ********************* REJECT WEBSOCKET ********************* #
    # ************************************************************ #
    async def reject_connection(self, code):
        # print(f"Rejecting connection with code {code}.")
        # await self.accept()
        await self.close(code=code)


    # ************************************************************ #
    # ******************* DISCONNECT WEBSOCKET ******************* #
    # ************************************************************ #
    async def disconnect(self, close_code):
        # Remove the connection from the dictionaries when a user disconnects
        if self.group_name_match is None:
            print("No group_name_match found.")
            return
        user_id = self.player
        print(f"Disconnecting user {user_id} from channel name {self.channel_name}")
        if user_id in self.connected_users:
            print(f"USER: {self.connected_users[user_id]}")
            # Remove for Remote Game
            if self.connected_users[user_id]['tournament_id'] is None or self.connected_users[user_id]['tournament_id'] == []:
                # Remove user from match and delete match if empty
                match_id = self.connected_users[user_id]['match_id']
                if match_id is not None and match_id in self.set_matches and user_id in self.set_matches[match_id]['players']:
                    self.set_matches[match_id]['players'].remove(user_id)
                    if not self.set_matches[match_id]['players']:
                        self.set_matches[match_id].clear()
                        del self.set_matches[match_id]
            elif len(self.set_tournaments[self.connected_users[user_id]['tournament_id']]['players']) <= 1:
                # Remove user from tournament and delete tournament if empty
                tournament_id = self.connected_users[user_id]['tournament_id']
                if tournament_id is not None and tournament_id in self.set_tournaments and user_id in self.set_tournaments[tournament_id]['players']:
                    self.set_tournaments[tournament_id]['players'].remove(user_id)
                    if self.set_tournaments[tournament_id]['matchFinal']:
                        if self.set_tournaments[tournament_id]['matchFinal'] in self.set_matches:
                            self.set_matches[self.set_tournaments[tournament_id]['matchFinal']].clear()
                            del self.set_matches[self.set_tournaments[tournament_id]['matchFinal']]
                    nbr_matches = len(self.set_tournaments[tournament_id]['matchesSemi']) - 1
                    while nbr_matches >= 0:
                        if self.set_tournaments[tournament_id]['matchesSemi'][nbr_matches] in self.set_matches:
                            self.set_matches[self.set_tournaments[tournament_id]['matchesSemi'][nbr_matches]].clear()
                            del self.set_matches[self.set_tournaments[tournament_id]['matchesSemi'][nbr_matches]]
                        nbr_matches -= 1
                    if not self.set_tournaments[tournament_id]['players']:
                        self.set_tournaments[tournament_id].clear()
                        del self.set_tournaments[tournament_id]

            # Remove user from connected_users
            self.connected_users[user_id].clear()
            del self.connected_users[user_id]

            print(f"self.set_matches: {self.set_tournaments}")
            print(f"self.set_matches: {self.set_matches}")
            print(f"self.connected_users: {self.connected_users}")

        self.discard_playerFromGroup(self.group_name_match)
        self.discard_playerFromGroup(self.group_name_tournament)
        
        # Additional print statement at disconnection
        if user_id:
            print(f"User {user_id} disconnected from channel name {self.channel_name}")
        self.close(close_code)

    
    async def receive(self, text_data):
        """
        Receive message from WebSocket.
        Log/print the received JSON data and forward it to other clients.
        """

        received_data = json.loads(text_data)
        
        # Log/print the received JSON data
        # print("Received JSON data:", received_data)

        # [Match (Remote & Tournament)] broadcast match_info (update & end) to all players in the match_group
        if self.match_id is not None and received_data['command'] == "match_info" and (received_data['mode'] == "update" or received_data['mode'] == "end") and not self.set_matches[self.match_id]['finished']:
            await self.send_to_group(text_data, self.set_matches[self.match_id]['group_name'])
            if received_data['mode'] == "end":
                self.set_matches[self.match_id]['finished'] = True
                self.set_matches[self.match_id]['endTime'] = self.get_currentTimestamp()
                self.storeMatchScore(self.match_id, received_data['score'])
                print(f"FINISHED MATCH: {self.set_matches[self.match_id]}")
                # [TODO] disconnect players from match???
        
        # [Tournament] broadcast tournament_info if match_end is received and match-making players for the final
        if self.tournament_id is not None and received_data['command'] == "match_info" and received_data['mode'] == "end":
            tournament_mode = 'update'
            finalRank = None
            tournament = self.set_tournaments[self.tournament_id]
            # [match_info for Semi-Final]
            if self.match_id in tournament['matchesSemi']:
                self.match_id = tournament['matchFinal']
                await self.discard_playerFromGroup(self.group_name_match)
                self.group_name_match = self.set_matches[self.match_id]['group_name']
                # [self is winner of match] add self to players of final
                if received_data['winner'] is not None and self.player == received_data['winner']:
                    await self.add_playerToMatch(tournament['matchFinal'])
                await self.add_playerToGroup(self.set_matches[self.match_id]['group_name'])
                # [all 4 players in final group] broadcast match_info 'start'
                if len(self.channel_layer.groups.get(self.group_name_match, {}).items()) == 4:
                    await self.send_to_group(match_info('start', self.set_matches[tournament['matchFinal']]['players']), self.group_name_match)
            # [match_info for Final]
            elif self.match_id == tournament['matchFinal']:
                finalRank = await self.get_finalRankTournament(self.tournament_id)
                self.match_id = None
                self.discard_playerFromGroup(self.group_name_match)
                self.group_name_match = None
                tournament_mode = 'end'
            # [match_info for wrong match]
            else:
                print(f"Warning: Received match_info for wrong match ({self.player}, {self.match_id})")
            # [broadcast tournament_info]
            await self.send_to_group(tournament_info(tournament_mode, self.set_matches[tournament['matchesSemi'][0]]['players'], self.set_matches[tournament['matchesSemi'][1]]['players'], self.set_matches[tournament['matchFinal']]['players'], finalRank), self.group_name_tournament)

        # [...]
        if self.match_id is not None and (received_data['command'] == "update" or received_data['command'] == "gamePause") and self.set_matches[self.match_id]['finished'] == False:
            await self.send_to_group(text_data, self.group_name_match)


        # # Pass the received JSON data as is to other clients
        # if received_data['command'] != "match_info" and ('mode' not in received_data or received_data['mode'] != "end"):
        #     # print(f"Sending message to group {self.group_name_match}: {json.loads(text_data)}")
        #     await self.send_to_group(text_data, self.group_name_match)


    async def get_finalRankTournament(self, tournament_id):
        tournament = self.set_tournaments[tournament_id]
        matchFinal = self.set_matches[tournament['matchFinal']]
        matchSemi1 = self.set_matches[tournament['matchesSemi'][0]]
        matchSemi2 = self.set_matches[tournament['matchesSemi'][1]]
        finalRank = []
        if matchFinal['score'][0] > matchFinal['score'][1]:
            finalRank.append(matchFinal['players'][0])
            finalRank.append(matchFinal['players'][1])
        else:
            finalRank.append(matchFinal['players'][1])
            finalRank.append(matchFinal['players'][0])
        if matchSemi1['score'][0] > matchSemi1['score'][1]:
            finalRank.append(matchSemi1['players'][0])
        else:
            finalRank.append(matchSemi1['players'][1])
        if matchSemi2['score'][0] > matchSemi2['score'][1]:
            finalRank.append(matchSemi2['players'][0])
        else:
            finalRank.append(matchSemi2['players'][1])
        return finalRank


    async def send_to_self(self, data):
        """ Send message to self """
        await self.channel_layer.send(self.channel_name, {
            'type': 'send_message',
            'data': data
        })

    async def send_to_group(self, data, group_name):
        if group_name is not None:
            await self.channel_layer.group_send(group_name, {
                'type': 'send_message',
                'data': data
            })

    async def send_message(self, event):
        """ Send the group message to clients """
        # Retrieve the message from the event
        message = event['data']
        # Send the message to the client WebSocket
        if self.channel_layer.groups:
            await self.send(text_data=message)