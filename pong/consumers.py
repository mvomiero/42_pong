# modified x, y, z so 0, 0, 0 is the centre and range is now from -0.5 to 0.5

import json, asyncio
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from pong.webSocket_msg_create import *
import random, math

class Table:
    def __init__(self):
        self.width = 1
        self.height = 1
        self.depth = 0.1
        self.left = -0.5
        self.right = 0.5
        self.top = 0.5
        self.bottom = -0.5

class Ball:
    def __init__(self):
        self.size = 0.1
        self.x = 0
        self.y = 0
        self.z = self.size
        self.dx = 1 if random.random() < 0.5 else -1
        self.dy = (random.uniform(0, 2)) - 1
        self.speed = 0.005
        self.max_z = random.random() - 0.5

    def update_position(self):
        self.x += self.dx * self.speed
        self.y += self.dy * self.speed
        # calculate ball z based on ball x so that it reaches max_z when crossing the net and 0 at either paddle
        # self.z = self.size / 2 + self.max_z * math.exp(-((self.x - 0) ** 2) / (2 * (1/4) ** 2))  # where '0' is mean and 1/4 is standard_deviation

    def check_hit_wall(self):
        if self.y < -0.5 or self.y >= 0.5:
            self.dy = -self.dy

    def check_hit_paddle(self, paddle):
        bottom_of_paddle = paddle.y - paddle.height / 2
        top_of_paddle = paddle.y + paddle.height / 2
        if bottom_of_paddle < self.y < top_of_paddle:
            self.dx = -self.dx
            # ball.max_z = random.random()
            return True
        else:
            return False

class Paddle:
    def __init__(self, init_x):
        self.x = init_x
        self.y = 0
        self.height = 1/5
        self.speed = 0
        self.increment = 0.1
    
    def paddle_down(self):
        self.y -= self.increment
        if self.y < (-0.5 + (self.height)):
            self.y = (-0.5 + (self.height))
    
    def paddle_up(self):
        self.y += self.increment
        if self.y > (0.5 - (self.height)):
            self.y = (0.5 - (self.height))

class Match():
    winning_score = 2

    def __init__(self):
        self.player1_name = None
        self.player2_name = None
        self.table = Table()
        self.ball = Ball()
        self.paddle_left = Paddle(self.table.left)
        self.paddle_right = Paddle(self.table.right)
        self.score_player1 = 0
        self.score_player2 = 0

class PongConsumer(AsyncWebsocketConsumer):
    matches = {}  # Store match instances

    async def connect(self):
        self.player = self.scope['url_route']['kwargs']['player']
        self.group_name = "match_0"

        await self.accept()
        await self.send_to_self(set_player(self.player))

        # Join the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # Check if the game instance already exists or create a new one
        if len(self.matches) == 0:
            self.matches[0] = Match()
            self.matches[0].player1_name = self.player
            self.paddle = self.matches[0].paddle_left
        else:
            self.matches[0].player2_name = self.player
            self.paddle = self.matches[0].paddle_right
            await self.send_to_group(match_info('start', [self.matches[0].player1_name, self.matches[0].player2_name]), self.group_name)
            # Start the game loop
            asyncio.ensure_future(self.game_loop())
        
        
    async def disconnect(self, close_code):
        # Handle disconnect logic, e.g., remove the player from the game
        pass

    async def receive(self, text_data):
        received_data = json.loads(text_data)
        print(f'data received: {received_data}')
        command = received_data.get('command')

        if command == 'move_paddle':
            await self.update_paddle_position(received_data['direction'])

    async def update_paddle_position(self, direction):
        if direction == 'up':
            self.paddle.paddle_up()
        elif direction == 'down':
            self.paddle.paddle_down()
        # await self.send_to_group()

    def check_if_ball_hit_either_paddle(self, match):
        if match.ball.x < match.paddle_left.x:
            hit_paddle_left = match.ball.check_hit_paddle(match.paddle_left)
            if not hit_paddle_left:
                match.score_player2 += 1
                match.ball = Ball()
                # self.send_to_group(match_info('update', [match.player1_name, match.player2_name], [match.score_player1, match.score_player2]), self.group_name)
        elif match.ball.x > match.paddle_right.x:
            hit_paddle_right = match.ball.check_hit_paddle(match.paddle_right)
            if not hit_paddle_right:
                match.score_player1 += 1
                match.ball = Ball()
                # self.send_to_group(match_info('update', [match.player1_name, match.player2_name], [match.score_player1, match.score_player2]), self.group_name)
    
    async def game_loop(self):
        print('game loop started')
        match = self.matches[0]
        while True:
            #for player, match in self.matches.items():
            # Update ball position based on speed
            # match.ball.x += match.ball.dx * match.ball.speed
            # match.ball.y += match.ball.dy * match.ball.speed

            # Check for collisions and update scores
            match.ball.update_position()
            match.ball.check_hit_wall()
            self.check_if_ball_hit_either_paddle(match)
            # Send updated game state to group
            await self.send_to_group(match_data(match.ball, [match.score_player1, match.score_player2], match.paddle_left, match.paddle_right), self.group_name)

            await asyncio.sleep(0.01)

    async def send_to_self(self, data):
        await self.channel_layer.send(self.channel_name, {
            'type': 'send.message',
            'data': data
        })

    async def send_to_group(self, data, group_name):
        # Send message to the player's group
        await self.channel_layer.group_send(
            group_name,
            {
                'type': 'send.message',
                'data': data
            }
        )

    async def send_message(self, event):
        # Send the message to the WebSocket
        await self.send(text_data=event['data'])
