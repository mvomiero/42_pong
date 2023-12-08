#pong/consumers.py

import json 
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
            # connected_users = {user_id: (channel_name, group_name, match_id), user_id: (...), ...}
    set_matches = {}  # Dictionary to store matches and their players
            # OLD: set_matches = {match_id: [player, player], match_id: [player, player], ...}
            # NEW (has to be implemented):
                # set_matches = {
                    # 'id1': {
                    #     'players':    ['player1', 'player2'],
                    #     'tournament': ['tournament_id']
                    # },
                    # 'id2': {
                    #     'players':    ['player3', 'player4'],
                    #     'tournament': ['None']        # "None" if not part of a tournament
                    # },

    set_tournaments = {}  # Dictionary to store tournaments and their matches
                # set_tournaments = {
                    # 'id1': {
                    #     'players': ['player1', 'player2'],
                    #     'matches': ['match1', 'match2']
                    # },
                    # 'id2': {
                    #     'players': ['player3', 'player4'],
                    #     'matches': ['match2', 'match3']
                    # },


    # ************************************************************ #
    # *********** ESTABLISH NEW WEBSOCKET CONNECTION ************* #
    # ************************************************************ #
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['game_mode']
        self.player = self.scope['url_route']['kwargs']['player']
        self.room_group_name = None

        print(f"room_code: {self.room_code}")
        print(f"player: {self.player}")
        
        # Reject connection if player already exists
        if self.player in self.connected_users:
            print(f"Player {self.player} already exists.")
            self.reject_connection(500)
            return

        # Add the player to a match
        if self.room_code == "match":
            if not await self.add_player_to_match():
                return
        elif self.room_code == "tournament":
            print("Tournament mode is not implemented yet.")
            if not await self.add_player_to_tournament():
                self.reject_connection(501)
                return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        # Add the connected user and their connection to the dictionary
        # user_id = self.scope["user"].id  # Assuming authentication is implemented and user information is available
        # if user_id:
        #     if user_id not in self.connected_users:
        #         self.connected_users[user_id] = set()
        #     self.connected_users[user_id].add(self.channel_name)

        group_size = len(self.channel_layer.groups.get(self.room_group_name, {}).items())
        print(f"The size of group '{self.room_group_name}' is: {group_size}")

        await self.accept()


    # ************************************************************ #
    # ***************** LOGIC PLAYER MATCHMAKING ***************** #
    # ************************************************************ #
    async def add_player_to_match(self):
        # OLD: set_matches = {match_id: [player, player], match_id: [player, player], ...}
            # NEW (has to be implemented):
                # set_matches = {
                    # 'id1': {
                    #     'players':    ['player1', 'player2'],
                    #     'tournament': ['tournament_id']
                    # },
                    # 'id2': {
                    #     'players':    ['player3', 'player4'],
                    #     'tournament': ['None']        # "None" if not part of a tournament
                    # },
        # add a player:     set_matches['id1']['players'].append('player5')
        # remove player:    if player_to_remove in set_matches['id1']['players']:
        #                       set_matches['id1']['players'].remove('player5')
        # retrieving all players: players = set_matches['id1']['players']
        # clearing all players: set_matches['id1']['players'].clear()
        # removing element from dictionary: del set_matches['id1']

        self.match_id = None

        max_nbr_games = 1000   # important to avoid overflow and undefined behavior with set_matcheses

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
            self.set_matches[id] = {'players': [], 'tournament': []}
            self.set_matches[id]['tournament'].append(None)
        self.set_matches[id]['players'].append(self.player)
        self.match_id = id

        print(f"self.set_matches: {self.set_matches}")

        self.room_group_name = f'{self.room_code}_{self.match_id}'  # generate room name
        print(f"room_group_name: {self.room_group_name}")

        # Add player to the dictionary
        self.connected_users[self.player] = set()
        user_info_tuple = (self.channel_name, self.room_group_name, self.match_id)
        self.connected_users[self.player].add(user_info_tuple)

        return True


    # ************************************************************ #
    # *************** LOGIC TOURNAMENT MATCHMAKING *************** #
    # ************************************************************ #
    async def add_player_to_tournament(self):
        # set_tournaments = {
                    # 'id1': {
                    #     'players': ['player1', 'player2'],
                    #     'matches': ['match1', 'match2']
                    # },
                    # 'id2': {
                    #     'players': ['player3', 'player4'],
                    #     'matches': ['match2', 'match3']
                    # },
        # add a player:     set_tournaments['id1']['players'].append('player5')
        # remove player:    if player_to_remove in set_tournaments['id1']['players']:
        #                       set_tournaments['id1']['players'].remove('player5')
        # retrieving all players: players = set_tournaments['id1']['players']
        # clearing all players: set_tournaments['id1']['players'].clear()
        # removing element from dictionary: del set_tournaments['id1']

        self.tournament_id = None
        max_nbr_tournaments = 0   # important to avoid overflow and undefined behavior with set_tournamentses
        players_per_tournament = 4

        # Find the first tournament ID with less than (players_per_tournament) players
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
            self.set_tournaments[id] = {'players': [], 'matches': []}
        self.set_tournaments[id].append(self.player)
        self.tournament_id = id
        

        return True


    # ************************************************************ #
    # ********************* REJECT WEBSOCKET ********************* #
    # ************************************************************ #
    async def reject_connection(self, code):
        await self.accept()
        await self.close(code=code)


    # ************************************************************ #
    # ******************* DISCONNECT WEBSOCKET ******************* #
    # ************************************************************ #
    async def disconnect(self, close_code):
        # Remove the connection from the dictionaries when a user disconnects
        if self.room_group_name is None:
            print("No room_group_name found.")
            return
        user_id = self.player
        print(f"Disconnecting user {user_id} from channel name {self.channel_name}")
        if user_id in self.connected_users:
            
            # Remove user from match and delete match if empty
            match_id = None
            for user_info_tuple in self.connected_users[user_id]:
                match_id = user_info_tuple[2]  # Assuming match_id is the third element
            print(f"Retrieved match_id {match_id} for user_id {user_id}.")
            if match_id is not None and match_id in self.set_matches and user_id in self.set_matches[match_id]['players']:
                self.set_matches[match_id]['players'].remove(user_id)
                if not self.set_matches[match_id]['players']:
                    self.set_matches[match_id]['tournament'].clear()
                    self.set_matches[match_id].clear()
                    del self.set_matches[match_id]
            
            # Clear and delete user from connected_users
            self.connected_users[user_id].clear()
            if not self.connected_users[user_id]:
                del self.connected_users[user_id]

            print(f"self.set_matches: {self.set_matches}")
            print(f"self.connected_users: {self.connected_users}")

            # self.connected_users[user_id].discard(self.channel_name)
            # if not self.connected_users[user_id]:
            #     del self.connected_users[user_id]

        await self.channel_layer.group_discard(
            self.room_group_name,
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
        # Log/print the received JSON data
        #print("Received JSON data:", text_data)

        received_data = json.loads(text_data)

        # Pass the received JSON data as is to other clients
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'send_message',
            'data': text_data  # Send the received data directly to other clients
        })

    async def send_message(self, event):
        """ Send the group message to clients """
        # Retrieve the message from the event
        message = event['data']
        # Send the message to the client WebSocket
        await self.send(text_data=message)