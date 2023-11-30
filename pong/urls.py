# pong/urls.py

from django.urls import path, include
from pong.views import index, pong, dashboard, room

urlpatterns = [
	path('', index, name='index'),
	path('room/', room, name='room'),
    # the value <> is then passsed to the view as a parameter
    # and corresponds to all between play/ and ? in the url
    path('play/<room_code>', pong),
	path('dashboard/', dashboard, name='dashboard'),
]