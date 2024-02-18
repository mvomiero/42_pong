#pong/consumers.py

import json, asyncio
from datetime import datetime
import time
from .webSocket_msg_create import *
# from .webSocket_msg_transmit import *
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from pong.views import add_game_data
from pong.views import add_tournament_data
from pong.match import MatchConsumer
import random

class Ball:
    def __init__(self):
        self.x = 0.5
        self.y = 0.5
        self.dx = 1 if random.random() < 0.5 else -1
        self.dy = (random.uniform(0, 2)) - 1
        self.speed = 0.01
        self.height = random.random()

    def update_ball(self):
        self.x += self.dx * self.speed
        self.y += self.dy * self.speed
    
    def check_if_ball_hit_top_bottom_table(self):
        if self.y < 0 or self.y >= 1:
            self.dy = -self.dy

    def ball_hit_paddle(self):
        self.dx = -self.dx
        self.height = random.random()
        # # adjust ball speed according to paddle speed:
        # new_ball_speed = self.speed - amount_to_slow  # ball first slows a bit on each paddle hit
        # if my_paddle_speed > 0:  # if the paddle is moving, it adds to the ball speed, if it is not moving the ball will slow a little
        #     new_ball_speed += paddle_speed / max_ball_speed_divider  # divider controls overall max ball speed
        # if new_ball_speed < min_ball_speed:  # we check that the final ball speed doesn't fall below a minimum threshold
        #     new_ball_speed = min_ball_speed
        # self.speed = new_ball_speed


class Paddle:
    def __init__(self):
        self.y = 1/2
        self.height = 1/5
        self.speed = 0
        self.increment = 0.1
    
    def paddle_down(self):
        self.y -= self.increment
        if self.y < 0:
            self.y = 0
    
    def paddle_up(self):
        self.y += self.increment
        if self.y > 1:
            self.y = 1


