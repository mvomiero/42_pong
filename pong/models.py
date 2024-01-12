from django.db import models
from django.utils import timezone
#from django.contrib.postgres.fields import ArrayField

class GameData(models.Model):
    player1_name = models.CharField(max_length=255)
    player1_points = models.PositiveIntegerField()
    player2_name = models.CharField(max_length=255)
    player2_points = models.PositiveIntegerField()
    game_end_timestamp = models.DateTimeField()
    game_duration_secs = models.PositiveIntegerField()
    is_tournament_game = models.BooleanField()
    blockchain_hash = models.CharField(max_length=64, null=True, blank=True)

    def __str__(self):
        return f"{self.player1_name} vs. {self.player2_name}"
        
    class Meta:
        app_label = 'pong'

class TournamentData(models.Model):
    match_id_semi_1=models.PositiveIntegerField()
    match_id_semi_2=models.PositiveIntegerField()
    match_id_final=models.PositiveIntegerField()
    tournament_end_timestamp = models.DateTimeField()
    tournament_duration_secs = models.PositiveIntegerField()
    #player_ranking = models.ArrayField(models.CharField(max_length=255), size=4)
    player_ranking = models.JSONField()

    def __str__(self):
        return f"Tournament"
        
    class Meta:
        app_label = 'pong'