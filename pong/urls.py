# pong/urls.py

from django.urls import path, include
from pong.views import index, pong, dashboard

urlpatterns = [
	path('', index, name='index'),
    # the value <> is then passsed to the view as a parameter
    # and corresponds to all between play/ and ? in the url
    path('play/<room_code>', pong),
	path('dashboard/', dashboard, name='dashboard'),
]