class PongConsumer(AsyncJsonWebsocketConsumer):

    winning_score = 2

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
                    #     'ball':       ::Ball,
                    #     'paddleLeft':  ::Paddle,
                    #     'paddleRight': ::Paddle,
                    # },

    # ************************************************************ #
    # *********** ESTABLISH NEW WEBSOCKET CONNECTION ************* #
    # ************************************************************ #
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['game_mode']
        self.player = self.scope['url_route']['kwargs']['player']
        self.group_name_match = None
        self.match_id = None
        self.paddle = None
        self.playerNbr = -1

        print(f"room_code: {self.room_code}")
        print(f"player: {self.player}")
        
        await self.accept()
        await self.send_to_self(set_player(self.player))

        # Reject connection if player already exists
        if self.player in self.connected_users:
            print(f"Player {self.player} already exists.")
            await PongConsumer.delete_connectedUsers(self, 4001)
            # await self.reject_connection(4001)
            return

        # Add the player to a match or tournament
        if self.room_code == "match":
            if not await self.add_playerRemoteMatch(self.room_code):
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
            self.paddle = self.set_matches[match_id]['paddleLeft']
            self.playerNbr = 0
        else:
            group_name_match = self.set_matches[match_id]['group_name']
            self.paddle = self.set_matches[match_id]['paddleRight']
            self.playerNbr = 1
        await self.add_playerToMatch(match_id)
        #print(f"Added player to match ({match_id}): {self.set_matches[match_id]}")

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
            self.set_matches[match_id]['startMatchTrigger'] = True

        await self.match_loop()            

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
        self.set_matches[match_id]['ball'] = Ball()
        self.set_matches[match_id]['paddleLeft'] = Paddle()
        self.set_matches[match_id]['paddleRight'] = Paddle()
        self.set_matches[match_id]['startMatchTrigger'] = False
        return group_name_match
    
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
        user.match_id = None


    """ Delete a match from set_matches """
    async def delete_match(self, match_id):
        # Clear and delete match
        if match_id is not None and match_id in self.set_matches:
            self.set_matches[match_id].clear()
            del self.set_matches[match_id]
    
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
        print(f"self.set_matches: {self.set_matches}")
        print(f"self.player: {self.player} & self.match_id: {self.match_id}")
        if len(self.set_matches[self.match_id]['players']) == 2:
            try:
                if self.set_matches[self.match_id]['players'][0] != self.player:
                    otherPlayer = self.set_matches[self.match_id]['players'][0]
                else:
                    otherPlayer = self.set_matches[self.match_id]['players'][1]
                await PongConsumer.delete_connectedUsers(self.connected_users[otherPlayer]['self'], 4005)
            except KeyError:
                print(f"KeyError: {otherPlayer} problems with deleting connected_users")
        try:
            await self.delete_match(self.match_id)
        except KeyError:
            print(f"KeyError: {self.match_id} problems with deleting match")
        try:
            await PongConsumer.delete_connectedUsers(self, 4005)
        except KeyError:
            print(f"KeyError: {self.player} problems with deleting connected_users")
        
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
        
        received_data = json.loads(text_data)
        
        # Log/print the received JSON data
        # print("Received JSON data:", received_data)

        # !!!!!!!!!!!!!NEW MESSAGES!!!!!!!!!!!!!
        if received_data['command'] == "player_paddle_up_keystate":
            self.paddle.paddle_up()
            # update paddle speed
            # didn't understand the True and False thing...
        elif received_data['command'] == "player_paddle_down_keystate":
            self.paddle.paddle_down()
            # update paddle speed
            # didn't understand the True and False thing...


        # [Match (Remote & Tournament)] broadcast match_info (update & end) to all players in the match_group
        if self.match_id is not None and received_data['command'] == "match_info" and (received_data['mode'] == "update" or received_data['mode'] == "end") and not self.set_matches[self.match_id]['finished']:
            await self.send_to_group(text_data, self.set_matches[self.match_id]['group_name'])
            if received_data['mode'] == "end":
                self.set_matches[self.match_id]['finished'] = True
                self.set_matches[self.match_id]['endTime'] = self.get_currentTimestamp()
                self.storeMatchScore(self.match_id, received_data['score'])
                print(f"\nFINISHED MATCH: {self.set_matches[self.match_id]}")
                # [store in database]
                await self.send_matchToDatabase(self.set_matches[self.match_id])
                otherPlayer = self.set_matches[self.match_id]['players'][0] if self.set_matches[self.match_id]['players'][0] != self.player else self.set_matches[self.match_id]['players'][1]
                await PongConsumer.delete_connectedUsers(self.connected_users[otherPlayer]['self'], 3001)
                await self.delete_match(self.match_id)
                await PongConsumer.delete_connectedUsers(self, 3001)
        
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

    async def match_loop(self):
        while self.set_matches[self.match_id]['startMatchTrigger'] == False:
            await asyncio.sleep(0.01)
        
        while self.set_matches[self.match_id]['startMatchTrigger'] == True:
            print("++++++++++++ IN LOOP ++++++++++++")
            ball = self.set_matches[self.match_id]['ball']
            ball.update_ball()
            ball.check_if_ball_hit_top_bottom_table()
            if ball.x < 0:
                await self.check_if_ball_hit_or_passed_paddle(ball)
            elif ball.x > 1:
                await self.check_if_ball_hit_or_passed_paddle(ball)
            await self.send_to_self(match_data(ball, self.set_matches[self.match_id]['score'], self.set_matches[self.match_id]['paddleLeft'], self.set_matches[self.match_id]['paddleRight']))
            await asyncio.sleep(0.02)

    async def check_if_ball_hit_or_passed_paddle(self, ball):
        half_paddle_height = self.paddle.height / 2
        if ball.y > self.paddle.y - half_paddle_height and ball.y < self.paddle.y + half_paddle_height:
            ball.ball_hit_paddle()
        else:
            await self.ball_passed_paddle()
    
    async def ball_passed_paddle(self):
        self.set_matches[self.match_id]['score'][self.playerNbr] += 1
        if self.set_matches[self.match_id]['score'][self.playerNbr] >= self.winning_score:
            await self.send_to_group(match_info('end', self.set_matches[self.match_id]['players'], self.set_matches[self.match_id]['score'], self.player), self.set_matches[self.match_id]['group_name'])
            self.set_matches[self.match_id]['startMatchTrigger'] = False
            # maybe further things if match is over (winning score reached)
        self.set_matches[self.match_id]['ball'] = Ball()    # reset ball