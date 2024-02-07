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

    def __str__(self):
        return f"{self.player1_name} vs. {self.player2_name}"
        
    class Meta:
        app_label = 'pong'

class TournamentData(models.Model):
    tour_id = models.IntegerField(default=0)
    match_id_semi_1=models.PositiveIntegerField()
    match_id_semi_2=models.PositiveIntegerField()
    match_id_final=models.PositiveIntegerField()
    tournament_end_timestamp = models.DateTimeField()
    tournament_duration_secs = models.PositiveIntegerField()
    #player_ranking = models.ArrayField(models.CharField(max_length=255), size=4)
    player_ranking = models.JSONField()
    blockchain_hash = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.tour_id}"
    
    # returns a dictionary with timestamps as keys and corresponding blockchain hashes as values
    def get_blockchain_data(self):
        timestamp = self.tournament_end_timestamp
        formatted_timestamp = timestamp.strftime('%Y-%m-%d %H:%M:%S')
        return {formatted_timestamp: self.blockchain_hash}

    # iterates through all instances and accumulates the data into a single dictionary
    @classmethod
    def get_all_blockchain_data(cls):
        all_blockchain_data = {}
        tournaments = cls.objects.all()

        for tournament in tournaments:
            all_blockchain_data.update(tournament.get_blockchain_data())

        return all_blockchain_data
        
    class Meta:
        app_label = 'pong'