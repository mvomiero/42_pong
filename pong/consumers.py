import gc
import json, asyncio
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from pong.webSocket_msg_create import *
from pong.match_setup import *
from pong.tournament_setup import *

class PongConsumer(AsyncWebsocketConsumer):
    game_loop_sleep_time = 0.01
    tournament_loop_sleep_time = 1
    matches = set()  # Store match instances in a set
    matches_lock = asyncio.Lock()
    tournaments = set()  # Store tournament instances in a set
    tournaments_lock = asyncio.Lock()
    channel_groups_lock = asyncio.Lock()

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
            asyncio.ensure_future(self.game_loop(self.match))


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

        # Start game loop (semi-finals) if the tournament is ready
        if not self.tn.player_missing():
            asyncio.ensure_future(self.tournament_loop(self.tn))
            
            
    async def disconnect(self, close_code):
        # check if self.match is in self.matches
        if self.mode == "match" and hasattr(self, 'match') and isinstance(self.match, Match):
            self.match.player_quit = True
            await asyncio.sleep(self.game_loop_sleep_time * 2)  # delay to ensure the game_loop has finished
            await self.game_clear(self.match, 4005)
        elif self.mode == "tournament" and hasattr(self, 'tn') and isinstance(self.tn, Tournament):
            self.tn.player_quit = True
            await asyncio.sleep(self.tournament_loop_sleep_time * 2)  # delay to ensure the tournament_loop has finished
            await self.tournament_clear(self.tn, 4006)

    async def receive(self, text_data):
        received_data = json.loads(text_data)
        # print(f'data received: {received_data}')
        command = received_data.get('command')

        if command and command == 'move_paddle' and self.paddle is not None:
            self.paddle.paddle_keyPress(received_data['direction'], received_data['action'])


    async def tournament_loop(self, tournament):
        
        await self.send_to_group(
            tournament_info('start', self.tn.semi1, self.tn.semi2),
            self.tn.group_name
        )
        
        # start semi-finals
        print('[remote tournament] starting game loop')
        consumer_semi1 = self.tn.semi1.consumer_instances[1]
        consumer_semi2 = self.tn.semi2.consumer_instances[1]
        asyncio.ensure_future(consumer_semi1.game_loop(consumer_semi1.match))
        asyncio.ensure_future(consumer_semi2.game_loop(consumer_semi2.match))

        while not tournament.finished:
            
            if tournament.semi1.finished and tournament.semi2.finished and tournament.final is None:
                tournament.set_final()
                for consumer in tournament.consumer_instances:
                    await consumer.add_channel_group(tournament.final.group_name)
                await self.send_to_group(
                    tournament_info('update', tournament.semi1, tournament.semi2, tournament.final),
                    self.tn.group_name
                )
                print('[remote tournament] starting final game loop')
                consumer_final = tournament.final.consumer_instances[1]
                asyncio.ensure_future(consumer_final.game_loop(consumer_final.match))
            
            if tournament.final is not None and tournament.final.finished:
                print('[remote tournament] tournament finished')
                tournament.finished = True
            
            if tournament.player_quit:
                return
            
            await asyncio.sleep(self.tournament_loop_sleep_time)

        # send tournament_info 'end' to the players
        await self.send_to_group(
            tournament_info('end', tournament.semi1, tournament.semi2, tournament.final, tournament.get_finalRank()),
            self.tn.group_name
        )
        await asyncio.sleep(0.5)    # delay to ensure the players receive the 'end' message

        # delete/close all PongConsumer and Match instances and the Tournament instance
        await self.tournament_clear(tournament, 3002)


    async def game_loop(self, match):

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
        
        if not match.player_quit:
            match.finished = True

        # send match_info 'end' to the players
        await self.send_to_group(
            match_info('end', [match.player1_name, match.player2_name], [match.score_player1, match.score_player2], match.get_winner()), 
            self.match.group_name
        )
        await asyncio.sleep(0.5)    # delay to ensure the players receive the 'end' message

        # in case of remote-match: delete/close all PongConsumer instances and the match instance
        if self.mode == "match":
            await self.game_clear(match, 3001)


    async def tournament_clear(self, tournament, closing_code=None):
        # delete all PongConsumer instances in the tournament-matches
        for consumer in tournament.consumer_instances:
            await consumer.delete_consumer_instance(closing_code)

        if tournament is not None:
            # delete match instance in tournament
            tournament.clear_tournament()

            # delete the tournament instance
            if self.tn in self.tournaments:
                self.tournaments.discard(tournament)


    async def game_clear(self, match, closing_code=None):
        # delete all PongConsumer instances in the match
        for consumer in match.consumer_instances:
            await consumer.delete_consumer_instance(closing_code)
        
        if match is not None:
            # delete match instance
            match.clear_match()

            # delete the match instance
            if self.match in self.matches:
                self.matches.discard(match)
        

    async def delete_consumer_instance(self, closing_code=None):
        async with self.channel_groups_lock:
            groups_copy = self.channel_layer.groups.copy()
            groups_to_remove = []

            # Identify groups to remove
            for group_name in groups_copy.keys():
                if self.channel_name in groups_copy.get(group_name, []):
                    await self.channel_layer.group_discard(
                        group_name,
                        self.channel_name
                    )
                if not groups_copy.get(group_name, []):
                    groups_to_remove.append(group_name)

            # Remove the empty groups
            for group_name in groups_to_remove:
                del groups_copy[group_name]

        # Close the WebSocket connection:
        await self.close(closing_code)

        # delete match & tournament instances
        self.tn = None
        self.match = None

        # delete the consumer instance
        del self

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
