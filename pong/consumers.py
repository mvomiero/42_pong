#pong/consumers.py

import json 
from channels.generic.websocket import AsyncJsonWebsocketConsumer

# Dictionary to store room player counts
room_player_counts = {}

class PongConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f'room_{self.room_code}'

        # Check if the room already exists in the dictionary; if not, initialize it with zero players
        if self.room_group_name not in room_player_counts:
            room_player_counts[self.room_group_name] = 0

        # Check the number of players in the room
        if room_player_counts[self.room_group_name] >= 2:
            await self.close_and_redirect()
        else:
            room_player_counts[self.room_group_name] += 1
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()


    async def close_and_redirect(self):
        # Close the connection and redirect to a certain view
        await self.close()
        await self.send_message({'redirect': True, 'message': 'Room is full. Redirecting...'})


    async def disconnect(self, close_code):
        room_player_counts[self.room_group_name] -= 1
        print("Disconnected")
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """
        Receive message from WebSocket.
        Log/print the received JSON data and forward it to other clients.
        """
        # Log/print the received JSON data
        #print("Received JSON data:", text_data)

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