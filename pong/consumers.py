#pong/consumers.py

import json 
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class PongConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        # Extract the room code from the channel's path
        self.room_code = self.scope['url_route']['kwargs']['room_code']

        # Construct a room group name that the channel will join (basic string formatting)
        self.room_group_name = 'room_%s' % self.room_code

        # Join the room group
            # await is used to pause the execution of an asynchronous function until the awaited coroutine is complete.
            # self.channel_layer.group_add(group, channel) --> Adds a channel (ws connection) to a group.
        await self.channel_layer.group_add(
            self.room_group_name, # the attribute that we defined above
            self.channel_name,
        )

            # Retrieve the group size
        group_size = len(self.channel_layer.groups.get(self.room_group_name, {}).items())

        # Print the group size
        print(f"The size of group '{self.room_group_name}' is: {group_size}")

        # Accept the connection
        await self.accept()

    async def disconnect(self, close_code):
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