import json, asyncio
from datetime import datetime
import time
from .webSocket_msg_create import *
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from pong.views import add_game_data, add_tournament_data


class PongConsumerLocal(AsyncJsonWebsocketConsumer):

    # ************************************************************ #
    # *********** ESTABLISH NEW WEBSOCKET CONNECTION ************* #
    # ************************************************************ #
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['game_mode']
        self.player1 = self.scope['url_route']['kwargs']['player1']
        self.player2 = self.scope['url_route']['kwargs']['player2']
        
        print(f"room_code: {self.room_code}")
        print(f"player1: {self.player1} | player2: {self.player2}")
        
        await self.accept()


    # ************************************************************ #
    # ******************* DISCONNECT WEBSOCKET ******************* #
    # ************************************************************ #
    async def disconnect(self, close_code):

        if close_code != 1001:
            print(f"Connection closed by Client with close_code {close_code}")
        
        if self is None:
            print("No Client found.")
            return

        await self.closeConnection(4005)


    # ************************************************************ #
    # ******************** RECEIVING MESSAGES ******************** #
    # ************************************************************ #
    async def receive(self, text_data):
        
        received_data = json.loads(text_data)
        
        # Log/print the received JSON data
        #print("Received JSON data:", received_data)

        # [match_info "end"]
        if received_data['command'] == "match_info" and received_data['mode'] == "end":
            await self.send_matchToDatabase(received_data)
            await self.closeConnection(3001)
        # [other message]
        else:
            print(f"Warning: Received wrong message ({self.player1}, {self.player2}): {received_data}")


    # ************************************************************ #
    # ******************* ADDITIONAL FUNCTIONS ******************* #
    # ************************************************************ #
            
    """ Send match data to database """
    async def send_matchToDatabase(self, data):
        p1n = self.player1
        p2n = self.player2
        p1s = data['score']['player1']
        p2s = data['score']['player2']
        gend = datetime.fromtimestamp(time.time())
        gdur = 0
        itg = False
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: add_game_data(p1n, p1s, p2n, p2s, gend, gdur, itg))


    """ Close Connection of Client """
    async def closeConnection(self, code=None):
        if self is None:
            return
        
        # Close connection with specified code
        if code is not None:
            await self.close(code)

        print(f"[Local Match] Disconnected user (p1: {self.player1}, p2:{self.player2}) with code {code}.")

        # Set user parameters to None
        self.room_code = None
        self.player1 = None
        self.player2 = None


    async def send_to_self(self, data):
        """ Send message to self """
        await self.channel_layer.send(self.channel_name, {
            'type': 'send_message',
            'data': data
        })

    async def send_message(self, event):
        """ Send the group message to clients """
        # Retrieve the message from the event
        message = event['data']
        # Send the message to the client WebSocket
        try:
            await self.send(text_data=message)
        except Exception as e:
            print(f"Error sending message: {e}")