from django.urls import path
from .views import add_game_data

urlpatterns = [
	path('blockchainTest/<str:arg1>/<int:arg2>/<str:arg3>/<int:arg4>/', add_game_data, name='add_game_data_url'),
]
