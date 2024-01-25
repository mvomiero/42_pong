#pong/consumers.py

import json, asyncio
from datetime import datetime
import time
from .webSocket_msg_create import *
# from .webSocket_msg_transmit import *
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from pong.views import add_game_data
from pong.views import add_tournament_data

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
                    #     'self':               self
                    # },
                    # 'player2': {
                    #     'channel_name':       ['specific..inmemory!qGPfepkBTNdx'],
                    #     'match_id':           [2]
                    #     'tournament_id':      [0]
                    #     'self':               self
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
                    #     'finished':    [False],
                    #     'lock':        asyncio.Lock(),
                    # },
                    # 'id2': {
                    #     'players':     ['player5', 'player6'],
                    #     'matchesSemi': [None, None],
                    #     'matchFinal':  [None],
                    #     'group_name':  ['tournament_2'],
                    #     'startTime':   <timestamp>,
                    #     'endTime':     <timestamp>,
                    #     'finished':    [True],
                    #     'lock':        asyncio.Lock(),
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
            await self.reject_connection(4001)
            return

        # Add the player to a match or tournament
        if self.room_code == "match":
            if not await self.add_playerRemoteMatch(self.room_code):
                return
        elif self.room_code == "tournament":
            if not await self.add_player_to_tournament(self.room_code):
                return

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
            self.reject_connection(4002)
            return False

        if match_id is None:  # create a new match
            match_id = await self.get_newMatchID()
            group_name_match = await self.create_newMatch(match_id)
            print(f"Created new match ({match_id}): {self.set_matches[match_id]}")
        else:
            group_name_match = self.set_matches[match_id]['group_name']
        await self.add_playerToMatch(match_id)
        #print(f"Added player to match ({match_id}): {self.set_matches[match_id]}")

        # Add player to the dictionary
        await self.add_playerToConnectedUsers(self.match_id, None)
        #print(f"Added player to connected_users: {self.connected_users}")
        
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
            self.reject_connection(4002)
            return False

        id = open_tournament
        if id is None:  # create a new tournament
            # Find the smallest available ID for the new tournament
            id = 0
            while id in self.set_tournaments:
                id += 1
            await self.create_newTournament(id)
        self.set_tournaments[id]['players'].append(self.player)
        self.tournament_id = id
        print(f"Added player to tournament ({id}): {self.set_tournaments[id]}")

        # Store group_name of tournament for self
        self.group_name_tournament = self.set_tournaments[id]['group_name']
        
        # Add player to the dictionary connected_users
        await self.add_playerToConnectedUsers(None, self.tournament_id)
        
        # Add player to the group
        await self.add_playerToGroup(self.group_name_tournament)
        
        # Create all three matches for the tournament
        if len(self.set_tournaments[id]['players']) == 1:
            while len(self.set_tournaments[id]['matchesSemi']) < 2:
                # Create empty match for the final
                if await self.is_setMatchFull():
                    for player in self.set_tournaments[id]['players']:
                        if self.connected_users[player]['self'] != self:
                            await PongConsumer.delete_connectedUsers(self.connected_users[player]['self'], 4002)
                    await self.delete_tournament(self.tournament_id)
                    await PongConsumer.delete_connectedUsers(self, 4002)
                    return False
                match_id = await self.get_newMatchID()
                await self.create_newMatch(match_id, self.tournament_id)
                self.set_tournaments[id]['matchesSemi'].append(match_id)
                print(f"Created new match semifinal ({match_id}): {self.set_matches[match_id]}")
            if await self.is_setMatchFull():
                for player in self.set_tournaments[id]['players']:
                    if self.connected_users[player]['self'] != self:
                        await PongConsumer.delete_connectedUsers(self.connected_users[player]['self'], 4002)
                await self.delete_tournament(self.tournament_id)
                await PongConsumer.delete_connectedUsers(self, 4002)
                return False
            match_id = await self.get_newMatchID()
            await self.create_newMatch(match_id, self.tournament_id)
            self.set_tournaments[id]['matchFinal'] = match_id
            print(f"Created new match final ({match_id}): {self.set_matches[match_id]}")


        # Add player to semi-final match
        if len(self.set_matches[self.set_tournaments[id]['matchesSemi'][0]]['players']) < 2:
            match_id = self.set_tournaments[id]['matchesSemi'][0]
        else:
            match_id = self.set_tournaments[id]['matchesSemi'][1]
        await self.add_playerToMatch(match_id)
        await self.add_playerToConnectedUsers(match_id, None)
        self.group_name_match = self.set_matches[match_id]['group_name']
        await self.add_playerToGroup(self.group_name_match)
        self.match_id = match_id

        # Broadcast tournament info to all players if tournament is full and start matches
        if len(self.set_tournaments[id]['players']) == players_per_tournament:
            # Broadcast tournament info to all players
            id_semi1 = self.set_tournaments[id]['matchesSemi'][0]
            id_semi2 = self.set_tournaments[id]['matchesSemi'][1]
            self.set_tournaments[id]['startTime'] = self.get_currentTimestamp()
            await self.send_to_group(tournament_info('start', self.set_matches[id_semi1]['players'], self.set_matches[id_semi2]['players']), self.group_name_tournament)
            # Start match
            print(f"[tournament - match_start] semi-final 1: {self.set_matches[id_semi1]}")
            print(f"[tournament - match_start] semi-final 2: {self.set_matches[id_semi2]}")
            self.set_matches[id_semi1]['startTime'] = self.get_currentTimestamp()
            self.set_matches[id_semi2]['startTime'] = self.get_currentTimestamp()
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
    
    """ Create a new tournament (without players & matches) """
    async def create_newTournament(self, tournament_id):
        self.set_tournaments[tournament_id] = {'players': [], 'matchesSemi': [], 'matchFinal': [], 'group_name': [], 'startTime': None, 'endTime': None, 'finished': False, 'lock': None}
        self.set_tournaments[tournament_id]['group_name'] = f'tournament_{tournament_id}'  # generate group name
        self.set_tournaments[tournament_id]['lock'] = asyncio.Lock()
        print(f"Created new tournament ({tournament_id}): {self.set_tournaments[tournament_id]}")
    
    """ Append a player to a match """
    async def add_playerToMatch(self, match_id):
        self.set_matches[match_id]['players'].append(self.player)
        self.match_id = match_id

    """ Add a player to connected_users (if it doesn't exist)
        and update match_id and tournament_id """
    async def add_playerToConnectedUsers(self, match_id, tournament_id):
        if self.player not in self.connected_users:
            self.connected_users[self.player] = {'channel_name': [], 'match_id': [], 'tournament_id': [], 'self': []}
        self.connected_users[self.player]['channel_name'] = self.channel_name
        if match_id is not None:
            self.connected_users[self.player]['match_id'] = match_id
        if tournament_id is not None:
            self.connected_users[self.player]['tournament_id'] = tournament_id
        self.connected_users[self.player]['self'] = self
        print(f"Added player to connected_users: {self.connected_users[self.player]}")

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

    """ Static method to discard a player from a group / room """
    @staticmethod
    async def discard_playerFromGroup_static(user, group_name):
        if group_name is not None:
            await user.channel_layer.group_discard(
                group_name,
                user.channel_name,
            )

    """ Get the current timestamp """
    def get_currentTimestamp(self):
        return time.time()

    """ Store the result of a match """
    def storeMatchScore(self, match_id, score):
        self.set_matches[match_id]['score'][0] = score['player1']
        self.set_matches[match_id]['score'][1] = score['player2']

    """ Send match data to database """
    async def send_matchToDatabase(self, match):
        p1n = match['players'][0]
        p2n = match['players'][1]
        p1s = match['score'][0]
        p2s = match['score'][1]
        gend = datetime.fromtimestamp(match['endTime'])
        gdur = match['endTime'] - match['startTime']
        if match['tournament'] is not None:
            itg = True
        else:
            itg = False
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: add_game_data(p1n, p1s, p2n, p2s, gend, gdur, itg))

    """ Send tournament data to database """
    async def send_tournamentToDatabase(self, tournament):
        semiMatch1 = self.set_matches[tournament['matchesSemi'][0]]
        semiMatch2 = self.set_matches[tournament['matchesSemi'][1]]
        finalMatch = self.set_matches[tournament['matchFinal']]
        playersRank = tournament['playersRank']
        tdur = tournament['endTime'] - tournament['startTime']
        tend = datetime.fromtimestamp(tournament['endTime'])
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: add_tournament_data(semiMatch1, semiMatch2, finalMatch, playersRank, tend, tdur))


    """ Delete a player from connected_users and close connection """
    @staticmethod
    async def delete_connectedUsers(user, code=None):
        if user is None:
            return
        
        user_id = user.player
        
        # Remove user from connected_users
        if user_id in user.connected_users:
            user.connected_users[user_id].clear()
            del user.connected_users[user_id]
        
        # Discard user from groups
        groups_copy = user.channel_layer.groups.copy()
        for group_name, group_members in groups_copy.items():
            # Check if the channel_name is a member of the group
            if user.channel_name in group_members:
                # Remove the channel_name from the group
                await PongConsumer.discard_playerFromGroup_static(user, group_name)

        # Close connection
        if code is not None:
            await user.reject_connection(code)

        print(f"Deleted user {user_id} with code {code}.")

        # Set user parameters to None
        user.room_code = None
        user.player = None
        user.group_name_match = None
        user.group_name_tournament = None
        user.tournament_id = None
        user.match_id = None


    """ Delete a match from set_matches """
    async def delete_match(self, match_id):
        # Clear and delete match
        if match_id is not None and match_id in self.set_matches:
            self.set_matches[match_id].clear()
            del self.set_matches[match_id]
    

    """ Delete a tournament from set_tournaments """
    async def delete_tournament(self, tournament_id):
        # Clear and delete tournament
        if tournament_id is not None and tournament_id in self.set_tournaments:
            for match_id in self.set_tournaments[tournament_id]['matchesSemi']:
                await self.delete_match(match_id)
            if self.set_tournaments[tournament_id]['matchFinal']:
                await self.delete_match(self.set_tournaments[tournament_id]['matchFinal'])
            self.set_tournaments[tournament_id].clear()
            del self.set_tournaments[tournament_id]
            
        
    """ Close the connection with a specific code """
    async def reject_connection(self, code):
        await self.close(code=code)


    # ************************************************************ #
    # ******************* DISCONNECT WEBSOCKET ******************* #
    # ************************************************************ #
    async def disconnect(self, close_code):
        if close_code != 1001:
            print(f"Connection closed by Client with close_code {close_code}")
        
        if self.player is None:
            print("No player found.")
            return

        channel_layer_group = self.channel_layer.groups.get(self.group_name_match, {})  # for check clean up
        groups_copy = self.channel_layer.groups.copy()
        
        # Clear and delete remote-match (including closing all players' connections)
        if self.tournament_id is None:
            if self.set_matches[self.match_id]['players'][0] != self.player:
                otherPlayer = self.set_matches[self.match_id]['players'][0]
            else:
                otherPlayer = self.set_matches[self.match_id]['players'][1]
            await PongConsumer.delete_connectedUsers(self.connected_users[otherPlayer]['self'], 4005)
            await self.delete_match(self.match_id)
            await PongConsumer.delete_connectedUsers(self, 4005)
            
        # Clear and delete tournament (including closing all players' connections and matches)
        if self.tournament_id is not None:
            for player in self.set_tournaments[self.tournament_id]['players']:
                if self.connected_users[player]['self'] != self:
                    await PongConsumer.delete_connectedUsers(self.connected_users[player]['self'], 4006)
            await self.delete_tournament(self.tournament_id)
            await PongConsumer.delete_connectedUsers(self, 4006)
        
        # Delete the empty groups
        groups_copy = self.channel_layer.groups.copy()
        for group_name, group_members in self.channel_layer.groups.copy().items():
            # Check if the group is empty after discarding a WebSocket
            if not self.channel_layer.groups.get(group_name):
                try:
                    del self.channel_layer.groups[group_name]
                except KeyError:
                    print(f"KeyError: {group_name} not found in channel_layer.groups")

        # Additional print statement at disconnection
        print(f"[disconnect client] self.set_tournaments: {self.set_tournaments}")
        print(f"[disconnect client] self.set_matches: {self.set_matches}")
        print(f"[disconnect client] self.connected_users: {self.connected_users}")
        print(f"[disconnect client] self.channel_layer.groups: {groups_copy}")
        print(f"[disconnect client] len(channel_layer_group.items()): {len(channel_layer_group.items())}\n\n")

    
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
                print(f"\nFINISHED MATCH: {self.set_matches[self.match_id]}")
                if self.tournament_id is None:
                    # [store in database]
                    await self.send_matchToDatabase(self.set_matches[self.match_id])
                    otherPlayer = self.set_matches[self.match_id]['players'][0] if self.set_matches[self.match_id]['players'][0] != self.player else self.set_matches[self.match_id]['players'][1]
                    await PongConsumer.delete_connectedUsers(self.connected_users[otherPlayer]['self'], 3001)
                    await self.delete_match(self.match_id)
                    await PongConsumer.delete_connectedUsers(self, 3001)
        
        # [Tournament] broadcast tournament_info if match_end is received and match-making players for the final
        if self.tournament_id is not None and received_data['command'] == "match_info" and received_data['mode'] == "end":
            tournament_mode = 'update'
            finalRank = None
            tournament = self.set_tournaments[self.tournament_id]
            # lock tournament
            async with self.set_tournaments[self.tournament_id]['lock']:
                # [match_info for Semi-Final]
                if not tournament['finished'] and self.match_id in tournament['matchesSemi']:
                    self.match_id = tournament['matchFinal']
                    await self.discard_playerFromGroup(self.group_name_match)
                    self.group_name_match = self.set_matches[self.match_id]['group_name']
                    # [self is winner of match] add self to players of final
                    if received_data['winner'] is not None and self.player == received_data['winner']:
                        await self.add_playerToMatch(tournament['matchFinal'])
                    await self.add_playerToGroup(self.set_matches[self.match_id]['group_name'])
                    # [all 4 players in final group] broadcast match_info 'start'
                    if len(self.channel_layer.groups.get(self.group_name_match, {}).items()) == 4:
                        self.set_matches[tournament['matchFinal']]['startTime'] = self.get_currentTimestamp()
                        await self.send_to_group(match_info('start', self.set_matches[tournament['matchFinal']]['players']), self.group_name_match)
                    # [broadcast tournament_info]
                    print(f"Broadcasting [semi-final=over]: {tournament_info(tournament_mode, self.set_matches[tournament['matchesSemi'][0]]['players'], self.set_matches[tournament['matchesSemi'][1]]['players'], self.set_matches[tournament['matchFinal']]['players'], finalRank)}")
                    await self.send_to_group(tournament_info(tournament_mode, self.set_matches[tournament['matchesSemi'][0]]['players'], self.set_matches[tournament['matchesSemi'][1]]['players'], self.set_matches[tournament['matchFinal']]['players'], finalRank), self.group_name_tournament)
                # [match_info for Final if it is not set to finished]
                elif not tournament['finished'] and self.match_id == tournament['matchFinal']:
                    channel_layer_group = self.channel_layer.groups.get(self.group_name_match, {})  # for check clean up
                    # [broadcast tournament_info 'end']
                    tournament_mode = 'end'
                    print(f"Broadcasting [final=over]: {tournament_info(tournament_mode, self.set_matches[tournament['matchesSemi'][0]]['players'], self.set_matches[tournament['matchesSemi'][1]]['players'], self.set_matches[tournament['matchFinal']]['players'], finalRank)}")
                    await self.send_to_group(tournament_info(tournament_mode, self.set_matches[tournament['matchesSemi'][0]]['players'], self.set_matches[tournament['matchesSemi'][1]]['players'], self.set_matches[tournament['matchFinal']]['players'], finalRank), self.group_name_tournament)
                    # [store in database]
                    self.set_tournaments[self.tournament_id]['endTime'] = self.get_currentTimestamp()
                    self.set_tournaments[self.tournament_id]['playersRank'] = await self.get_finalRankTournament(self.tournament_id)
                    await self.send_tournamentToDatabase(tournament)
                    # clean up tournament (includes deleting all matches and players)
                    for player in self.set_tournaments[self.tournament_id]['players']:
                        if self.connected_users[player]['self'] != self:
                            await PongConsumer.delete_connectedUsers(self.connected_users[player]['self'], 3002)
                    await self.delete_tournament(self.tournament_id)
                    await PongConsumer.delete_connectedUsers(self, 3002)
                    # set tournament to finished
                    tournament['finished'] = True
                    return
                # [match_info for wrong match]
                else:
                    print(f"Warning: Received match_info for wrong match ({self.player}, {self.match_id})")

        # [Broadcast match game-data]
        if (self.match_id is not None 
            and (
                received_data['command'] == "updateLeftPaddle" or
                received_data['command'] == "updateRightPaddle" or
                received_data['command'] == "updateBall" or
                received_data['command'] == "initBall" or
                received_data['command'] == "gamePause"
            )
            and self.set_matches[self.match_id]['finished'] == False):
            await self.send_to_group(text_data, self.group_name_match)


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
        # print(f"Sending message: {message}")
        try:
            await self.send(text_data=message)
        except Exception as e:
            print(f"Error sending message: {e}")