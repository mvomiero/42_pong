#pong/consumers.py

import json 
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class PongConsumer(AsyncJsonWebsocketConsumer):

    connected_users = {}  # Dictionary to store connected users and their connections

    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = 'room_%s' % self.room_code

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        # Add the connected user and their connection to the dictionary
        user_id = self.scope["user"].id  # Assuming authentication is implemented and user information is available
        if user_id:
            if user_id not in self.connected_users:
                self.connected_users[user_id] = set()
            self.connected_users[user_id].add(self.channel_name)

        group_size = len(self.channel_layer.groups.get(self.room_group_name, {}).items())
        print(f"The size of group '{self.room_group_name}' is: {group_size}")

        # Additional print statement at connection
        if user_id:
            print(f"User {user_id} connected with channel name {self.channel_name}")

        await self.accept()

    async def disconnect(self, close_code):
        # Remove the connection from the dictionary when a user disconnects
        user_id = self.scope["user"].id
        if user_id in self.connected_users:
            self.connected_users[user_id].discard(self.channel_name)
            if not self.connected_users[user_id]:
                del self.connected_users[user_id]

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

        # Additional print statement at disconnection
        if user_id:
            print(f"User {user_id} disconnected from channel name {self.channel_name}")

    
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