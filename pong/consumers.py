#pong/consumers.py

import json 
from .webSocket_messages import *
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
                    #     'score':      [0, 0]
                    # },
                    # 'id2': {
                    #     'players':    ['player3', 'player4'],
                    #     'tournament': ['None']        # "None" if not part of a tournament
                    #     'score':      [0, 0]
                    # },

    set_tournaments = {}  # Dictionary to store tournaments and their matches
                # set_tournaments = {
                    # 'id1': {
                    #     'players':     ['player1', 'player2', 'player3', 'player4'],
                    #     'matchesSemi': ['match1', 'match2'],
                    #     'matchFinal':  ['match3'],
                    # },
                    # 'id2': {
                    #     'players':     ['player5', 'player6'],
                    #     'matchesSemi': [None, None],
                    #     'matchFinal':  [None],
                    # },


    # ************************************************************ #
    # *********** ESTABLISH NEW WEBSOCKET CONNECTION ************* #
    # ************************************************************ #
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['game_mode']
        self.player = self.scope['url_route']['kwargs']['player']
        self.room_group_name_match = None
        self.room_group_name_tournament = None

        print(f"room_code: {self.room_code}")
        print(f"player: {self.player}")
        
        await self.accept()
        await self.send_to_self(set_player(self.player))

        # Reject connection if player already exists
        if self.player in self.connected_users:
            print(f"Player {self.player} already exists.")
            self.reject_connection(507)
            return

        # Add the player to a match
        if self.room_code == "match":
            if not await self.add_player_to_match(self.room_code):
                return
        elif self.room_code == "tournament":
            print("Tournament mode is not implemented yet.")
            if not await self.add_player_to_tournament(self.room_code):
                self.reject_connection(501)
                return

        group_size = len(self.channel_layer.groups.get(self.room_group_name_match, {}).items())
        print(f"The size of group '{self.room_group_name_match}' is: {group_size}")



    # ************************************************************ #
    # ***************** LOGIC PLAYER MATCHMAKING ***************** #
    # ************************************************************ #
    async def add_player_to_match(self, room_code):
        self.match_id = None

        max_nbr_games = 1000   # important to avoid overflow and undefined behavior with set_matches

        # Find the first match ID with only one player
        open_match = None
        for id, data in self.set_matches.items():
            print(f"match_id: {id} | players: {data['players']} | len(players): {len(data['players'])}")
            if len(data['players']) == 1:
                open_match = id
                break

        # Reject if set_matches is full
        if open_match is None and len(self.set_matches) >= max_nbr_games:
            print("set_matches is full.")
            self.reject_connection(507)
            return False

        id = open_match
        if id is None:  # create a new match
            # Find the smallest available ID for the new match
            id = 0
            while id in self.set_matches:
                id += 1
            self.set_matches[id] = {'players': [], 'tournament': [], 'score': []}
            self.set_matches[id]['tournament'].append(None)
            self.set_matches[id]['score'] = [-1, -1]
        self.set_matches[id]['players'].append(self.player)
        self.match_id = id

        print(f"self.set_matches: {self.set_matches}")

        self.room_group_name_match = f'{room_code}_{self.match_id}'  # generate room name
        print(f"room_group_name_match: {self.room_group_name_match}")

        # Add player to the dictionary
        await self.add_connected_users(self.match_id, -1)
        
        print(f"self.connected_users: {self.connected_users}")

        # Add player to the group
        if self.room_group_name_match is not None:
            await self.channel_layer.group_add(
                self.room_group_name_match,
                self.channel_name,
            )

        if len(self.set_matches[id]['players']) == 2:
            await self.send_to_group(match_start(self.set_matches[id]['players']), self.room_group_name_match)

        return True


    async def create_match_tournament(self, tournament_id, player1, player2):
        max_nbr_games = 1000

        # Reject if set_matches is full
        if len(self.set_matches) >= max_nbr_games:
            print("set_matches is full.")
            # self.reject_connection(507)
            return -1
        
        # Find the smallest available ID for the new match
        match_id = 0
        while match_id in self.set_matches:
            match_id += 1
        
        # Create new match
        self.set_matches[match_id] = {'players': [], 'tournament': [], 'score': []}
        self.set_matches[match_id]['tournament'] = tournament_id
        self.set_matches[match_id]['score'] = [-1, -1]
        self.set_matches[match_id]['players'] = [player1, player2]
        
        room_group_name_match = f'{"match"}_{match_id}'  # generate room name

        # Add player to the dictionary
        # TODO: change so that method uses a player_name instead of self.player
        await self.add_connected_users(self.match_id, -1)

        # Add player to the group
        # TODO: add both players to the group (not self.channel_name!!)
        if self.room_group_name_match is not None:
            await self.channel_layer.group_add(
                self.room_group_name_match,
                self.channel_name,
            )

        return match_id


    # ************************************************************ #
    # *************** LOGIC TOURNAMENT MATCHMAKING *************** #
    # ************************************************************ #
    async def add_player_to_tournament(self, room_code):
        self.tournament_id = None
        max_nbr_tournaments = 0   # important to avoid overflow and undefined behavior with set_tournaments
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

        print(f"open_tournament: {open_tournament}")
        id = open_tournament
        if id is None:  # create a new tournament
            # Find the smallest available ID for the new tournament
            id = 0
            while id in self.set_tournaments:
                id += 1
            self.set_tournaments[id] = {'players': [], 'matchesSemi': [], 'matchFinal': []}
        self.set_tournaments[id].append(self.player)
        self.tournament_id = id

        self.room_group_name_tournament = f'{room_code}_{self.tournament_id}'  # generate room name
        print(f"room_group_name_match: {self.room_group_name_tournament}")

        # Add player to the dictionary connected_users
        await self.add_connected_users(None, self.tournament_id)

        # Add player to the group
        if self.room_group_name_tournament is not None:
            await self.channel_layer.group_add(
                self.room_group_name_tournament,
                self.channel_name,
            )

        # Broadcast tournament info to all players if tournament is full
        if len(self.set_tournaments[id]['players']) == players_per_tournament:
            await self.send_to_group(tournament_info('start'), self.room_group_name_tournament)
            self.set_tournaments[id]['matchesSemi'].append(self.create_match_tournament(self.tournament_id, self.set_tournaments[id]['players'][0], self.set_tournaments[id]['players'][1]))
            self.set_tournaments[id]['matchesSemi'].append(self.create_match_tournament(self.tournament_id, self.set_tournaments[id]['players'][2], self.set_tournaments[id]['players'][3]))




        return True


    async def add_connected_users(self, match_id, tournament_id):
        if self.player not in self.connected_users:
            self.connected_users[self.player] = {'channel_name': [], 'room_group_name_match': [], 'match_id': []}
        self.connected_users[self.player]['channel_name'] = self.channel_name
        if match_id != -1:
            self.connected_users[self.player]['match_id'] = match_id
        if tournament_id != -1:
            self.connected_users[self.player]['tournament_id'] = tournament_id


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
        if self.room_group_name_match is None:
            print("No room_group_name_match found.")
            return
        user_id = self.player
        print(f"Disconnecting user {user_id} from channel name {self.channel_name}")
        if user_id in self.connected_users:
            
            # Remove user from match and delete match if empty
            match_id = self.connected_users[user_id]['match_id'][0]
            print(f"Retrieved match_id {match_id} for user_id {user_id}.")
            if match_id is not None and match_id in self.set_matches and user_id in self.set_matches[match_id]['players']:
                self.set_matches[match_id]['players'].remove(user_id)
                if not self.set_matches[match_id]['players']:
                    self.set_matches[match_id]['tournament'].clear()
                    self.set_matches[match_id]['score'].clear()
                    self.set_matches[match_id].clear()
                    del self.set_matches[match_id]
            
            # Clear and delete user from connected_users
            self.connected_users[user_id]['channel_name'].clear()
            self.connected_users[user_id]['room_group_name_match'].clear()
            self.connected_users[user_id]['match_id'].clear()
            self.connected_users[user_id].clear()
            del self.connected_users[user_id]

            print(f"self.set_matches: {self.set_matches}")
            print(f"self.connected_users: {self.connected_users}")

        await self.channel_layer.group_discard(
            self.room_group_name_match,
            self.channel_name,
        )
        

        # Additional print statement at disconnection
        if user_id:
            print(f"User {user_id} disconnected from channel name {self.channel_name}")
        self.close()

    
    async def receive(self, text_data):
        """
        Receive message from WebSocket.
        Log/print the received JSON data and forward it to other clients.
        """
        
        received_data = json.loads(text_data)
        
        # Log/print the received JSON data
        print("Received JSON data:", received_data)

        # store game store in dictionary set_matches
        if received_data['command'] == "updateScore":
            print(f"Received JSON data ({self.player}):, {received_data}")
            self.set_matches[self.match_id]['score'][0] = received_data['players']['scorePlayer1']
            self.set_matches[self.match_id]['score'][1] = received_data['players']['scorePlayer2']

        # Pass the received JSON data as is to other clients
        self.send_to_group(text_data, self.room_group_name_match)


    async def send_to_self(self, data):
        """ Send message to self """
        await self.channel_layer.send(self.channel_name, {
            'type': 'send_message',
            'data': data
        })

    async def send_to_group(self, data, group_name):
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