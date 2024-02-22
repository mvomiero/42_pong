# modified x, y, z so 0, 0, 0 is the centre and range is now from -0.5 to 0.5

import json, asyncio
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from pong.webSocket_msg_create import *
from pong.match_setup import *

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
            self.matches[0].consumer_instances.append(self)
            self.paddle = self.matches[0].paddle_left
        else:
            self.matches[0].player2_name = self.player
            self.matches[0].consumer_instances.append(self)
            self.paddle = self.matches[0].paddle_right
            await self.send_to_group(
                match_info('start', [self.matches[0].player1_name, self.matches[0].player2_name]), 
                self.group_name
            )
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
        while match.winning_score > max(match.score_player1, match.score_player2):
            match.ball.update_position()
            match.ball.check_hit_table_top_or_bottom(match.table)
            self.check_if_ball_hit_either_paddle(match)
            self.move_paddle(match.paddle_left, match.table)
            self.move_paddle(match.paddle_right, match.table)
            await self.send_to_group(
                match_data(match.ball, [match.score_player1, match.score_player2], match.paddle_left, match.paddle_right), 
                self.group_name
            )
            await asyncio.sleep(0.01)
        
        # send match_info 'end' to the players
        winner = match.player1_name if match.score_player1 > match.score_player2 else match.player2_name
        await self.send_to_group(
            match_info('end', [match.player1_name, match.player2_name], [match.score_player1, match.score_player2], winner), 
            self.group_name
        )

        await asyncio.sleep(0.5)    # delay to ensure the players receive the 'end' message

        # deleting/closing all PongConsumer instances and the match instance
        await self.game_finished(3001)
        

    async def game_finished(self, closing_code=None):
        # delete all PongConsumer instances in the match
        for consumer in self.matches[0].consumer_instances:
            await PongConsumer.delete_consumer_instance(consumer, closing_code)
        
        # delete the match instance
        del self.matches[0]


    @staticmethod
    async def delete_consumer_instance(consumer, closing_code=None):
        # copy the channel groups (to delete the group later on if it's empty)
        channel_groups_copy = consumer.channel_layer.groups.copy()
        
        # Remove the consumer instance from the matches list
        await consumer.channel_layer.group_discard(
            consumer.group_name,
            consumer.channel_name
        )

        # delete group if it's empty
        if consumer.group_name in channel_groups_copy and not channel_groups_copy[consumer.group_name]:
            del channel_groups_copy[consumer.group_name]

        # Close the WebSocket connection:
        await consumer.close(closing_code)


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
