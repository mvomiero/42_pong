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
        Get the event and send the appropriate event
        """
        response = json.loads(text_data)
        event = response.get("event", None)
        message = response.get("message", None)
        # Send message to room group based on the event
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'send_message',
            'message': message,
            "event": event  # Use the received event directly
        })

    async def send_message(self, res):
        """ Receive message from room group """
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "payload": res,
        }))