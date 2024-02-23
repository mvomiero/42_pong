
import json, asyncio
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from pong.webSocket_msg_create import *
from pong.match_setup import *
from pong.tournament_setup import *

class PongConsumer(AsyncWebsocketConsumer):
    game_loop_sleep_time = 0.01
    matches = set()  # Store match instances in a set
    matches_lock = asyncio.Lock()
    tournaments = set()  # Store tournament instances in a set
    tournaments_lock = asyncio.Lock()

    async def connect(self):
        self.mode = self.scope['url_route']['kwargs']['game_mode']
        self.player = self.scope['url_route']['kwargs']['player']
        
        await self.accept()
        await self.send_to_self(set_player(self.player))

        # Setup match or tournament
        if self.mode == "match":
            await self.setup_match()
        elif self.mode == "tournament":
            await self.setup_tournament()
    

    async def setup_match(self):
        
        async with self.matches_lock:
            # find a match with a missing player
            match = None
            match_found = False
            for match in self.matches:
                if match.tournament is None and match.player_missing():
                    match_found = True
                    break
            # create new match if no match with missing player is found
            if match_found is False:
                match = Match(None)
                match.group_name = f"match_{id(match)}"
                self.matches.add(match)
        
            # add the player to the match
            match.add_player(self.player, self)

        # save the match and paddle (of self) instance
        self.match = match
        self.paddle = self.match.get_paddle(self.player)

        # add the player to the match's channel group
        await self.add_channel_group(self.match.group_name)

        # Start game loop if the match is ready
        if not self.match.player_missing():
            print('[remote match] starting game loop')
            asyncio.ensure_future(self.game_loop())


    async def setup_tournament(self):

        async with self.tournaments_lock:
            #find a tournament with a missing player
            tournament = None
            tournament_found = False
            for tournament in self.tournaments:
                if tournament.player_missing():
                    tournament_found = True
                    break
            # create new tournament if no tournament with missing player is found
            if tournament_found is False:
                tournament = Tournament()
                tournament.group_name = f"tournament_{id(tournament)}"
                self.tournaments.add(tournament)
        
            # add the player to the tournament
            tournament.add_player(self)

        # save the tournament instance
        self.tn = tournament

        # add the player to the match's tournament's channel group
        await self.add_channel_group(self.match.group_name)
        await self.add_channel_group(self.tn.group_name)

        print(f'added player: {self.player} to tournament: {self.tn.group_name} & match: {self.match.group_name}')
        print(f'number of player in tournament: {len(self.tn.consumer_instances)}')
        
        # Start game loop (semi-finals) if the tournament is ready
        if not self.tn.player_missing():
            await self.send_to_group(
                tournament_info('start', self.tn.semi1, self.tn.semi2),
                self.tn.group_name
            )
            
            print('[remote tournament] starting game loop')
            consumer_semi1 = self.tn.semi1.consumer_instances[1]
            consumer_semi2 = self.tn.semi2.consumer_instances[1]
            asyncio.ensure_future(consumer_semi1.game_loop())
            asyncio.ensure_future(consumer_semi2.game_loop())


    async def disconnect(self, close_code):
        # check if self.match is in self.matches
        if hasattr(self, 'match') and isinstance(self.match, Match) and self.match in self.matches:
            self.match.player_quit = True
            await asyncio.sleep(self.game_loop_sleep_time * 2)  # delay to ensure the game_loop has finished
            await self.game_finished(4005)
        

    async def receive(self, text_data):
        received_data = json.loads(text_data)
        # print(f'data received: {received_data}')
        command = received_data.get('command')

        if command and command == 'move_paddle':
            self.paddle.paddle_keyPress(received_data['direction'], received_data['action'])


    async def game_loop(self):
        match = self.match

        await self.send_to_group(
            match_info('start', [match.player1_name, match.player2_name]), 
            self.match.group_name
        )
        
        while match.winning_score > max(match.score_player1, match.score_player2):
            match.update_ball()
            if match.check_if_ball_hit_paddle() is False:
                await self.send_to_group(
                    match_info('update', [match.player1_name, match.player2_name], [match.score_player1, match.score_player2]), 
                    self.match.group_name
                )
            match.update_paddles()
            if match.player_quit is True:
                return
            await self.send_to_group(
                match_data(match.ball, [match.score_player1, match.score_player2], match.paddle_left, match.paddle_right), 
                self.match.group_name
            )
            await asyncio.sleep(self.game_loop_sleep_time)
        
        # send match_info 'end' to the players
        await self.send_to_group(
            match_info('end', [match.player1_name, match.player2_name], [match.score_player1, match.score_player2], match.get_winner()), 
            self.match.group_name
        )

        # deleting/closing all PongConsumer instances and the match instance
        await asyncio.sleep(0.5)    # delay to ensure the players receive the 'end' message
        await self.game_finished(3001)
        

    async def game_finished(self, closing_code=None):
        i_matches = 0
        match = self.match
        # delete all PongConsumer instances in the match
        for consumer in match.consumer_instances:
            await PongConsumer.delete_consumer_instance(consumer, closing_code)
        
        # delete the match instance
        self.matches.discard(match)
        del match
        

    @staticmethod
    async def delete_consumer_instance(consumer, closing_code=None):
        # copy the channel groups (to delete the group later on if it's empty)
        channel_groups_copy = consumer.channel_layer.groups.copy()
        
        # Remove the consumer instance from the matches list
        await consumer.channel_layer.group_discard(
            consumer.match.group_name,
            consumer.channel_name
        )

        # delete group if it's empty
        if consumer.match.group_name in channel_groups_copy and not channel_groups_copy[consumer.match.group_name]:
            del channel_groups_copy[consumer.match.group_name]

        # Close the WebSocket connection:
        await consumer.close(closing_code)

        # delete the consumer instance
        del consumer

    async def add_channel_group(self, group_name):
        await self.channel_layer.group_add(
            group_name,
            self.channel_name
        )

    async def send_to_self(self, data):
        await self.channel_layer.send(self.channel_name, {
            'type': 'send.message',
            'data': data
        })

    async def send_to_group(self, data, group_name):
        print(f'sending to group: {group_name}, data: {data}')
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
