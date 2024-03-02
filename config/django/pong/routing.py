from django.urls import re_path
from pong.consumers import PongConsumer
from pong.consumers_local import PongConsumerLocal

websocket_urlpatterns = [
    re_path(r'^ws/play/(?P<game_mode>.+)/(?P<player>.+)/$', PongConsumer.as_asgi()),
    re_path(r'^ws/play/(?P<game_mode>+)/(?P<player1>+)/(?P<player2>+)/$', PongConsumerLocal.as_asgi()),
]
