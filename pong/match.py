import json, asyncio
from datetime import datetime
import time
from .webSocket_msg_create import *
# from .webSocket_msg_transmit import *
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from pong.views import add_game_data
from pong.views import add_tournament_data

class MatchConsumer(AsyncJsonWebsocketConsumer):

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.group_name_match = None
		self.pongConsumers = []
		self.tournament_id = None
		self.score = []
		self.startTime = None
		self.endTime = None
		self.storedInDB = False

	async def connect(self):
		await self.accept()

	async def disconnect(self, close_code):
		# Clean up resources, if necessary
		pass

	async def receive(self, text_data):
		# Handle incoming data
		data = json.loads(text_data)
		message_type = data.get('type', None)

		if message_type == 'join':
			await self.join_group(data['group_name'])
		elif message_type == 'send_data':
			await self.send_data(data['payload'])

	async def join_group(self, group_name):
		# Join the specified WebSocket group
		await self.channel_layer.group_add(
            group_name,
            self.channel_name
        )
		self.group_name = group_name

	async def send_data(self, payload):
		# Broadcast the payload to all group members
		await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'send_data',
                'payload': payload,
            }
        )

	async def send_data(self, event):
		# Send payload to WebSocket
		payload = event['payload']
		await self.send(text_data=json.dumps(payload))