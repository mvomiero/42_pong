from django.urls import re_path
from pong.consumers import PongConsumer

websocket_urlpatterns = [
    re_path(r'^ws/play/(?P<room_code>\w+)/$', PongConsumer.as_asgi()),
]


# URL parsing --> r'^ws/play/(?P<room_code>\w+)/$':
#   ^ws/play/ --> matches the path starting with ws/play/
#   (?P<room_code>\w+) --> named capturing group that captures a sequence of word characters (\w+).
#       The captured value will be referred to as room_code.
#   /$ --> matches the path ending with /.