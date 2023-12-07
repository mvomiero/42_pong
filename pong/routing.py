from django.urls import re_path
from pong.consumers import PongConsumer

websocket_urlpatterns = [
    # re_path(r'^ws/play/(?P<room_code>\w+)/$', PongConsumer.as_asgi()),
    re_path(r'^ws/play/(?P<game_mode>\w+)/(?P<player>\w+)/$', PongConsumer.as_asgi()),
]
    # http://127.0.0.1:8000/play/?&mode=match?&choice=flo
        # match OR tournament


# URL parsing --> r'^ws/play/(?P<room_code>\w+)/$':
#   ^ws/play/ --> matches the path starting with ws/play/
#   (?P<room_code>\w+) --> named capturing group that captures a sequence of word characters (\w+).
#       The captured value will be referred to as room_code.
#   /$ --> matches the path ending with /.