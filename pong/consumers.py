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
        self.z = 1
        self.dx = 1 if random.random() < 0.5 else -1
        self.dy = random.uniform(-1, 1)
        self.speed = 0.005
        self.min_speed = 0.002
        self.max_speed = 0.05
        self.min_z = self.size
        self.max_z = self.randomise_max_z()
    
    def randomise_max_z(self):
        # between min of ball.size and max of a random value between ball.size and 1
        return random.uniform(self.size, 1)

    def update_position(self):
        self.x += self.dx * self.speed
        self.y += self.dy * self.speed
        # calculate ball z based on ball x so that it reaches max_z when crossing the net and 0 at either paddle
        # where '0' is mean and 1/4 is standard_deviation
        self.z = self.size / 2 + self.max_z * math.exp(-((self.x - 0) ** 2) / (2 * (1/4) ** 2))

    def check_hit_table_top_or_bottom(self, table):
        if self.y < table.bottom or self.y >= table.top:
            self.dy = -self.dy

    def check_hit_paddle(self, paddle):
        bottom_of_paddle = paddle.y - paddle.half_height
        top_of_paddle = paddle.y + paddle.half_height
        if bottom_of_paddle < self.y < top_of_paddle:
            self.x = paddle.x
            self.dx = -self.dx
            self.max_z = self.randomise_max_z()
            if paddle.speed == 0:
                self.speed *= 0.7
            else:
                self.speed += paddle.speed * 0.3
            # self.speed = max(self.speed, self.max_speed)
            if self.speed < self.min_speed:
                self.speed = self.min_speed
            if self.speed > self.max_speed:
                self.speed = self.max_speed
            return True
        else:
            return False

class Paddle:
    def __init__(self, init_x):
        self.x = init_x
        self.y = 0
        self.height = 1/4
        self.half_height = self.height / 2
        self.speed = 0
        self.speed_init = 0.001
        self.speed_increment = 0.001
        self.min_speed = 0.001
        self.max_speed = 0.04
        self.up_key_held = False
        self.down_key_held = False
    
    def paddle_up_pressed(self):
        if not self.up_key_held:
            self.down_key_held = False
            self.up_key_held = True
            self.speed = self.speed_init

    def paddle_up_released(self):
        self.up_key_held = False
        self.speed = 0

    def paddle_down_pressed(self):
        if not self.down_key_held:
            self.up_key_held = False
            self.down_key_held = True
            self.speed = self.speed_init

    def paddle_down_released(self):
        self.down_key_held = False
        self.speed = 0     
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
        # print(f'data received: {received_data}')
        command = received_data.get('command')

        if command == 'move_paddle':
            await self.update_paddle_position(received_data['direction'], received_data['action'])

    async def update_paddle_position(self, direction, action):
        if direction == 'up' and action == 'pressed':
            self.paddle.paddle_up_pressed()
        elif direction == 'up' and action == 'released':
            self.paddle.paddle_up_released()
        elif direction == 'down' and action == 'pressed':
            self.paddle.paddle_down_pressed()
        elif direction == 'down' and action == 'released':
            self.paddle.paddle_down_released()

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
    
    def move_paddle(self, paddle, table):
        if paddle.up_key_held and paddle.y + paddle.half_height < table.top:
            paddle.speed += paddle.speed_increment
            paddle.y += paddle.speed
            if paddle.y + paddle.half_height > table.top:
                paddle.y = table.top - paddle.half_height
        if paddle.down_key_held and paddle.y - paddle.half_height > table.bottom:
            paddle.speed += paddle.speed_increment
            paddle.y -= paddle.speed
            if paddle.y - paddle.half_height < table.bottom:
                paddle.y = table.bottom + paddle.half_height

    async def game_loop(self):
        print('game loop started')
        match = self.matches[0]
        while True:
            match.ball.update_position()
            match.ball.check_hit_table_top_or_bottom(match.table)
            self.check_if_ball_hit_either_paddle(match)
            self.move_paddle(match.paddle_left, match.table)
            self.move_paddle(match.paddle_right, match.table)
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
