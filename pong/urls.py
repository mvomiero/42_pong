# pong/urls.py

from django.urls import path, include
from pong.views import index

urlpatterns = [
	path('', index, name='index'),
]