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

    # player:flo    | match:semi1
    # player:marco  | match:semi1
    # player:pierre | match:semi2
    # player:john   | match:semi2
    connected_users = {}  # Dictionary to store connected users and their connections
            # connected_users = {user_id: {channel_name, group_name, match_id}, user_id: {...}, ...}
    set_match = {}  # Dictionary to store matches and their players (NEW)
            # set_match = {match_id: [player, player], match_id: [player, player], ...}

    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['game_mode']
        self.player = self.scope['url_route']['kwargs']['player']
        print(f"room_code: {self.room_code}")
        print(f"player: {self.player}")
        self.match_id = None  # NEW
        self.tournament_id = None  # NEW
        self.room_group_name = None  # NEW
        
        # To Do: Handle douplicates in alias (player name) for matches

        # Add the player to a match
        if self.room_code == "match":
            
            # Find the first match ID with only one player
            open_match = None
            for match_id, players in self.set_match.items():
                print(f"match_id: {match_id} | players: {players} | len(players): {len(players)}")
                if len(players) == 1:
                    open_match = match_id
                    break
            
            # Refuse if set_match is full
            nbr_matches = len(self.set_match)
            print(f"len(matches): {nbr_matches}")
            if open_match is None and len(self.set_match) >= 1:
                print("Match is full.")
                await self.close(code=507)
                return
            
            print(f"open_match: {open_match}")
            if open_match is None:  # create a new match
                # Find the smallest available ID for the new match
                new_match_id = 1
                while new_match_id in self.set_match:
                    new_match_id += 1
                self.set_match[new_match_id] = set()
                self.set_match[new_match_id].add(self.player)
                self.match_id = new_match_id
                
            else:
                self.set_match[open_match].add(self.player)
                self.match_id = open_match

            print(f"self.set_match: {self.set_match}")

            self.room_group_name = f'{self.room_code}_{self.match_id}'  # generate room name
            print(f"room_group_name: {self.room_group_name}")

            # Add player to the dictionary
            # (To Do: check if player already exists)
            self.connected_users[self.player] = set()
            user_info_tuple = (self.channel_name, self.room_group_name, self.match_id)
            self.connected_users[self.player].add(user_info_tuple)

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

        # Additional print statement at connection
        # if user_id:
        #     print(f"User {user_id} connected with channel name {self.channel_name}")

        await self.accept()

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
            if match_id and match_id in self.set_match and user_id in self.set_match[match_id]:
                self.set_match[match_id].discard(user_id)
                if not self.set_match[match_id]:
                    del self.set_match[match_id]
            
            # Clear and delete user from connected_users
            self.connected_users[user_id].clear()
            if not self.connected_users[user_id]:
                del self.connected_users[user_id]

            print(f"self.set_match: {self.set_match}")
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