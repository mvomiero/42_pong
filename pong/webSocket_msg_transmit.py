
# import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer


async def send_to_self(self, data):
    """ Send message to self """
    await self.channel_layer.send(self.channel_name, {
        'type': 'send_message',
        'data': data
    })

async def send_to_group(self, data, group_name):
    await self.channel_layer.group_send(group_name, {
        'type': 'send_message',
        'data': data
    })

async def send_message(self, event):
    """ Send the group message to clients """
    # Retrieve the message from the event
    message = event['data']
    # Send the message to the client WebSocket
    if self.channel_layer.groups:
        await self.send(text_data=message)