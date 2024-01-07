# pong/urls.py

from django.urls import path, include
from pong.views import index, pong, dashboard, room, play_local, play_remote, pong_local, error_full, error_duplicate, error_disconnection, get_dashboard_data

urlpatterns = [
	path('', index, name='index'),
	path('room/', room, name='room'),
    path('play_local/', play_local, name='play_local'),
    path('play_remote/', play_remote, name='play_remote'),
    path('pong_local/', pong_local, name='pong_local'),
    # the value <> is then passsed to the view as a parameter
    # and corresponds to all between play/ and ? in the url
    path('play/<room_code>', pong),
	#path('dashboard/', dashboard, name='dashboard'),
    path('error/full/', error_full, name='error_full'),
    path('error/duplicate/', error_duplicate, name='error_duplicate'),
    path('error/disconnection/', error_disconnection, name='error_disconnection'),

    # NEW FOR CHARTS:
	path('dashboard/', get_dashboard_data, name='dashboard-date')
]